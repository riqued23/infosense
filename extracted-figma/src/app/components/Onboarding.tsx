import { useNavigate } from 'react-router';
import { Heart, FileText, MessageCircle } from 'lucide-react';

export function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl text-blue-900 mb-4">ClearCare</h1>
          <p className="text-lg text-gray-700 leading-relaxed max-w-xl mx-auto">
            Welcome to ClearCare. We help you understand your medical test results in simple language. 
            This app does not replace your doctor—it helps you prepare questions and learn what your results may mean.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-gray-900 mb-2">Upload Results</h3>
            <p className="text-sm text-gray-600">Share your lab reports or test results</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-gray-900 mb-2">Get Explanations</h3>
            <p className="text-sm text-gray-600">Understand medical terms in plain language</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-gray-900 mb-2">Ask Your Doctor</h3>
            <p className="text-sm text-gray-600">Prepare questions for your appointment</p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/home')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}