import { FileText, Download, Calendar, User } from 'lucide-react';
import { MedicalTerm } from './MedicalTerm';

interface SummaryData {
  patientName: string;
  testDate: string;
  reportType: string;
  keyFindings: string[];
  abnormalResults: number;
  totalResults: number;
  criticalActions: string[];
  nextSteps: string[];
}

interface ComprehensiveSummaryProps {
  data: SummaryData;
}

export function ComprehensiveSummary({ data }: ComprehensiveSummaryProps) {
  const handleDownload = () => {
    // In a real app, this would generate a PDF
    alert('Summary download feature - would generate a PDF in production');
  };

  const abnormalPercentage = ((data.abnormalResults / data.totalResults) * 100).toFixed(0);

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl">Comprehensive Summary</h3>
              <p className="text-blue-100 text-sm">Your medical results at a glance</p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4" />
              <p className="text-sm text-blue-100">Patient</p>
            </div>
            <p className="text-lg">{data.patientName}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4" />
              <p className="text-sm text-blue-100">Test Date</p>
            </div>
            <p className="text-lg">{data.testDate}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4" />
              <p className="text-sm text-blue-100">Report Type</p>
            </div>
            <p className="text-lg">{data.reportType}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Introductory Summary */}
        <div className="pb-4 border-b border-gray-200">
          <p className="text-gray-700 leading-relaxed">
            Your{' '}
            <MedicalTerm 
              term="Complete Blood Count (CBC)" 
              definition="A Complete Blood Count is a common blood test that measures different components of your blood, including red blood cells (which carry oxygen), white blood cells (which fight infection), and platelets (which help with clotting). It's used to evaluate your overall health and detect a wide range of conditions."
            >
              <span className="font-medium">Complete Blood Count (CBC)</span>
            </MedicalTerm>{' '}
            test results show several measurements of your blood cells. Most of your results are within the normal range, with one result slightly outside the normal range that should be discussed with your doctor.
          </p>
        </div>

        {/* Results Overview */}
        <div>
          <h4 className="text-gray-900 mb-3">Results Overview</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600"
                  style={{ width: `${100 - Number(abnormalPercentage)}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {data.totalResults - data.abnormalResults} Normal
                  </span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {data.abnormalResults} of {data.totalResults} outside normal range
            </div>
          </div>
        </div>

        {/* Key Findings */}
        <div>
          <h4 className="text-gray-900 mb-3">Key Findings</h4>
          <ul className="space-y-2">
            {data.keyFindings.map((finding, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-600 flex-shrink-0">•</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critical Actions */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-orange-900 mb-3">Important: Discuss with Your Doctor</h4>
          <ul className="space-y-2">
            {data.criticalActions.map((action, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-orange-800">
                <span className="text-orange-600 flex-shrink-0">⚠</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-blue-900 mb-3">Recommended Next Steps</h4>
          <ul className="space-y-2">
            {data.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                <span className="text-blue-600 flex-shrink-0">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 italic border-t border-gray-200 pt-4">
          This summary is generated by AI to help you understand your results. It does not replace professional 
          medical advice. Always consult with your healthcare provider about your test results and treatment options.
        </div>
      </div>
    </div>
  );
}