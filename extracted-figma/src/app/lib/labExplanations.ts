interface LabResultForExplanation {
  name: string;
  value: number;
  unit: string;
  normalMin: number;
  normalMax: number;
  status: 'normal' | 'high' | 'low' | 'not-established';
  referenceRangeSource?: string;
}

export interface GeneratedLabExplanation {
  name: string;
  definition: string;
  description: string;
  resultMeaning: string;
}

export interface TrustedLabSource {
  label: string;
  url: string;
}

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

function removeDoctorAdvice(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !/\b(?:talk|ask|discuss|review)\b.*\b(?:doctor|clinician|care team|provider)\b/i.test(sentence))
    .join(' ')
    .trim();
}

function cleanResultMeaning(text: string, result: LabResultForExplanation) {
  const withoutVagueSymptoms = text
    .replace(/\s*(?:Talk|Ask|Discuss|Review)\s+[^.!?]*\b(?:doctor|clinician|care team|provider)\b[^.!?]*\bif you have symptoms\b[^.!?]*[.!?]?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (result.status === 'normal' || result.status === 'not-established') {
    return removeDoctorAdvice(withoutVagueSymptoms) || buildLocalLabExplanation(result).resultMeaning;
  }

  if (/\b(?:doctor|clinician|care team|provider)\b/i.test(withoutVagueSymptoms)) {
    return withoutVagueSymptoms;
  }

  return `${withoutVagueSymptoms} Discuss this out-of-range result with your doctor.`.trim();
}

export function combineLabExplanation(explanation: GeneratedLabExplanation) {
  return [
    `What it means: ${explanation.definition}`,
    `About this test: ${explanation.description}`,
    `Your result: ${explanation.resultMeaning}`,
  ].join('\n\n');
}

export function getTrustedLabSource(name: string): TrustedLabSource {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('cd4') || lowerName.includes('cd 4') || lowerName.includes('cd8') || lowerName.includes('cd 8')) {
    return {
      label: 'MedlinePlus: CD4 Lymphocyte Count',
      url: 'https://medlineplus.gov/lab-tests/cd4-lymphocyte-count/',
    };
  }

  if (
    lowerName.includes('neutrophil') ||
    lowerName.includes('lymph') ||
    lowerName.includes('mono') ||
    lowerName.includes('eos') ||
    lowerName.includes('baso')
  ) {
    return {
      label: 'MedlinePlus: Blood Differential Test',
      url: 'https://medlineplus.gov/ency/article/003657.htm',
    };
  }

  if (lowerName === 'wbc' || lowerName.includes('white blood')) {
    return {
      label: 'MedlinePlus: White Blood Count',
      url: 'https://medlineplus.gov/lab-tests/white-blood-count-wbc/',
    };
  }

  if (
    lowerName === 'rbc' ||
    lowerName.includes('hemoglobin') ||
    lowerName.includes('hematocrit') ||
    lowerName.includes('mcv') ||
    lowerName.includes('mch') ||
    lowerName.includes('mchc') ||
    lowerName.includes('rdw') ||
    lowerName.includes('platelet')
  ) {
    return {
      label: 'MedlinePlus: Complete Blood Count',
      url: 'https://medlineplus.gov/lab-tests/complete-blood-count-cbc/',
    };
  }

  return {
    label: 'MedlinePlus: Blood Count Tests',
    url: 'https://medlineplus.gov/bloodcounttests.html',
  };
}

function markerRole(name: string) {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('cd4') || lowerName.includes('cd 4')) {
    return {
      definition: 'CD4 cells are a type of immune cell. They help organize the body\'s response when it needs to fight germs.',
      description: 'This test counts or measures CD4 cells in your blood. Doctors may review it with other immune cell results to understand how your immune system is balanced.',
    };
  }

  if (lowerName.includes('cd8') || lowerName.includes('cd 8')) {
    return {
      definition: 'CD8 cells are a type of immune cell. They help the body find and remove infected cells.',
      description: 'This test counts or measures CD8 cells in your blood. Doctors often compare it with related immune cell tests to see the bigger picture.',
    };
  }

  if (lowerName.includes('neutrophil')) {
    return {
      definition: 'Neutrophils are white blood cells. They are one of the body\'s first defenses against many infections.',
      description: 'This test shows how many neutrophils are in your blood. It can help your care team understand part of your immune response.',
    };
  }

  if (lowerName.includes('lymph')) {
    return {
      definition: 'Lymphocytes are white blood cells. They help your immune system recognize and respond to germs.',
      description: 'This test shows how many lymphocytes are in your blood. Your doctor may compare it with other white blood cell results.',
    };
  }

  if (lowerName.includes('mono')) {
    return {
      definition: 'Monocytes are white blood cells. They help clean up germs, old cells, and damaged tissue.',
      description: 'This test shows how many monocytes are in your blood. It gives your care team another view of immune system activity.',
    };
  }

  if (lowerName.includes('eos')) {
    return {
      definition: 'Eosinophils are white blood cells. They can rise with allergies, asthma, and some infections.',
      description: 'This test shows how many eosinophils are in your blood. Your doctor reads it with your symptoms and other lab results.',
    };
  }

  if (lowerName.includes('baso')) {
    return {
      definition: 'Basophils are white blood cells. They can be involved in allergic and inflammation responses.',
      description: 'This test shows how many basophils are in your blood. It is usually reviewed as one part of a white blood cell breakdown.',
    };
  }

  if (lowerName.includes('hemoglobin')) {
    return {
      definition: 'Hemoglobin is a protein in red blood cells. It helps carry oxygen from your lungs to the rest of your body.',
      description: 'This test checks how much hemoglobin is in your blood. Doctors use it to help look for signs of anemia or other blood problems.',
    };
  }

  if (lowerName === 'wbc' || lowerName.includes('white blood')) {
    return {
      definition: 'White blood cells help your body fight germs.',
      description: 'This test counts the white blood cells in your blood. It can change with infections, inflammation, medicines, and other health factors.',
    };
  }

  if (lowerName === 'rbc' || lowerName.includes('red blood')) {
    return {
      definition: 'Red blood cells carry oxygen through your body.',
      description: 'This test counts the red blood cells in your blood. Doctors read it with hemoglobin and hematocrit to understand oxygen-carrying blood cells.',
    };
  }

  if (lowerName.includes('platelet')) {
    return {
      definition: 'Platelets are blood cells that help your blood clot when you bleed.',
      description: 'This test counts the platelets in your blood. Platelets can matter for bleeding, bruising, and clotting risk.',
    };
  }

  return {
    definition: `${name} is one lab value from your report.`,
    description: 'This test gives your care team one piece of information about your health. It should be read with your symptoms, history, and other lab results.',
  };
}

export function buildLocalLabExplanation(result: LabResultForExplanation): GeneratedLabExplanation {
  const role = markerRole(result.name);
  const valueText = `${result.value.toLocaleString('en-US')} ${result.unit}`.trim();
  const rangeText =
    result.referenceRangeSource === 'not-established'
      ? 'This report does not give a usual range for this test, so ClearCare cannot label it high or low.'
      : `The usual range on this report is ${result.normalMin}-${result.normalMax} ${result.unit}.`;
  const statusText =
    result.status === 'not-established'
      ? `${valueText ? `Your result is ${valueText}. ` : ''}${rangeText}`
      : result.status === 'normal'
        ? `Your result is ${valueText}, which is in range. ${rangeText} This means the value fits the range listed by the lab.`
        : `Your result is ${valueText}, which is ${result.status}. ${rangeText} This does not explain the cause by itself. Ask your doctor what it means for you.`;

  return {
    name: result.name,
    definition: role.definition,
    description: role.description,
    resultMeaning: statusText,
  };
}

export function normalizeLabExplanation(value: unknown, fallback: LabResultForExplanation): GeneratedLabExplanation {
  if (!value || typeof value !== 'object') {
    return buildLocalLabExplanation(fallback);
  }

  const candidate = value as Record<string, unknown>;
  const local = buildLocalLabExplanation(fallback);

  return {
    name: asString(candidate.name) || fallback.name,
    definition: asString(candidate.definition) || local.definition,
    description: asString(candidate.description) || local.description,
    resultMeaning: cleanResultMeaning(asString(candidate.resultMeaning) || local.resultMeaning, fallback),
  };
}
