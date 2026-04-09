// Will drop into Node/Express backend later
// Ask Ethan for API key

const GOOGLE_TRANSLATE_URL =
  "https://translation.googleapis.com/language/translate/v2";

/**
 * Translate a string
 * @param {string} text     - Text to translate
 * @param {string} target   - BCP-47 language code, e.g. "es", "zh", "ar"
 * @param {string} apiKey   - Google Cloud API key
 * @param {string} [source] - Source language (omit for auto-detect)
 * @returns {Promise<{translatedText: string, detectedSourceLanguage?: string}>}
 */
export async function translateText(text, target, apiKey, source = null) {
  const body = { q: text, target, format: "text" };
  if (source) body.source = source;

  const res = await fetch(`${GOOGLE_TRANSLATE_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const translation = data.data.translations[0];
  return {
    translatedText: translation.translatedText,
    detectedSourceLanguage: translation.detectedSourceLanguage ?? source,
  };
}

/**
 * Translate multiple strings in one API call (batch — saves quota usage).
 * @param {string[]} texts  - Array of strings
 * @param {string}   target - Target language code
 * @param {string}   apiKey
 * @returns {Promise<string[]>} - Array of translated strings, same order
 */
export async function translateBatch(texts, target, apiKey) {
  if (!texts.length) return [];

  const res = await fetch(`${GOOGLE_TRANSLATE_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: texts, target, format: "text" }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.data.translations.map((t) => t.translatedText);
}

/**
 * Detect the language of input string
 * @param {string} text
 * @param {string} apiKey
 * @returns {Promise<{language: string, confidence: number}>}
 */
export async function detectLanguage(text, apiKey) {
  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2/detect?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text }),
    }
  );

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  const det = data.data.detections[0][0];
  return { language: det.language, confidence: det.confidence };
}

/**
 * List supported languages with corresponding display names
 * @param {string} apiKey
 * @param {string} [displayLanguage] - Language for display names, e.g. "en"
 * @returns {Promise<Array<{language: string, name: string}>>}
 */
export async function getSupportedLanguages(apiKey, displayLanguage = "en") {
  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2/languages` +
    `?key=${apiKey}&target=${displayLanguage}`
  );

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  return data.data.languages;
}