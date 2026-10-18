const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { checkFollowUpsAndReminders } = require('../services/cronService');

router.use(auth);

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('relatedApplication', 'company role status')
      .populate('relatedInterview', 'company role round scheduledAt');

    const unreadCount = await Notification.countDocuments({ user: req.userId, isRead: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error retrieving notifications', error: error.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
});

// POST /api/notifications/mark-all-read
router.post('/mark-all-read', async (req, res) => {
  try {
    await Notification.updateMany({ user: req.userId, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    res.status(500).json({ message: 'Error updating notifications', error: error.message });
  }
});

// POST /api/notifications/trigger-cron - Run scheduled reminder scanner manually on demand
router.post('/trigger-cron', async (req, res) => {
  try {
    const result = await checkFollowUpsAndReminders();
    res.json({ message: 'Cron scan executed successfully', result });
  } catch (error) {
    console.error('Error executing cron check:', error);
    res.status(500).json({ message: 'Error triggering scheduler', error: error.message });
  }
});

module.exports = router;
