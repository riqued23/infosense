import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, FileText, Info, Languages, ChevronDown, Save, MessageCircle, AlertCircle, Stethoscope } from 'lucide-react';
import { TranslationPanel } from './TranslationPanel';

// Mock AI-generated explanation for clinical note
const mockClinicalNote = {
  summary: "Your doctor's notes from your recent visit show that you were seen for follow-up care. The doctor has documented your current condition, reviewed your symptoms, and outlined a treatment plan. Below is a plain-language explanation of what your doctor wrote.",
  sections: [
    {
      title: "Chief Complaint",
      medicalText: "F/u HTN, DM",
      explanation: "This means you came in for a follow-up appointment to check on your high blood pressure (hypertension - HTN) and diabetes (diabetes mellitus - DM). These are ongoing conditions that need regular monitoring."
    },
    {
      title: "Vital Signs",
      medicalText: "BP: 142/88 mmHg, HR: 76 bpm, Temp: 98.6°F, Wt: 165 lbs",
      explanation: "Your blood pressure is 142/88, which is slightly elevated (normal is below 120/80). Your heart rate is 76 beats per minute, which is normal. Your temperature is normal, and your weight is 165 pounds."
    },
    {
      title: "Assessment",
      medicalText: "1. HTN - suboptimal control\n2. DM Type 2 - well controlled on current regimen\n3. Patient counseled on lifestyle modifications",
      explanation: "The doctor found that your high blood pressure is not as well controlled as it should be. However, your diabetes is being managed well with your current medications. The doctor talked to you about making healthy lifestyle changes like diet and exercise."
    },
    {
      title: "Medications",
      medicalText: "1. Lisinopril 20mg PO daily - increase to 40mg daily\n2. Metformin 1000mg PO BID - continue\n3. Aspirin 81mg PO daily - continue",
      explanation: "Your blood pressure medication (Lisinopril) is being increased from 20mg to 40mg taken once daily by mouth. Your diabetes medication (Metformin) stays the same at 1000mg twice daily by mouth. Your baby aspirin (81mg) continues once daily."
    },
    {
      title: "Plan",
      medicalText: "RTC in 4 weeks for BP recheck. Labs: HbA1c, BMP, lipid panel. Patient instructed to monitor BP at home daily and keep log.",
      explanation: "You should return to the clinic in 4 weeks to check your blood pressure again. Blood tests will be ordered including a test to check your average blood sugar over 3 months (HbA1c), kidney function tests (BMP), and cholesterol levels (lipid panel). You should check your blood pressure at home every day and write down the numbers."
    }
  ],
  keyTerms: [
    {
      term: "HTN (Hypertension)",
      definition: "High blood pressure - when the force of blood against your artery walls is too high"
    },
    {
      term: "DM (Diabetes Mellitus)",
      definition: "A condition where your body has trouble controlling blood sugar levels"
    },
    {
      term: "PO",
      definition: "By mouth - how to take the medication (swallow it)"
    },
    {
      term: "BID",
      definition: "Twice a day"
    },
    {
      term: "RTC",
      definition: "Return to clinic"
    },
    {
      term: "BMP",
      definition: "Basic Metabolic Panel - blood tests that check kidney function and electrolytes"
    }
  ],
  questionsToAsk: [
    "Why is my blood pressure medication being increased?",
    "What blood pressure numbers should I aim for at home?",
    "Are there specific foods I should eat or avoid to help control my blood pressure?",
    "What symptoms should I watch for that might mean my blood pressure is too high?",
    "When will I get the results from my blood tests?"
  ]
};

export function ClinicalNoteResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');
  const [showTranslation, setShowTranslation] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    if (language !== 'english') {
      setShowTranslation(true);
    } else {
      setShowTranslation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/home')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl text-blue-900">ClearCare</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Save className="w-4 h-4" />
                Save for My Visit
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Language Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Translate explanation:</span>
            </div>
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="english">English</option>
                <option value="chinese">中文 (Chinese)</option>
                <option value="spanish">Español (Spanish)</option>
                <option value="arabic">العربية (Arabic)</option>
                <option value="french">Français (French)</option>
                <option value="hindi">हिन्दी (Hindi)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* AI Explanation Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>About this explanation:</strong> This information was created by AI to help you understand 
            your doctor's notes and medical terms. It is based on general medical knowledge, not your complete 
            health history. Always discuss your clinical notes with your doctor before making any health decisions.
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl text-gray-900 mb-3">Clinical Note Summary</h2>
          <p className="text-gray-700 leading-relaxed">{mockClinicalNote.summary}</p>
        </div>

        {/* Translation Panel */}
        {showTranslation && (
          <TranslationPanel language={selectedLanguage} explanation={mockClinicalNote} />
        )}

        {/* Detailed Sections */}
        <div className="space-y-4 mb-8">
          {mockClinicalNote.sections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg text-gray-900 mb-3">{section.title}</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 mb-1">What the doctor wrote:</p>
                <p className="text-gray-900 font-mono text-sm whitespace-pre-line">{section.medicalText}</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-sm text-blue-700 mb-1">What this means:</p>
                <p className="text-gray-700 text-sm leading-relaxed">{section.explanation}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Key Medical Terms */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg text-gray-900 mb-4">Key Medical Terms Explained</h3>
          <div className="space-y-3">
            {mockClinicalNote.keyTerms.map((item, index) => (
              <div key={index} className="pb-3 border-b border-gray-200 last:border-b-0">
                <p className="text-gray-900 mb-1">
                  <strong>{item.term}</strong>
                </p>
                <p className="text-sm text-gray-600">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Questions to Ask Doctor */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-6">
          <button
            onClick={() => setShowQuestions(!showQuestions)}
            className="flex items-center justify-between w-full mb-4"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg text-gray-900">Prepare Questions</h3>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform ${
                showQuestions ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {showQuestions && (
            <div>
              <p className="text-sm text-gray-700 mb-4">
                Based on your clinical notes, here are some questions you might want to ask your healthcare provider:
              </p>
              <ul className="space-y-2">
                {mockClinicalNote.questionsToAsk.map((question, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-sm text-gray-700">{question}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Encourage Doctor Follow-up */}
        <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg text-gray-900 mb-2">Ready for your appointment?</h3>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                You now have a better understanding of your clinical notes. We encourage you to bring these notes 
                to your next appointment and ask questions about anything that concerns you. Your healthcare provider 
                knows your full medical history and can give you personalized advice.
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Contact My Doctor
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-900">
            <strong>Important:</strong> ClearCare is an educational tool, not a medical service. The AI provides 
            general explanations and cannot diagnose conditions, recommend treatments, or replace professional 
            medical advice. If you have urgent symptoms or health concerns, contact your healthcare provider or 
            seek emergency care immediately.
          </div>
        </div>
      </main>
    </div>
  );
}