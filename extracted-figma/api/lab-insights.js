const INSIGHTS_INSTRUCTIONS = `
You create patient-friendly lab report insights.
Return only valid JSON with this shape:
{
  "summary": {
    "headline": string,
    "plainLanguageSummary": string,
    "keyTakeaways": string[],
    "watchItems": string[],
    "suggestedQuestions": string[],
    "confidenceNote": string
  },
  "explanations": [
    {
      "name": string,
      "definition": string,
      "description": string,
      "resultMeaning": string
    }
  ]
}

Plain-language rules:
- Write the summary at about a 5th to 6th grade reading level.
- Write lab-card explanations at about an 8th grade reading level.
- Use short sentences and everyday words.
- Explain medical terms the first time you use them.
- Use "high", "low", and "in range" instead of clinical wording.
- Say "usual range on this report" instead of "reference interval" except in confidenceNote.
- Do not diagnose, recommend treatment, or tell the user to change medicines.
- Do not say a result is dangerous, critical, urgent, or an emergency unless that exact flag was provided.
- Do not imply certainty about why a result is high or low.

Summary rules:
- Start plainLanguageSummary with the main finding in one simple sentence.
- Then explain what the flagged result type means in the body.
- keyTakeaways must be 2 to 5 short bullets.
- Each key takeaway should start with the plain meaning, then include the lab value only if useful.
- watchItems must focus on what to ask or review with a clinician.
- suggestedQuestions must be phrased as patient questions to ask a doctor.
- confidenceNote must say this is educational and based only on the provided lab values.

Lab explanation rules:
- Return one explanation for each result in the same order as provided.
- The definition field must define the lab marker itself, not the test.
- The description field should explain what the test checks and why it may be reviewed.
- The resultMeaning field should explain this exact value compared with the usual range when one is provided.
- If referenceRangeSource is "not-established", say the report does not give a usual range, so the app cannot label the value high or low.
- Do not say "talk to your doctor if you have symptoms" or similar vague advice.
- Only include a "discuss with your doctor" sentence when the status is "high" or "low".
- For CD4 or CD8 tests, explain that these are immune cells. Do not discuss HIV, AIDS, or immune disease unless the provided data says that directly.
- Use only the provided value, unit, status, and range information.
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
    if (!match) throw new Error('AI insights did not return JSON.');
    return JSON.parse(match[0]);
  }
}

export async function handleLabInsightsRequest(req, res, options = {}) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  const model = options.model || process.env.OPENAI_INSIGHTS_MODEL || 'gpt-4.1-nano';

  if (!apiKey) {
    sendJson(res, 503, {
      error: 'OPENAI_API_KEY is not set. Add it to your deployment environment variables.',
    });
    return;
  }

  try {
    const { report, results, questionsToAsk } = await readJsonBody(req);

    if (!report || !Array.isArray(results)) {
      sendJson(res, 400, { error: 'report and results are required' });
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
        max_output_tokens: 6200,
        instructions: INSIGHTS_INSTRUCTIONS,
        input: JSON.stringify({
          report,
          results: results.slice(0, 40),
          questionsToAsk,
        }),
      }),
    });

    const payload = await openAiResponse.json();

    if (!openAiResponse.ok) {
      sendJson(res, openAiResponse.status, {
        error: payload?.error?.message || 'OpenAI insights request failed.',
      });
      return;
    }

    const outputText = extractOutputText(payload);

    if (typeof outputText !== 'string') {
      sendJson(res, 502, { error: 'OpenAI insights response did not include text output.' });
      return;
    }

    sendJson(res, 200, parseJsonOutput(outputText));
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Unable to generate lab insights.',
    });
  }
}

export default async function handler(req, res) {
  await handleLabInsightsRequest(req, res);
}
