import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Users,
  CheckCircle,
  Plus,
  ExternalLink,
  Star,
  MessageSquare,
  HelpCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function InterviewsView({
  interviews,
  onOpenNewInterviewModal,
  onOpenAddQuestionModal,
  onSelectInterview,
  onUpdateInterviewStatus
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'completed'

  const now = new Date();
  const upcomingList = interviews.filter(i => i.status === 'Scheduled' && new Date(i.scheduledAt) >= now);
  const pastList = interviews.filter(i => i.status === 'Completed' || new Date(i.scheduledAt) < now);

  const displayedList = filter === 'upcoming'
    ? upcomingList
    : filter === 'completed'
    ? pastList
    : interviews;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-extrabold text-white">Interview Schedule & Feedback</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track interview dates, technical rounds, questions asked, and personal retrospectives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${filter === 'all' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              All ({interviews.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${filter === 'upcoming' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              Upcoming ({upcomingList.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${filter === 'completed' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              Completed ({pastList.length})
            </button>
          </div>

          <button
            onClick={onOpenNewInterviewModal}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Schedule Interview
          </button>
        </div>
      </div>

      {/* Interviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {displayedList.map((interview) => {
          const isUpcoming = new Date(interview.scheduledAt) >= now && interview.status === 'Scheduled';
          const dateObj = new Date(interview.scheduledAt);

          return (
            <div
              key={interview._id}
              className={`bg-slate-850/80 bg-slate-900 border rounded-2xl p-5 transition-all shadow-lg flex flex-col justify-between ${
                isUpcoming ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Top Badge & Company */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{interview.company}</h3>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        interview.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {interview.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">{interview.role}</p>
                  </div>

                  <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-xl border border-slate-700">
                    {interview.round}
                  </span>
                </div>

                {/* Date & Meeting Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({interview.durationMinutes || 45} mins)</span>
                  </div>

                  {interview.meetingLink && (
                    <div className="sm:col-span-2 flex items-center gap-2 pt-1 border-t border-slate-800/60 text-emerald-400">
                      <Video className="w-4 h-4 shrink-0" />
                      <a
                        href={interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate hover:underline flex items-center gap-1 font-semibold"
                      >
                        Join Call <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Interviewers */}
                {interview.interviewers?.length > 0 && (
                  <div className="mb-3 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Interviewers</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {interview.interviewers.map((person, idx) => (
                        <span key={idx} className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
                          {person.name} {person.role && `(${person.role})`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preparation Notes */}
                {interview.preparationNotes && (
                  <div className="mb-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 font-bold text-slate-400 text-[11px] uppercase mb-1">
                      <FileText className="w-3 h-3 text-emerald-400" /> Prep Focus
                    </div>
                    <p className="line-clamp-2">{interview.preparationNotes}</p>
                  </div>
                )}

                {/* Logged Questions preview */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Questions Logged ({interview.questionsAsked?.length || 0})
                    </span>
                    <button
                      onClick={() => onOpenAddQuestionModal(interview)}
                      className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Question
                    </button>
                  </div>

                  {interview.questionsAsked?.length > 0 ? (
                    <div className="space-y-2">
                      {interview.questionsAsked.slice(0, 2).map((q, qIdx) => (
                        <div key={qIdx} className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-slate-200 line-clamp-1">{q.question}</span>
                            <div className="flex items-center text-amber-400 shrink-0">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span className="text-[11px] font-bold ml-0.5">{q.selfRating}/5</span>
                            </div>
                          </div>
                          {q.myAnswerNotes && (
                            <p className="text-slate-400 text-[11px] mt-1 line-clamp-1 italic">
                              "{q.myAnswerNotes}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No questions logged yet for this round.</p>
                  )}
                </div>

                {/* Retrospective feedback if completed */}
                {interview.retrospective?.strengths && (
                  <div className="mt-3 p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs">
                    <span className="font-bold text-emerald-400 text-[10px] uppercase">Retrospective Takeaway:</span>
                    <p className="text-slate-300 mt-0.5">{interview.retrospective.strengths}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => onSelectInterview(interview)}
                  className="text-xs font-semibold text-slate-300 hover:text-white"
                >
                  View Details & Retrospective
                </button>

                {interview.status === 'Scheduled' && (
                  <button
                    onClick={() => onUpdateInterviewStatus(interview._id, 'Completed')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {displayedList.length === 0 && (
          <div className="col-span-full py-16 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300">No interviews found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Schedule your recruiter screens, live coding sessions, and system design loops to stay prepared.
            </p>
            <button
              onClick={onOpenNewInterviewModal}
              className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md"
            >
              + Schedule Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
