import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';

interface TrendData {
  date: string;
  value: number;
}

interface TrendAnalysisProps {
  testName: string;
  unit: string;
  normalMin: number;
  normalMax: number;
  trends: TrendData[];
  interpretation: string;
}

export function TrendAnalysis({ testName, unit, normalMin, normalMax, trends, interpretation }: TrendAnalysisProps) {
  const latest = trends[trends.length - 1];
  const previous = trends[trends.length - 2];
  const change = latest ? latest.value - (previous?.value || latest.value) : 0;
  const changePercent = previous ? ((change / previous.value) * 100).toFixed(1) : 0;

  const getTrendIcon = () => {
    if (change > 0) return <TrendingUp className="w-5 h-5 text-orange-600" />;
    if (change < 0) return <TrendingDown className="w-5 h-5 text-blue-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getTrendColor = (value: number) => {
    if (value >= normalMin && value <= normalMax) return 'bg-green-500';
    return 'bg-orange-500';
  };

  const maxValue = Math.max(...trends.map(t => t.value), normalMax);
  const minValue = Math.min(...trends.map(t => t.value), normalMin);
  const range = maxValue - minValue;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg text-gray-900">Trend Over Time</h4>
        <div className="flex items-center gap-2 text-sm">
          {getTrendIcon()}
          <span className="text-gray-700">
            {change > 0 ? '+' : ''}{change.toFixed(1)} {unit}
            {previous && ` (${change > 0 ? '+' : ''}${changePercent}%)`}
          </span>
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="relative mb-6">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300"></div>
        <div className="relative flex justify-between items-end h-32">
          {trends.map((trend, index) => {
            const height = ((trend.value - minValue) / range) * 100;
            const isInRange = trend.value >= normalMin && trend.value <= normalMax;
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="relative w-full flex flex-col items-center">
                  <div
                    className={`w-8 rounded-t-lg transition-all ${getTrendColor(trend.value)}`}
                    style={{ height: `${Math.max(height, 10)}px` }}
                  ></div>
                  <div className={`w-3 h-3 rounded-full ${getTrendColor(trend.value)} border-2 border-white -mt-1`}></div>
                  <div className="text-xs text-gray-900 mt-2">{trend.value}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interpretation */}
      <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
        <p className="text-sm text-gray-700 leading-relaxed">{interpretation}</p>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Normal range: {normalMin} - {normalMax} {unit}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>Outside normal range</span>
        </div>
      </div>
    </div>
  );
}