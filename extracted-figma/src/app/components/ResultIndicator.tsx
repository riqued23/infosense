import { useState, useEffect } from 'react';
import { CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
// @ts-ignore
import { useTranslation } from '../translation/useTranslation';

interface ResultIndicatorProps {
  name: string;
  value: number;
  unit: string;
  normalMin: number;
  normalMax: number;
  rangeMin: number;
  rangeMax: number;
  status: 'normal' | 'high' | 'low';
}

const RI_DEFAULTS = {
  normalRange: 'Normal Range',
  aboveNormal: 'Above Normal',
  belowNormal: 'Below Normal',
  yourValue: 'Your value:',
  displayRange: 'Display range:',
  referenceRange: 'Reference range:',
  low: 'Low',
  normal: 'Normal',
  high: 'High',
};

export function ResultIndicator({
  value,
  unit,
  normalMin,
  normalMax,
  rangeMin,
  rangeMax,
  status,
}: ResultIndicatorProps) {
  const { language, translateBatch } = useTranslation();
  const [t, setT] = useState(RI_DEFAULTS);

  useEffect(() => {
    if (language === 'en') { setT(RI_DEFAULTS); return; }
    translateBatch(Object.values(RI_DEFAULTS)).then((translated: string[]) => {
      const keys = Object.keys(RI_DEFAULTS) as (keyof typeof RI_DEFAULTS)[];
      setT(Object.fromEntries(keys.map((k, i) => [k, translated[i]])) as typeof RI_DEFAULTS);
    });
  }, [language]);

  const formatNumber = (num: number) => num.toLocaleString('en-US');

  const fullRange = rangeMax - rangeMin;
  const normalStartPosition = fullRange > 0 ? ((normalMin - rangeMin) / fullRange) * 100 : 30;
  const normalEndPosition = fullRange > 0 ? ((normalMax - rangeMin) / fullRange) * 100 : 70;
  const clampedNormalStart = Math.max(0, Math.min(100, normalStartPosition));
  const clampedNormalEnd = Math.max(clampedNormalStart, Math.min(100, normalEndPosition));
  const normalWidth = clampedNormalEnd - clampedNormalStart;

  const valuePosition = fullRange > 0 ? ((value - rangeMin) / fullRange) * 100 : 50;
  const clampedPosition = Math.max(0, Math.min(100, valuePosition));

  const statusInfo = {
    normal: { icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-700', label: t.normalRange },
    high:   { icon: <TrendingUp className="w-5 h-5" />,  color: 'text-orange-700', label: t.aboveNormal },
    low:    { icon: <TrendingDown className="w-5 h-5" />, color: 'text-orange-700', label: t.belowNormal },
  }[status];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={statusInfo.color}>{statusInfo.icon}</span>
          <span className={`text-sm ${statusInfo.color}`}>{statusInfo.label}</span>
        </div>
        <span className="text-sm text-gray-600">
          {t.yourValue} <strong className="text-gray-900">{formatNumber(value)} {unit}</strong>
        </span>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
          <span>{t.displayRange} {formatNumber(rangeMin)} - {formatNumber(rangeMax)} {unit}</span>
          <span>{t.referenceRange} {formatNumber(normalMin)} - {formatNumber(normalMax)} {unit}</span>
        </div>

        {/* Scale background */}
        <div className="h-10 bg-gray-100 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-orange-200" style={{ width: `${clampedNormalStart}%` }} />
          <div className="absolute top-0 h-full bg-green-200" style={{ left: `${clampedNormalStart}%`, width: `${normalWidth}%` }} />
          <div className="absolute top-0 right-0 h-full bg-orange-200" style={{ width: `${100 - clampedNormalEnd}%` }} />
          <div
            className="absolute top-0 h-full flex items-center transition-all duration-300"
            style={{ left: `${clampedPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-1 h-10 bg-blue-600 shadow-lg" />
          </div>
        </div>

        {/* Scale labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <div className="flex flex-col items-start">
            <span className="text-orange-600">{t.low}</span>
            <span className="text-gray-500">&lt; {formatNumber(normalMin)} {unit}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-green-600">{t.normal}</span>
            <span className="text-gray-500">{formatNumber(normalMin)} - {formatNumber(normalMax)} {unit}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-orange-600">{t.high}</span>
            <span className="text-gray-500">&gt; {formatNumber(normalMax)} {unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
