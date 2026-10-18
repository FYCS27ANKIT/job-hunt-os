const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { analyzeSkillGap, extractSkillsFromText, generateInterviewQuestions } = require('../services/aiService');

router.use(auth);

// POST /api/ai/match-skills - Run instant skill gap comparison
router.post('/match-skills', async (req, res) => {
  try {
    const { jobDescription, role, customSkills, customResume } = req.body;

    const analysis = await analyzeSkillGap({
      resumeText: customResume !== undefined ? customResume : (req.user.resumeText || ''),
      resumeSkills: customSkills || (req.user.resumeSkills || []),
      jobDescription: jobDescription || '',
      role: role || req.user.targetRole || ''
    });

    res.json(analysis);
  } catch (error) {
    console.error('AI match skills error:', error);
    res.status(500).json({ message: 'Failed to analyze skills', error: error.message });
  }
});

// POST /api/ai/extract-skills - Extract tech skills from provided text
router.post('/extract-skills', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text content is required' });
    }

    const skills = extractSkillsFromText(text);
    res.json({ skills, count: skills.length });
  } catch (error) {
    console.error('Skill extraction error:', error);
    res.status(500).json({ message: 'Failed to extract skills', error: error.message });
  }
});

// POST /api/ai/generate-questions - Generate tailored interview questions
router.post('/generate-questions', async (req, res) => {
  try {
    const { company, role, missingSkills, matchedSkills } = req.body;
    const questions = await generateInterviewQuestions({
      company: company || 'Tech Company',
      role: role || req.user.targetRole || 'Software Engineer',
      missingSkills: missingSkills || [],
      matchedSkills: matchedSkills || (req.user.resumeSkills || [])
    });

    res.json({ questions });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ message: 'Failed to generate questions', error: error.message });
  }
});

module.exports = router;
