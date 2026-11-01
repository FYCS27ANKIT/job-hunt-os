const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { analyzeSkillGap } = require('../services/aiService');

// GET /api/jobs - Browse jobs (optional auth for personalized match scores)
router.get('/', async (req, res) => {
  try {
    const { search, workType, experienceLevel, location, status } = req.query;
    const filter = { status: status || 'Active' };

    if (workType && workType !== 'all') {
      filter.workType = workType;
    }
    if (experienceLevel && experienceLevel !== 'all') {
      filter.experienceLevel = experienceLevel;
    }
    if (location && location !== 'all') {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const jobs = await Job.find(filter)
      .populate('employer', 'name email companyName companyLogo companyWebsite')
      .sort({ featured: -1, createdAt: -1 });

    // If an authenticated user token was passed in header, calculate personalized match score
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '').trim();
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_job_hunt_os_token_key_2026');
        const candidate = await User.findById(decoded.userId);

        if (candidate && candidate.resumeSkills) {
          const candidateSkillsLower = candidate.resumeSkills.map(s => s.toLowerCase());

          const enrichedJobs = jobs.map(job => {
            const reqSkills = job.requiredSkills || [];
            let matchedCount = 0;
            reqSkills.forEach(skill => {
              if (candidateSkillsLower.some(cs => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))) {
                matchedCount++;
              }
            });
            const score = reqSkills.length > 0 ? Math.round((matchedCount / reqSkills.length) * 100) : 75;
            const jobObj = job.toObject();
            jobObj.candidateMatchScore = score;
            return jobObj;
          });

          return res.json(enrichedJobs);
        }
      } catch (e) {
        // Continue unpersonalized
      }
    }

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error retrieving jobs', error: error.message });
  }
});

// GET /api/jobs/employer/my-jobs - Get jobs posted by logged-in employer
router.get('/employer/my-jobs', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.userId }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    res.status(500).json({ message: 'Error retrieving your jobs', error: error.message });
  }
});

// GET /api/jobs/:id - Single job detail
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'name email companyName companyWebsite companyIndustry companySize companyDescription');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Error retrieving job details', error: error.message });
  }
});

// POST /api/jobs - Create new job posting (Employer / Admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only employers and admins can post job openings.' });
    }

    const {
      title,
      department,
      location,
      workType,
      jobType,
      salary,
      experienceLevel,
      requiredSkills,
      description,
      responsibilities,
      benefits
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Job title and description are required.' });
    }

    const companyName = req.user.companyName || req.user.name || 'Hiring Company';

    let skillsList = requiredSkills || [];
    if (typeof skillsList === 'string') {
      skillsList = skillsList.split(',').map(s => s.trim()).filter(Boolean);
    }

    const job = new Job({
      employer: req.userId,
      company: companyName,
      companyLogo: req.user.companyLogo || '',
      title,
      department: department || 'Engineering',
      location: location || 'Remote',
      workType: workType || 'Remote',
      jobType: jobType || 'Full-time',
      salary: salary || { min: 0, max: 0, currency: 'USD' },
      experienceLevel: experienceLevel || 'Senior Level',
      requiredSkills: skillsList,
      description,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      status: 'Active'
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ message: 'Failed to post job opening', error: error.message });
  }
});

// PUT /api/jobs/:id - Edit job posting
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this job.' });
    }

    if (req.body.requiredSkills && typeof req.body.requiredSkills === 'string') {
      req.body.requiredSkills = req.body.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
    }

    Object.assign(job, req.body);
    await job.save();

    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Failed to update job', error: error.message });
  }
});

// DELETE /api/jobs/:id - Delete or archive job
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job.' });
    }

    await Job.findByIdAndDelete(job._id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Failed to delete job', error: error.message });
  }
});

// POST /api/jobs/:id/apply - Candidate applies to employer's job
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check if candidate already applied to this specific job
    const existing = await Application.findOne({ user: req.userId, job: job._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted an application for this position.' });
    }

    const { coverNote, phone } = req.body;
    const candidate = req.user;

    // Run AI skill gap analysis against job's required skills and description
    const gapAnalysis = await analyzeSkillGap({
      resumeText: candidate.resumeText || '',
      resumeSkills: candidate.resumeSkills || [],
      jobDescription: `${job.title} at ${job.company}.\nRequirements: ${(job.requiredSkills || []).join(', ')}\n${job.description}`,
      role: job.title
    });

    const application = new Application({
      user: candidate._id,
      job: job._id,
      employer: job.employer,
      company: job.company,
      role: job.title,
      location: job.location,
      workType: job.workType,
      status: 'Applied',
      priority: 'High',
      source: 'Platform Job Board',
      salary: job.salary,
      jobDescription: job.description,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      candidatePhone: phone || '',
      candidateResumeUrl: candidate.resumeUrl || '',
      candidateResumeFileName: candidate.resumeOriginalName || candidate.resumeFileName || '',
      candidateCoverNote: coverNote || '',
      matchedSkills: gapAnalysis.matchedSkills,
      missingSkills: gapAnalysis.missingSkills,
      matchScore: gapAnalysis.matchScore,
      aiRecommendations: gapAnalysis.aiRecommendations,
      timeline: [
        {
          stage: 'Applied',
          date: new Date(),
          note: `Applied to ${job.company} via Platform Job Board with ${gapAnalysis.matchScore}% skill match.`
        }
      ]
    });

    await application.save();

    // Increment applicants counter on job
    job.applicantsCount = (job.applicantsCount || 0) + 1;
    await job.save();

    // Send notification to Employer
    await Notification.create({
      user: job.employer,
      type: 'SYSTEM',
      title: `New Candidate Application: ${candidate.name}`,
      message: `${candidate.name} applied for "${job.title}" with a ${gapAnalysis.matchScore}% ATS resume match score.`,
      relatedApplication: application._id,
      actionUrl: '/employer/applicants'
    });

    res.status(201).json({
      message: 'Application submitted successfully to employer!',
      application
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ message: 'Failed to submit application', error: error.message });
  }
});

module.exports = router;
