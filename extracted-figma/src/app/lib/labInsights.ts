import { normalizeGeneratedSummary, type GeneratedSummary } from './aiSummary';
import { buildLocalLabExplanation, normalizeLabExplanation, type GeneratedLabExplanation } from './labExplanations';

interface LabResult {
  name: string;
  value: number;
  unit: string;
  normalMin: number;
  normalMax: number;
  status: 'normal' | 'high' | 'low' | 'not-established';
  trendInterpretation?: string;
  referenceRangeSource?: string;
  referenceRangeNote?: string;
}

interface ReportSummaryData {
  patientName: string;
  testDate: string;
  reportType: string;
}

export interface GeneratedLabInsights {
  summary: GeneratedSummary;
  explanations: GeneratedLabExplanation[];
}

export async function requestLabInsights(
  report: ReportSummaryData,
  results: LabResult[],
  questionsToAsk: string[],
) {
  const response = await fetch('/api/lab-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report, results, questionsToAsk }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = typeof payload.error === 'string' ? payload.error : 'AI insights request failed.';
    throw new Error(errorMessage);
  }

  const summary = normalizeGeneratedSummary(payload.summary);

  if (!summary) {
    throw new Error('AI returned an unexpected insights format.');
  }

  const explanations = Array.isArray(payload.explanations) ? payload.explanations : [];

  return {
    summary,
    explanations: results.map((result, index) =>
      normalizeLabExplanation(explanations[index], {
        ...result,
        referenceRangeSource: result.referenceRangeSource ?? 'uploaded-report',
      })
    ),
  };
}

export function buildLocalLabInsights(results: LabResult[]) {
  return results.map((result) =>
    buildLocalLabExplanation({
      ...result,
      referenceRangeSource: result.referenceRangeSource ?? 'uploaded-report',
    })
  );
}
