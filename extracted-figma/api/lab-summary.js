const SUMMARY_INSTRUCTIONS =
  'You summarize lab reports in plain language for educational use. Do not diagnose, recommend treatment, or replace a clinician. Return only valid JSON with keys: headline, plainLanguageSummary, keyTakeaways, watchItems, suggestedQuestions, confidenceNote. Each list should contain 2 to 5 short strings.';

const SAFETY_RULES = [
  'Use only the provided lab values and reference range source notes.',
  'Mention when ranges are general fallback ranges rather than ranges from the report.',
  'Encourage the user to verify with their clinician.',
];

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function extractOutputText(payload) {
  if (typeof payload.output_text === 'string') {
    return payload.output_text;
  }

  const content = payload.output?.flatMap((item) => item.content ?? []) ?? [];
  const textItem = content.find((item) => typeof item.text === 'string');

  return textItem?.text;
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

export async function handleLabSummaryRequest(req, res, options = {}) {
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
    const { report, results, questionsToAsk } = await readJsonBody(req);

    const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        store: false,
        max_output_tokens: 900,
        instructions: SUMMARY_INSTRUCTIONS,
        input: JSON.stringify({
          report,
          results,
          questionsToAsk,
          safetyRules: SAFETY_RULES,
        }),
      }),
    });

    const payload = await openAiResponse.json();

    if (!openAiResponse.ok) {
      sendJson(res, openAiResponse.status, {
        error: payload?.error?.message || 'OpenAI request failed.',
      });
      return;
    }

    const outputText = extractOutputText(payload);

    if (typeof outputText !== 'string') {
      sendJson(res, 502, { error: 'OpenAI response did not include text output.' });
      return;
    }

    sendJson(res, 200, { summary: JSON.parse(outputText) });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Unable to generate AI summary.',
    });
  }
}

export default async function handler(req, res) {
  await handleLabSummaryRequest(req, res);
}
