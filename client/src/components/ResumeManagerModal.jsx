import React, { useState, useRef } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  X,
  FileCheck,
  Download
} from 'lucide-react';

export default function ResumeManagerModal({ isOpen, onClose, onResumeUpdated }) {
  const { user, setUser } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedFile(e.target.files[0]);
    }
  };

  const handleSelectedFile = (selected) => {
    setError('');
    const ext = selected.name.split('.').pop().toLowerCase();
    if (!['pdf', 'txt', 'doc', 'docx'].includes(ext)) {
      setError('Please upload a PDF, TXT, DOC, or DOCX document.');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUser(prev => ({
        ...prev,
        resumeUrl: res.data.resume.url,
        resumeFileName: res.data.resume.fileName,
        resumeOriginalName: res.data.resume.originalName,
        resumeFileSize: res.data.resume.fileSize,
        resumeUploadedAt: res.data.resume.uploadedAt,
        resumeSkills: res.data.user.resumeSkills
      }));

      setSuccessMsg(`Resume "${res.data.resume.originalName}" uploaded! Extracted ${res.data.resume.extractedSkills?.length || 0} technical skills.`);
      setFile(null);
      if (onResumeUpdated) onResumeUpdated();
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Failed to upload and parse resume file.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveResume = async () => {
    if (!confirm('Are you sure you want to remove your uploaded resume?')) return;
    try {
      await API.delete('/resume');
      setUser(prev => ({
        ...prev,
        resumeUrl: '',
        resumeFileName: '',
        resumeOriginalName: '',
        resumeFileSize: 0,
        resumeUploadedAt: null
      }));
      setSuccessMsg('Resume removed.');
      if (onResumeUpdated) onResumeUpdated();
    } catch (err) {
      setError('Failed to remove resume.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Candidate Resume Management</h3>
              <p className="text-xs text-slate-500">Upload your resume for automatic skill parsing & 1-click job applications.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Currently Active Resume Card */}
          {user?.resumeUrl ? (
            <div className="bg-slate-50/80 border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">
                        {user.resumeOriginalName || 'Uploaded Resume'}
                      </h4>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {user.resumeFileSize ? `${(user.resumeFileSize / 1024).toFixed(1)} KB • ` : ''}
                      Uploaded {user.resumeUploadedAt ? new Date(user.resumeUploadedAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <a
                    href={user.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 shadow-sm transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download / View</span>
                  </a>
                  <button
                    onClick={handleRemoveResume}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Remove Resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Indexed Skills preview */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Parsed Technical Skills ({user.resumeSkills?.length || 0})</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {(user.resumeSkills || []).map((sk, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-950">No resume uploaded yet</p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Uploading your resume allows the AI engine to calculate ATS match scores and pre-fills your profile for 1-click applications to employer jobs.
                </p>
              </div>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              {user?.resumeUrl ? 'Replace or Upload New Resume' : 'Upload Resume File'}
            </label>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-sky-500 bg-sky-50/60'
                  : 'border-slate-300 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3 border border-sky-100">
                <Upload className="w-6 h-6" />
              </div>

              {file ? (
                <div>
                  <p className="text-sm font-bold text-slate-900">{file.name}</p>
                  <p className="text-xs text-sky-600 font-semibold mt-1">
                    {(file.size / 1024).toFixed(1)} KB • Ready to upload
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Drag and drop your resume here, or <span className="text-sky-600 underline font-bold">browse</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF, TXT, DOC, DOCX up to 10MB
                  </p>
                </div>
              )}
            </div>

            {file && (
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs rounded-xl transition shadow-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-sm"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Parsing Resume...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      Upload & Auto-Extract Skills
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
