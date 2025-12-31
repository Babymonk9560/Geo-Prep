import React, { useState, useEffect } from 'react';
import { EvaluationResult, EvaluationModule } from '../types';
import { evaluateAnswerWithGemini } from '../services/geminiService';
import { saveLog, getStudentLogs } from '../services/storageService';
import { getUsers } from '../services/authService'; // Note: authService usually manages access, but let's assume we can get profile from prop or auth service if needed.
// However, since we don't have global state management like Redux/Context setup in this snippet for profile, we need to pass it from App or fetch it.
// The cleanest way in this architecture without changing App too much is to fetch the profile from localstorage via authService helper or pass it as prop.
// Let's pass it as prop from App.

interface EvaluationLabProps {
  username: string;
}

const EvaluationLab: React.FC<EvaluationLabProps> = ({ username }) => {
  const [module, setModule] = useState<EvaluationModule>('INTERVIEW_SIMULATION');
  const [topic, setTopic] = useState('Geomorphology');
  const [question, setQuestion] = useState('Explain the impact of Western Disturbances on Haryana agriculture.');
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  // Simple retrieval of profile since it's not passed in props yet
  const getProfile = () => {
      // In a real app, this should come from context or props.
      // We will read it from the "hpsc_users_db" based on username for now to keep changes local
      try {
          const users = getUsers();
          return users[username]?.profile || 'General';
      } catch {
          return 'General';
      }
  };

  useEffect(() => {
    // Load history for trend line
    const logs = getStudentLogs(username);
    const scores = logs.map(l => l.result?.user_feedback?.score_total || 0);
    setHistory(scores);
  }, [username, result]);

  const topics = [
    "Geomorphology",
    "Climatology", 
    "Oceanography", 
    "Geographic Thought", 
    "Population & Settlement",
    "Economic Geography",
    "Regional Planning",
    "Geography of India",
    "Haryana Geography"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const profile = getProfile();
      const evalData = await evaluateAnswerWithGemini(module, topic, question, answer, profile);
      setResult(evalData);
      
      saveLog({
        student: username,
        topic: topic,
        question: question,
        module: module,
        result: evalData
      });

    } catch (err) {
      setError("Failed to evaluate. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDimensionLabels = () => {
      switch(module) {
          case 'INTERVIEW_SIMULATION': return ['Content', 'Context', 'Communication'];
          case 'TEACHING_DEMO': return ['Pedagogy', 'Engagement', 'Complexity'];
          case 'RESEARCH_DEFENSE': return ['Methodology', 'Relevance', 'Feasibility'];
          default: return ['D1', 'D2', 'D3'];
      }
  };

  const dimLabels = getDimensionLabels();

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-3">
          <span className="bg-blue-100 text-blue-700 p-2 rounded-lg text-2xl">📝</span>
          Evaluation Lab
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* INPUT FORM */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Attempt Question</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Evaluation Module</label>
                <select 
                  value={module} 
                  onChange={(e) => setModule(e.target.value as EvaluationModule)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 font-medium"
                >
                  <option value="INTERVIEW_SIMULATION">Interview Simulation (3-C Model)</option>
                  <option value="TEACHING_DEMO">Teaching Demo (TPACK)</option>
                  <option value="RESEARCH_DEFENSE">Research Defense (Grant Standard)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Topic</label>
                <select 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Question / Prompt</label>
                <textarea 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm h-16"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Response</label>
                <textarea 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none h-40 font-serif"
                  placeholder="Type your academic response here..."
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading || !answer.trim()}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  "Submit for Diagnostics"
                )}
              </button>
              {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            </div>
          </div>

          {/* RESULT CARD & TRENDS */}
          <div className="flex flex-col gap-6">
            {result ? (
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in">
                <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">Performance Matrix</h3>
                    <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">{result.admin_analytics.candidate_archetype}</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${result.user_feedback.score_total >= 70 ? 'text-green-400' : result.user_feedback.score_total >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {result.user_feedback.score_total}<span className="text-lg text-slate-500">%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Dimension Scores (Visualized as Bars for robustness) */}
                  <div className="space-y-4">
                      <div>
                          <div className="flex justify-between text-sm mb-1">
                              <span className="font-semibold text-slate-700">{dimLabels[0]}</span>
                              <span className="text-slate-500">{result.user_feedback.framework_scores.dimension_1}/10</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{width: `${result.user_feedback.framework_scores.dimension_1 * 10}%`}}></div>
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-sm mb-1">
                              <span className="font-semibold text-slate-700">{dimLabels[1]}</span>
                              <span className="text-slate-500">{result.user_feedback.framework_scores.dimension_2}/10</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full transition-all duration-1000" style={{width: `${result.user_feedback.framework_scores.dimension_2 * 10}%`}}></div>
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-sm mb-1">
                              <span className="font-semibold text-slate-700">{dimLabels[2]}</span>
                              <span className="text-slate-500">{result.user_feedback.framework_scores.dimension_3}/10</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-orange-500 h-2 rounded-full transition-all duration-1000" style={{width: `${result.user_feedback.framework_scores.dimension_3 * 10}%`}}></div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Mentor Feedback</div>
                    <p className="text-sm text-slate-800 leading-relaxed">{result.user_feedback.constructive_comment}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 min-h-[300px]">
                <div className="text-5xl mb-4 grayscale opacity-20">📊</div>
                <p className="text-center">Submit your response to generate deep diagnostics.</p>
              </div>
            )}

            {/* TREND LINE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">HPSC Readiness Trend</h3>
                {history.length > 1 ? (
                    <div className="h-32 flex items-end gap-1 border-b border-l border-slate-200 p-2 relative">
                         {/* Simple visual representation of trend */}
                         {history.slice(-10).map((score, i) => (
                             <div key={i} className="flex-1 flex flex-col justify-end items-center group relative">
                                 <div 
                                    className={`w-full max-w-[20px] rounded-t-sm transition-all hover:opacity-80 ${score >= 70 ? 'bg-green-400' : score >= 50 ? 'bg-blue-400' : 'bg-red-300'}`} 
                                    style={{height: `${score}%`}}
                                 ></div>
                                 {/* Tooltip */}
                                 <div className="absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                     Score: {score}%
                                 </div>
                             </div>
                         ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-400 italic">Complete more sessions to see your progress trend.</p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationLab;