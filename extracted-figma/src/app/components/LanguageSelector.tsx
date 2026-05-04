import { useState } from 'react';
import { Languages, ChevronDown, Globe } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – JS module, types inferred as any
import { useTranslation } from '../translation/useTranslation';

const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', flag: '🇨🇳' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', flag: '🇸🇦' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어', flag: '🇰🇷' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', flag: '🇧🇷' },
];

export function LanguageSelector() {
  const { language, changeLanguage } = useTranslation();
  const [isMinimized, setIsMinimized] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const activeLanguage = LANGUAGES.find((lang) => lang.code === language) || LANGUAGES[0];
  const isEnglish = language === 'en';

  return (
    <div className="fixed bottom-5 left-5 z-[9999] flex flex-col items-start gap-2 select-none">

      {/* Expanded panel */}
      {!isMinimized && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-80 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-white" />
              <span className="text-sm text-white">Translation</span>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-blue-100 hover:text-white transition-colors text-lg leading-none"
              title="Minimize"
            >
              ×
            </button>
          </div>

          {/* Active language banner */}
          <div className={`px-4 py-2.5 flex items-center justify-between border-b border-gray-100 ${
            isEnglish ? 'bg-gray-50' : 'bg-blue-50'
          }`}>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Current Language</p>
              <p className={`text-sm ${isEnglish ? 'text-gray-700' : 'text-blue-700'}`}>
                <span className="mr-2">{activeLanguage.flag}</span>
                {activeLanguage.nativeLabel}
              </p>
            </div>
            {!isEnglish && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Active
              </span>
            )}
          </div>

          {/* Language selector dropdown */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-400 transition-colors bg-white"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span>{activeLanguage.flag} {activeLanguage.nativeLabel}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10 max-h-64 overflow-y-auto">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        language === lang.code ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{lang.flag}</span>
                        <div>
                          <p className={`text-sm ${language === lang.code ? 'text-blue-700' : 'text-gray-800'}`}>
                            {lang.nativeLabel}
                          </p>
                          <p className="text-xs text-gray-500">{lang.label}</p>
                        </div>
                      </div>
                      {language === lang.code && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-2.5">
              <p className="text-xs text-gray-600">
                {isEnglish
                  ? 'Select a language to translate the entire page and medical summary.'
                  : 'The page and AI summary are being displayed in your selected language.'}
              </p>
            </div>
          </div>

          {/* Quick-switch flag strip */}
          <div className="px-4 pb-3 pt-2 flex flex-wrap gap-1.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                title={lang.label}
                className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                  language === lang.code
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {lang.flag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Minimized FAB */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl shadow-lg border transition-all ${
            !isEnglish
              ? 'bg-blue-600 border-blue-700 text-white'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          title="Open language selector"
        >
          <Languages className="w-4 h-4" />
          <span className="text-xs font-medium">
            {!isEnglish ? activeLanguage.flag : 'Language'}
          </span>
        </button>
      )}
    </div>
  );
}
