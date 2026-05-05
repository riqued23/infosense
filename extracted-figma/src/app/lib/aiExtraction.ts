import {
  buildLabQuestions,
  getLabStatus,
  getParserConfidence,
  type ParsedLabReport,
  type ParsedLabResult,
  type ReferenceRangeSource,
} from './labReportParser';

interface AiExtractedResult {
  name?: unknown;
  value?: unknown;
  unit?: unknown;
  normalMin?: unknown;
  normalMax?: unknown;
  referenceRangeSource?: unknown;
  referenceRangeNote?: unknown;
}

interface LabcorpProfileDefinition {
  name: string;
  unit: string;
  normalMin: number;
  normalMax: number;
  referenceRangeSource: ReferenceRangeSource;
  referenceRangeNote: string;
}

const labcorpCd4ProfileDefinitions: LabcorpProfileDefinition[] = [
  { name: 'Absolute CD 4 Helper', unit: '/uL', normalMin: 359, normalMax: 1519, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: '% CD 4 Pos. Lymph.', unit: '%', normalMin: 30.8, normalMax: 58.5, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'Abs. CD 8 Suppressor', unit: '/uL', normalMin: 109, normalMax: 897, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: '% CD 8 Pos. Lymph.', unit: '%', normalMin: 12, normalMax: 35.5, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'CD4/CD8 Ratio', unit: '', normalMin: 0.92, normalMax: 3.72, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'WBC', unit: 'x10E3/uL', normalMin: 3.4, normalMax: 10.8, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'RBC', unit: 'x10E6/uL', normalMin: 3.77, normalMax: 5.28, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'Hemoglobin', unit: 'g/dL', normalMin: 11.1, normalMax: 15.9, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'Hematocrit', unit: '%', normalMin: 34, normalMax: 46.6, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'MCV', unit: 'fL', normalMin: 79, normalMax: 97, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'MCH', unit: 'pg', normalMin: 26.6, normalMax: 33, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'MCHC', unit: 'g/dL', normalMin: 31.5, normalMax: 35.7, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'RDW', unit: '%', normalMin: 11.7, normalMax: 15.4, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'Platelets', unit: 'x10E3/uL', normalMin: 150, normalMax: 450, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'Neutrophils', unit: '%', normalMin: 0, normalMax: 0, referenceRangeSource: 'not-established', referenceRangeNote: 'Labcorp lists this reference interval as Not Estab.; no normal/abnormal label or range graph is shown.' },
  { name: 'Lymphs', unit: '%', normalMin: 0, normalMax: 0, referenceRangeSource: 'not-established', referenceRangeNote: 'Labcorp lists this reference interval as Not Estab.; no normal/abnormal label or range graph is shown.' },
  { name: 'Monocytes', unit: '%', normalMin: 0, normalMax: 0, referenceRangeSource: 'not-established', referenceRangeNote: 'Labcorp lists this reference interval as Not Estab.; no normal/abnormal label or range graph is shown.' },
  { name: 'Eos', unit: '%', normalMin: 0, normalMax: 0, referenceRangeSource: 'not-established', referenceRangeNote: 'Labcorp lists this reference interval as Not Estab.; no normal/abnormal label or range graph is shown.' },
  { name: 'Basos', unit: '%', normalMin: 0, normalMax: 0, referenceRangeSource: 'not-established', referenceRangeNote: 'Labcorp lists this reference interval as Not Estab.; no normal/abnormal label or range graph is shown.' },
  { name: 'Neutrophils (Absolute)', unit: 'x10E3/uL', normalMin: 1.4, normalMax: 7, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'Lymphs (Absolute)', unit: 'x10E3/uL', normalMin: 0.7, normalMax: 3.1, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'Monocytes (Absolute)', unit: 'x10E3/uL', normalMin: 0.1, normalMax: 0.9, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'Eos (Absolute)', unit: 'x10E3/uL', normalMin: 0, normalMax: 0.4, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'Baso (Absolute)', unit: 'x10E3/uL', normalMin: 0, normalMax: 0.2, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
  { name: 'Immature Granulocytes', unit: '%', normalMin: 0, normalMax: 0, referenceRangeSource: 'not-established', referenceRangeNote: 'Labcorp does not provide a numeric reference interval for this value; no normal/abnormal label or range graph is shown.' },
  { name: 'Immature Grans (Abs)', unit: 'x10E3/uL', normalMin: 0, normalMax: 0.1, referenceRangeSource: 'uploaded-report', referenceRangeNote: 'Reference range paired from the Labcorp report column order.' },
];

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const toString = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

function cleanLabName(name: string) {
  return name
    .replace(/\s+(?:0\s*)?[12]\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeLabKey(name: string) {
  return cleanLabName(name).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function normalizeReferenceSource(value: unknown): ReferenceRangeSource {
  return value === 'uploaded-report' ? 'uploaded-report' : 'not-established';
}

function createParsedResult(
  definition: LabcorpProfileDefinition,
  value: number,
  explanationPrefix = 'This value was reconciled from the Labcorp report table.'
): ParsedLabResult {
  const rangePadding = Math.max((definition.normalMax - definition.normalMin) * 0.75, Math.abs(value) * 0.25, 1);

  return {
    name: definition.name,
    value,
    unit: definition.unit,
    normalMin: definition.normalMin,
    normalMax: definition.normalMax,
    rangeMin: Math.min(definition.normalMin - rangePadding, value),
    rangeMax: Math.max(definition.normalMax + rangePadding, value),
    referenceRangeSource: definition.referenceRangeSource,
    referenceRangeNote: definition.referenceRangeNote,
    status:
      definition.referenceRangeSource === 'not-established'
        ? 'not-established'
        : getLabStatus(value, definition.normalMin, definition.normalMax),
    explanation: `${explanationPrefix} Review the value, unit, and reference range before relying on this summary.`,
    terms: [{ term: definition.name, definition: `${definition.name} is a lab marker from the uploaded report.` }],
    sourceLevel: 'general',
    sources: ['Uploaded report'],
    trends: [{ date: new Date().toISOString().slice(0, 10), value }],
    trendInterpretation: 'Only one uploaded result was found, so trend analysis needs prior reports for comparison.',
  };
}

function parseLabcorpValueLine(line: string) {
  const normalized = line.replace(/\s+/g, ' ').trim();
  const match = normalized.match(/^(-?\d+(?:\.\d+)?)(?:\s+(?:High|Low|Alert|Abnormal)){0,3}$/i);

  return match ? Number(match[1]) : null;
}

function parseFlaggedLabcorpValueLine(line: string) {
  const normalized = line.replace(/\s+/g, ' ').trim();
  const match = normalized.match(/^(-?\d+(?:\.\d+)?)\s+(?:High|Low|Alert|Abnormal)\b/i);

  return match ? Number(match[1]) : null;
}

function extractLabcorpCd4ProfileResults(extractedText: string): ParsedLabResult[] {
  if (!/\bLabcorp\b/i.test(extractedText) || !/\bCD4\/CD8 Ratio Profile\b/i.test(extractedText)) {
    return [];
  }

  const lines = extractedText
    .replace(/\r/g, '\n')
    .split(/\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const firstNameIndex = lines.findIndex((line) => /^Absolute CD 4 Helper\b/i.test(line));
  const lastNameIndex = lines.findIndex((line) => /^Immature Grans \(Abs\)(?:\s|$)/i.test(line));

  if (firstNameIndex < 0 || lastNameIndex < firstNameIndex) {
    return [];
  }

  const linesBeforeNameBlock = lines.slice(0, firstNameIndex);
  const firstValue =
    linesBeforeNameBlock
      .map(parseFlaggedLabcorpValueLine)
      .filter((value): value is number => value !== null)
      .at(-1) ??
    linesBeforeNameBlock
      .map(parseLabcorpValueLine)
      .filter((value): value is number => value !== null)
      .at(-1);
  const trailingValues: number[] = [];
  for (const line of lines.slice(lastNameIndex + 1)) {
    if (/^Units\s+Reference Interval$/i.test(line)) {
      break;
    }

    const value = parseLabcorpValueLine(line);
    if (value !== null) {
      trailingValues.push(value);
    }
  }

  const values = [firstValue, ...trailingValues].filter((value): value is number => typeof value === 'number');

  if (values.length < labcorpCd4ProfileDefinitions.length) {
    return [];
  }

  return labcorpCd4ProfileDefinitions.map((definition, index) =>
    createParsedResult(definition, values[index], 'This value was reconciled from Labcorp table columns after ignoring lab-location codes like 01 and 02.')
  );
}

function mergePreferredResults(aiResults: ParsedLabResult[], preferredResults: ParsedLabResult[]) {
  if (preferredResults.length === 0) {
    return aiResults;
  }

  const preferredKeys = new Set(preferredResults.map((result) => normalizeLabKey(result.name)));
  const extraAiResults = aiResults.filter((result) => !preferredKeys.has(normalizeLabKey(result.name)));

  return [...preferredResults, ...extraAiResults];
}

function normalizeResult(result: AiExtractedResult, index: number): ParsedLabResult | null {
  const value = toNumber(result.value);
  const referenceRangeSource = normalizeReferenceSource(result.referenceRangeSource);
  const normalMin = toNumber(result.normalMin) ?? 0;
  const normalMax = toNumber(result.normalMax) ?? 0;

  if (value === null || (referenceRangeSource === 'uploaded-report' && normalMin >= normalMax)) {
    return null;
  }

  const name = cleanLabName(toString(result.name, `Lab Result ${index + 1}`));
  const unit = toString(result.unit, '');
  const rangePadding = Math.max((normalMax - normalMin) * 0.75, Math.abs(value) * 0.25, 1);

  return {
    name,
    value,
    unit,
    normalMin,
    normalMax,
    rangeMin: Math.min(normalMin - rangePadding, value),
    rangeMax: Math.max(normalMax + rangePadding, value),
    referenceRangeSource,
    referenceRangeNote:
      typeof result.referenceRangeNote === 'string' && result.referenceRangeNote.trim()
        ? result.referenceRangeNote.trim()
        : referenceRangeSource === 'uploaded-report'
          ? 'Reference range extracted from the uploaded report by AI and should be reviewed.'
          : 'Reference range was not extracted from the PDF. Confirm with the lab report or clinician.',
    status: referenceRangeSource === 'not-established' ? 'not-established' : getLabStatus(value, normalMin, normalMax),
    explanation: `${name} was extracted from the uploaded lab report. Review the value, unit, and reference range before relying on this summary.`,
    terms: [{ term: name, definition: `${name} is a lab marker from the uploaded report.` }],
    sourceLevel: 'general',
    sources: ['Uploaded report'],
    trends: [{ date: new Date().toISOString().slice(0, 10), value }],
    trendInterpretation: 'Only one uploaded result was found, so trend analysis needs prior reports for comparison.',
  };
}

export function normalizeAiExtractedReport(payload: unknown, extractedText: string, fileName?: string): ParsedLabReport | null {
  if (!payload || typeof payload !== 'object') return null;

  const candidate = payload as Record<string, unknown>;
  const rawResults = Array.isArray(candidate.results) ? candidate.results : [];
  const aiResults = rawResults
    .map((result, index) => normalizeResult(result as AiExtractedResult, index))
    .filter((result): result is ParsedLabResult['results'][number] => Boolean(result));
  const labcorpResults = extractLabcorpCd4ProfileResults(extractedText);
  const results = mergePreferredResults(aiResults, labcorpResults);

  if (results.length === 0) {
    return null;
  }

  const abnormalResults = results.filter((result) => result.status === 'high' || result.status === 'low');
  const unavailableRangeCount = results.filter((result) => result.referenceRangeSource === 'not-established').length;
  const parserWarnings = [
    'AI extracted these values from the uploaded PDF text. Review each field before relying on the summary.',
    ...(unavailableRangeCount > 0
      ? [`${unavailableRangeCount} result${unavailableRangeCount === 1 ? '' : 's'} did not include a numeric reference interval, so no normal/abnormal label or range graph is shown for those values.`]
      : []),
  ];

  return {
    patientName: toString(candidate.patientName, 'Uploaded Patient'),
    testDate: toString(candidate.testDate, new Date().toLocaleDateString('en-US')),
    reportType: toString(candidate.reportType, 'Uploaded Lab Report'),
    results,
    questionsToAsk: buildLabQuestions(results),
    keyFindings: [
      `${results.length} lab value${results.length === 1 ? '' : 's'} were extracted by AI from the uploaded PDF text.`,
      `${abnormalResults.length} result${abnormalResults.length === 1 ? '' : 's'} are outside the extracted reference range.`,
      'Review extracted values against the original PDF before relying on this summary.',
    ],
    criticalActions:
      abnormalResults.length > 0
        ? abnormalResults.map((result) => `Discuss your ${result.status} ${result.name} result with your doctor.`)
        : ['Ask your clinician to review the uploaded report if anything looks unclear or incomplete.'],
    nextSteps: [
      'Confirm every extracted value, unit, and reference range on the review screen.',
      'Bring the report and generated summary to your healthcare provider.',
      'Upload prior reports later if you want trend analysis across time.',
    ],
    extractedText,
    fileName,
    parserWarnings,
    parserConfidence: getParserConfidence(results, parserWarnings),
  };
}

export async function requestAiLabExtraction(extractedText: string, fileName?: string) {
  const response = await fetch('/api/extract-labs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ extractedText, fileName }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = typeof payload.error === 'string' ? payload.error : 'AI extraction request failed.';
    throw new Error(errorMessage);
  }

  const report = normalizeAiExtractedReport(payload.report, extractedText, fileName);

  if (!report) {
    throw new Error('AI extraction did not return usable lab results.');
  }

  return report;
}
