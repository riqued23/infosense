import { CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

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

export function ResultIndicator({
  name,
  value,
  unit,
  normalMin,
  normalMax,
  rangeMin,
  rangeMax,
  status
}: ResultIndicatorProps) {
  // Format number with commas for readability
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  const fullRange = rangeMax - rangeMin;
  const normalStartPosition = fullRange > 0 ? ((normalMin - rangeMin) / fullRange) * 100 : 30;
  const normalEndPosition = fullRange > 0 ? ((normalMax - rangeMin) / fullRange) * 100 : 70;
  const clampedNormalStart = Math.max(0, Math.min(100, normalStartPosition));
  const clampedNormalEnd = Math.max(clampedNormalStart, Math.min(100, normalEndPosition));
  const normalWidth = clampedNormalEnd - clampedNormalStart;

  // Calculate position of user's value based on where it falls relative to normal range
  let valuePosition: number;
  
  if (fullRange > 0) {
    valuePosition = ((value - rangeMin) / fullRange) * 100;
  } else {
    valuePosition = 50;
  }

  // Clamp position between 0 and 100
  const clampedPosition = Math.max(0, Math.min(100, valuePosition));

  const getStatusInfo = () => {
    switch (status) {
      case 'normal':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Normal Range'
        };
      case 'high':
        return {
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'text-orange-700',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: 'Above Normal'
        };
      case 'low':
        return {
          icon: <TrendingDown className="w-5 h-5" />,
          color: 'text-orange-700',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: 'Below Normal'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`${statusInfo.color}`}>{statusInfo.icon}</span>
          <span className={`text-sm ${statusInfo.color}`}>{statusInfo.label}</span>
        </div>
        <span className="text-sm text-gray-600">
          Your value: <strong className="text-gray-900">{formatNumber(value)} {unit}</strong>
        </span>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
          <span>Display range: {formatNumber(rangeMin)} - {formatNumber(rangeMax)} {unit}</span>
          <span>Reference range: {formatNumber(normalMin)} - {formatNumber(normalMax)} {unit}</span>
        </div>

        {/* Scale background */}
        <div className="h-10 bg-gray-100 rounded-lg relative overflow-hidden">
          {/* Low zone (left) */}
          <div
            className="absolute top-0 left-0 h-full bg-orange-200"
            style={{ width: `${clampedNormalStart}%` }}
          />
          
          {/* Normal zone (middle) */}
          <div
            className="absolute top-0 h-full bg-green-200"
            style={{ 
              left: `${clampedNormalStart}%`,
              width: `${normalWidth}%`
            }}
          />
          
          {/* High zone (right) */}
          <div
            className="absolute top-0 right-0 h-full bg-orange-200"
            style={{ width: `${100 - clampedNormalEnd}%` }}
          />

          {/* User value marker */}
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
            <span className="text-orange-600">Low</span>
            <span className="text-gray-500">&lt; {formatNumber(normalMin)} {unit}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-green-600">Normal</span>
            <span className="text-gray-500">{formatNumber(normalMin)} - {formatNumber(normalMax)} {unit}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-orange-600">High</span>
            <span className="text-gray-500">&gt; {formatNumber(normalMax)} {unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
