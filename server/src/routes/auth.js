const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { extractSkillsFromText } = require('../services/aiService');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'super_secret_jwt_job_hunt_os_token_key_2026',
    { expiresIn: '30d' }
  );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, targetRole, targetSalary, resumeSkills, resumeText, location, experienceYears } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email address already exists.' });
    }

    // Auto extract skills from resume text if provided
    let skills = resumeSkills || [];
    if (typeof skills === 'string') {
      skills = skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (resumeText && skills.length === 0) {
      skills = extractSkillsFromText(resumeText);
    }

    const user = new User({
      name,
      email,
      password,
      targetRole: targetRole || 'Full Stack Software Engineer',
      targetSalary: targetSalary || 120000,
      resumeSkills: skills.length > 0 ? skills : ['React', 'Node.js', 'TypeScript', 'MongoDB', 'REST APIs', 'Git'],
      resumeText: resumeText || '',
      location: location || 'Remote / Hybrid',
      experienceYears: experienceYears || 3
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        targetSalary: user.targetSalary,
        resumeSkills: user.resumeSkills,
        resumeText: user.resumeText,
        location: user.location,
        experienceYears: user.experienceYears
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        targetSalary: user.targetSalary,
        resumeSkills: user.resumeSkills,
        resumeText: user.resumeText,
        location: user.location,
        experienceYears: user.experienceYears,
        followUpDefaultDays: user.followUpDefaultDays
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, targetRole, targetSalary, resumeSkills, resumeText, location, experienceYears, followUpDefaultDays } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (targetRole) user.targetRole = targetRole;
    if (targetSalary !== undefined) user.targetSalary = targetSalary;
    if (location) user.location = location;
    if (experienceYears !== undefined) user.experienceYears = experienceYears;
    if (followUpDefaultDays !== undefined) user.followUpDefaultDays = followUpDefaultDays;
    
    if (resumeText !== undefined) {
      user.resumeText = resumeText;
    }

    if (resumeSkills) {
      user.resumeSkills = Array.isArray(resumeSkills) 
        ? resumeSkills 
        : resumeSkills.split(',').map(s => s.trim()).filter(Boolean);
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile.', error: error.message });
  }
});

module.exports = router;
