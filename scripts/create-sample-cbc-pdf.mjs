import fs from 'node:fs';

const outputPath = new URL('../sample-cbc-lab-report.pdf', import.meta.url);

const escapePdfText = (text) =>
  text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const lines = [
  'ClearCare Sample Laboratory Report',
  'Patient: Sample Patient',
  'Collection Date: 05/03/2026',
  'Report Type: Complete Blood Count (CBC)',
  '',
  'Test                         Result      Unit        Reference Range',
  'Hemoglobin                   15.0        g/dL        13.0 - 17.0',
  'White Blood Cells WBC        5100        /uL         4600 - 10800',
  'Neutrophils                  79          %           40 - 80',
  'Lymphocyte                   18          %           20 - 40',
  'Platelet Count               350         x10^3/uL    150 - 440',
  'Mean Corpuscular Volume MCV  94.0        fL          83 - 101',
  '',
  'Notes: This is a fictional sample report for testing PDF upload and parsing.',
  'Always review real lab results with a licensed healthcare professional.',
];

const textCommands = ['BT', '/F1 12 Tf', '72 740 Td'];
lines.forEach((line, index) => {
  if (index > 0) {
    textCommands.push('0 -22 Td');
  }

  textCommands.push(`(${escapePdfText(line)}) Tj`);
});
textCommands.push('ET');

const stream = textCommands.join('\n');
const objects = [
  null,
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
];

let pdf = '%PDF-1.4\n';
const offsets = [0];

for (let index = 1; index < objects.length; index += 1) {
  offsets[index] = Buffer.byteLength(pdf);
  pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
}

const xrefOffset = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;

for (let index = 1; index < objects.length; index += 1) {
  pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
}

pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

fs.writeFileSync(outputPath, pdf);
console.log(outputPath.pathname);
