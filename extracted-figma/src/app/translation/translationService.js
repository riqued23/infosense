const PROXY_URL = "/api/translate";

/**
 * Translate a single string via the local proxy server.
 * The Google API key stays on the server — never exposed to the browser.
 */
export async function translateText(text, targetLang) {
  if (!text?.trim()) return text;

  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, target: targetLang }),
  });

  if (!res.ok) throw new Error(`Translation error: ${res.statusText}`);
  const data = await res.json();
  return data.data.translations[0].translatedText;
}

/**
 * Translate multiple strings in one request via the local proxy server.
 */
export async function translateBatch(texts, targetLang) {
  if (!texts.length) return texts;

  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: texts, target: targetLang }),
  });

  if (!res.ok) throw new Error(`Translation error: ${res.statusText}`);
  const data = await res.json();
  return data.data.translations.map((t) => t.translatedText);
}
