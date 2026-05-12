import { AlertTriangle, CheckCircle2, ClipboardList, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { requestAiLabSummary, type GeneratedSummary } from '../lib/aiSummary';
import { useMemo, useState, useEffect } from 'react';
// @ts-ignore
import { useTranslation } from '../translation/useTranslation';
type LabResultStatus = 'normal' | 'high' | 'low' | 'not-established';

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

function explainMarkerRole(name: string) {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('cd4') || lowerName.includes('cd 4')) {
    return 'CD4 cells are immune cells. They help direct the body\'s response to germs.';
  }

  if (lowerName.includes('cd8') || lowerName.includes('cd 8')) {
    return 'CD8 cells are immune cells. They help the body find and remove infected cells.';
  }

  if (lowerName.includes('neutrophil')) {
    return 'Neutrophils are white blood cells. They help fight many common infections.';
  }

  if (lowerName.includes('lymph')) {
    return 'Lymphocytes are white blood cells. They help the immune system respond to germs.';
  }

  if (lowerName.includes('mono')) {
    return 'Monocytes are white blood cells. They help clean up germs and damaged cells.';
  }

  if (lowerName.includes('eos')) {
    return 'Eosinophils are white blood cells. They can be linked with allergies and parasites.';
  }

  if (lowerName.includes('baso')) {
    return 'Basophils are white blood cells. They can be involved in allergic responses.';
  }

  if (lowerName.includes('hemoglobin')) {
    return 'Hemoglobin is part of red blood cells. It helps carry oxygen through the body.';
  }

  if (lowerName === 'wbc' || lowerName.includes('white blood')) {
    return 'White blood cells help the body fight germs.';
  }

  if (lowerName === 'rbc' || lowerName.includes('red blood')) {
    return 'Red blood cells carry oxygen through the body.';
  }

  if (lowerName.includes('platelet')) {
    return 'Platelets help blood clot when you bleed.';
  }

  return `${name} is one lab value from this report. Your care team can explain how it fits your health.`;
}

function describeAbnormalResult(result: LabResult) {
  const direction = result.status === 'low' ? 'low' : 'high';
  return `${result.name} is ${direction}. Your result is ${formatValue(result)}. The usual range on this report is ${result.normalMin}-${result.normalMax} ${result.unit}. ${explainMarkerRole(result.name)} Ask your doctor what this means for you.`;
}

function describeAbnormalTakeaway(results: LabResult[]) {
  if (results.length === 0) {
    return 'No reviewed value is marked high or low.';
  }

  if (results.length === 1) {
    const result = results[0];
    return `One result is ${result.status}. Ask your doctor what ${result.name} means for you.`;
  }

  const highCount = results.filter((result) => result.status === 'high').length;
  const lowCount = results.filter((result) => result.status === 'low').length;
  const parts = [
    highCount > 0 ? `${highCount} high` : '',
    lowCount > 0 ? `${lowCount} low` : '',
  ].filter(Boolean);

  return `${results.length} results need review (${parts.join(', ')}). Ask your doctor what they mean together.`;
}

function describeNoRangeTakeaway(results: LabResult[]) {
  if (results.length === 0) {
    return 'Each reviewed value has a usual range on this report.';
  }

  return `${results.length} value${results.length === 1 ? '' : 's'} do not have a usual range on this report. ClearCare did not label them high or low.`;
}

function generateSummary(report: ReportSummaryData, results: LabResult[], questionsToAsk: string[], version: number): GeneratedSummary {
  const abnormalResults = results.filter((result) => result.status === 'high' || result.status === 'low');
  const normalResults = results.filter((result) => result.status === 'normal');
  const notEstablishedResults = results.filter((result) => result.status === 'not-established');
  const summaryLeadIns = [
    `${report.patientName}'s report has ${results.length} lab value${results.length === 1 ? '' : 's'} to review.`,
    `This summary looks at ${results.length} lab value${results.length === 1 ? '' : 's'} from ${report.testDate}.`,
    `${report.reportType} includes ${results.length} lab value${results.length === 1 ? '' : 's'} in this upload.`,
  ];
  const leadIn = summaryLeadIns[(version - 1) % summaryLeadIns.length];

  if (results.length === 0) {
    return {
      headline: `${report.reportType}: no structured lab values found`,
      plainLanguageSummary:
        'ClearCare could read the file, but it could not find clear lab values. This can happen when a PDF is scanned or the table is hard to read.',
      keyTakeaways: [
        'No clear lab values were found.',
        'You can still review the text from the file.',
        'Ask your care team to review the original report.',
      ],
      watchItems: ['Try uploading a searchable PDF if you have one.'],
      suggestedQuestions: questionsToAsk.slice(0, 3),
      confidenceNote:
        'This is educational and based only on text ClearCare could read from the file.',
    };
  }

  const abnormalText =
    abnormalResults.length === 0
      ? 'No values are marked high or low.'
      : abnormalResults.map(describeAbnormalResult).join(' ');
  const notEstablishedText =
    notEstablishedResults.length > 0
      ? `${notEstablishedResults.length} value${notEstablishedResults.length === 1 ? '' : 's'} did not have a usual range on this report. ClearCare did not label those values high or low.`
      : '';
  const abnormalTeachingText =
    abnormalResults.length > 0
      ? abnormalResults
          .slice(0, 2)
          .map((result) => explainMarkerRole(result.name))
          .join(' ')
      : '';

  const headline =
    abnormalResults.length === 0
      ? `${report.reportType}: all reviewed values are in range`
      : `${report.reportType}: ${abnormalResults.length} value${abnormalResults.length === 1 ? '' : 's'} need review`;

  return {
    headline,
    plainLanguageSummary: `${leadIn} ${normalResults.length} value${normalResults.length === 1 ? '' : 's'} are within the usual range shown on the report. ${abnormalText} ${abnormalTeachingText} ${notEstablishedText} This is educational. Review it with your doctor or care team.`,
    keyTakeaways: [
      `${normalResults.length} of ${results.length} value${results.length === 1 ? '' : 's'} are in range.`,
      describeAbnormalTakeaway(abnormalResults),
      describeNoRangeTakeaway(notEstablishedResults),
    ],
    watchItems:
      abnormalResults.length > 0
        ? abnormalResults.map((result) => `Ask your doctor what the ${result.name} result means for you.`)
        : ['Ask your doctor if any value needs follow-up.'],
    suggestedQuestions: questionsToAsk.slice(0, 3),
    confidenceNote:
      'This is educational and based only on the lab values shown here. It does not include symptoms, medicines, past health history, or your clinician\'s judgment.',
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
            <p className="text-2xl text-orange-900">{results.filter((result) => result.status === 'high' || result.status === 'low').length}</p>
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
