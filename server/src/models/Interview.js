const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  category: {
    type: String,
    enum: ['Technical', 'Behavioral', 'System Design', 'Live Coding', 'Culture Fit', 'General'],
    default: 'Technical'
  },
  myAnswerNotes: { type: String, default: '' },
  selfRating: { type: Number, min: 1, max: 5, default: 3 },
  feedback: { type: String, default: '' }
});

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    index: true
  },
  company: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  round: {
    type: String,
    enum: ['Recruiter Screen', 'Technical Screen', 'Live Coding', 'System Design', 'Behavioral / Culture', 'Hiring Manager', 'Take-Home Presentation', 'Executive / Final Round'],
    default: 'Recruiter Screen'
  },
  scheduledAt: {
    type: Date,
    required: true,
    index: true
  },
  durationMinutes: {
    type: Number,
    default: 45
  },
  interviewers: [{
    name: { type: String, default: '' },
    role: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  }],
  meetingLink: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Rescheduled', 'Cancelled'],
    default: 'Scheduled'
  },
  preparationNotes: {
    type: String,
    default: ''
  },
  questionsAsked: [questionSchema],
  personalFeedback: {
    type: String,
    default: ''
  },
  retrospective: {
    strengths: { type: String, default: '' },
    improvements: { type: String, default: '' },
    overallScore: { type: Number, min: 1, max: 5, default: 4 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema);
