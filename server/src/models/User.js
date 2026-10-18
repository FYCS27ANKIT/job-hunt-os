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
  followUpDefaultDays: {
    type: Number,
    default: 5
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
