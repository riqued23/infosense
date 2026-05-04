import { AlertTriangle, CheckCircle2, ClipboardList, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { requestAiLabSummary, type GeneratedSummary } from '../lib/aiSummary';
import { useMemo, useState, useEffect } from 'react';
// @ts-ignore
import { useTranslation } from '../translation/useTranslation';
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

const UI_LABELS = {
  panelTitle: 'AI Lab Summary',
  statusLocalPreview: 'Local preview',
  statusGenerating: 'Generating...',
  statusAiGenerated: 'OpenAI-generated',
  statusLocalFallback: 'Local fallback',
  btnGenerating: 'Generating',
  btnRegenerate: 'Regenerate',
  btnGenerate: 'Generate AI',
  inRange: 'In Range',
  ofReviewed: 'of',
  reviewedResults: 'reviewed results',
  needsReview: 'Needs Review',
  outsideRange: 'Outside reference range',
  clinicalContext: 'Clinical Context',
  bringToTeam: 'Bring this report to your care team for full interpretation.',
  keyTakeaways: 'Key Takeaways',
  watchItems: 'Watch Items',
  questionsHeader: 'Questions to Ask Your Doctor',
  localPreviewNotice: 'This is a local preview. Press Generate AI to send the reviewed lab values to OpenAI for a plain-language summary.',
  aiUnavailablePrefix: 'AI summary unavailable:',
  aiUnavailableSuffix: 'Showing the local rule-based summary instead.',
};

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
  const [aiSummary, setAiSummary] = useState<GeneratedSummary | null>(null);
  const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'ready' | 'fallback'>('idle');
  const [aiError, setAiError] = useState('');
  const { language, translateBatch } = useTranslation() as {
    language: string;
    translateBatch: (texts: string[]) => Promise<string[]>;
  };
  const localSummary = useMemo(
    () => generateSummary(report, results, questionsToAsk, summaryVersion),
    [questionsToAsk, report, results, summaryVersion]
  );
  const summary = aiSummary ?? localSummary;

  const loadAiSummary = async () => {
    setIsGenerating(true);
    setAiStatus('loading');
    setAiError('');
    setAiSummary(null);

    try {
      const nextSummary = await requestAiLabSummary(report, results, questionsToAsk);

      setAiSummary(nextSummary);
      setAiStatus('ready');
    } catch (error) {
      setAiSummary(null);
      setAiStatus('fallback');
      setAiError(error instanceof Error ? error.message : 'AI summary unavailable.');
    } finally {
      setIsGenerating(false);
    }
  };

  const [labels, setLabels] = useState(UI_LABELS);
  const [translatedSummary, setTranslatedSummary] = useState<GeneratedSummary | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (language === 'en') {
      setLabels(UI_LABELS);
      setTranslatedSummary(null);
      return;
    }

    setIsTranslating(true);

    const labelValues = Object.values(UI_LABELS);
    const summaryStrings = [
      summary.headline,
      summary.plainLanguageSummary,
      ...summary.keyTakeaways,
      ...summary.watchItems,
      ...summary.suggestedQuestions,
      summary.confidenceNote,
    ];

    translateBatch([...labelValues, ...summaryStrings])
      .then((translated: string[]) => {
        const labelKeys = Object.keys(UI_LABELS) as (keyof typeof UI_LABELS)[];
        const translatedLabels = Object.fromEntries(
          labelKeys.map((k, i) => [k, translated[i]])
        ) as typeof UI_LABELS;

        let i = labelValues.length;
        const ts: GeneratedSummary = {
          headline: translated[i++],
          plainLanguageSummary: translated[i++],
          keyTakeaways: summary.keyTakeaways.map(() => translated[i++]),
          watchItems: summary.watchItems.map(() => translated[i++]),
          suggestedQuestions: summary.suggestedQuestions.map(() => translated[i++]),
          confidenceNote: translated[i++],
        };

        setLabels(translatedLabels);
        setTranslatedSummary(ts);
        setIsTranslating(false);
      })
      .catch(() => setIsTranslating(false));
  }, [language, summary]);

  const displaySummary = translatedSummary ?? summary;

  const handleRegenerate = () => {
    setSummaryVersion((version) => version + 1);
    loadAiSummary();
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
              <p className="text-sm text-blue-100 mb-1">
                {labels.panelTitle}
                {aiStatus === 'idle' && <span className="ml-2 text-blue-200">{labels.statusLocalPreview}</span>}
                {aiStatus === 'loading' && <span className="ml-2 text-blue-200">{labels.statusGenerating}</span>}
                {aiStatus === 'ready' && <span className="ml-2 text-green-100">{labels.statusAiGenerated}</span>}
                {aiStatus === 'fallback' && <span className="ml-2 text-orange-100">{labels.statusLocalFallback}</span>}
              </p>
              <h2 className="text-xl leading-snug">{displaySummary.headline}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={aiStatus === 'ready' ? handleRegenerate : loadAiSummary}
            disabled={isGenerating || isTranslating}
            className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 disabled:opacity-70 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? labels.btnGenerating : aiStatus === 'ready' ? labels.btnRegenerate : labels.btnGenerate}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <p className="text-gray-700 leading-relaxed">{displaySummary.plainLanguageSummary}</p>

        {aiStatus === 'idle' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
            {labels.localPreviewNotice}
          </div>
        )}

        {aiStatus === 'fallback' && aiError && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-800">
            {labels.aiUnavailablePrefix} {aiError} {labels.aiUnavailableSuffix}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-3">
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-sm">{labels.inRange}</h3>
            </div>
            <p className="text-2xl text-green-900">{results.filter((result) => result.status === 'normal').length}</p>
            <p className="text-xs text-green-800">{labels.ofReviewed} {results.length} {labels.reviewedResults}</p>
          </div>

          <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm">{labels.needsReview}</h3>
            </div>
            <p className="text-2xl text-orange-900">{results.filter((result) => result.status !== 'normal').length}</p>
            <p className="text-xs text-orange-800">{labels.outsideRange}</p>
          </div>

          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2 text-blue-800">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm">{labels.clinicalContext}</h3>
            </div>
            <p className="text-sm text-blue-900 leading-snug">{labels.bringToTeam}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-5 h-5 text-blue-700" />
              <h3 className="text-gray-900">{labels.keyTakeaways}</h3>
            </div>
            <ul className="space-y-2">
              {displaySummary.keyTakeaways.map((takeaway, index) => (
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
              <h3 className="text-gray-900">{labels.watchItems}</h3>
            </div>
            <ul className="space-y-2">
              {displaySummary.watchItems.map((item, index) => (
                <li key={index} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-orange-600 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-gray-900 mb-3">{labels.questionsHeader}</h3>
          <ul className="space-y-2">
            {displaySummary.suggestedQuestions.map((question, index) => (
              <li key={index} className="text-sm text-gray-700">
                {index + 1}. {question}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xs text-gray-500 border-t border-gray-200 pt-4">
          {displaySummary.confidenceNote}
        </div>
      </div>
    </section>
  );
}
