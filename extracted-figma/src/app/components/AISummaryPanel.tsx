import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardList, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

type LabResultStatus = 'normal' | 'high' | 'low';

interface LabResult {
  name: string;
  value: number;
  unit: string;
  normalMin: number;
  normalMax: number;
  status: LabResultStatus;
  trendInterpretation?: string;
}

interface ReportSummaryData {
  patientName: string;
  testDate: string;
  reportType: string;
}

interface AISummaryPanelProps {
  report: ReportSummaryData;
  results: LabResult[];
  questionsToAsk: string[];
}

interface GeneratedSummary {
  headline: string;
  plainLanguageSummary: string;
  keyTakeaways: string[];
  watchItems: string[];
  suggestedQuestions: string[];
  confidenceNote: string;
}

const formatValue = (result: LabResult) => `${result.value.toLocaleString('en-US')} ${result.unit}`;

function describeAbnormalResult(result: LabResult) {
  const direction = result.status === 'low' ? 'below' : 'above';
  return `${result.name} is ${direction} the reference range at ${formatValue(result)} (expected ${result.normalMin}-${result.normalMax} ${result.unit}).`;
}

function generateSummary(report: ReportSummaryData, results: LabResult[], questionsToAsk: string[], version: number): GeneratedSummary {
  const abnormalResults = results.filter((result) => result.status !== 'normal');
  const normalResults = results.filter((result) => result.status === 'normal');
  const trendHighlights = results
    .filter((result) => result.trendInterpretation)
    .slice(0, 2)
    .map((result) => result.trendInterpretation as string);
  const summaryLeadIns = [
    `${report.patientName}'s ${report.reportType} from ${report.testDate} includes ${results.length} reviewed measurements.`,
    `This ${report.reportType} summary reviews ${results.length} lab values from ${report.testDate}.`,
    `For ${report.patientName}'s ${report.testDate} ${report.reportType}, ${results.length} measurements were reviewed.`,
  ];
  const leadIn = summaryLeadIns[(version - 1) % summaryLeadIns.length];

  if (results.length === 0) {
    return {
      headline: `${report.reportType}: no structured lab values found`,
      plainLanguageSummary:
        'The uploaded report text was captured, but ClearCare could not identify supported lab values from it yet. This can happen with scanned PDFs, unusual formatting, or lab markers this prototype does not parse yet.',
      keyTakeaways: [
        'No numeric lab values were recognized for summary generation.',
        'The extracted text can still be reviewed from the original report section.',
        'A clinician should review the original PDF directly.',
      ],
      watchItems: ['Try a searchable PDF or a report that includes common CBC markers such as hemoglobin, WBC, platelets, lymphocytes, neutrophils, or MCV.'],
      suggestedQuestions: questionsToAsk.slice(0, 3),
      confidenceNote:
        'Generated from extracted PDF text only. No medical interpretation was made because structured values were not recognized.',
    };
  }

  const abnormalText =
    abnormalResults.length === 0
      ? 'No values are marked outside the provided reference ranges.'
      : abnormalResults.map(describeAbnormalResult).join(' ');

  const headline =
    abnormalResults.length === 0
      ? `${report.reportType}: all reviewed values are in range`
      : `${report.reportType}: ${abnormalResults.length} value needs a closer look`;

  return {
    headline,
    plainLanguageSummary: `${leadIn} ${normalResults.length} are within the provided reference ranges. ${abnormalText} This summary is educational and should be reviewed with a clinician who knows the patient's history.`,
    keyTakeaways: [
      `${normalResults.length} of ${results.length} results are in the normal range.`,
      abnormalResults.length > 0
        ? abnormalResults.map(describeAbnormalResult)[0]
        : 'The report does not show a flagged high or low result in this sample.',
      trendHighlights[0] ?? 'Trend information is limited for this report.',
    ],
    watchItems:
      abnormalResults.length > 0
        ? abnormalResults.map((result) => `Ask whether the ${result.name} result should be rechecked or monitored.`)
        : ['Continue routine follow-up based on your clinician\'s guidance.'],
    suggestedQuestions: questionsToAsk.slice(0, 3),
    confidenceNote:
      'Generated from the visible lab values and reference ranges. It does not include symptoms, medications, prior diagnoses, or your clinician\'s interpretation.',
  };
}

export function AISummaryPanel({ report, results, questionsToAsk }: AISummaryPanelProps) {
  const [summaryVersion, setSummaryVersion] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const summary = useMemo(
    () => generateSummary(report, results, questionsToAsk, summaryVersion),
    [questionsToAsk, report, results, summaryVersion]
  );

  const handleRegenerate = () => {
    setIsGenerating(true);
    window.setTimeout(() => {
      setSummaryVersion((version) => version + 1);
      setIsGenerating(false);
    }, 700);
  };

  return (
    <section className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden">
      <div className="bg-blue-900 text-white px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-blue-100 mb-1">AI Lab Summary</p>
              <h2 className="text-xl leading-snug">{summary.headline}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 disabled:opacity-70 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating' : 'Regenerate'}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <p className="text-gray-700 leading-relaxed">{summary.plainLanguageSummary}</p>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-sm">In Range</h3>
            </div>
            <p className="text-2xl text-green-900">{results.filter((result) => result.status === 'normal').length}</p>
            <p className="text-xs text-green-800">of {results.length} reviewed results</p>
          </div>

          <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm">Needs Review</h3>
            </div>
            <p className="text-2xl text-orange-900">{results.filter((result) => result.status !== 'normal').length}</p>
            <p className="text-xs text-orange-800">outside reference range</p>
          </div>

          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2 text-blue-800">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm">Clinical Context</h3>
            </div>
            <p className="text-sm text-blue-900 leading-snug">Bring this summary to your care team for interpretation.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-5 h-5 text-blue-700" />
              <h3 className="text-gray-900">Key Takeaways</h3>
            </div>
            <ul className="space-y-2">
              {summary.keyTakeaways.map((takeaway, index) => (
                <li key={index} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 flex-shrink-0">•</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-700" />
              <h3 className="text-gray-900">Watch Items</h3>
            </div>
            <ul className="space-y-2">
              {summary.watchItems.map((item, index) => (
                <li key={index} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-orange-600 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-gray-900 mb-3">Questions This Summary Suggests</h3>
          <ul className="space-y-2">
            {summary.suggestedQuestions.map((question, index) => (
              <li key={index} className="text-sm text-gray-700">
                {index + 1}. {question}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xs text-gray-500 border-t border-gray-200 pt-4">
          {summary.confidenceNote}
        </div>
      </div>
    </section>
  );
}
