import React, { useState } from 'react';
import API from '../services/api';
import {
  MessageSquareQuote,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  Trash2
} from 'lucide-react';

export default function QuestionBankView({
  questions,
  onRefreshQuestions,
  onOpenNewQuestionModal
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  const handlePracticeCount = async (id, e) => {
    e.stopPropagation();
    try {
      await API.post(`/questions/${id}/practice`);
      onRefreshQuestions();
    } catch (err) {
      console.error('Failed to update practice count:', err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this question?')) return;
    try {
      await API.delete(`/questions/${id}`);
      onRefreshQuestions();
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  const handleGenerateAIQuestions = async () => {
    setGeneratingAI(true);
    try {
      const res = await API.post('/ai/generate-questions', {
        company: 'Tier 1 Tech Companies',
        role: 'Full Stack Software Engineer'
      });
      const generated = res.data.questions || [];
      
      // Save them into question bank
      for (const q of generated) {
        await API.post('/questions', {
          question: q.question,
          category: q.category,
          difficulty: q.difficulty,
          answerKey: q.answerKey,
          company: 'AI Curated',
          keyTakeaways: ['High-frequency interview question']
        });
      }

      alert(`Generated & saved ${generated.length} high-yield interview questions!`);
      onRefreshQuestions();
    } catch (err) {
      console.error('Error generating questions:', err);
      alert('Failed to generate AI questions');
    } finally {
      setGeneratingAI(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch =
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      (q.company && q.company.toLowerCase().includes(search.toLowerCase())) ||
      (q.answerKey && q.answerKey.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-extrabold text-white">Interview Question Bank & Feedback</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Store encountered interview questions, model answers, and retrospective self-coaching notes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleGenerateAIQuestions}
            disabled={generatingAI}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {generatingAI ? 'Generating...' : 'AI Question Generator'}
          </button>

          <button
            onClick={onOpenNewQuestionModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Custom Question
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Behavioral">Behavioral (STAR)</option>
            <option value="System Design">System Design</option>
            <option value="Live Coding">Live Coding</option>
            <option value="Culture Fit">Culture Fit</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((q) => {
          const isExpanded = expandedId === q._id;

          return (
            <div
              key={q._id}
              onClick={() => setExpandedId(isExpanded ? null : q._id)}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {q.company || 'General'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      q.category === 'System Design' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      q.category === 'Behavioral' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      q.category === 'Live Coding' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {q.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      q.difficulty === 'Hard' ? 'text-rose-400 bg-rose-500/10' :
                      q.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10' :
                      'text-emerald-400 bg-emerald-500/10'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {q.question}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Practice counter button */}
                  <button
                    onClick={(e) => handlePracticeCount(q._id, e)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg text-xs font-semibold border border-slate-700 transition"
                    title="Click to increment practice session"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Practiced {q.timesPracticed || 0}x</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(q._id, e)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="Delete question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-slate-500 p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded details: Answer Key & Takeaways */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 cursor-default" onClick={(e) => e.stopPropagation()}>
                  {q.answerKey && (
                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Recommended Answer Structure / STAR Key</span>
                      </div>
                      <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                        {q.answerKey}
                      </p>
                    </div>
                  )}

                  {q.keyTakeaways?.length > 0 && (
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 text-xs">
                      <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wider block mb-1">
                        Personal Feedback & Retention Points:
                      </span>
                      <ul className="space-y-1 text-slate-300">
                        {q.keyTakeaways.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400">✓</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
            <MessageSquareQuote className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300">No questions found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add questions from your recent interviews or use the AI Generator to prepare for upcoming rounds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
