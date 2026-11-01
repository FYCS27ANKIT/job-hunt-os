import React, { useState } from 'react';
import API from '../services/api';
import {
  MessageSquareQuote,
  Plus,
  Search,
  CheckCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-sky-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Interview Question Bank & Feedback</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Store encountered interview questions, model answers, and retrospective self-coaching notes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleGenerateAIQuestions}
            disabled={generatingAI}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold rounded-xl text-xs transition active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            {generatingAI ? 'Generating...' : 'AI Question Generator'}
          </button>

          <button
            onClick={onOpenNewQuestionModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition shadow-sm shadow-sky-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Custom Question
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
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
            className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Question Cards Grid */}
      <div className="space-y-3">
        {filteredQuestions.map((q) => {
          const isExpanded = expandedId === q._id;

          return (
            <div
              key={q._id}
              onClick={() => setExpandedId(isExpanded ? null : q._id)}
              className="cursor-pointer bg-white border border-slate-200/90 hover:border-sky-300 rounded-xl transition-all shadow-xs hover:shadow-md"
            >
              <div className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                      {q.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      q.difficulty === 'Hard' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {q.difficulty}
                    </span>
                    {q.company && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        @{q.company}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {q.question}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => handlePracticeCount(q._id, e)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold border border-slate-200 transition"
                    title="Click to increment practice count"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{q.timesPracticed || 0}</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(q._id, e)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Delete question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Collapsible Model Answer & Notes */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/70 text-xs space-y-3 rounded-b-xl">
                  {q.answerKey && (
                    <div>
                      <div className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                        Model Answer / STAR Framework:
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed font-mono whitespace-pre-wrap text-[11px]">
                        {q.answerKey}
                      </div>
                    </div>
                  )}

                  {q.myNotes && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                      <div className="font-bold text-[10px] uppercase mb-0.5">My Personal Coaching Notes:</div>
                      <p>{q.myNotes}</p>
                    </div>
                  )}

                  {q.keyTakeaways?.length > 0 && (
                    <div>
                      <div className="font-bold text-slate-600 uppercase text-[10px] mb-1">Key Takeaways:</div>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                        {q.keyTakeaways.map((point, idx) => (
                          <li key={idx}>{point}</li>
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
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
            No questions match your current filters. Add or generate AI questions above.
          </div>
        )}
      </div>
    </div>
  );
}
