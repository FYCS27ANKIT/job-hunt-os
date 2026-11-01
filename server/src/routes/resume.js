const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Application = require('../models/Application');
const { uploadResume, parseResumeFile } = require('../services/resumeService');
const { analyzeSkillGap } = require('../services/aiService');

router.use(auth);

// POST /api/resume/upload - Upload and parse candidate resume
router.post('/upload', uploadResume.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded.' });
    }

    const parsed = await parseResumeFile(req.file);
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Merge detected skills with existing skills
    const existingSkills = user.resumeSkills || [];
    const mergedSkills = Array.from(new Set([...existingSkills, ...parsed.extractedSkills]));

    user.resumeUrl = parsed.url;
    user.resumeFileName = parsed.fileName;
    user.resumeOriginalName = parsed.originalName;
    user.resumeFileSize = parsed.fileSize;
    user.resumeMimeType = parsed.mimeType;
    user.resumeUploadedAt = new Date();
    if (parsed.extractedText) {
      user.resumeText = parsed.extractedText;
    }
    user.resumeSkills = mergedSkills.length > 0 ? mergedSkills : existingSkills;

    await user.save();

    // Optionally re-score existing candidate applications against the new resume
    const applications = await Application.find({ user: user._id });
    for (const app of applications) {
      try {
        const gapAnalysis = await analyzeSkillGap({
          resumeText: user.resumeText,
          resumeSkills: user.resumeSkills,
          jobDescription: app.jobDescription || `${app.role} at ${app.company}`,
          role: app.role
        });
        app.matchedSkills = gapAnalysis.matchedSkills;
        app.missingSkills = gapAnalysis.missingSkills;
        app.matchScore = gapAnalysis.matchScore;
        app.aiRecommendations = gapAnalysis.aiRecommendations;
        await app.save();
      } catch (err) {
        // Continue
      }
    }

    res.json({
      message: 'Resume uploaded and analyzed successfully!',
      resume: {
        url: user.resumeUrl,
        fileName: user.resumeFileName,
        originalName: user.resumeOriginalName,
        fileSize: user.resumeFileSize,
        uploadedAt: user.resumeUploadedAt,
        extractedSkills: parsed.extractedSkills,
        totalSkills: user.resumeSkills.length
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        resumeSkills: user.resumeSkills,
        resumeUrl: user.resumeUrl,
        resumeOriginalName: user.resumeOriginalName,
        resumeUploadedAt: user.resumeUploadedAt
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Failed to upload and parse resume', error: error.message });
  }
});

// GET /api/resume/my-resume - Get current user's resume details
router.get('/my-resume', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      'resumeUrl resumeFileName resumeOriginalName resumeFileSize resumeMimeType resumeUploadedAt resumeSkills resumeText'
    );
    res.json({ resume: user });
  } catch (error) {
    console.error('Error fetching resume info:', error);
    res.status(500).json({ message: 'Failed to fetch resume', error: error.message });
  }
});

// DELETE /api/resume - Remove current resume
router.delete('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.resumeFileName) {
      const filePath = path.join(__dirname, '../../uploads/resumes', user.resumeFileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    user.resumeUrl = '';
    user.resumeFileName = '';
    user.resumeOriginalName = '';
    user.resumeFileSize = 0;
    user.resumeMimeType = '';
    user.resumeUploadedAt = null;

    await user.save();
    res.json({ message: 'Resume removed successfully', user });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ message: 'Failed to remove resume', error: error.message });
  }
});

module.exports = router;
