import { useTranslation } from "./useTranslation";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "zh", label: "中文" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },
  { code: "pt", label: "Português" },
  { code: "hi", label: "हिन्दी" },
];

/**
 * Drop anywhere inside <TranslationProvider>. No props required.
 * Optionally pass a custom languages array: [{ code, label }]
 */
export function LanguageSwitcher({ languages = LANGUAGES, className = "" }) {
  const { language, changeLanguage } = useTranslation();

  return (
    <select
      value={language}
      onChange={(e) => changeLanguage(e.target.value)}
      aria-label="Select language"
      className={className}
    >
      {languages.map(({ code, label }) => (
        <option key={code} value={code}>{label}</option>
      ))}
    </select>
  );
}
