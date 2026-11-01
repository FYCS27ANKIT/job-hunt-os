const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  employer: {
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
  companyLogo: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    default: 'Engineering'
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
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  salary: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead / Staff', 'Executive'],
    default: 'Senior Level'
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    required: true
  },
  responsibilities: {
    type: [String],
    default: []
  },
  benefits: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['Active', 'Paused', 'Closed'],
    default: 'Active',
    index: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  applicantsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
