import { Shield, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface SourceIndicatorProps {
  level: 'high' | 'medium' | 'general';
  sources: string[];
}

// Mapping of source names to their URLs
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
  "American Diabetes Association": "https://diabetes.org/"
};

export function SourceIndicator({ level, sources }: SourceIndicatorProps) {
  const getSourceInfo = () => {
    switch (level) {
      case 'high':
        return {
          icon: <Shield className="w-4 h-4" />,
          color: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'High Reliability',
          description: 'Based on peer-reviewed research and clinical guidelines'
        };
      case 'medium':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Medical Standards',
          description: 'Based on established medical knowledge and standards'
        };
      case 'general':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          color: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'General Information',
          description: 'General medical information - discuss with your doctor'
        };
      default:
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Medical Standards',
          description: 'Based on established medical knowledge and standards'
        };
    }
  };

  const info = getSourceInfo();

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
          <p className="text-gray-600 mb-1">Sources:</p>
          <ul className="space-y-1">
            {sources.map((source, index) => (
              <li key={index} className="text-gray-700 flex items-start gap-1">
                <span className="text-gray-400">•</span>
                <span className="flex items-center gap-1">
                  {sourceUrls[source] ? (
                    <>
                      <a 
                        href={sourceUrls[source]} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                      >
                        {source}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
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