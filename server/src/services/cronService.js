const cron = require('node-cron');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Scan applications and interviews to generate follow-up and preparation notifications
 */
async function checkFollowUpsAndReminders() {
  console.log('[Scheduler] Running automated check for follow-up reminders and upcoming interviews...');
  let notificationsCreated = 0;

  try {
    const users = await User.find();

    for (const user of users) {
      const followUpDaysThreshold = user.followUpDefaultDays || 5;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - followUpDaysThreshold);

      // 1. Check Applications that need follow-up
      const staleApplications = await Application.find({
        user: user._id,
        status: { $in: ['Applied', 'Screening'] },
        followUpStatus: 'Pending',
        lastContactDate: { $lte: cutoffDate }
      });

      for (const app of staleApplications) {
        // Check if an unread notification already exists
        const existingNotif = await Notification.findOne({
          user: user._id,
          relatedApplication: app._id,
          type: 'FOLLOW_UP_DUE',
          isRead: false
        });

        if (!existingNotif) {
          const daysSinceContact = Math.floor((new Date() - new Date(app.lastContactDate)) / (1000 * 60 * 60 * 24));
          await Notification.create({
            user: user._id,
            type: 'FOLLOW_UP_DUE',
            title: `Follow-up Due: ${app.company}`,
            message: `It has been ${daysSinceContact} days since your last activity with ${app.company} for the ${app.role} role. Reach out to maintain momentum!`,
            relatedApplication: app._id,
            actionUrl: `/applications/${app._id}`,
            dueDate: new Date()
          });
          notificationsCreated++;
        }
      }

      // 2. Check Upcoming Interviews within the next 48 hours
      const now = new Date();
      const in48Hours = new Date();
      in48Hours.setHours(in48Hours.getHours() + 48);

      const upcomingInterviews = await Interview.find({
        user: user._id,
        status: 'Scheduled',
        scheduledAt: { $gte: now, $lte: in48Hours }
      });

      for (const interview of upcomingInterviews) {
        const existingNotif = await Notification.findOne({
          user: user._id,
          relatedInterview: interview._id,
          type: 'UPCOMING_INTERVIEW',
          isRead: false
        });

        if (!existingNotif) {
          const hoursLeft = Math.round((new Date(interview.scheduledAt) - now) / (1000 * 60 * 60));
          await Notification.create({
            user: user._id,
            type: 'UPCOMING_INTERVIEW',
            title: `Interview in ${hoursLeft}h: ${interview.company}`,
            message: `Your ${interview.round} interview with ${interview.company} is scheduled for ${new Date(interview.scheduledAt).toLocaleString()}. Review your question notes and preparation checklist.`,
            relatedInterview: interview._id,
            actionUrl: `/interviews`,
            dueDate: interview.scheduledAt
          });
          notificationsCreated++;
        }
      }
    }

    console.log(`[Scheduler] Check complete. Created ${notificationsCreated} new alerts.`);
    return { success: true, notificationsCreated };
  } catch (error) {
    console.error('[Scheduler] Error during scheduled scan:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Initialize node-cron schedule
 */
function initScheduler() {
  // Run every morning at 09:00 AM server time
  cron.schedule('0 9 * * *', () => {
    checkFollowUpsAndReminders();
  });

  // Also run every 30 minutes in background to catch time-sensitive interviews
  cron.schedule('*/30 * * * *', () => {
    checkFollowUpsAndReminders();
  });

  console.log('[Scheduler] Cron jobs registered: Daily 9:00 AM check + 30-min interview monitor');
}

module.exports = {
  initScheduler,
  checkFollowUpsAndReminders
};
