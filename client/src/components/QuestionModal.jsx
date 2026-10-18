import React, { useState } from 'react';
import API from '../services/api';
import { X, Star, HelpCircle, BookOpen } from 'lucide-react';

export default function QuestionModal({
  isOpen,
  onClose,
  onSaved,
  interview = null // If provided, attaches to this interview
}) {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [selfRating, setSelfRating] = useState(4);
  const [myAnswerNotes, setMyAnswerNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saveToBank, setSaveToBank] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      alert('Question is required');
      return;
    }

    setSaving(true);
    try {
      if (interview) {
        // Post to interview question log
        await API.post(`/interviews/${interview._id}/questions`, {
          question,
          category,
          myAnswerNotes,
          selfRating: Number(selfRating),
          feedback,
          saveToBank
        });
      } else {
        // Direct to Question Bank
        await API.post('/questions', {
          question,
          category,
          difficulty,
          answerKey: myAnswerNotes,
          keyTakeaways: feedback ? [feedback] : []
        });
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save question:', err);
      alert('Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">
              {interview ? `Log Question: ${interview.company}` : 'Add Interview Question'}
            </h3>
            <p className="text-xs text-slate-400">Record prompt, answer structure, and retrospective feedback.</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Question Asked *</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Design a distributed cache with LRU eviction and replication..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Technical">Technical</option>
                <option value="System Design">System Design</option>
                <option value="Live Coding">Live Coding</option>
                <option value="Behavioral">Behavioral (STAR)</option>
                <option value="Culture Fit">Culture Fit</option>
              </select>
            </div>

            {interview ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Self-Rating</label>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelfRating(star)}
                      className={`p-1 rounded ${selfRating >= star ? 'text-amber-400' : 'text-slate-600'}`}
                    >
                      <Star className={`w-5 h-5 ${selfRating >= star ? 'fill-amber-400' : ''}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-300 ml-1">{selfRating}/5</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Answer Notes / Solution Outline
            </label>
            <textarea
              rows={3}
              placeholder="What points did you emphasize? Key architectural trade-offs, algorithms, or STAR situation..."
              value={myAnswerNotes}
              onChange={(e) => setMyAnswerNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Interviewer Feedback / Retrospective Takeaways
            </label>
            <input
              type="text"
              placeholder="What went well? What could be articulated more clearly next time?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {interview && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="saveToBank"
                checked={saveToBank}
                onChange={(e) => setSaveToBank(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="saveToBank" className="text-xs text-slate-300">
                Also save to personal Question Bank for future prep
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-md active:scale-95"
            >
              {saving ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
