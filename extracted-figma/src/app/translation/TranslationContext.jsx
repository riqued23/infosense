import { createContext, useState, useCallback, useRef } from "react";
import { translateText, translateBatch } from "./translationService";

export const TranslationContext = createContext(null);

const DEFAULT_LANGUAGE = "en";

export function TranslationProvider({ children }) {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const cache = useRef({});

  const translate = useCallback(
    async (text, targetLang = language) => {
      if (!text || targetLang === DEFAULT_LANGUAGE) return text;
      const key = `${text}__${targetLang}`;
      if (cache.current[key]) return cache.current[key];
      const result = await translateText(text, targetLang);
      cache.current[key] = result;
      return result;
    },
    [language]
  );

  const translateBatchCached = useCallback(
    async (texts, targetLang = language) => {
      if (!texts.length || targetLang === DEFAULT_LANGUAGE) return texts;

      const results = new Array(texts.length);
      const toFetch = [];
      const toFetchIndexes = [];

      texts.forEach((text, i) => {
        const key = `${text}__${targetLang}`;
        if (cache.current[key]) {
          results[i] = cache.current[key];
        } else {
          toFetch.push(text);
          toFetchIndexes.push(i);
        }
      });

      if (toFetch.length) {
        const translated = await translateBatch(toFetch, targetLang);
        translated.forEach((t, idx) => {
          const originalIndex = toFetchIndexes[idx];
          const key = `${toFetch[idx]}__${targetLang}`;
          cache.current[key] = t;
          results[originalIndex] = t;
        });
      }

      return results;
    },
    [language]
  );

  const changeLanguage = useCallback((lang) => setLanguage(lang), []);
  const clearCache = useCallback(() => { cache.current = {}; }, []);

  return (
    <TranslationContext.Provider
      value={{
        language,
        defaultLanguage: DEFAULT_LANGUAGE,
        translate,
        translateBatch: translateBatchCached,
        changeLanguage,
        clearCache,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}
