const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/analytics/summary - High-level metrics & KPIs
router.get('/summary', async (req, res) => {
  try {
    const applications = await Application.find({ user: req.userId });
    const interviews = await Interview.find({ user: req.userId });

    const totalApps = applications.length;
    const activeApps = applications.filter(a => !['Rejected', 'Offer'].includes(a.status)).length;
    
    const countByStatus = {
      Wishlist: 0,
      Applied: 0,
      Screening: 0,
      Interviewing: 0,
      Offer: 0,
      Rejected: 0
    };

    applications.forEach(a => {
      if (countByStatus[a.status] !== undefined) {
        countByStatus[a.status]++;
      }
    });

    const nonWishlist = totalApps - countByStatus.Wishlist;
    const interviewCount = interviews.length;
    const offerCount = countByStatus.Offer;

    const interviewRate = nonWishlist > 0 
      ? Math.round(((countByStatus.Screening + countByStatus.Interviewing + countByStatus.Offer) / nonWishlist) * 100) 
      : 0;

    const offerRate = nonWishlist > 0 
      ? Math.round((offerCount / nonWishlist) * 100) 
      : 0;

    // Follow-ups pending
    const followUpsPending = applications.filter(a => 
      ['Applied', 'Screening'].includes(a.status) && a.followUpStatus === 'Pending'
    ).length;

    // Average match score
    const avgMatchScore = totalApps > 0 
      ? Math.round(applications.reduce((acc, curr) => acc + (curr.matchScore || 0), 0) / totalApps) 
      : 0;

    // By source breakdown
    const sourceMap = {};
    applications.forEach(a => {
      const src = a.source || 'Other';
      if (!sourceMap[src]) sourceMap[src] = { total: 0, interviews: 0, offers: 0 };
      sourceMap[src].total++;
      if (['Screening', 'Interviewing', 'Offer'].includes(a.status)) {
        sourceMap[src].interviews++;
      }
      if (a.status === 'Offer') {
        sourceMap[src].offers++;
      }
    });

    // Monthly trend (past 6 months)
    const monthlyMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short' });
      monthlyMap[key] = 0;
    }

    applications.forEach(a => {
      const d = new Date(a.applicationDate);
      const key = d.toLocaleString('default', { month: 'short' });
      if (monthlyMap[key] !== undefined) {
        monthlyMap[key]++;
      }
    });

    // Top missing skills across all jobs
    const missingSkillCounts = {};
    applications.forEach(a => {
      (a.missingSkills || []).forEach(sk => {
        missingSkillCounts[sk] = (missingSkillCounts[sk] || 0) + 1;
      });
    });

    const topMissingSkills = Object.entries(missingSkillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    res.json({
      kpis: {
        totalApplications: totalApps,
        activeApplications: activeApps,
        interviewCount,
        interviewRate,
        offerCount,
        offerRate,
        followUpsPending,
        avgMatchScore
      },
      statusDistribution: countByStatus,
      funnel: [
        { stage: 'Wishlist', count: countByStatus.Wishlist },
        { stage: 'Applied', count: countByStatus.Applied },
        { stage: 'Screening', count: countByStatus.Screening },
        { stage: 'Interviewing', count: countByStatus.Interviewing },
        { stage: 'Offer', count: countByStatus.Offer },
        { stage: 'Rejected', count: countByStatus.Rejected }
      ],
      sources: sourceMap,
      monthlyTrend: {
        labels: Object.keys(monthlyMap),
        data: Object.values(monthlyMap)
      },
      topMissingSkills
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error compiling analytics', error: error.message });
  }
});

module.exports = router;
