import { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
// @ts-ignore
import { useTranslation } from '../translation/useTranslation';

interface SourceIndicatorProps {
  level: 'high' | 'medium' | 'general';
  sources: string[];
}

const sourceUrls: Record<string, string> = {
  "National Institutes of Health": "https://www.nih.gov/",
  "Mayo Clinic": "https://www.mayoclinic.org/",
  "American Association for Clinical Chemistry": "https://www.aacc.org/",
  "Clinical Hematology Reference Standards": "https://www.ncbi.nlm.nih.gov/books/NBK2263/",
  "General Medical References": "https://medlineplus.gov/",
  "Centers for Disease Control and Prevention": "https://www.cdc.gov/",
  "CDC": "https://www.cdc.gov/",
  "World Health Organization": "https://www.who.int/",
  "WHO": "https://www.who.int/",
  "American Heart Association": "https://www.heart.org/",
  "American Diabetes Association": "https://diabetes.org/",
  "Uploaded report": "#",
};

const SI_DEFAULTS = {
  highLabel: 'High Reliability',
  highDesc: 'Based on peer-reviewed research and clinical guidelines',
  medLabel: 'Medical Standards',
  medDesc: 'Based on established medical knowledge and standards',
  genLabel: 'General Information',
  genDesc: 'General medical information - discuss with your doctor',
  sourcesHeader: 'Sources:',
};

export function SourceIndicator({ level, sources }: SourceIndicatorProps) {
  const { language, translateBatch } = useTranslation();
  const [t, setT] = useState(SI_DEFAULTS);

  useEffect(() => {
    if (language === 'en') { setT(SI_DEFAULTS); return; }
    translateBatch(Object.values(SI_DEFAULTS)).then((translated: string[]) => {
      const keys = Object.keys(SI_DEFAULTS) as (keyof typeof SI_DEFAULTS)[];
      setT(Object.fromEntries(keys.map((k, i) => [k, translated[i]])) as typeof SI_DEFAULTS);
    });
  }, [language]);

  const info = {
    high: {
      icon: <Shield className="w-4 h-4" />,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: t.highLabel,
      description: t.highDesc,
    },
    medium: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: t.medLabel,
      description: t.medDesc,
    },
    general: {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      label: t.genLabel,
      description: t.genDesc,
    },
  }[level] ?? {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: t.medLabel,
    description: t.medDesc,
  };

  return (
    <div className={`${info.bgColor} border ${info.borderColor} rounded-lg p-3 text-xs`}>
      <div className="flex items-start gap-2 mb-2">
        <span className={info.color}>{info.icon}</span>
        <div className="flex-1">
          <p className={`font-semibold ${info.color} mb-1`}>{info.label}</p>
          <p className="text-gray-600">{info.description}</p>
        </div>
      </div>
      {sources.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-gray-600 mb-1">{t.sourcesHeader}</p>
          <ul className="space-y-1">
            {sources.map((source, index) => (
              <li key={index} className="text-gray-700 flex items-start gap-1">
                <span className="text-gray-400">•</span>
                <span className="flex items-center gap-1">
                  {sourceUrls[source] && sourceUrls[source] !== '#' ? (
                    <a
                      href={sourceUrls[source]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                    >
                      {source}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    source
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
