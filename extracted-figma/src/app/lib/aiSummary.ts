interface LabResult {
  name: string;
  value: number;
  unit: string;
  normalMin: number;
  normalMax: number;
  status: 'normal' | 'high' | 'low';
  trendInterpretation?: string;
  referenceRangeSource?: string;
  referenceRangeNote?: string;
}

interface ReportSummaryData {
  patientName: string;
  testDate: string;
  reportType: string;
}

export interface GeneratedSummary {
  headline: string;
  plainLanguageSummary: string;
  keyTakeaways: string[];
  watchItems: string[];
  suggestedQuestions: string[];
  confidenceNote: string;
}

const normalizeStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 5) : [];

export function normalizeGeneratedSummary(value: unknown): GeneratedSummary | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const headline = typeof candidate.headline === 'string' ? candidate.headline : '';
  const plainLanguageSummary =
    typeof candidate.plainLanguageSummary === 'string' ? candidate.plainLanguageSummary : '';
  const confidenceNote = typeof candidate.confidenceNote === 'string' ? candidate.confidenceNote : '';
  const keyTakeaways = normalizeStringArray(candidate.keyTakeaways);
  const watchItems = normalizeStringArray(candidate.watchItems);
  const suggestedQuestions = normalizeStringArray(candidate.suggestedQuestions);

  if (!headline || !plainLanguageSummary || keyTakeaways.length === 0) {
    return null;
  }

  return {
    headline,
    plainLanguageSummary,
    keyTakeaways,
    watchItems,
    suggestedQuestions,
    confidenceNote,
  };
}

export async function requestAiLabSummary(
  report: ReportSummaryData,
  results: LabResult[],
  questionsToAsk: string[],
) {
  const response = await fetch('/api/lab-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report, results, questionsToAsk }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = typeof payload.error === 'string' ? payload.error : 'AI summary request failed.';
    throw new Error(errorMessage);
  }

  const summary = normalizeGeneratedSummary(payload.summary);

  if (!summary) {
    throw new Error('AI returned an unexpected summary format.');
  }

  return summary;
}
