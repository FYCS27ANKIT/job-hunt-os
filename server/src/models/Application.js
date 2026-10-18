const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: 'Remote'
  },
  workType: {
    type: String,
    enum: ['Remote', 'Hybrid', 'Onsite'],
    default: 'Remote'
  },
  status: {
    type: String,
    enum: ['Wishlist', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Rejected'],
    default: 'Applied',
    index: true
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  source: {
    type: String,
    enum: ['LinkedIn', 'Indeed', 'Wellfound', 'Referral', 'Company Website', 'Recruiter Reachout', 'Other'],
    default: 'LinkedIn'
  },
  salary: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  jobDescription: {
    type: String,
    default: ''
  },
  jobUrl: {
    type: String,
    default: ''
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  lastContactDate: {
    type: Date,
    default: Date.now
  },
  followUpDate: {
    type: Date
  },
  followUpStatus: {
    type: String,
    enum: ['Pending', 'Sent', 'Resolved', 'Dismissed'],
    default: 'Pending'
  },
  followUpNotes: {
    type: String,
    default: ''
  },
  matchedSkills: {
    type: [String],
    default: []
  },
  missingSkills: {
    type: [String],
    default: []
  },
  matchScore: {
    type: Number,
    default: 0
  },
  aiRecommendations: {
    type: [String],
    default: []
  },
  recruiter: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  notes: {
    type: String,
    default: ''
  },
  timeline: [{
    stage: String,
    date: { type: Date, default: Date.now },
    note: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);
