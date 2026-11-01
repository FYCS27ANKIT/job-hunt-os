const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Protect all employer routes
router.use(auth);

// Middleware: ensure user is employer or admin
const ensureEmployer = (req, res, next) => {
  if (req.user.role !== 'employer' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Employer or Admin privileges required.' });
  }
  next();
};

router.use(ensureEmployer);

// GET /api/employer/applicants - Get all applicants for this employer's jobs
router.get('/applicants', async (req, res) => {
  try {
    const { jobId, status, search, sort } = req.query;

    // Find all jobs owned by this employer
    const myJobs = await Job.find({ employer: req.userId }).select('_id');
    const myJobIds = myJobs.map(j => j._id);

    const filter = {
      $or: [
        { employer: req.userId },
        { job: { $in: myJobIds } }
      ]
    };

    if (jobId && jobId !== 'all') {
      filter.job = jobId;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { candidateName: { $regex: search, $options: 'i' } },
        { candidateEmail: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    let query = Application.find(filter)
      .populate('user', 'name email location targetRole experienceYears resumeUrl resumeOriginalName resumeSkills resumeText')
      .populate('job', 'title department location workType salary');

    if (sort === 'score') query = query.sort({ matchScore: -1 });
    else if (sort === 'oldest') query = query.sort({ createdAt: 1 });
    else query = query.sort({ createdAt: -1 });

    const applicants = await query.exec();
    res.json(applicants);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ message: 'Error retrieving candidates', error: error.message });
  }
});

// GET /api/employer/applicants/:id - Get single applicant profile & resume
router.get('/applicants/:id', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email location targetRole experienceYears resumeUrl resumeOriginalName resumeSkills resumeText')
      .populate('job');

    if (!application) return res.status(404).json({ message: 'Applicant not found' });

    const interviews = await Interview.find({ application: application._id }).sort({ scheduledAt: 1 });

    res.json({ application, interviews });
  } catch (error) {
    console.error('Error fetching applicant detail:', error);
    res.status(500).json({ message: 'Error fetching candidate details', error: error.message });
  }
});

// PATCH /api/employer/applicants/:id/status - Update applicant candidate stage
router.patch('/applicants/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const prevStatus = application.status;
    application.status = status;
    application.lastContactDate = new Date();

    const stageNote = note || `Status updated from ${prevStatus} to ${status} by hiring team.`;
    application.timeline.push({
      stage: status,
      date: new Date(),
      note: stageNote
    });

    await application.save();

    // Notify candidate
    await Notification.create({
      user: application.user,
      type: 'SYSTEM',
      title: `Application Update: ${application.company}`,
      message: `Great news! Your application for "${application.role}" has moved to the "${status}" stage.`,
      relatedApplication: application._id,
      actionUrl: '/kanban'
    });

    res.json({ message: 'Candidate status updated', application });
  } catch (error) {
    console.error('Error updating applicant status:', error);
    res.status(500).json({ message: 'Failed to update candidate status', error: error.message });
  }
});

// POST /api/employer/applicants/:id/schedule-interview - Employer schedules interview with applicant
router.post('/applicants/:id/schedule-interview', async (req, res) => {
  try {
    const { round, scheduledAt, durationMinutes, meetingLink, interviewers, preparationNotes } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Promote status to Interviewing
    application.status = 'Interviewing';
    application.timeline.push({
      stage: 'Interviewing',
      date: new Date(),
      note: `Interview scheduled for round: ${round || 'Recruiter Screen'}`
    });
    application.lastContactDate = new Date();
    await application.save();

    const interview = new Interview({
      user: application.user,
      application: application._id,
      company: application.company,
      role: application.role,
      round: round || 'Recruiter Screen',
      scheduledAt: new Date(scheduledAt),
      durationMinutes: durationMinutes || 45,
      interviewers: interviewers || [{ name: req.user.name, role: 'Hiring Manager' }],
      meetingLink: meetingLink || '',
      preparationNotes: preparationNotes || '',
      status: 'Scheduled'
    });

    await interview.save();

    // Send immediate notification to Candidate
    await Notification.create({
      user: application.user,
      type: 'UPCOMING_INTERVIEW',
      title: `Interview Scheduled with ${application.company}!`,
      message: `Your ${round || 'interview'} for "${application.role}" is set for ${new Date(scheduledAt).toLocaleString()}. Meeting link: ${meetingLink || 'To be shared'}`,
      relatedApplication: application._id,
      relatedInterview: interview._id,
      dueDate: new Date(scheduledAt),
      actionUrl: '/interviews'
    });

    res.status(201).json({ message: 'Interview scheduled successfully', interview, application });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ message: 'Failed to schedule interview', error: error.message });
  }
});

// PUT /api/employer/applicants/:id/notes - Update internal recruiter notes
router.put('/applicants/:id/notes', async (req, res) => {
  try {
    const { recruiterNotes } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.recruiterNotes = recruiterNotes || '';
    await application.save();

    res.json({ message: 'Internal notes saved', application });
  } catch (error) {
    console.error('Error saving notes:', error);
    res.status(500).json({ message: 'Failed to save notes', error: error.message });
  }
});

// GET /api/employer/stats - Aggregate hiring metrics for employer dashboard
router.get('/stats', async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.userId });
    const jobIds = jobs.map(j => j._id);

    const applications = await Application.find({
      $or: [
        { employer: req.userId },
        { job: { $in: jobIds } }
      ]
    });

    const activeJobsCount = jobs.filter(j => j.status === 'Active').length;
    const totalApplicants = applications.length;
    const screeningCount = applications.filter(a => a.status === 'Screening').length;
    const interviewingCount = applications.filter(a => a.status === 'Interviewing').length;
    const offerCount = applications.filter(a => a.status === 'Offer').length;

    const avgMatchScore = totalApplicants > 0
      ? Math.round(applications.reduce((acc, curr) => acc + (curr.matchScore || 0), 0) / totalApplicants)
      : 0;

    res.json({
      activeJobsCount,
      totalJobsCount: jobs.length,
      totalApplicants,
      screeningCount,
      interviewingCount,
      offerCount,
      avgMatchScore,
      stageCounts: {
        Applied: applications.filter(a => a.status === 'Applied').length,
        Screening: screeningCount,
        Interviewing: interviewingCount,
        Offer: offerCount,
        Rejected: applications.filter(a => a.status === 'Rejected').length
      }
    });
  } catch (error) {
    console.error('Error compiling employer stats:', error);
    res.status(500).json({ message: 'Failed to compile stats', error: error.message });
  }
});

// PUT /api/employer/profile - Update employer company profile
router.put('/profile', async (req, res) => {
  try {
    const { companyName, companyWebsite, companyIndustry, companySize, companyLocation, companyDescription } = req.body;
    const user = req.user;

    if (companyName) user.companyName = companyName;
    if (companyWebsite) user.companyWebsite = companyWebsite;
    if (companyIndustry) user.companyIndustry = companyIndustry;
    if (companySize) user.companySize = companySize;
    if (companyLocation) user.companyLocation = companyLocation;
    if (companyDescription) user.companyDescription = companyDescription;

    await user.save();
    res.json({ message: 'Company profile updated', user });
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({ message: 'Failed to update company profile', error: error.message });
  }
});

module.exports = router;
