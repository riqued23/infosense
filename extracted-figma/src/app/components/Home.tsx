import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { extractPdfText } from '@/lib/pdfText';
import { parseLabReportText } from '@/lib/labReportParser';
import { LanguageSelector } from './LanguageSelector';
// @ts-ignore
import { useTranslation } from '../translation/useTranslation';

const HOME_DEFAULTS = {
  headline: 'Understand Your Medical Results',
  description: 'Upload your lab report or medical test results, and our AI will explain the medical terms and values in plain language. You\'ll see which results are in normal range, what certain numbers mean, and what questions you might want to ask your healthcare provider. Remember, only your doctor can make medical decisions based on your full health history.',
  importantLabel: 'Important:',
  importantText: 'ClearCare is an educational tool, not a medical service. The AI provides general explanations and cannot diagnose conditions, recommend treatments, or replace professional medical advice. If you have urgent symptoms or health concerns, contact your healthcare provider or seek emergency care immediately.',
  uploadTitle: 'Upload Test Results',
  uploadSubtext: 'Drag and drop your medical report here, or click to browse',
  chooseFile: 'Choose File',
  fileFormats: 'Supports PDF, JPG, PNG formats',
  uploadedSuccess: 'File uploaded successfully',
  explainBtn: 'Explain This Report',
  readingBtn: 'Reading PDF',
  uploadDiff: 'Upload Different File',
  card1Title: 'Learn More About This Test',
  card1Desc: 'Get background information on common medical tests',
  card1Btn: 'Browse Test Library →',
  card2Title: 'Prepare Questions',
  card2Desc: 'Build a list of questions to ask your doctor',
  card2Btn: 'Start Preparing →',
};

export function Home() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReadingReport, setIsReadingReport] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const { language, translateBatch } = useTranslation();
  const [t, setT] = useState(HOME_DEFAULTS);

  useEffect(() => {
    if (language === 'en') { setT(HOME_DEFAULTS); return; }
    translateBatch(Object.values(HOME_DEFAULTS)).then((results: string[]) => {
      const keys = Object.keys(HOME_DEFAULTS) as (keyof typeof HOME_DEFAULTS)[];
      setT(Object.fromEntries(keys.map((k, i) => [k, results[i]])) as typeof HOME_DEFAULTS);
    });
  }, [language]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setUploadError('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
      setUploadError('');
    }
  };

  const handleExplain = async () => {
    if (!uploadedFile) return;

    if (uploadedFile.type !== 'application/pdf') {
      setUploadError('PDF upload is supported first. JPG and PNG will need OCR in a later step.');
      return;
    }

    setIsReadingReport(true);
    setUploadError('');

    try {
      const extractedText = await extractPdfText(uploadedFile);
      const parsedReport = parseLabReportText(extractedText, uploadedFile.name);
      sessionStorage.setItem('clearcareUploadedReport', JSON.stringify(parsedReport));
      navigate('/review', { state: { source: 'uploaded-pdf' } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to read this PDF.';
      setUploadError(`${message} Try a text-based PDF or export the report as a searchable PDF.`);
    } finally {
      setIsReadingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LanguageSelector />

      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl text-blue-900">ClearCare</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl text-gray-900 mb-3">{t.headline}</h2>
          <p className="text-gray-700 leading-relaxed">{t.description}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>{t.importantLabel}</strong> {t.importantText}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {!uploadedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2">{t.uploadTitle}</h3>
              <p className="text-sm text-gray-600 mb-6">{t.uploadSubtext}</p>
              <label className="inline-block">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <span className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block">
                  {t.chooseFile}
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-4">{t.fileFormats}</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-6 py-4 mb-6">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div className="text-left">
                  <p className="text-sm text-gray-900">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-600">{t.uploadedSuccess}</p>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleExplain}
                  disabled={isReadingReport}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {isReadingReport && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isReadingReport ? t.readingBtn : t.explainBtn}
                </button>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setUploadError('');
                  }}
                  disabled={isReadingReport}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t.uploadDiff}
                </button>
              </div>
              {uploadError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  {uploadError}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-2">{t.card1Title}</h3>
            <p className="text-sm text-gray-600 mb-4">{t.card1Desc}</p>
            <button className="text-blue-600 text-sm hover:text-blue-700">{t.card1Btn}</button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-2">{t.card2Title}</h3>
            <p className="text-sm text-gray-600 mb-4">{t.card2Desc}</p>
            <button className="text-blue-600 text-sm hover:text-blue-700">{t.card2Btn}</button>
          </div>
        </div>
      </main>
    </div>
  );
}
