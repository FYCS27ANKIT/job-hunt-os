const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const auth = require('../middleware/auth');
const { analyzeSkillGap } = require('../services/aiService');

// Protect all application routes
router.use(auth);

// GET /api/applications - Get all applications for current user
router.get('/', async (req, res) => {
  try {
    const { status, search, priority, sort } = req.query;
    const filter = { user: req.userId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    let query = Application.find(filter);

    if (sort === 'date_asc') query = query.sort({ applicationDate: 1 });
    else if (sort === 'company') query = query.sort({ company: 1 });
    else if (sort === 'match') query = query.sort({ matchScore: -1 });
    else query = query.sort({ applicationDate: -1 });

    const applications = await query.exec();
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error retrieving applications', error: error.message });
  }
});

// GET /api/applications/:id - Get single application with related interviews
router.get('/:id', async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, user: req.userId });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const interviews = await Interview.find({ application: application._id }).sort({ scheduledAt: 1 });

    res.json({ application, interviews });
  } catch (error) {
    console.error('Error fetching application detail:', error);
    res.status(500).json({ message: 'Error fetching application', error: error.message });
  }
});

// POST /api/applications - Create new application
router.post('/', async (req, res) => {
  try {
    const {
      company,
      role,
      location,
      workType,
      status,
      priority,
      source,
      salary,
      jobDescription,
      jobUrl,
      applicationDate,
      recruiter,
      notes
    } = req.body;

    if (!company || !role) {
      return res.status(400).json({ message: 'Company and Role are required.' });
    }

    // Run AI skill gap analysis against user profile
    const gapAnalysis = await analyzeSkillGap({
      resumeText: req.user.resumeText || '',
      resumeSkills: req.user.resumeSkills || [],
      jobDescription: jobDescription || '',
      role
    });

    const appDate = applicationDate ? new Date(applicationDate) : new Date();
    const followUpDays = req.user.followUpDefaultDays || 5;
    const followUpDate = new Date(appDate);
    followUpDate.setDate(followUpDate.getDate() + followUpDays);

    const initialStatus = status || 'Applied';

    const application = new Application({
      user: req.userId,
      company,
      role,
      location: location || 'Remote',
      workType: workType || 'Remote',
      status: initialStatus,
      priority: priority || 'Medium',
      source: source || 'LinkedIn',
      salary: salary || { min: 0, max: 0, currency: 'USD' },
      jobDescription: jobDescription || '',
      jobUrl: jobUrl || '',
      applicationDate: appDate,
      lastContactDate: appDate,
      followUpDate,
      followUpStatus: 'Pending',
      matchedSkills: gapAnalysis.matchedSkills,
      missingSkills: gapAnalysis.missingSkills,
      matchScore: gapAnalysis.matchScore,
      aiRecommendations: gapAnalysis.aiRecommendations,
      recruiter: recruiter || {},
      notes: notes || '',
      timeline: [
        {
          stage: initialStatus,
          date: appDate,
          note: `Application created with initial status ${initialStatus}`
        }
      ]
    });

    await application.save();
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ message: 'Failed to create application', error: error.message });
  }
});

// PUT /api/applications/:id - Update full application
router.put('/:id', async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, user: req.userId });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const previousStatus = application.status;
    const previousJobDesc = application.jobDescription;

    Object.assign(application, req.body);

    // If status changed, record in timeline
    if (req.body.status && req.body.status !== previousStatus) {
      application.timeline.push({
        stage: req.body.status,
        date: new Date(),
        note: `Status moved from ${previousStatus} to ${req.body.status}`
      });
      application.lastContactDate = new Date();
    }

    // If job description changed and wasn't previously analyzed, refresh match
    if (req.body.jobDescription && req.body.jobDescription !== previousJobDesc) {
      const gapAnalysis = await analyzeSkillGap({
        resumeText: req.user.resumeText || '',
        resumeSkills: req.user.resumeSkills || [],
        jobDescription: req.body.jobDescription,
        role: application.role
      });
      application.matchedSkills = gapAnalysis.matchedSkills;
      application.missingSkills = gapAnalysis.missingSkills;
      application.matchScore = gapAnalysis.matchScore;
      application.aiRecommendations = gapAnalysis.aiRecommendations;
    }

    await application.save();
    res.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Failed to update application', error: error.message });
  }
});

// PATCH /api/applications/:id/status - Quick status change for Kanban board
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findOne({ _id: req.params.id, user: req.userId });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const previousStatus = application.status;
    application.status = status;
    application.lastContactDate = new Date();

    application.timeline.push({
      stage: status,
      date: new Date(),
      note: `Moved to ${status} via Kanban board`
    });

    await application.save();
    res.json(application);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Failed to change status', error: error.message });
  }
});

// POST /api/applications/:id/rescan - Re-run AI skill matching with current resume
router.post('/:id/rescan', async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, user: req.userId });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const gapAnalysis = await analyzeSkillGap({
      resumeText: req.user.resumeText || '',
      resumeSkills: req.user.resumeSkills || [],
      jobDescription: application.jobDescription || `${application.role} at ${application.company}`,
      role: application.role
    });

    application.matchedSkills = gapAnalysis.matchedSkills;
    application.missingSkills = gapAnalysis.missingSkills;
    application.matchScore = gapAnalysis.matchScore;
    application.aiRecommendations = gapAnalysis.aiRecommendations;

    await application.save();
    res.json({ message: 'Skill gap re-analyzed successfully', application });
  } catch (error) {
    console.error('Error rescanning application:', error);
    res.status(500).json({ message: 'Failed to rescan application', error: error.message });
  }
});

// POST /api/applications/:id/follow-up - Update follow-up status (Sent, Dismissed, Rescheduled)
router.post('/:id/follow-up', async (req, res) => {
  try {
    const { status, nextDate, notes } = req.body;
    const application = await Application.findOne({ _id: req.params.id, user: req.userId });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.followUpStatus = status || 'Sent';
    if (nextDate) application.followUpDate = new Date(nextDate);
    if (notes) application.followUpNotes = notes;
    application.lastContactDate = new Date();

    application.timeline.push({
      stage: 'Follow-up Sent',
      date: new Date(),
      note: notes || `Follow-up marked as ${application.followUpStatus}`
    });

    await application.save();
    res.json({ message: 'Follow-up recorded', application });
  } catch (error) {
    console.error('Error updating follow-up:', error);
    res.status(500).json({ message: 'Failed to update follow-up', error: error.message });
  }
});

// DELETE /api/applications/:id
router.delete('/:id', async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Also remove associated interviews
    await Interview.deleteMany({ application: application._id });

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Failed to delete application', error: error.message });
  }
});

module.exports = router;
