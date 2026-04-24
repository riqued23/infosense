import { AlertCircle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

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

  // Fixed visual positions for consistent appearance across all graphs
  const normalStartPosition = 30; // Fixed at 30%
  const normalEndPosition = 70;   // Fixed at 70%
  const normalWidth = normalEndPosition - normalStartPosition; // 40% width

  // Calculate position of user's value based on where it falls relative to normal range
  let valuePosition: number;
  
  if (value < normalMin) {
    // Value is below normal - map to 0-30% zone
    const belowRange = normalMin - rangeMin;
    const belowValue = normalMin - value;
    const belowPercent = belowRange > 0 ? (belowValue / belowRange) : 0;
    valuePosition = normalStartPosition * (1 - belowPercent);
  } else if (value > normalMax) {
    // Value is above normal - map to 70-100% zone
    const aboveRange = rangeMax - normalMax;
    const aboveValue = value - normalMax;
    const abovePercent = aboveRange > 0 ? (aboveValue / aboveRange) : 0;
    valuePosition = normalEndPosition + ((100 - normalEndPosition) * abovePercent);
  } else {
    // Value is within normal range - map to 30-70% zone
    const normalRange = normalMax - normalMin;
    const valueInNormal = value - normalMin;
    const normalPercent = normalRange > 0 ? (valueInNormal / normalRange) : 0.5;
    valuePosition = normalStartPosition + (normalWidth * normalPercent);
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
        {/* Scale background */}
        <div className="h-10 bg-gray-100 rounded-lg relative overflow-hidden">
          {/* Low zone (left) */}
          <div
            className="absolute top-0 left-0 h-full bg-orange-200"
            style={{ width: `${normalStartPosition}%` }}
          />
          
          {/* Normal zone (middle) */}
          <div
            className="absolute top-0 h-full bg-green-200"
            style={{ 
              left: `${normalStartPosition}%`,
              width: `${normalWidth}%`
            }}
          />
          
          {/* High zone (right) */}
          <div
            className="absolute top-0 right-0 h-full bg-orange-200"
            style={{ width: `${100 - normalEndPosition}%` }}
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
            <span className="text-gray-500">&lt; {formatNumber(normalMin)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-green-600">Normal</span>
            <span className="text-gray-500">{formatNumber(normalMin)} - {formatNumber(normalMax)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-orange-600">High</span>
            <span className="text-gray-500">&gt; {formatNumber(normalMax)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}