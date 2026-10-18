const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    default: 'General'
  },
  role: {
    type: String,
    default: 'Software Engineer'
  },
  category: {
    type: String,
    enum: ['Technical', 'Behavioral', 'System Design', 'Live Coding', 'Culture Fit', 'General'],
    default: 'Technical'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  answerKey: {
    type: String,
    default: ''
  },
  keyTakeaways: {
    type: [String],
    default: []
  },
  timesPracticed: {
    type: Number,
    default: 1
  },
  lastPracticedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QuestionBank', questionBankSchema);
