import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractPdfText(file: File) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => {
        if (!('str' in item)) {
          return '';
        }

        return `${item.str}${item.hasEOL ? '\n' : ' '}`;
      })
      .join('')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n[ \t]+/g, '\n')
      .split('\n')
      .map((line) => line.replace(/[ \t]{2,}/g, ' ').trim())
      .filter(Boolean)
      .join('\n')
      .trim();

    if (pageText) {
      pages.push(pageText);
    }
  }

  return pages.join('\n\n');
}
