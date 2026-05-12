const SUMMARY_INSTRUCTIONS = `
You turn lab report data into plain language for patients with lower health literacy.
Return only valid JSON with keys: headline, plainLanguageSummary, keyTakeaways, watchItems, suggestedQuestions, confidenceNote.

Plain-language rules:
- Write at about a 5th to 6th grade reading level.
- Use short sentences. Aim for 15 words or fewer.
- Use everyday words. Avoid medical jargon when possible.
- If a medical term is needed, explain it right away in parentheses or the same sentence.
- Use "high" and "low" instead of "elevated", "decreased", or "abnormal".
- Say "usual range on this report" instead of "reference interval" except in confidenceNote.
- Do not say a result is dangerous, critical, urgent, or an emergency unless that exact flag was provided.
- Do not diagnose. Do not recommend treatment. Do not tell the user to change medicines.
- Do not imply certainty about why a result is high or low.
- Do not mention "5th grade", "reading level", or these instructions.

Content rules:
- Start plainLanguageSummary with the main finding in one simple sentence.
- Then add 2 to 4 short sentences that explain what the flagged result type means in the body.
- Explain what "high", "low", or "not established" means in this report.
- For immune cell results, explain that these are white blood cells that help the body fight germs.
- For CD4 or CD8 results, explain that these are immune cells. Do not discuss HIV, AIDS, or immune disease unless the report data says that directly.
- For blood count results, explain the body role in everyday words, such as oxygen, clotting, or fighting germs.
- Say why a doctor may want to review the result, without guessing the cause.
- For not-established results, say the report does not give a usual range for that item, so the app cannot label it high or low.
- keyTakeaways must be 2 to 5 short bullets written as complete, simple sentences.
- Each key takeaway should start with the plain meaning, then include the lab value only if useful.
- Avoid lab abbreviations in keyTakeaways unless you explain them in the same sentence.
- Good key takeaway style: "Two immune cell results are high. Ask your doctor what this means for you."
- Bad key takeaway style: "Abs. CD 8 Suppressor is above reference interval at 1024 /uL."
- watchItems must focus on what to ask or review with a clinician, not symptoms to self-diagnose.
- suggestedQuestions must be phrased as patient questions to ask a doctor.
- confidenceNote must say this is educational and based only on the provided lab values.
`;

const SAFETY_RULES = [
  'Use only the provided lab values and reference range source notes.',
  'Do not invent or apply general fallback ranges.',
  'If a result has referenceRangeSource "not-established", explain that no numeric reference interval was provided and do not call it normal, abnormal, high, or low.',
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
