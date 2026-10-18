import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { X, User, DollarSign, Target, Sparkles, Plus, Trash2 } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Full Stack Software Engineer');
  const [targetSalary, setTargetSalary] = useState(user?.targetSalary || 140000);
  const [location, setLocation] = useState(user?.location || 'Remote / Hybrid');
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears || 3);
  const [followUpDays, setFollowUpDays] = useState(user?.followUpDefaultDays || 5);
  const [resumeSkills, setResumeSkills] = useState(user?.resumeSkills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [resumeText, setResumeText] = useState(user?.resumeText || '');
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const trimmed = newSkillInput.trim();
    if (!resumeSkills.includes(trimmed)) {
      setResumeSkills([...resumeSkills, trimmed]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setResumeSkills(resumeSkills.filter(s => s !== skillToRemove));
  };

  const handleAutoExtractSkills = async () => {
    if (!resumeText.trim()) {
      alert('Please paste some resume text first');
      return;
    }

    setExtracting(true);
    try {
      const res = await API.post('/ai/extract-skills', { text: resumeText });
      const detected = res.data.skills || [];
      const merged = Array.from(new Set([...resumeSkills, ...detected]));
      setResumeSkills(merged);
      alert(`Extracted ${detected.length} skills from your resume text!`);
    } catch (err) {
      console.error('Failed to extract skills:', err);
      alert('Error extracting skills');
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser({
        name,
        targetRole,
        targetSalary: Number(targetSalary),
        location,
        experienceYears: Number(experienceYears),
        followUpDefaultDays: Number(followUpDays),
        resumeSkills,
        resumeText
      });

      if (onProfileUpdated) onProfileUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Career Profile & Resume Settings</h3>
            <p className="text-xs text-slate-400">Used by the AI engine to score job matches and detect skill gaps.</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Role Title</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Salary ($)</label>
              <input
                type="number"
                value={targetSalary}
                onChange={(e) => setTargetSalary(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Experience (Years)</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Follow-up Days Threshold</label>
              <input
                type="number"
                value={followUpDays}
                onChange={(e) => setFollowUpDays(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Technical Skills Pills & Adder */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Resume Skills ({resumeSkills.length})
            </label>
            <div className="flex flex-wrap gap-1.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800 min-h-[80px] max-h-40 overflow-y-auto mb-2">
              {resumeSkills.map((sk) => (
                <span
                  key={sk}
                  className="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-medium"
                >
                  <span>{sk}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(sk)}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. GraphQL, AWS, Docker)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
                className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Raw Resume Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Raw Resume Text / Bio
              </label>
              <button
                type="button"
                onClick={handleAutoExtractSkills}
                disabled={extracting}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Extract Skills</span>
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Paste your resume or bio here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              {saving ? 'Updating...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
