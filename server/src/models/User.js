const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['employee', 'employer', 'admin'],
    default: 'employee',
    index: true
  },
  // Employee / Candidate Profile Fields
  targetRole: {
    type: String,
    default: 'Full Stack Software Engineer'
  },
  targetSalary: {
    type: Number,
    default: 120000
  },
  location: {
    type: String,
    default: 'Remote / Hybrid'
  },
  experienceYears: {
    type: Number,
    default: 3
  },
  bio: {
    type: String,
    default: ''
  },
  resumeSkills: {
    type: [String],
    default: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Git', 'REST APIs', 'Docker']
  },
  resumeText: {
    type: String,
    default: ''
  },
  // Resume File Upload Details
  resumeUrl: {
    type: String,
    default: ''
  },
  resumeFileName: {
    type: String,
    default: ''
  },
  resumeOriginalName: {
    type: String,
    default: ''
  },
  resumeFileSize: {
    type: Number,
    default: 0
  },
  resumeMimeType: {
    type: String,
    default: ''
  },
  resumeUploadedAt: {
    type: Date
  },
  followUpDefaultDays: {
    type: Number,
    default: 5
  },

  // Employer / Recruiter Profile Fields
  companyName: {
    type: String,
    default: ''
  },
  companyWebsite: {
    type: String,
    default: ''
  },
  companyIndustry: {
    type: String,
    default: 'Technology & Software'
  },
  companySize: {
    type: String,
    default: '50-200'
  },
  companyLocation: {
    type: String,
    default: 'San Francisco, CA'
  },
  companyDescription: {
    type: String,
    default: ''
  },
  companyLogo: {
    type: String,
    default: ''
  },

  // Admin & System Control
  status: {
    type: String,
    enum: ['Active', 'Suspended'],
    default: 'Active'
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
