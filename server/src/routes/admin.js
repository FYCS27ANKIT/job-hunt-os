const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');

router.use(auth);

// Middleware: ensure user is Admin
const ensureAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
  next();
};

router.use(ensureAdmin);

// GET /api/admin/stats - System-wide administrative overview
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      employeesCount,
      employersCount,
      adminsCount,
      totalJobs,
      activeJobs,
      totalApplications,
      totalInterviews,
      totalOffers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'employee' }),
      User.countDocuments({ role: 'employer' }),
      User.countDocuments({ role: 'admin' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'Active' }),
      Application.countDocuments(),
      Interview.countDocuments(),
      Application.countDocuments({ status: 'Offer' })
    ]);

    const placementRate = totalApplications > 0
      ? Math.round((totalOffers / totalApplications) * 100)
      : 0;

    res.json({
      users: {
        total: totalUsers,
        employees: employeesCount,
        employers: employersCount,
        admins: adminsCount
      },
      jobs: {
        total: totalJobs,
        active: activeJobs
      },
      pipeline: {
        totalApplications,
        totalInterviews,
        totalOffers,
        placementRate
      },
      system: {
        mongoStatus: mongoose.connection.readyState === 1 ? 'Healthy' : 'Disconnected',
        nodeVersion: process.version,
        uptimeSeconds: Math.round(process.uptime()),
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Error retrieving system statistics', error: error.message });
  }
});

// GET /api/admin/users - List all users
router.get('/users', async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// PATCH /api/admin/users/:id/role - Change user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['employee', 'employer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();

    res.json({ message: `Role updated to ${role}`, user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role', error: error.message });
  }
});

// PATCH /api/admin/users/:id/status - Toggle user active / suspended
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = status || (user.status === 'Active' ? 'Suspended' : 'Active');
    await user.save();

    res.json({ message: `User status changed to ${user.status}`, user });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Failed to toggle status', error: error.message });
  }
});

// DELETE /api/admin/users/:id - Delete user account
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Clean up applications & jobs
    await Application.deleteMany({ user: user._id });
    await Job.deleteMany({ employer: user._id });
    await Interview.deleteMany({ user: user._id });

    res.json({ message: 'User and all related records deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

// GET /api/admin/jobs - List all jobs across platform
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('employer', 'name email companyName')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching admin jobs:', error);
    res.status(500).json({ message: 'Failed to retrieve jobs', error: error.message });
  }
});

// PATCH /api/admin/jobs/:id/feature - Toggle featured flag
router.patch('/jobs/:id/feature', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    job.featured = !job.featured;
    await job.save();

    res.json({ message: `Job ${job.featured ? 'featured' : 'unfeatured'}`, job });
  } catch (error) {
    console.error('Error featuring job:', error);
    res.status(500).json({ message: 'Failed to feature job', error: error.message });
  }
});

// DELETE /api/admin/jobs/:id - Moderate/remove job
router.delete('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.json({ message: 'Job removed by administrator' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Failed to remove job', error: error.message });
  }
});

// POST /api/admin/broadcast - Send platform notification to all users
router.post('/broadcast', async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const allUsers = await User.find({ status: 'Active' });
    const notifications = allUsers.map(u => ({
      user: u._id,
      type: 'SYSTEM',
      title,
      message,
      actionUrl: '/kanban'
    }));

    await Notification.insertMany(notifications);
    res.json({ message: `Broadcast sent to ${allUsers.length} users successfully.` });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ message: 'Failed to broadcast alert', error: error.message });
  }
});

module.exports = router;
