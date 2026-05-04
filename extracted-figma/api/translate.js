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

export async function handleTranslateRequest(req, res, options = {}) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const apiKey = options.apiKey || process.env.GOOGLE_TRANSLATE_API_KEY;

  if (!apiKey) {
    sendJson(res, 503, {
      error: 'GOOGLE_TRANSLATE_API_KEY is not set. Add it to your deployment environment variables.',
    });
    return;
  }

  try {
    const { q, target } = await readJsonBody(req);

    if (!q || !target) {
      sendJson(res, 400, { error: 'q and target are required' });
      return;
    }

    const googleResponse = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, target, format: 'text' }),
    });

    const payload = await googleResponse.json();

    if (!googleResponse.ok) {
      sendJson(res, googleResponse.status, payload);
      return;
    }

    sendJson(res, 200, payload);
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Unable to translate text.',
    });
  }
}

export default async function handler(req, res) {
  await handleTranslateRequest(req, res);
}
