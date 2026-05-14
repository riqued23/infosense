import { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Activity, ArrowLeft, BookOpen, ChevronDown, ExternalLink, FileText, Info, Save, MessageCircle, AlertCircle, Image as ImageIcon, HelpCircle, Edit2, Trash2, Plus, Sparkles, Stethoscope } from 'lucide-react';
import { ResultIndicator } from './ResultIndicator';
import { SourceIndicator } from './SourceIndicator';
import { TrendAnalysis } from './TrendAnalysis';
import { MedicalTerm } from './MedicalTerm';
import { LanguageSelector } from './LanguageSelector';
import { AISummaryPanel } from './AISummaryPanel';
import type { ParsedLabReport } from '@/lib/labReportParser';
import { type GeneratedSummary } from '@/lib/aiSummary';
import { buildLocalLabExplanation, getTrustedLabSource, type GeneratedLabExplanation } from '@/lib/labExplanations';
import { buildLocalLabInsights, requestLabInsights, type GeneratedLabInsights } from '@/lib/labInsights';
import exampleImage from 'figma:asset/82fbe702169bdbc28b8a30884aa28c6363cb2024.png';
// @ts-ignore
import { useTranslation } from '../translation/useTranslation';

// ── Static UI label defaults ──────────────────────────────────────────────────
const RESULT_DEFAULTS = {
  originalReport: 'Your Original Report',
  clickToHide: 'Click to hide',
  clickToView: 'Click to view',
  uploadedReportText: 'your uploaded medical report',
  pdfReadComplete: 'PDF Read Complete',
  rangesFromPdf: 'ranges from PDF',
  unavailableRanges: 'without numeric ranges',
  aboutTitle: 'About this explanation:',
  aboutText: 'This information was created by AI to help you understand medical terms and values. It is based on general medical knowledge, not your personal health history. Always discuss your results with your doctor before making any health decisions.',
  refRangeSource: 'Reference range source:',
  uploadedRangeLabel: 'Uploaded report',
  unavailableRangeLabel: 'Not established',
  valueOnlyLabel: 'Value reported',
  noRangeGraphText: 'This report does not provide a numeric reference interval for this value, so ClearCare is not assigning a normal/abnormal label or showing a range graph.',
  labExplanationLoading: 'Building plain-language test explanations...',
  labExplanationFallback: 'Showing plain-language explanations generated on this device.',
  insightsLoadingTitle: 'Creating Your AI Lab Summary',
  insightsLoadingDesc: 'ClearCare is reviewing your lab values, writing plain-language explanations, and preparing your result cards.',
  insightsLoadingStep1: 'Reviewing your uploaded lab values',
  insightsLoadingStep2: 'Checking high, low, and in-range results',
  insightsLoadingStep3: 'Writing easy-to-read explanations',
  insightsLoadingStep4: 'Preparing your personalized summary',
  insightsLoadingActive: 'AI is working',
  insightsLoadingNearlyDone: 'Finishing up',
  whatItMeans: 'What It Means',
  aboutThisTest: 'About This Test',
  yourResult: 'Your Result',
  wantToLearnMore: 'Want to learn more?',
  statusNormal: 'Normal',
  statusHigh: 'High',
  statusLow: 'Low',
  statusNoRange: 'No range',
  prepareQuestions: 'Prepare Questions',
  prepareDesc: 'Based on your results, here are some questions you might want to ask your healthcare provider:',
  addQuestion: 'Add your own question...',
  add: 'Add',
  readyTitle: 'Ready for your appointment?',
  readyDesc: 'You now have a better understanding of your test results. We encourage you to bring this report to your doctor and ask questions about anything that concerns you. Your healthcare provider knows your full medical history and can give you personalized advice.',
  contactDoctor: 'Contact My Doctor',
  importantLabel: 'Important:',
  importantText: 'ClearCare is an educational tool, not a medical service. The AI provides general explanations and cannot diagnose conditions, recommend treatments, or replace professional medical advice. If you have urgent symptoms or health concerns, contact your healthcare provider or seek emergency care immediately.',
  saveForVisit: 'Save for My Visit',
  noResultsTitle: 'No Structured Results Found',
  noResultsDesc: 'The PDF text was captured, but this prototype could not identify supported lab values yet. You can view the extracted text above, or try a searchable CBC report with values such as hemoglobin, WBC, platelets, lymphocytes, neutrophils, or MCV.',
};

const LAB_INSIGHTS_CACHE_PREFIX = 'clearcareLabInsights:v1:';

function hashCacheKey(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function getLabInsightsCacheKey(input: string) {
  return `${LAB_INSIGHTS_CACHE_PREFIX}${hashCacheKey(input)}`;
}

function readCachedLabInsights(cacheKey: string): GeneratedLabInsights | null {
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (!cached) return null;

    const parsed = JSON.parse(cached);

    if (!parsed || typeof parsed !== 'object' || !parsed.summary || !Array.isArray(parsed.explanations)) {
      return null;
    }

    return parsed as GeneratedLabInsights;
  } catch {
    return null;
  }
}

function writeCachedLabInsights(cacheKey: string, insights: GeneratedLabInsights) {
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(insights));
  } catch {
    // Browsers can reject storage in private mode or when the quota is full.
  }
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const mockExplanation = {
  summary: "Your Complete Blood Count (CBC) test results show several measurements of your blood cells. Most of your results are within the normal range, with one result slightly outside the normal range that should be discussed with your doctor.",
  results: [
    {
      name: "Hemoglobin",
      value: 15,
      unit: "g/dL",
      normalMin: 13,
      normalMax: 17,
      rangeMin: 3,
      rangeMax: 20,
      status: "normal" as const,
      explanation: "Hemoglobin is a protein in your red blood cells that carries oxygen throughout your body. Your level is within the normal range, which means your blood is carrying oxygen effectively.",
      terms: [
        { term: "Hemoglobin", definition: "A protein in red blood cells that carries oxygen from the lungs to all parts of the body and returns carbon dioxide back to the lungs." },
        { term: "red blood cells", definition: "Blood cells that carry oxygen throughout the body. They get their red color from hemoglobin." }
      ],
      sourceLevel: "high" as const,
      sources: ["National Institutes of Health", "Mayo Clinic"],
      trends: [
        { date: "2023-01-01", value: 13.5 },
        { date: "2023-02-01", value: 14 },
        { date: "2023-03-01", value: 14.2 },
        { date: "2023-04-01", value: 14.8 },
        { date: "2023-05-01", value: 15 }
      ],
      trendInterpretation: "Your hemoglobin levels have been increasing over the past few months and are now within the normal range, which is a positive trend."
    },
    {
      name: "Total Leucocyte Count (WBC)",
      value: 5100,
      unit: "/μL",
      normalMin: 4600,
      normalMax: 10800,
      rangeMin: 2000,
      rangeMax: 15000,
      status: "normal" as const,
      explanation: "White blood cells help fight infections. Your count is in the normal range, which suggests your immune system is functioning properly.",
      terms: [
        { term: "White blood cells", definition: "Cells in the immune system that help fight infections and diseases. Also called leukocytes or WBC." },
        { term: "infections", definition: "When harmful germs like bacteria or viruses enter the body and cause illness." },
        { term: "immune system", definition: "The body's defense system that protects against infections and diseases." }
      ],
      sourceLevel: "medium" as const,
      sources: ["American Association for Clinical Chemistry"],
      trends: [
        { date: "2023-01-01", value: 5000 },
        { date: "2023-02-01", value: 5200 },
        { date: "2023-03-01", value: 5300 },
        { date: "2023-04-01", value: 5200 },
        { date: "2023-05-01", value: 5100 }
      ],
      trendInterpretation: "Your white blood cell count has been stable over the past few months, which is a good sign."
    },
    {
      name: "Neutrophils",
      value: 79,
      unit: "%",
      normalMin: 40,
      normalMax: 80,
      rangeMin: 20,
      rangeMax: 90,
      status: "normal" as const,
      explanation: "Neutrophils are the most common type of white blood cell that fights bacterial infections. Your percentage is within the normal range.",
      terms: [
        { term: "Neutrophils", definition: "The most abundant type of white blood cell that protects against bacterial and fungal infections by destroying harmful microorganisms." },
        { term: "bacterial infections", definition: "Illnesses caused by harmful bacteria entering the body, such as strep throat or urinary tract infections." }
      ],
      sourceLevel: "medium" as const,
      sources: ["Clinical Hematology Reference Standards"],
      trends: [
        { date: "2023-01-01", value: 79 },
        { date: "2023-02-01", value: 78 },
        { date: "2023-03-01", value: 77 },
        { date: "2023-04-01", value: 76 },
        { date: "2023-05-01", value: 75 }
      ],
      trendInterpretation: "Your neutrophil percentage has been decreasing slightly over the past few months, but it is still within the normal range."
    },
    {
      name: "Lymphocyte",
      value: 18,
      unit: "%",
      normalMin: 20,
      normalMax: 40,
      rangeMin: 10,
      rangeMax: 50,
      status: "low" as const,
      explanation: "Lymphocytes are white blood cells that help your body fight viral infections. Your percentage is slightly lower than normal. This can happen for various reasons and your doctor can determine if this needs attention.",
      terms: [
        { term: "Lymphocytes", definition: "White blood cells that fight viral infections and help produce antibodies. They are a key part of the immune system." },
        { term: "viral infections", definition: "Illnesses caused by viruses, such as the flu, common cold, or COVID-19." },
        { term: "antibodies", definition: "Proteins made by the immune system that recognize and neutralize harmful substances like viruses and bacteria." }
      ],
      sourceLevel: "high" as const,
      sources: ["National Institutes of Health", "Mayo Clinic"],
      trends: [
        { date: "2023-01-01", value: 18 },
        { date: "2023-02-01", value: 19 },
        { date: "2023-03-01", value: 20 },
        { date: "2023-04-01", value: 21 },
        { date: "2023-05-01", value: 22 }
      ],
      trendInterpretation: "Your lymphocyte percentage has been increasing over the past few months, which is a positive trend."
    },
    {
      name: "Platelet Count",
      value: 3.5,
      unit: "lakh/cumm",
      normalMin: 1.5,
      normalMax: 4.4,
      rangeMin: 0.5,
      rangeMax: 6,
      status: "normal" as const,
      explanation: "Platelets help your blood clot when you're injured. Your platelet count is within the healthy range.",
      terms: [
        { term: "Platelets", definition: "Small blood cells that help form clots to stop bleeding when you have a cut or injury." },
        { term: "clot", definition: "A thick mass of blood that forms to stop bleeding and help wounds heal." }
      ],
      sourceLevel: "medium" as const,
      sources: ["American Association for Clinical Chemistry"],
      trends: [
        { date: "2023-01-01", value: 3.5 },
        { date: "2023-02-01", value: 3.6 },
        { date: "2023-03-01", value: 3.7 },
        { date: "2023-04-01", value: 3.8 },
        { date: "2023-05-01", value: 3.9 }
      ],
      trendInterpretation: "Your platelet count has been stable over the past few months, which is a good sign."
    },
    {
      name: "Mean Corpuscular Volume (MCV)",
      value: 94.0,
      unit: "fL",
      normalMin: 83,
      normalMax: 101,
      rangeMin: 70,
      rangeMax: 110,
      status: "normal" as const,
      explanation: "MCV measures the average size of your red blood cells. Your value is normal.",
      terms: [
        { term: "MCV", definition: "Mean Corpuscular Volume - a measurement of the average size of red blood cells. It helps diagnose different types of anemia." }
      ],
      sourceLevel: "general" as const,
      sources: ["General Medical References"],
      trends: [
        { date: "2023-01-01", value: 94.0 },
        { date: "2023-02-01", value: 94.1 },
        { date: "2023-03-01", value: 94.2 },
        { date: "2023-04-01", value: 94.3 },
        { date: "2023-05-01", value: 94.4 }
      ],
      trendInterpretation: "Your MCV has been stable over the past few months, which is a good sign."
    }
  ],
  questionsToAsk: [
    "What does my slightly low lymphocyte percentage mean?",
    "Should I be concerned about the lymphocyte trend?",
    "Are there any lifestyle changes I should consider to support my immune system?",
    "How often should I have my blood tested again?",
    "What symptoms should I watch for that would require immediate attention?"
  ]
};

const summaryData = {
  patientName: "Emily Li",
  testDate: "February 12, 2026",
  reportType: "Complete Blood Count (CBC)",
  keyFindings: [
    "Hemoglobin is within normal range at 15.0 g/dL (normal: 13-17 g/dL)",
    "Lymphocyte percentage is slightly below normal at 18% (normal: 20-40%)",
    "White blood cell count, neutrophils, platelets, and MCV are all within normal ranges",
    "Hemoglobin has shown an increasing trend over the past 6 months"
  ],
  abnormalResults: 1,
  totalResults: 6,
  criticalActions: [
    "Discuss your slightly low lymphocyte percentage with your doctor",
    "Ask about the significance of the lymphocyte trend and whether monitoring is needed"
  ],
  nextSteps: [
    "Schedule a routine follow-up appointment with your healthcare provider if recommended",
    "Mention the lymphocyte result to your doctor at your next visit",
    "Continue to maintain healthy lifestyle habits",
    "Follow any additional recommendations prescribed by your doctor"
  ]
};

export function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, translateBatch } = useTranslation();

  // ── Static label translations ──
  const [t, setT] = useState(RESULT_DEFAULTS);

  useEffect(() => {
    if (language === 'en') { setT(RESULT_DEFAULTS); return; }
    translateBatch(Object.values(RESULT_DEFAULTS)).then((translated: string[]) => {
      const keys = Object.keys(RESULT_DEFAULTS) as (keyof typeof RESULT_DEFAULTS)[];
      setT(Object.fromEntries(keys.map((k, i) => [k, translated[i]])) as typeof RESULT_DEFAULTS);
    });
  }, [language]);

  // ── Uploaded report ──
  const uploadedReport = useMemo<ParsedLabReport | null>(() => {
    try {
      const stored = sessionStorage.getItem('clearcareUploadedReport');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [location.key]);

  const currentExplanation = uploadedReport
    ? {
        summary: uploadedReport.results.length > 0
          ? `${uploadedReport.results.length} lab values were extracted from your uploaded PDF.`
          : 'Your PDF was uploaded, but the app could not recognize structured lab values from the extracted text.',
        results: uploadedReport.results,
        questionsToAsk: uploadedReport.questionsToAsk,
      }
    : mockExplanation;

  const currentSummaryData = uploadedReport
    ? {
        patientName: uploadedReport.patientName,
        testDate: uploadedReport.testDate,
        reportType: uploadedReport.reportType,
        keyFindings: uploadedReport.keyFindings,
        abnormalResults: uploadedReport.results.filter(r => r.status === 'high' || r.status === 'low').length,
        totalResults: Math.max(uploadedReport.results.length, 1),
        criticalActions: uploadedReport.criticalActions,
        nextSteps: uploadedReport.nextSteps,
      }
    : summaryData;
  const insightReport = useMemo(() => ({
    patientName: currentSummaryData.patientName,
    testDate: currentSummaryData.testDate,
    reportType: currentSummaryData.reportType,
  }), [currentSummaryData.patientName, currentSummaryData.testDate, currentSummaryData.reportType]);

  const insightResults = useMemo(
    () => currentExplanation.results.map((result) => ({
      name: result.name,
      value: result.value,
      unit: result.unit,
      normalMin: result.normalMin,
      normalMax: result.normalMax,
      status: result.status,
      referenceRangeSource: 'referenceRangeSource' in result ? result.referenceRangeSource : 'uploaded-report',
    })),
    [currentExplanation.results]
  );

  const insightsRequestKey = useMemo(
    () => JSON.stringify({
      report: insightReport,
      results: insightResults,
      questionsToAsk: currentExplanation.questionsToAsk,
    }),
    [insightReport, insightResults, currentExplanation.questionsToAsk]
  );
  const insightsCacheKey = useMemo(() => getLabInsightsCacheKey(insightsRequestKey), [insightsRequestKey]);
  const localLabExplanations = useMemo(
    () => buildLocalLabInsights(insightResults),
    [insightResults]
  );
  const [labExplanations, setLabExplanations] = useState<GeneratedLabExplanation[]>(localLabExplanations);
  const [aiSummary, setAiSummary] = useState<GeneratedSummary | null>(null);
  const [labInsightStatus, setLabInsightStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [labInsightError, setLabInsightError] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(8);

  // ── Dynamic content translations ──
  const [translatedLabExplanations, setTranslatedLabExplanations] = useState<GeneratedLabExplanation[]>(localLabExplanations);
  const [translatedRefNotes, setTranslatedRefNotes] = useState<string[]>(
    currentExplanation.results.map(r => ('referenceRangeNote' in r ? String((r as any).referenceRangeNote || '') : ''))
  );
  const [translatedResultNames, setTranslatedResultNames] = useState<string[]>(
    currentExplanation.results.map(r => r.name)
  );
  const [displayQuestions, setDisplayQuestions] = useState<string[]>(currentExplanation.questionsToAsk);
  const [translatedBlurb, setTranslatedBlurb] = useState('');

  useEffect(() => {
    let isActive = true;
    const cachedInsights = readCachedLabInsights(insightsCacheKey);

    if (cachedInsights && cachedInsights.explanations.length === insightResults.length) {
      setLabInsightError('');
      setAiSummary(cachedInsights.summary);
      setLabExplanations(cachedInsights.explanations);
      setLabInsightStatus('ready');
      return () => {
        isActive = false;
      };
    }

    setLabInsightStatus('loading');
    setLabInsightError('');
    setAiSummary(null);
    setLabExplanations(localLabExplanations);

    requestLabInsights(insightReport, insightResults, currentExplanation.questionsToAsk)
      .then((insights) => {
        if (!isActive) return;
        writeCachedLabInsights(insightsCacheKey, insights);
        setAiSummary(insights.summary);
        setLabExplanations(insights.explanations);
        setLabInsightStatus('ready');
      })
      .catch((error) => {
        if (!isActive) return;
        setLabInsightError(error instanceof Error ? error.message : 'AI insights unavailable.');
        setAiSummary(null);
        setLabExplanations(localLabExplanations);
        setLabInsightStatus('fallback');
      });

    return () => {
      isActive = false;
    };
  }, [insightsRequestKey, insightsCacheKey, insightReport, insightResults, currentExplanation.questionsToAsk, localLabExplanations]);

  useEffect(() => {
    if (labInsightStatus !== 'loading') {
      setLoadingProgress(100);
      return;
    }

    setLoadingProgress(8);

    const progressTimer = window.setInterval(() => {
      setLoadingProgress((currentProgress) => {
        if (currentProgress < 38) return currentProgress + 7;
        if (currentProgress < 68) return currentProgress + 4;
        if (currentProgress < 88) return currentProgress + 2;
        return Math.min(currentProgress + 0.5, 94);
      });
    }, 650);

    return () => window.clearInterval(progressTimer);
  }, [labInsightStatus, insightsRequestKey]);

  useEffect(() => {
    const explanations = currentExplanation.results.map((result, index) =>
      labExplanations[index] ?? buildLocalLabExplanation({
        name: result.name,
        value: result.value,
        unit: result.unit,
        normalMin: result.normalMin,
        normalMax: result.normalMax,
        status: result.status,
        referenceRangeSource: 'referenceRangeSource' in result ? result.referenceRangeSource : 'uploaded-report',
      })
    );
    const explanationFields = explanations.flatMap((explanation) => [
      explanation.definition,
      explanation.description,
      explanation.resultMeaning,
    ]);
    const refNotes = currentExplanation.results.map(r =>
      'referenceRangeNote' in r ? String((r as any).referenceRangeNote || '') : ''
    );
    const resultNames = currentExplanation.results.map((r: { name: string }) => r.name);
    const qs = currentExplanation.questionsToAsk;
    const blurb = uploadedReport
      ? `ClearCare extracted text from ${uploadedReport.fileName} and recognized ${uploadedReport.results.length} supported lab value${uploadedReport.results.length === 1 ? '' : 's'}.`
      : '';

    if (language === 'en') {
      setTranslatedLabExplanations(explanations);
      setTranslatedRefNotes(refNotes);
      setTranslatedResultNames(resultNames);
      setDisplayQuestions(qs);
      setTranslatedBlurb(blurb);
      return;
    }

    const allStrings = [...explanationFields, ...refNotes, ...qs, ...resultNames, blurb];
    translateBatch(allStrings).then((translated: string[]) => {
      const n = explanationFields.length;
      const m = refNotes.length;
      const q = qs.length;
      const r = resultNames.length;
      const translatedExplanationFields = translated.slice(0, n);
      setTranslatedLabExplanations(explanations.map((explanation, index) => ({
        ...explanation,
        definition: translatedExplanationFields[index * 3] || explanation.definition,
        description: translatedExplanationFields[index * 3 + 1] || explanation.description,
        resultMeaning: translatedExplanationFields[index * 3 + 2] || explanation.resultMeaning,
      })));
      setTranslatedRefNotes(translated.slice(n, n + m));
      setDisplayQuestions(translated.slice(n + m, n + m + q));
      setTranslatedResultNames(translated.slice(n + m + q, n + m + q + r));
      setTranslatedBlurb(translated[n + m + q + r] || blurb);
    });
  }, [language, uploadedReport, labExplanations]);

  // ── Local UI state ──
  const [showTrends, setShowTrends] = useState(false);
  const [showOriginalReport, setShowOriginalReport] = useState(false);
  const [questions, setQuestions] = useState<string[]>(currentExplanation.questionsToAsk);
  const [newQuestion, setNewQuestion] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [expandedResultIndexes, setExpandedResultIndexes] = useState<Set<number>>(new Set());

  const toggleResultCard = (index: number) => {
    setExpandedResultIndexes((currentIndexes) => {
      const nextIndexes = new Set(currentIndexes);

      if (nextIndexes.has(index)) {
        nextIndexes.delete(index);
      } else {
        nextIndexes.add(index);
      }

      return nextIndexes;
    });
  };

  const formatResultValue = (result: typeof currentExplanation.results[number]) =>
    `${result.value.toLocaleString('en-US')} ${result.unit}`.trim();

  const getResultStatusDisplay = (result: typeof currentExplanation.results[number]) => {
    if (result.referenceRangeSource === 'not-established' || result.status === 'not-established') {
      return {
        label: t.statusNoRange,
        badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
        accentClass: 'border-l-gray-300',
      };
    }

    if (result.status === 'high') {
      return {
        label: t.statusHigh,
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
        accentClass: 'border-l-red-500',
      };
    }

    if (result.status === 'low') {
      return {
        label: t.statusLow,
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
        accentClass: 'border-l-red-500',
      };
    }

    return {
      label: t.statusNormal,
      badgeClass: 'bg-green-50 text-green-700 border-green-200',
      accentClass: 'border-l-green-500',
    };
  };

  const renderTextWithTerms = (text: string, terms: Array<{ term: string; definition: string }>) => {
    if (!terms || terms.length === 0) return text;
    const parts: React.ReactNode[] = [];
    let remainingText = text;
    let keyCounter = 0;
    const wrappedTerms = new Set<string>();
    terms.forEach(({ term, definition }) => {
      if (wrappedTerms.has(term.toLowerCase())) return;
      const regex = new RegExp(`\\b(${term})\\b`, 'i');
      const match = remainingText.match(regex);
      if (match && match.index !== undefined) {
        if (match.index > 0) parts.push(remainingText.substring(0, match.index));
        parts.push(
          <MedicalTerm key={`term-${keyCounter++}`} term={term} definition={definition}>
            {match[1]}
          </MedicalTerm>
        );
        remainingText = remainingText.substring(match.index + match[1].length);
        wrappedTerms.add(term.toLowerCase());
      }
    });
    if (remainingText) parts.push(remainingText);
    return parts.length > 0 ? parts : text;
  };

  const renderLabExplanation = (
    resultName: string,
    explanation: GeneratedLabExplanation,
    terms: Array<{ term: string; definition: string }>
  ) => {
    const trustedSource = getTrustedLabSource(resultName);
    const sections = [
      {
        label: t.whatItMeans,
        text: explanation.definition,
        icon: <BookOpen className="w-4 h-4" />,
        color: 'text-blue-700',
        border: 'border-blue-200',
      },
      {
        label: t.aboutThisTest,
        text: explanation.description,
        icon: <Stethoscope className="w-4 h-4" />,
        color: 'text-teal-700',
        border: 'border-teal-200',
      },
      {
        label: t.yourResult,
        text: explanation.resultMeaning,
        icon: <Activity className="w-4 h-4" />,
        color: 'text-indigo-700',
        border: 'border-indigo-200',
      },
    ];

    return (
      <div className="space-y-4 mb-4">
        {sections.map((section) => (
          <section key={section.label} className={`border-l-4 ${section.border} pl-4`}>
            <div className={`flex items-center gap-2 text-sm ${section.color} mb-1`}>
              {section.icon}
              <h4 className="font-medium">{section.label}</h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {renderTextWithTerms(section.text, terms)}
            </p>
          </section>
        ))}
        <a
          href={trustedSource.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 hover:bg-blue-100 transition-colors"
        >
          <span className="font-medium">{t.wantToLearnMore}</span>
          <span>{trustedSource.label}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  };

  const regenerateLabInsights = () => {
    setLabInsightStatus('loading');
    setLabInsightError('');
    setAiSummary(null);
    setLabExplanations(localLabExplanations);

    requestLabInsights(insightReport, insightResults, currentExplanation.questionsToAsk)
      .then((insights) => {
        writeCachedLabInsights(insightsCacheKey, insights);
        setAiSummary(insights.summary);
        setLabExplanations(insights.explanations);
        setLabInsightStatus('ready');
      })
      .catch((error) => {
        setLabInsightError(error instanceof Error ? error.message : 'AI insights unavailable.');
        setAiSummary(null);
        setLabExplanations(localLabExplanations);
        setLabInsightStatus('fallback');
      });
  };

  const renderInsightsLoading = () => {
    const steps = [
      t.insightsLoadingStep1,
      t.insightsLoadingStep2,
      t.insightsLoadingStep3,
      t.insightsLoadingStep4,
    ];
    const activeStepIndex = Math.min(Math.floor((loadingProgress / 100) * steps.length), steps.length - 1);

    return (
      <section className="fixed inset-0 z-50 bg-white text-gray-900">
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(#2563eb_1px,transparent_1px),linear-gradient(90deg,#2563eb_1px,transparent_1px)] bg-[size:36px_36px]" />
        <div className="relative min-h-screen px-6 py-8 flex items-center justify-center">
          <div className="w-full max-w-3xl">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-lg text-blue-950">ClearCare</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-800">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
                </span>
                {loadingProgress > 88 ? t.insightsLoadingNearlyDone : t.insightsLoadingActive}
              </div>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-7 relative w-28 h-28">
                <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
                <div className="absolute inset-3 rounded-full border-2 border-teal-200 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-t-4 border-t-blue-700 border-r-4 border-r-transparent border-b-4 border-b-teal-500 border-l-4 border-l-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-lg">
                    <Sparkles className="w-7 h-7" />
                  </div>
                </div>
              </div>

              <h2 className="text-3xl text-blue-950 mb-3">{t.insightsLoadingTitle}</h2>
              <p className="text-base text-gray-700 leading-relaxed max-w-2xl mx-auto">
                {t.insightsLoadingDesc}
              </p>
            </div>

            <div className="mt-10">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>{steps[activeStepIndex]}</span>
                <span>{Math.round(loadingProgress)}%</span>
              </div>
              <div className="h-3 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-700 transition-all duration-700 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-4 gap-3">
              {steps.map((step, index) => {
                const isComplete = index < activeStepIndex;
                const isActive = index === activeStepIndex;

                return (
                  <div
                    key={step}
                    className={`rounded-lg border px-3 py-4 min-h-28 ${
                      isActive
                        ? 'border-blue-300 bg-blue-50 text-blue-950 shadow-sm'
                        : isComplete
                          ? 'border-green-200 bg-green-50 text-green-900'
                          : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                        isComplete
                          ? 'bg-green-600 text-white'
                          : isActive
                            ? 'bg-blue-700 text-white'
                            : 'bg-gray-100 text-gray-500'
                      }`}>
                        {isComplete ? '✓' : index + 1}
                      </span>
                      {isActive && <Activity className="w-4 h-4 text-blue-700 animate-pulse" />}
                    </div>
                    <p className="text-sm leading-snug">{step}</p>
                  </div>
                );
              })}
            </div>

            <p className="mt-8 text-center text-xs text-gray-500">
              This usually takes a few seconds. Longer reports can take a little more time.
            </p>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LanguageSelector />

      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/home')} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl text-blue-900">ClearCare</h1>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Save className="w-4 h-4" />
              {t.saveForVisit}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Original Report Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <button
            onClick={() => setShowOriginalReport(!showOriginalReport)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-start gap-3">
              <ImageIcon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
              <div className="flex-1 text-left">
                <h2 className="text-lg text-gray-900 mb-1">{t.originalReport}</h2>
                <p className="text-sm text-gray-600">
                  {showOriginalReport ? t.clickToHide : t.clickToView} {t.uploadedReportText}
                </p>
              </div>
            </div>
            <svg className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform ${showOriginalReport ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showOriginalReport && (
            <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
              {uploadedReport ? (
                <div className="bg-gray-50 p-4">
                  <div className="text-sm text-gray-700 mb-3"><strong>File:</strong> {uploadedReport.fileName}</div>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-96 overflow-auto bg-white border border-gray-200 rounded-lg p-4">
                    {uploadedReport.extractedText || 'No selectable text was found in this PDF.'}
                  </pre>
                </div>
              ) : (
                <img src={exampleImage} alt="Complete Blood Count Report" className="w-full h-auto" />
              )}
            </div>
          )}
        </div>

        {/* PDF parse summary */}
        {uploadedReport && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-gray-900 mb-1">{t.pdfReadComplete}</h2>
                <p className="text-sm text-gray-700">
                  {translatedBlurb || `ClearCare extracted text from ${uploadedReport.fileName} and recognized ${uploadedReport.results.length} supported lab value${uploadedReport.results.length === 1 ? '' : 's'}.`}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-50 text-gray-700 border border-gray-200">
                    {uploadedReport.results.filter(r => r.referenceRangeSource === 'uploaded-report').length} {t.rangesFromPdf}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-50 text-gray-700 border border-gray-200">
                    {uploadedReport.results.filter(r => r.referenceRangeSource === 'not-established').length} {t.unavailableRanges}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {uploadedReport?.parserWarnings.map((warning, index) => (
          <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-900">{warning}</div>
          </div>
        ))}

        {/* AI explanation notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>{t.aboutTitle}</strong> {t.aboutText}
          </div>
        </div>

        {labInsightStatus === 'loading' ? (
          renderInsightsLoading()
        ) : (
          <>
            {/* AI Summary */}
            <div className="mb-6">
              <AISummaryPanel
                report={currentSummaryData}
                results={currentExplanation.results}
                questionsToAsk={questions}
                aiSummary={aiSummary}
                aiStatus={labInsightStatus}
                aiError={labInsightError}
                isGenerating={labInsightStatus === 'loading'}
                onRegenerate={regenerateLabInsights}
              />
            </div>

            {/* Detailed result cards */}
            <div className="space-y-4 mb-8">
              {currentExplanation.results.length > 0 && labInsightStatus !== 'ready' && (
            <div className={`rounded-lg border p-3 text-xs ${
              labInsightStatus === 'loading'
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-orange-50 border-orange-200 text-orange-900'
            }`}>
              {labInsightStatus === 'loading' ? t.labExplanationLoading : t.labExplanationFallback}
            </div>
          )}
          {currentExplanation.results.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg text-gray-900 mb-2">{t.noResultsTitle}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{t.noResultsDesc}</p>
            </div>
          )}
          {currentExplanation.results.map((result, index) => {
            const isExpanded = expandedResultIndexes.has(index);
            const statusDisplay = getResultStatusDisplay(result);

            return (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${statusDisplay.accentClass} overflow-hidden transition-shadow hover:shadow-md`}
              >
                <button
                  type="button"
                  onClick={() => toggleResultCard(index)}
                  aria-expanded={isExpanded}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <h3 className="text-lg text-gray-900 truncate">{translatedResultNames[index] || result.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {t.valueOnlyLabel}: <span className="text-gray-800">{formatResultValue(result)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusDisplay.badgeClass}`}>
                      {statusDisplay.label}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5">
                    <div className="pt-2">
                      {result.referenceRangeSource === 'uploaded-report' ? (
                        <ResultIndicator
                          name={result.name}
                          value={result.value}
                          unit={result.unit}
                          normalMin={result.normalMin}
                          normalMax={result.normalMax}
                          rangeMin={result.rangeMin}
                          rangeMax={result.rangeMax}
                          status={result.status}
                        />
                      ) : (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-gray-700">{t.valueOnlyLabel}</span>
                            <strong className="text-gray-900">{formatResultValue(result)}</strong>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">{t.noRangeGraphText}</p>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {renderLabExplanation(
                          result.name,
                          translatedLabExplanations[index] ?? buildLocalLabExplanation({
                            name: result.name,
                            value: result.value,
                            unit: result.unit,
                            normalMin: result.normalMin,
                            normalMax: result.normalMax,
                            status: result.status,
                            referenceRangeSource: 'referenceRangeSource' in result ? result.referenceRangeSource : 'uploaded-report',
                          }),
                          result.terms
                        )}

                        {'referenceRangeNote' in result && (
                          <div className={`rounded-lg border p-3 text-xs mb-4 ${
                            result.referenceRangeSource === 'uploaded-report'
                              ? 'bg-green-50 border-green-200 text-green-800'
                              : 'bg-gray-50 border-gray-200 text-gray-800'
                          }`}>
                            <strong>{t.refRangeSource}</strong>{' '}
                            {result.referenceRangeSource === 'uploaded-report' ? t.uploadedRangeLabel : t.unavailableRangeLabel}.
                            {' '}
                            {translatedRefNotes[index] || (result as any).referenceRangeNote}
                          </div>
                        )}

                        <SourceIndicator level={result.sourceLevel} sources={result.sources} />
                      </div>

                      {showTrends && result.trends && result.referenceRangeSource === 'uploaded-report' && (
                        <div className="mt-4">
                          <TrendAnalysis
                            testName={result.name}
                            unit={result.unit}
                            normalMin={result.normalMin}
                            normalMax={result.normalMax}
                            trends={result.trends}
                            interpretation={result.trendInterpretation}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
            </div>
          </>
        )}

        {/* Prepare Questions */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg text-gray-900">{t.prepareQuestions}</h3>
          </div>
          <p className="text-sm text-gray-700 mb-4">{t.prepareDesc}</p>
          <ul className="space-y-3">
            {displayQuestions.map((question, index) => (
              <li key={index} className="flex items-start gap-2 group">
                <span className="text-blue-600 mt-0.5">•</span>
                {editingIndex === index ? (
                  <div className="flex-1">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={() => {
                        if (editingText.trim()) {
                          const updated = [...questions];
                          updated[index] = editingText;
                          setQuestions(updated);
                        }
                        setEditingIndex(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingText.trim()) {
                            const updated = [...questions];
                            updated[index] = editingText;
                            setQuestions(updated);
                          }
                          setEditingIndex(null);
                        } else if (e.key === 'Escape') {
                          setEditingIndex(null);
                        }
                      }}
                      autoFocus
                      className="w-full text-sm text-gray-700 border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-700">{question}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingIndex(index); setEditingText(questions[index] || question); }}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit question"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setQuestions(questions.filter((_, i) => i !== index));
                          setDisplayQuestions(displayQuestions.filter((_, i) => i !== index));
                        }}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newQuestion.trim()) {
                  setQuestions([...questions, newQuestion]);
                  setDisplayQuestions([...displayQuestions, newQuestion]);
                  setNewQuestion('');
                }
              }}
              placeholder={t.addQuestion}
              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                if (newQuestion.trim()) {
                  setQuestions([...questions, newQuestion]);
                  setDisplayQuestions([...displayQuestions, newQuestion]);
                  setNewQuestion('');
                }
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              {t.add}
            </button>
          </div>
        </div>

        {/* Ready for appointment */}
        <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg text-gray-900 mb-2">{t.readyTitle}</h3>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">{t.readyDesc}</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                {t.contactDoctor}
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-900">
            <strong>{t.importantLabel}</strong> {t.importantText}
          </div>
        </div>
      </main>
    </div>
  );
}
