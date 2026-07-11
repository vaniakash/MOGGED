const express = require('express');
const Streak  = require('../models/Streak');

const router = express.Router();

const BADGE_MILESTONES = [3, 7, 14, 30, 60, 100];

// POST /api/streak/checkin
router.post('/checkin', async (req, res) => {
  const sessionId = req.body.sessionId || req.headers['x-session-id'];
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

  const today = new Date().toDateString();
  let streak = await Streak.findOne({ sessionId });

  if (!streak) {
    streak = await Streak.create({ sessionId, count: 1, lastCheckin: new Date(), badges: [] });
    return res.json({ streak, newBadge: null, message: '🔥 Streak started!' });
  }

  const lastDay = streak.lastCheckin ? new Date(streak.lastCheckin).toDateString() : null;
  if (lastDay === today) {
    return res.json({ streak, newBadge: null, message: 'Already checked in today!' });
  }

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const newCount  = lastDay === yesterday ? streak.count + 1 : 1;
  const badges    = [...streak.badges];
  let newBadge    = null;

  for (const milestone of BADGE_MILESTONES) {
    if (newCount === milestone && !badges.includes(`${milestone}-day-streak`)) {
      badges.push(`${milestone}-day-streak`);
      newBadge = `${milestone}-day-streak`;
    }
  }

  streak = await Streak.findOneAndUpdate(
    { sessionId },
    { count: newCount, lastCheckin: new Date(), badges, updatedAt: new Date() },
    { new: true }
  );

  const message = newCount > 1 ? `🔥 ${newCount}-day streak!` : '🔥 Streak started!';
  return res.json({ streak, newBadge, message });
});

// GET /api/streak/:sessionId
router.get('/:sessionId', async (req, res) => {
  const streak = await Streak.findOne({ sessionId: req.params.sessionId });
  if (!streak) return res.json({ count: 0, badges: [], lastCheckin: null });
  return res.json(streak);
});

module.exports = router;
