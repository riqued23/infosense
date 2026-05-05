const EXTRACTION_INSTRUCTIONS = `
You extract structured lab results from messy PDF text. Return only valid JSON.

Rules:
- Do not diagnose or summarize.
- Preserve exact lab test names, values, units, and reference ranges from the document.
- Reconstruct table rows when PDF text extraction separates names, values, units, and reference intervals into different blocks.
- Labcorp reports often append lab-location codes like "01", "02", or "0 2" after test names. These are not result values and must be ignored.
- For Labcorp reports where test names, current result values, units, and reference intervals appear as separate vertical blocks, pair them by their displayed order. Example: Neutrophils 02, Lymphs 02, Monocytes 02, Eos 02, Basos 0 2 are test names with lab code suffixes; their values appear later in the current result value block.
- Do not invent lab results.
- Include results with numeric values. If the reference interval is "Not Estab.", blank, unavailable, or not numeric, keep the value but set normalMin and normalMax to 0 and referenceRangeSource to "not-established".
- If a reference range is present in the document, set referenceRangeSource to "uploaded-report".
- Never invent fallback or general reference ranges.
- Return JSON with shape:
{
  "patientName": string,
  "testDate": string,
  "reportType": string,
  "results": [
    {
      "name": string,
      "value": number,
      "unit": string,
      "normalMin": number,
      "normalMax": number,
      "referenceRangeSource": "uploaded-report" | "not-established",
      "referenceRangeNote": string
    }
  ]
}
`;

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body);
  }

  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

function extractOutputText(payload) {
  if (typeof payload.output_text === 'string') {
    return payload.output_text;
  }

  const content = payload.output?.flatMap((item) => item.content ?? []) ?? [];
  const textItem = content.find((item) => typeof item.text === 'string');

  return textItem?.text;
}

function parseJsonOutput(outputText) {
  try {
    return JSON.parse(outputText);
  } catch {
    const match = outputText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI extraction did not return JSON.');
    return JSON.parse(match[0]);
  }
}

export async function handleExtractLabsRequest(req, res, options = {}) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  const model = options.model || process.env.OPENAI_MODEL || 'gpt-4.1-mini';

  if (!apiKey) {
    sendJson(res, 503, {
      error: 'OPENAI_API_KEY is not set. Add it to your deployment environment variables.',
    });
    return;
  }

  try {
    const { extractedText, fileName } = await readJsonBody(req);

    if (!extractedText || typeof extractedText !== 'string') {
      sendJson(res, 400, { error: 'extractedText is required' });
      return;
    }

    const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        store: false,
        max_output_tokens: 2400,
        instructions: EXTRACTION_INSTRUCTIONS,
        input: JSON.stringify({
          fileName,
          extractedText: extractedText.slice(0, 50000),
        }),
      }),
    });

    const payload = await openAiResponse.json();

    if (!openAiResponse.ok) {
      sendJson(res, openAiResponse.status, {
        error: payload?.error?.message || 'OpenAI extraction request failed.',
      });
      return;
    }

    const outputText = extractOutputText(payload);

    if (typeof outputText !== 'string') {
      sendJson(res, 502, { error: 'OpenAI extraction response did not include text output.' });
      return;
    }

    sendJson(res, 200, { report: parseJsonOutput(outputText) });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Unable to extract lab values with AI.',
    });
  }
}

export default async function handler(req, res) {
  await handleExtractLabsRequest(req, res);
}
