import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Heart, FileText, MessageCircle } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
// @ts-ignore
import { useTranslation } from '../translation/useTranslation';

const ONBOARDING_DEFAULTS = {
  tagline: 'Welcome to ClearCare. We help you understand your medical test results in simple language. This app does not replace your doctor—it helps you prepare questions and learn what your results may mean.',
  card1Title: 'Upload Results',
  card1Desc: 'Share your lab reports or test results',
  card2Title: 'Get Explanations',
  card2Desc: 'Understand medical terms in plain language',
  card3Title: 'Ask Your Doctor',
  card3Desc: 'Prepare questions for your appointment',
  getStarted: 'Get Started',
};

export function Onboarding() {
  const navigate = useNavigate();

  const { language, translateBatch } = useTranslation();
  const [t, setT] = useState(ONBOARDING_DEFAULTS);

  useEffect(() => {
    if (language === 'en') { setT(ONBOARDING_DEFAULTS); return; }
    translateBatch(Object.values(ONBOARDING_DEFAULTS)).then((results: string[]) => {
      const keys = Object.keys(ONBOARDING_DEFAULTS) as (keyof typeof ONBOARDING_DEFAULTS)[];
      setT(Object.fromEntries(keys.map((k, i) => [k, results[i]])) as typeof ONBOARDING_DEFAULTS);
    });
  }, [language]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
      <LanguageSelector />

      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl text-blue-900 mb-4">ClearCare</h1>
          <p className="text-lg text-gray-700 leading-relaxed max-w-xl mx-auto">{t.tagline}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-gray-900 mb-2">{t.card1Title}</h3>
            <p className="text-sm text-gray-600">{t.card1Desc}</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-gray-900 mb-2">{t.card2Title}</h3>
            <p className="text-sm text-gray-600">{t.card2Desc}</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-gray-900 mb-2">{t.card3Title}</h3>
            <p className="text-sm text-gray-600">{t.card3Desc}</p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/home')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.getStarted}
          </button>
        </div>
      </div>
    </div>
  );
}
