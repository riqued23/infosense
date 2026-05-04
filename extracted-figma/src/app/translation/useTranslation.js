import { useContext, useState, useEffect } from "react";
import { TranslationContext } from "./TranslationContext";

/** Access the full translation context from anywhere inside <TranslationProvider> */
export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error("useTranslation must be used inside <TranslationProvider>");
  return ctx;
}

/**
 * Translate a single static string reactively.
 * Re-translates automatically when the app language changes.
 *
 * const label = useTranslated("Submit");
 */
export function useTranslated(text) {
  const { translate, language } = useTranslation();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    let cancelled = false;
    translate(text).then((result) => {
      if (!cancelled) setTranslated(result);
    });
    return () => { cancelled = true; };
  }, [text, language]); // eslint-disable-line react-hooks/exhaustive-deps

  return translated;
}
