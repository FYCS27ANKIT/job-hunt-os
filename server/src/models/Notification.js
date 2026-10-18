const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['FOLLOW_UP_DUE', 'UPCOMING_INTERVIEW', 'SKILL_GAP_ALERT', 'SYSTEM', 'INTERVIEW_PREP'],
    default: 'FOLLOW_UP_DUE'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  relatedInterview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview'
  },
  actionUrl: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
