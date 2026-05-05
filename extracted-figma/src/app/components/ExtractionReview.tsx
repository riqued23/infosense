import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, ArrowLeft, CheckCircle2, FileText } from 'lucide-react';
import { refreshParsedLabReport, type ParsedLabReport, type ParsedLabResult, type ReferenceRangeSource } from '@/lib/labReportParser';
import { LanguageSelector } from './LanguageSelector';
// @ts-ignore
import { useTranslation } from '../translation/useTranslation';

const REVIEW_DEFAULTS = {
  notFoundTitle: 'No Uploaded Report Found',
  notFoundDesc: 'Upload a PDF before reviewing extracted values.',
  backToUpload: 'Back to Upload',
  headerTitle: 'Review Extracted Report',
  headerSubtitle: 'Confirm values before ClearCare summarizes them.',
  continueBtn: 'Continue to Results',
  alertText: 'PDF extraction can misread table columns, units, and reference ranges. Correct anything that looks off before generating summaries or charts.',
  reportDetails: 'Report Details',
  patientName: 'Patient Name',
  testDate: 'Test Date',
  reportType: 'Report Type',
  labValuesTitle: 'Extracted Lab Values',
  labValuesSubtitle: 'Edit values, units, and reference ranges. Status updates automatically.',
  colTest: 'Test',
  colValue: 'Value',
  colUnit: 'Unit',
  colRefMin: 'Ref Min',
  colRefMax: 'Ref Max',
  colRangeSource: 'Range Source',
  colStatus: 'Status',
  optionUploaded: 'Uploaded report',
  optionUnavailable: 'Not established',
  emptyLabValues: 'No supported lab values were recognized. You can still review extracted text below, but summaries will be limited.',
  extractedTextTitle: 'Extracted Text',
  noTextFound: 'No selectable text was found in this PDF.',
};

const numberOrZero = (value: string) => {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
};

function loadReport(): ParsedLabReport | null {
  try {
    const storedReport = sessionStorage.getItem('clearcareUploadedReport');
    return storedReport ? JSON.parse(storedReport) : null;
  } catch {
    return null;
  }
}

export function ExtractionReview() {
  const navigate = useNavigate();
  const initialReport = useMemo(loadReport, []);
  const [report, setReport] = useState<ParsedLabReport | null>(initialReport);
  const { language, translateBatch } = useTranslation() as {
    language: string;
    translateBatch: (texts: string[]) => Promise<string[]>;
  };
  const [t, setT] = useState(REVIEW_DEFAULTS);

  useEffect(() => {
    if (language === 'en') { setT(REVIEW_DEFAULTS); return; }
    translateBatch(Object.values(REVIEW_DEFAULTS)).then((translated: string[]) => {
      const keys = Object.keys(REVIEW_DEFAULTS) as (keyof typeof REVIEW_DEFAULTS)[];
      setT(Object.fromEntries(keys.map((k, i) => [k, translated[i]])) as typeof REVIEW_DEFAULTS);
    });
  }, [language]);

  const updateReport = (updates: Partial<ParsedLabReport>) => {
    setReport((currentReport) => {
      if (!currentReport) return currentReport;
      return refreshParsedLabReport({ ...currentReport, ...updates });
    });
  };

  const updateResult = (index: number, updates: Partial<ParsedLabResult>) => {
    setReport((currentReport) => {
      if (!currentReport) return currentReport;

      const results = currentReport.results.map((result, resultIndex) =>
        resultIndex === index ? { ...result, ...updates } : result
      );

      return refreshParsedLabReport({ ...currentReport, results });
    });
  };

  const handleContinue = () => {
    if (!report) return;
    sessionStorage.setItem('clearcareUploadedReport', JSON.stringify(refreshParsedLabReport(report)));
    navigate('/results', { state: { source: 'reviewed-upload' } });
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LanguageSelector />
        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h1 className="text-xl text-gray-900 mb-2">{t.notFoundTitle}</h1>
            <p className="text-sm text-gray-700 mb-4">{t.notFoundDesc}</p>
            <button
              onClick={() => navigate('/home')}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.backToUpload}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LanguageSelector />

      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/home')} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl text-blue-900">{t.headerTitle}</h1>
                <p className="text-xs text-gray-500">{t.headerSubtitle}</p>
              </div>
            </div>
            <button
              onClick={handleContinue}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t.continueBtn}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">{t.alertText}</p>
        </div>

        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg text-gray-900 mb-4">{t.reportDetails}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <label className="text-sm text-gray-700">
              {t.patientName}
              <input
                value={report.patientName}
                onChange={(event) => updateReport({ patientName: event.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="text-sm text-gray-700">
              {t.testDate}
              <input
                value={report.testDate}
                onChange={(event) => updateReport({ testDate: event.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="text-sm text-gray-700">
              {t.reportType}
              <input
                value={report.reportType}
                onChange={(event) => updateReport({ reportType: event.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg text-gray-900">{t.labValuesTitle}</h2>
            <p className="text-sm text-gray-600">{t.labValuesSubtitle}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">{t.colTest}</th>
                  <th className="text-left px-4 py-3 font-medium">{t.colValue}</th>
                  <th className="text-left px-4 py-3 font-medium">{t.colUnit}</th>
                  <th className="text-left px-4 py-3 font-medium">{t.colRefMin}</th>
                  <th className="text-left px-4 py-3 font-medium">{t.colRefMax}</th>
                  <th className="text-left px-4 py-3 font-medium">{t.colRangeSource}</th>
                  <th className="text-left px-4 py-3 font-medium">{t.colStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.results.map((result, index) => (
                  <tr key={`${result.name}-${index}`}>
                    <td className="px-4 py-3">
                      <input
                        value={result.name}
                        onChange={(event) => updateResult(index, { name: event.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={result.value}
                        onChange={(event) => updateResult(index, { value: numberOrZero(event.target.value) })}
                        className="w-24 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={result.unit}
                        onChange={(event) => updateResult(index, { unit: event.target.value })}
                        className="w-28 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {result.referenceRangeSource === 'not-established' ? (
                        <span className="inline-flex w-24 px-2 py-1 text-gray-500">Not Estab.</span>
                      ) : (
                        <input
                          type="number"
                          value={result.normalMin}
                          onChange={(event) => updateResult(index, { normalMin: numberOrZero(event.target.value) })}
                          className="w-24 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {result.referenceRangeSource === 'not-established' ? (
                        <span className="inline-flex w-24 px-2 py-1 text-gray-500">Not Estab.</span>
                      ) : (
                        <input
                          type="number"
                          value={result.normalMax}
                          onChange={(event) => updateResult(index, { normalMax: numberOrZero(event.target.value) })}
                          className="w-24 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={result.referenceRangeSource}
                        onChange={(event) => {
                          const source = event.target.value as ReferenceRangeSource;
                          updateResult(index, {
                            referenceRangeSource: source,
                            referenceRangeNote:
                              source === 'uploaded-report'
                                ? 'Reference range confirmed from the uploaded report during review.'
                                : 'No numeric reference interval was provided in the uploaded report. ClearCare will not assign a normal/abnormal label or show a range graph.',
                            sources: ['Uploaded report'],
                          });
                        }}
                        className="w-40 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="uploaded-report">{t.optionUploaded}</option>
                        <option value="not-established">{t.optionUnavailable}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                        result.status === 'normal'
                          ? 'bg-green-50 text-green-700'
                          : result.status === 'not-established'
                            ? 'bg-gray-50 text-gray-700'
                            : 'bg-orange-50 text-orange-700'
                      }`}>
                        {result.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {report.results.length === 0 && (
            <div className="p-6 text-sm text-gray-700">
              {t.emptyLabValues}
            </div>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
          <h2 className="text-lg text-gray-900 mb-3">{t.extractedTextTitle}</h2>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-80 overflow-auto bg-gray-50 border border-gray-200 rounded-lg p-4">
            {report.extractedText || t.noTextFound}
          </pre>
        </section>
      </main>
    </div>
  );
}
