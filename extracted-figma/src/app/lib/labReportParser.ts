export type LabStatus = 'normal' | 'high' | 'low';
export type SourceLevel = 'high' | 'medium' | 'general';
export type ReferenceRangeSource = 'uploaded-report' | 'general-fallback';

export interface LabTerm {
  term: string;
  definition: string;
}

export interface LabTrend {
  date: string;
  value: number;
}

export interface ParsedLabResult {
  name: string;
  value: number;
  unit: string;
  normalMin: number;
  normalMax: number;
  rangeMin: number;
  rangeMax: number;
  referenceRangeSource: ReferenceRangeSource;
  referenceRangeNote: string;
  status: LabStatus;
  explanation: string;
  terms: LabTerm[];
  sourceLevel: SourceLevel;
  sources: string[];
  trends: LabTrend[];
  trendInterpretation: string;
}

export interface ParsedLabReport {
  patientName: string;
  testDate: string;
  reportType: string;
  results: ParsedLabResult[];
  questionsToAsk: string[];
  keyFindings: string[];
  criticalActions: string[];
  nextSteps: string[];
  extractedText: string;
  fileName?: string;
  parserWarnings: string[];
  parserConfidence: 'high' | 'medium' | 'low';
}

interface LabDefinition {
  name: string;
  aliases: string[];
  unit: string;
  normalMin: number;
  normalMax: number;
  rangeMin: number;
  rangeMax: number;
  explanation: string;
  terms: LabTerm[];
}

const labDefinitions: LabDefinition[] = [
  {
    name: 'Hemoglobin',
    aliases: ['hemoglobin', 'hgb', 'hb'],
    unit: 'g/dL',
    normalMin: 13,
    normalMax: 17,
    rangeMin: 3,
    rangeMax: 20,
    explanation:
      'Hemoglobin is a protein in red blood cells that carries oxygen throughout your body.',
    terms: [
      { term: 'Hemoglobin', definition: 'A protein in red blood cells that carries oxygen from the lungs to the body.' },
      { term: 'red blood cells', definition: 'Blood cells that carry oxygen throughout the body.' },
    ],
  },
  {
    name: 'Total Leucocyte Count (WBC)',
    aliases: ['white blood cell', 'white blood cells', 'wbc', 'leucocyte', 'leukocyte', 'total leucocyte count'],
    unit: '/uL',
    normalMin: 4600,
    normalMax: 10800,
    rangeMin: 2000,
    rangeMax: 15000,
    explanation:
      'White blood cells help your body fight infections. The count can change with infections, inflammation, medications, and other health factors.',
    terms: [
      { term: 'White blood cells', definition: 'Immune system cells that help fight infections and disease.' },
      { term: 'immune system', definition: 'The body system that helps protect against infections and disease.' },
    ],
  },
  {
    name: 'Neutrophils',
    aliases: ['neutrophil', 'neutrophils', 'neut'],
    unit: '%',
    normalMin: 40,
    normalMax: 80,
    rangeMin: 20,
    rangeMax: 90,
    explanation:
      'Neutrophils are a common type of white blood cell that help fight bacterial infections.',
    terms: [
      { term: 'Neutrophils', definition: 'White blood cells that help protect against bacterial and fungal infections.' },
      { term: 'bacterial infections', definition: 'Illnesses caused by harmful bacteria.' },
    ],
  },
  {
    name: 'Lymphocyte',
    aliases: ['lymphocyte', 'lymphocytes', 'lymph'],
    unit: '%',
    normalMin: 20,
    normalMax: 40,
    rangeMin: 10,
    rangeMax: 50,
    explanation:
      'Lymphocytes are white blood cells that help your body respond to viruses and produce antibodies.',
    terms: [
      { term: 'Lymphocytes', definition: 'White blood cells that help respond to viruses and support antibody production.' },
      { term: 'antibodies', definition: 'Proteins made by the immune system that recognize harmful substances.' },
    ],
  },
  {
    name: 'Platelet Count',
    aliases: ['platelet', 'platelets', 'plt', 'platelet count'],
    unit: 'x10^3/uL',
    normalMin: 150,
    normalMax: 440,
    rangeMin: 50,
    rangeMax: 600,
    explanation:
      'Platelets help your blood clot when you have a cut or injury.',
    terms: [
      { term: 'Platelets', definition: 'Small blood cells that help form clots to stop bleeding.' },
      { term: 'clot', definition: 'A thickened mass of blood that helps stop bleeding.' },
    ],
  },
  {
    name: 'Mean Corpuscular Volume (MCV)',
    aliases: ['mean corpuscular volume', 'mcv'],
    unit: 'fL',
    normalMin: 83,
    normalMax: 101,
    rangeMin: 70,
    rangeMax: 110,
    explanation:
      'MCV measures the average size of your red blood cells and can help clinicians understand different types of anemia.',
    terms: [
      { term: 'MCV', definition: 'Mean Corpuscular Volume, a measure of the average size of red blood cells.' },
      { term: 'anemia', definition: 'A condition where the body does not have enough healthy red blood cells or hemoglobin.' },
    ],
  },
];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function parseNumbers(text: string) {
  return Array.from(text.matchAll(/-?\d+(?:\.\d+)?/g)).map((match) => Number(match[0]));
}

function detectUnit(line: string, fallbackUnit: string) {
  const unitMatch = line.match(/(?:g\/dL|mg\/dL|x10\^?3\/uL|10\^?3\/uL|\/uL|\/µL|\/μL|fL|%|lakh\/cumm)/i);
  return unitMatch?.[0] ?? fallbackUnit;
}

function detectReferenceRange(line: string, definition: LabDefinition, value: number) {
  const numbers = parseNumbers(line);

  if (numbers.length >= 3) {
    const [, possibleMin, possibleMax] = numbers;
    if (possibleMin < possibleMax && value !== possibleMin && value !== possibleMax) {
      return {
        normalMin: possibleMin,
        normalMax: possibleMax,
        source: 'uploaded-report' as const,
        note: 'Reference range read from the uploaded report.',
      };
    }
  }

  const rangeMatch = line.match(/(?:normal|reference|ref(?:erence)? range|range)?\s*:?\s*(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)/i);
  if (rangeMatch) {
    const normalMin = Number(rangeMatch[1]);
    const normalMax = Number(rangeMatch[2]);
    if (normalMin < normalMax) {
      return {
        normalMin,
        normalMax,
        source: 'uploaded-report' as const,
        note: 'Reference range read from the uploaded report.',
      };
    }
  }

  return {
    normalMin: definition.normalMin,
    normalMax: definition.normalMax,
    source: 'general-fallback' as const,
    note: 'Reference range was not found in the PDF, so ClearCare used a general adult fallback range. Confirm with the lab report or clinician.',
  };
}

function getStatus(value: number, normalMin: number, normalMax: number): LabStatus {
  if (value < normalMin) return 'low';
  if (value > normalMax) return 'high';
  return 'normal';
}

function findResultForDefinition(text: string, definition: LabDefinition): ParsedLabResult | null {
  const lines = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const matchingAlias = definition.aliases.find((alias) =>
      new RegExp(`\\b${escapeRegExp(alias)}\\b`, 'i').test(line)
    );

    if (!matchingAlias) {
      continue;
    }

    const aliasIndex = line.toLowerCase().indexOf(matchingAlias.toLowerCase());
    const numbersAfterAlias = parseNumbers(line.slice(aliasIndex + matchingAlias.length));
    const numbersInLine = parseNumbers(line);
    const value = numbersAfterAlias[0] ?? numbersInLine[0];

    if (value === undefined || Number.isNaN(value)) {
      continue;
    }

    const { normalMin, normalMax, source, note } = detectReferenceRange(line, definition, value);
    const status = getStatus(value, normalMin, normalMax);
    const unit = detectUnit(line, definition.unit);

    return {
      name: definition.name,
      value,
      unit,
      normalMin,
      normalMax,
      rangeMin: Math.min(definition.rangeMin, normalMin),
      rangeMax: Math.max(definition.rangeMax, normalMax),
      referenceRangeSource: source,
      referenceRangeNote: note,
      status,
      explanation: definition.explanation,
      terms: definition.terms,
      sourceLevel: 'general',
      sources: source === 'uploaded-report' ? ['Uploaded report'] : ['General medical references'],
      trends: [{ date: new Date().toISOString().slice(0, 10), value }],
      trendInterpretation:
        'Only one uploaded result was found, so trend analysis needs prior reports for comparison.',
    };
  }

  return null;
}

function detectDate(text: string) {
  const dateMatch =
    text.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/) ??
    text.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}\b/i);

  return dateMatch?.[0] ?? new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function detectPatientName(text: string) {
  const patientMatch = text.match(/\b(?:patient|patient name|name)\s*:?\s*([A-Z][A-Za-z' -]+(?:\s+[A-Z][A-Za-z' -]+){0,3})/i);

  if (!patientMatch) {
    return 'Uploaded Patient';
  }

  return patientMatch[1]
    .replace(/\b(?:dob|date of birth|collection date|report type)\b.*$/i, '')
    .trim() || 'Uploaded Patient';
}

function detectReportType(text: string, hasStructuredResults: boolean) {
  const labeledReportType = text.match(/\b(?:report type|test type|panel|test name)\s*:?\s*([A-Za-z0-9 ()/,-]+?)(?:\n|$)/i);

  if (labeledReportType?.[1]) {
    return labeledReportType[1].trim();
  }

  if (/\b(?:complete blood count|cbc)\b/i.test(text)) {
    return 'Complete Blood Count (CBC)';
  }

  if (/\b(?:basic metabolic panel|bmp)\b/i.test(text)) {
    return 'Basic Metabolic Panel (BMP)';
  }

  if (/\b(?:comprehensive metabolic panel|cmp)\b/i.test(text)) {
    return 'Comprehensive Metabolic Panel (CMP)';
  }

  if (/\b(?:lipid panel|cholesterol)\b/i.test(text)) {
    return 'Lipid Panel';
  }

  return hasStructuredResults ? 'Uploaded Lab Report' : 'Uploaded Medical Report';
}

function buildQuestions(results: ParsedLabResult[]) {
  const abnormalResults = results.filter((result) => result.status !== 'normal');
  const questions = abnormalResults.flatMap((result) => [
    `What does my ${result.name} result mean in the context of my health history?`,
    `Should my ${result.name} be repeated or monitored over time?`,
  ]);

  return [
    ...questions,
    'Are any of these results urgent or expected based on my medications or recent illness?',
    'What symptoms should I watch for before my next appointment?',
  ].slice(0, 5);
}

function getParserConfidence(results: ParsedLabResult[], warnings: string[]) {
  if (warnings.length > 0 || results.length === 0) {
    return 'low' as const;
  }

  const fallbackCount = results.filter((result) => result.referenceRangeSource === 'general-fallback').length;

  if (fallbackCount === 0) {
    return 'high' as const;
  }

  if (fallbackCount < results.length) {
    return 'medium' as const;
  }

  return 'low' as const;
}

export function parseLabReportText(extractedText: string, fileName?: string): ParsedLabReport {
  const cleanedText = extractedText.replace(/\r/g, '\n').replace(/[ \t]+/g, ' ').trim();
  const results = labDefinitions
    .map((definition) => findResultForDefinition(cleanedText, definition))
    .filter((result): result is ParsedLabResult => Boolean(result));
  const abnormalResults = results.filter((result) => result.status !== 'normal');
  const parserWarnings: string[] = [];

  if (!cleanedText) {
    parserWarnings.push('No selectable text was found in this PDF. It may be a scanned image and would need OCR.');
  }

  if (results.length === 0 && cleanedText) {
    parserWarnings.push('Text was extracted, but no supported lab values were recognized yet.');
  }

  const fallbackRangeCount = results.filter((result) => result.referenceRangeSource === 'general-fallback').length;
  if (fallbackRangeCount > 0) {
    parserWarnings.push(`${fallbackRangeCount} reference range${fallbackRangeCount === 1 ? ' was' : 's were'} not found in the PDF, so general fallback ranges are being shown.`);
  }

  return {
    patientName: detectPatientName(cleanedText),
    testDate: detectDate(cleanedText),
    reportType: detectReportType(cleanedText, results.length > 0),
    results,
    questionsToAsk: buildQuestions(results),
    keyFindings:
      results.length > 0
        ? [
            `${results.length} supported lab value${results.length === 1 ? '' : 's'} were recognized from the uploaded PDF.`,
            `${abnormalResults.length} result${abnormalResults.length === 1 ? '' : 's'} are outside the detected or default reference range.`,
            'Review extracted values against the original PDF before relying on this summary.',
          ]
        : ['No structured lab values were recognized from the uploaded PDF.'],
    criticalActions:
      abnormalResults.length > 0
        ? abnormalResults.map((result) => `Discuss your ${result.status} ${result.name} result with your doctor.`)
        : ['Ask your clinician to review the uploaded report if anything looks unclear or incomplete.'],
    nextSteps: [
      'Compare the extracted values with the original PDF for accuracy.',
      'Bring the report and generated summary to your healthcare provider.',
      'Upload prior reports later if you want trend analysis across time.',
    ],
    extractedText: cleanedText,
    fileName,
    parserWarnings,
    parserConfidence: getParserConfidence(results, parserWarnings),
  };
}
