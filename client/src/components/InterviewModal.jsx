import React, { useState } from 'react';
import API from '../services/api';
import { X, Calendar, Clock, Video, Users, FileText } from 'lucide-react';

export default function InterviewModal({
  isOpen,
  onClose,
  onSaved,
  applications,
  initialApplication = null
}) {
  const [selectedAppId, setSelectedAppId] = useState(initialApplication?._id || applications[0]?._id || '');
  const [round, setRound] = useState('Technical Screen');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [meetingLink, setMeetingLink] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [interviewerRole, setInterviewerRole] = useState('');
  const [preparationNotes, setPreparationNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppId || !date) {
      alert('Please select a company application and date.');
      return;
    }

    setSaving(true);
    try {
      const scheduledAt = new Date(`${date}T${time || '00:00'}`);

      await API.post('/interviews', {
        applicationId: selectedAppId,
        round,
        scheduledAt,
        durationMinutes: Number(durationMinutes),
        meetingLink,
        interviewers: interviewerName ? [{ name: interviewerName, role: interviewerRole }] : [],
        preparationNotes
      });

      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to schedule interview:', err);
      alert('Failed to schedule interview');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Schedule New Interview</h3>
            <p className="text-xs text-slate-400">Add dates, meeting links, and prep focus points.</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Application *</label>
            <select
              required
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="" disabled>Select an active job application</option>
              {applications.map((app) => (
                <option key={app._id} value={app._id}>
                  {app.company} — {app.role} ({app.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Round Type</label>
              <select
                value={round}
                onChange={(e) => setRound(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Recruiter Screen">Recruiter Screen</option>
                <option value="Technical Screen">Technical Screen</option>
                <option value="Live Coding">Live Coding</option>
                <option value="System Design">System Design</option>
                <option value="Behavioral / Culture">Behavioral / Culture</option>
                <option value="Hiring Manager">Hiring Manager</option>
                <option value="Take-Home Presentation">Take-Home Presentation</option>
                <option value="Executive / Final Round">Executive / Final Round</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duration</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Interview Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Time (24h)</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Meeting Link (Zoom / Meet)</label>
            <input
              type="text"
              placeholder="https://meet.google.com/xyz or https://zoom.us/j/..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Interviewer Name</label>
              <input
                type="text"
                placeholder="Dr. Aris Thorne"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Interviewer Role</label>
              <input
                type="text"
                placeholder="Engineering Manager"
                value={interviewerRole}
                onChange={(e) => setInterviewerRole(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Preparation & Focus Notes</label>
            <textarea
              rows={3}
              placeholder="Key concepts to review, trade-offs to highlight, questions to ask interviewers..."
              value={preparationNotes}
              onChange={(e) => setPreparationNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

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
              {saving ? 'Scheduling...' : 'Save Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
