import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleExplain = () => {
    navigate('/results');
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          <h2 className="text-2xl text-gray-900 mb-3">Understand Your Medical Results</h2>
          <p className="text-gray-700 leading-relaxed">
            Upload your lab report or medical test results, and our AI will explain the medical terms and values 
            in plain language. You'll see which results are in normal range, what certain numbers mean, and what 
            questions you might want to ask your healthcare provider. Remember, only your doctor can make medical 
            decisions based on your full health history.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>Important:</strong> ClearCare is an educational tool, not a medical service. The AI provides 
            general explanations and cannot diagnose conditions, recommend treatments, or replace professional 
            medical advice. If you have urgent symptoms or health concerns, contact your healthcare provider or 
            seek emergency care immediately.
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
              <h3 className="text-gray-900 mb-2">Upload Test Results</h3>
              <p className="text-sm text-gray-600 mb-6">
                Drag and drop your medical report here, or click to browse
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <span className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block">
                  Choose File
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-4">Supports PDF, JPG, PNG formats</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-6 py-4 mb-6">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div className="text-left">
                  <p className="text-sm text-gray-900">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-600">File uploaded successfully</p>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleExplain}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Explain This Report
                </button>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Upload Different File
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-2">Learn More About This Test</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get background information on common medical tests
            </p>
            <button className="text-blue-600 text-sm hover:text-blue-700">
              Browse Test Library →
            </button>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-2">Prepare Questions</h3>
            <p className="text-sm text-gray-600 mb-4">
              Build a list of questions to ask your doctor
            </p>
            <button className="text-blue-600 text-sm hover:text-blue-700">
              Start Preparing →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}