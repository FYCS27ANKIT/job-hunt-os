const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const QuestionBank = require('../models/QuestionBank');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/interviews - List all interviews for user
router.get('/', async (req, res) => {
  try {
    const { status, timeframe } = req.query;
    const filter = { user: req.userId };

    if (status) {
      filter.status = status;
    }

    if (timeframe === 'upcoming') {
      filter.scheduledAt = { $gte: new Date() };
    } else if (timeframe === 'past') {
      filter.scheduledAt = { $lt: new Date() };
    }

    const interviews = await Interview.find(filter)
      .populate('application', 'company role status location matchScore')
      .sort({ scheduledAt: 1 });

    res.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ message: 'Error fetching interviews', error: error.message });
  }
});

// GET /api/interviews/:id
router.get('/:id', async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.userId })
      .populate('application');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(500).json({ message: 'Error fetching interview', error: error.message });
  }
});

// POST /api/interviews - Schedule an interview
router.post('/', async (req, res) => {
  try {
    const {
      applicationId,
      company,
      role,
      round,
      scheduledAt,
      durationMinutes,
      interviewers,
      meetingLink,
      preparationNotes
    } = req.body;

    if (!applicationId || !scheduledAt) {
      return res.status(400).json({ message: 'Application ID and scheduled date/time are required.' });
    }

    const application = await Application.findOne({ _id: applicationId, user: req.userId });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Auto promote application status to 'Interviewing' if currently Applied or Screening
    if (['Wishlist', 'Applied', 'Screening'].includes(application.status)) {
      application.status = 'Interviewing';
      application.timeline.push({
        stage: 'Interviewing',
        date: new Date(),
        note: `Interview scheduled for round: ${round || 'Recruiter Screen'}`
      });
      application.lastContactDate = new Date();
      await application.save();
    }

    const interview = new Interview({
      user: req.userId,
      application: application._id,
      company: company || application.company,
      role: role || application.role,
      round: round || 'Recruiter Screen',
      scheduledAt: new Date(scheduledAt),
      durationMinutes: durationMinutes || 45,
      interviewers: interviewers || [],
      meetingLink: meetingLink || '',
      preparationNotes: preparationNotes || ''
    });

    await interview.save();
    res.status(201).json(interview);
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({ message: 'Error scheduling interview', error: error.message });
  }
});

// PUT /api/interviews/:id - Update interview, feedback & retrospective
router.put('/:id', async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.userId });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    Object.assign(interview, req.body);
    await interview.save();

    res.json(interview);
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ message: 'Error updating interview', error: error.message });
  }
});

// POST /api/interviews/:id/questions - Add question asked during this interview & optionally save to Question Bank
router.post('/:id/questions', async (req, res) => {
  try {
    const { question, category, myAnswerNotes, selfRating, feedback, saveToBank } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, user: req.userId });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const newQuestion = {
      question,
      category: category || 'Technical',
      myAnswerNotes: myAnswerNotes || '',
      selfRating: selfRating || 3,
      feedback: feedback || ''
    };

    interview.questionsAsked.push(newQuestion);
    await interview.save();

    // If requested, save to personal Question Bank for future prep
    if (saveToBank) {
      await QuestionBank.create({
        user: req.userId,
        question,
        company: interview.company,
        role: interview.role,
        category: category || 'Technical',
        answerKey: myAnswerNotes || '',
        keyTakeaways: feedback ? [feedback] : []
      });
    }

    res.status(201).json({ interview, question: interview.questionsAsked[interview.questionsAsked.length - 1] });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ message: 'Error adding question', error: error.message });
  }
});

// DELETE /api/interviews/:id
router.delete('/:id', async (req, res) => {
  try {
    const interview = await Interview.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({ message: 'Error deleting interview', error: error.message });
  }
});

module.exports = router;
