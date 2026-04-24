import { useState } from 'react';
import { Info } from 'lucide-react';

interface MedicalTermProps {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export function MedicalTerm({ term, definition, children }: MedicalTermProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span className="relative inline-block">
      <span
        className="border-b-2 border-dotted border-blue-400 cursor-help text-blue-700"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {children}
      </span>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-50">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">{term}</p>
              <p className="text-gray-200">{definition}</p>
            </div>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </div>
      )}
    </span>
  );
}
