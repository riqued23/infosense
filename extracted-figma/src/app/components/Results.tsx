import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, FileText, Info, Languages, ChevronDown, Save, MessageCircle, AlertCircle, Image as ImageIcon, MessageSquare, Cloud, HelpCircle, Edit2, Trash2, Plus } from 'lucide-react';
import { TranslationPanel } from './TranslationPanel';
import { ResultIndicator } from './ResultIndicator';
import { SourceIndicator } from './SourceIndicator';
import { TrendAnalysis } from './TrendAnalysis';
import { MedicalTerm } from './MedicalTerm';
import { ComprehensiveSummary } from './ComprehensiveSummary';
import { LanguageSelector } from './LanguageSelector';
import exampleImage from 'figma:asset/82fbe702169bdbc28b8a30884aa28c6363cb2024.png';

// Mock AI-generated explanation based on real CBC report
const mockExplanation = {
  summary: "Your Complete Blood Count (CBC) test results show several measurements of your blood cells. Most of your results are within the normal range, with one result slightly outside the normal range that should be discussed with your doctor.",
  results: [
    {
      name: "Hemoglobin",
      value: 15,
      unit: "g/dL",
      normalMin: 13,
      normalMax: 17,
      rangeMin: 3,
      rangeMax: 20,
      status: "normal" as const,
      explanation: "Hemoglobin is a protein in your red blood cells that carries oxygen throughout your body. Your level is within the normal range, which means your blood is carrying oxygen effectively.",
      terms: [
        { term: "Hemoglobin", definition: "A protein in red blood cells that carries oxygen from the lungs to all parts of the body and returns carbon dioxide back to the lungs." },
        { term: "red blood cells", definition: "Blood cells that carry oxygen throughout the body. They get their red color from hemoglobin." }
      ],
      sourceLevel: "high" as const,
      sources: ["National Institutes of Health", "Mayo Clinic"],
      trends: [
        { date: "2023-01-01", value: 13.5 },
        { date: "2023-02-01", value: 14 },
        { date: "2023-03-01", value: 14.2 },
        { date: "2023-04-01", value: 14.8 },
        { date: "2023-05-01", value: 15 }
      ],
      trendInterpretation: "Your hemoglobin levels have been increasing over the past few months and are now within the normal range, which is a positive trend."
    },
    {
      name: "Total Leucocyte Count (WBC)",
      value: 5100,
      unit: "/μL",
      normalMin: 4600,
      normalMax: 10800,
      rangeMin: 2000,
      rangeMax: 15000,
      status: "normal" as const,
      explanation: "White blood cells help fight infections. Your count is in the normal range, which suggests your immune system is functioning properly.",
      terms: [
        { term: "White blood cells", definition: "Cells in the immune system that help fight infections and diseases. Also called leukocytes or WBC." },
        { term: "infections", definition: "When harmful germs like bacteria or viruses enter the body and cause illness." },
        { term: "immune system", definition: "The body's defense system that protects against infections and diseases." }
      ],
      sourceLevel: "medium" as const,
      sources: ["American Association for Clinical Chemistry"],
      trends: [
        { date: "2023-01-01", value: 5000 },
        { date: "2023-02-01", value: 5200 },
        { date: "2023-03-01", value: 5300 },
        { date: "2023-04-01", value: 5200 },
        { date: "2023-05-01", value: 5100 }
      ],
      trendInterpretation: "Your white blood cell count has been stable over the past few months, which is a good sign."
    },
    {
      name: "Neutrophils",
      value: 79,
      unit: "%",
      normalMin: 40,
      normalMax: 80,
      rangeMin: 20,
      rangeMax: 90,
      status: "normal" as const,
      explanation: "Neutrophils are the most common type of white blood cell that fights bacterial infections. Your percentage is within the normal range.",
      terms: [
        { term: "Neutrophils", definition: "The most abundant type of white blood cell that protects against bacterial and fungal infections by destroying harmful microorganisms." },
        { term: "bacterial infections", definition: "Illnesses caused by harmful bacteria entering the body, such as strep throat or urinary tract infections." }
      ],
      sourceLevel: "medium" as const,
      sources: ["Clinical Hematology Reference Standards"],
      trends: [
        { date: "2023-01-01", value: 79 },
        { date: "2023-02-01", value: 78 },
        { date: "2023-03-01", value: 77 },
        { date: "2023-04-01", value: 76 },
        { date: "2023-05-01", value: 75 }
      ],
      trendInterpretation: "Your neutrophil percentage has been decreasing slightly over the past few months, but it is still within the normal range."
    },
    {
      name: "Lymphocyte",
      value: 18,
      unit: "%",
      normalMin: 20,
      normalMax: 40,
      rangeMin: 10,
      rangeMax: 50,
      status: "low" as const,
      explanation: "Lymphocytes are white blood cells that help your body fight viral infections. Your percentage is slightly lower than normal. This can happen for various reasons and your doctor can determine if this needs attention.",
      terms: [
        { term: "Lymphocytes", definition: "White blood cells that fight viral infections and help produce antibodies. They are a key part of the immune system." },
        { term: "viral infections", definition: "Illnesses caused by viruses, such as the flu, common cold, or COVID-19." },
        { term: "antibodies", definition: "Proteins made by the immune system that recognize and neutralize harmful substances like viruses and bacteria." }
      ],
      sourceLevel: "high" as const,
      sources: ["National Institutes of Health", "Mayo Clinic"],
      trends: [
        { date: "2023-01-01", value: 18 },
        { date: "2023-02-01", value: 19 },
        { date: "2023-03-01", value: 20 },
        { date: "2023-04-01", value: 21 },
        { date: "2023-05-01", value: 22 }
      ],
      trendInterpretation: "Your lymphocyte percentage has been increasing over the past few months, which is a positive trend."
    },
    {
      name: "Platelet Count",
      value: 3.5,
      unit: "lakh/cumm",
      normalMin: 1.5,
      normalMax: 4.4,
      rangeMin: 0.5,
      rangeMax: 6,
      status: "normal" as const,
      explanation: "Platelets help your blood clot when you're injured. Your platelet count is within the healthy range.",
      terms: [
        { term: "Platelets", definition: "Small blood cells that help form clots to stop bleeding when you have a cut or injury." },
        { term: "clot", definition: "A thick mass of blood that forms to stop bleeding and help wounds heal." }
      ],
      sourceLevel: "medium" as const,
      sources: ["American Association for Clinical Chemistry"],
      trends: [
        { date: "2023-01-01", value: 3.5 },
        { date: "2023-02-01", value: 3.6 },
        { date: "2023-03-01", value: 3.7 },
        { date: "2023-04-01", value: 3.8 },
        { date: "2023-05-01", value: 3.9 }
      ],
      trendInterpretation: "Your platelet count has been stable over the past few months, which is a good sign."
    },
    {
      name: "Mean Corpuscular Volume (MCV)",
      value: 94.0,
      unit: "fL",
      normalMin: 83,
      normalMax: 101,
      rangeMin: 70,
      rangeMax: 110,
      status: "normal" as const,
      explanation: "MCV measures the average size of your red blood cells. Your value is normal.",
      terms: [
        { term: "MCV", definition: "Mean Corpuscular Volume - a measurement of the average size of red blood cells. It helps diagnose different types of anemia." }
      ],
      sourceLevel: "general" as const,
      sources: ["General Medical References"],
      trends: [
        { date: "2023-01-01", value: 94.0 },
        { date: "2023-02-01", value: 94.1 },
        { date: "2023-03-01", value: 94.2 },
        { date: "2023-04-01", value: 94.3 },
        { date: "2023-05-01", value: 94.4 }
      ],
      trendInterpretation: "Your MCV has been stable over the past few months, which is a good sign."
    }
  ],
  questionsToAsk: [
    "What does my slightly low lymphocyte percentage mean?",
    "Should I be concerned about the lymphocyte trend?",
    "Are there any lifestyle changes I should consider to support my immune system?",
    "How often should I have my blood tested again?",
    "What symptoms should I watch for that would require immediate attention?"
  ]
};

const summaryData = {
  patientName: "Emily Li",
  testDate: "February 12, 2026",
  reportType: "Complete Blood Count (CBC)",
  keyFindings: [
    "Hemoglobin is within normal range at 15.0 g/dL (normal: 13-17 g/dL)",
    "Lymphocyte percentage is slightly below normal at 18% (normal: 20-40%)",
    "White blood cell count, neutrophils, platelets, and MCV are all within normal ranges",
    "Hemoglobin has shown an increasing trend over the past 6 months"
  ],
  abnormalResults: 1,
  totalResults: 6,
  criticalActions: [
    "Discuss your slightly low lymphocyte percentage with your doctor",
    "Ask about the significance of the lymphocyte trend and whether monitoring is needed"
  ],
  nextSteps: [
    "Schedule a routine follow-up appointment with your healthcare provider if recommended",
    "Mention the lymphocyte result to your doctor at your next visit",
    "Continue to maintain healthy lifestyle habits",
    "Follow any additional recommendations prescribed by your doctor"
  ]
};

export function Results() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTrends, setShowTrends] = useState(false);
  const [showOriginalReport, setShowOriginalReport] = useState(false);
  const [questions, setQuestions] = useState<string[]>(mockExplanation.questionsToAsk);
  const [newQuestion, setNewQuestion] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    if (language !== 'english') {
      setShowTranslation(true);
    } else {
      setShowTranslation(false);
    }
  };

  // Function to render text with medical term tooltips
  const renderTextWithTerms = (text: string, terms: Array<{ term: string; definition: string }>) => {
    if (!terms || terms.length === 0) {
      return text;
    }

    const parts: React.ReactNode[] = [];
    let remainingText = text;
    let keyCounter = 0;

    // Track which terms we've already wrapped to avoid duplicates
    const wrappedTerms = new Set<string>();

    terms.forEach(({ term, definition }) => {
      // Skip if we've already wrapped this term
      if (wrappedTerms.has(term.toLowerCase())) {
        return;
      }

      // Case-insensitive search for the term
      const regex = new RegExp(`\\b(${term})\\b`, 'i');
      const match = remainingText.match(regex);

      if (match && match.index !== undefined) {
        // Add text before the match
        if (match.index > 0) {
          parts.push(remainingText.substring(0, match.index));
        }

        // Add the medical term component
        parts.push(
          <MedicalTerm key={`term-${keyCounter++}`} term={term} definition={definition}>
            {match[1]}
          </MedicalTerm>
        );

        // Update remaining text
        remainingText = remainingText.substring(match.index + match[1].length);
        wrappedTerms.add(term.toLowerCase());
      }
    });

    // Add any remaining text
    if (remainingText) {
      parts.push(remainingText);
    }

    return parts.length > 0 ? parts : text;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'high':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating Language Selector */}
      <LanguageSelector
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
      />

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
                  <FileText className="w-5 h-5 text-white" />
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
        {/* Original Report Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <button
            onClick={() => setShowOriginalReport(!showOriginalReport)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-start gap-3">
              <ImageIcon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
              <div className="flex-1 text-left">
                <h2 className="text-lg text-gray-900 mb-1">Your Original Report</h2>
                <p className="text-sm text-gray-600">
                  {showOriginalReport ? 'Click to hide' : 'Click to view'} your uploaded medical report
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform ${
                showOriginalReport ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {showOriginalReport && (
            <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
              <img 
                src={exampleImage} 
                alt="Complete Blood Count Report" 
                className="w-full h-auto"
              />
            </div>
          )}
        </div>

        {/* AI Explanation Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>About this explanation:</strong> This information was created by AI to help you understand 
            medical terms and values. It is based on general medical knowledge, not your personal health history. 
            Always discuss your results with your doctor before making any health decisions.
          </div>
        </div>

        {/* Comprehensive Summary */}
        <div className="mb-6">
          <ComprehensiveSummary data={summaryData} />
        </div>

        {/* Translation Panel */}
        {showTranslation && (
          <TranslationPanel language={selectedLanguage} explanation={mockExplanation} />
        )}

        {/* Detailed Results */}
        <div className="space-y-4 mb-8">
          {mockExplanation.results.map((result, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg text-gray-900 mb-4">{result.name}</h3>
              
              <ResultIndicator
                name={result.name}
                value={result.value}
                unit={result.unit}
                normalMin={result.normalMin}
                normalMax={result.normalMax}
                rangeMin={result.rangeMin}
                rangeMax={result.rangeMax}
                status={result.status}
              />
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-gray-600 text-sm leading-relaxed mb-4">{renderTextWithTerms(result.explanation, result.terms)}</div>
                
                {/* Source Indicator */}
                <SourceIndicator level={result.sourceLevel} sources={result.sources} />
              </div>

              {/* Trend Analysis */}
              {showTrends && result.trends && (
                <div className="mt-4">
                  <TrendAnalysis
                    testName={result.name}
                    unit={result.unit}
                    normalMin={result.normalMin}
                    normalMax={result.normalMax}
                    trends={result.trends}
                    interpretation={result.trendInterpretation}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Questions to Ask Doctor */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg text-gray-900">Prepare Questions</h3>
          </div>
          
          <div>
            <p className="text-sm text-gray-700 mb-4">
              Based on your results, here are some questions you might want to ask your healthcare provider:
            </p>
            <ul className="space-y-3">
              {questions.map((question, index) => (
                <li key={index} className="flex items-start gap-2 group">
                  <span className="text-blue-600 mt-0.5">•</span>
                  {editingIndex === index ? (
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => {
                          if (editingText.trim()) {
                            const newQuestions = [...questions];
                            newQuestions[index] = editingText;
                            setQuestions(newQuestions);
                          }
                          setEditingIndex(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editingText.trim()) {
                              const newQuestions = [...questions];
                              newQuestions[index] = editingText;
                              setQuestions(newQuestions);
                            }
                            setEditingIndex(null);
                          } else if (e.key === 'Escape') {
                            setEditingIndex(null);
                          }
                        }}
                        autoFocus
                        className="w-full text-sm text-gray-700 border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-gray-700">{question}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingIndex(index);
                            setEditingText(question);
                          }}
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Edit question"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setQuestions(questions.filter((_, i) => i !== index));
                          }}
                          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newQuestion.trim()) {
                    setQuestions([...questions, newQuestion]);
                    setNewQuestion('');
                  }
                }}
                placeholder="Add your own question..."
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (newQuestion.trim()) {
                    setQuestions([...questions, newQuestion]);
                    setNewQuestion('');
                  }
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
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
                You now have a better understanding of your test results. We encourage you to bring this report 
                to your doctor and ask questions about anything that concerns you. Your healthcare provider knows 
                your full medical history and can give you personalized advice.
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