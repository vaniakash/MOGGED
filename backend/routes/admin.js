const express   = require('express');
const jwt       = require('jsonwebtoken');
const User      = require('../models/User');
const Match     = require('../models/Match');
const AppStats  = require('../models/AppStats');
const PageView  = require('../models/PageView');
const Subscription = require('../models/Subscription');

const router = express.Router();

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'fallback_secret';

// ── Auth Middleware ────────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(auth.slice(7), ADMIN_JWT_SECRET);
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [totalUsers, totalMatches, googleUsers, appStats, activeSubs] = await Promise.all([
      User.countDocuments(),
      Match.countDocuments(),
      User.countDocuments({ provider: 'google' }),
      AppStats.get(),
      User.countDocuments({ 'subscription.status': 'active' }),
    ]);

    res.json({
      totalUsers,
      totalMatches,
      googleUsers,
      activeSubs,
      activeQueue:  0,
      activeBattles: 0,
      activeChat:   0,
      arenaButtonPresses: appStats?.arenaButtonPresses || 0,
      battlesStarted:     appStats?.battlesStarted || 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/admin/analytics ─────────────────────────────────────────────────
// Query params: period = 'today' | 'week' | 'month' | 'all'
router.get('/analytics', requireAdmin, async (req, res) => {
  try {
    const now  = new Date();

    // ── Time boundaries ──────────────────────────────────────────────────────
    const startOfToday = new Date(now); startOfToday.setHours(0,0,0,0);
    const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - 6); startOfWeek.setHours(0,0,0,0);
    const startOfMonth = new Date(now); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
    const last1min     = new Date(now.getTime() - 60_000);
    const last5min     = new Date(now.getTime() - 5 * 60_000);
    const last1hr      = new Date(now.getTime() - 60 * 60_000);
    const last24hr     = new Date(now.getTime() - 24 * 60 * 60_000);
    const last7d       = new Date(now.getTime() - 7 * 24 * 60 * 60_000);
    const last30d      = new Date(now.getTime() - 30 * 24 * 60 * 60_000);

    // ── Active sessions (distinct sessionId in window) ───────────────────────
    const [
      active1min, active5min, active1hr, active24hr, active7d,
      todayViews, weekViews, monthViews, totalViews,
    ] = await Promise.all([
      PageView.distinct('sessionId', { ts: { $gte: last1min },  sessionId: { $ne: null } }).then(a => a.length),
      PageView.distinct('sessionId', { ts: { $gte: last5min },  sessionId: { $ne: null } }).then(a => a.length),
      PageView.distinct('sessionId', { ts: { $gte: last1hr },   sessionId: { $ne: null } }).then(a => a.length),
      PageView.distinct('sessionId', { ts: { $gte: last24hr },  sessionId: { $ne: null } }).then(a => a.length),
      PageView.distinct('sessionId', { ts: { $gte: last7d },    sessionId: { $ne: null } }).then(a => a.length),
      PageView.countDocuments({ ts: { $gte: startOfToday } }),
      PageView.countDocuments({ ts: { $gte: startOfWeek } }),
      PageView.countDocuments({ ts: { $gte: startOfMonth } }),
      PageView.countDocuments(),
    ]);

    // ── Hourly buckets for today (last 24 h, grouped by hour) ────────────────
    const hourlyRaw = await PageView.aggregate([
      { $match: { ts: { $gte: last24hr } } },
      {
        $group: {
          _id: {
            y: { $year: '$ts' },
            m: { $month: '$ts' },
            d: { $dayOfMonth: '$ts' },
            h: { $hour: '$ts' },
          },
          views: { $sum: 1 },
          uniq:  { $addToSet: '$sessionId' },
        }
      },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1, '_id.h': 1 } },
    ]);
    const hourly = hourlyRaw.map(b => ({
      label: `${String(b._id.h).padStart(2,'0')}:00`,
      views: b.views,
      users: b.uniq.filter(Boolean).length,
    }));

    // ── Daily buckets for last 30 days ────────────────────────────────────────
    const dailyRaw = await PageView.aggregate([
      { $match: { ts: { $gte: last30d } } },
      {
        $group: {
          _id: {
            y: { $year: '$ts' },
            m: { $month: '$ts' },
            d: { $dayOfMonth: '$ts' },
          },
          views: { $sum: 1 },
          uniq:  { $addToSet: '$sessionId' },
        }
      },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
    ]);
    const daily = dailyRaw.map(b => ({
      label: `${b._id.d}/${b._id.m}`,
      views: b.views,
      users: b.uniq.filter(Boolean).length,
    }));

    // ── Country breakdown (top 20, last 30 days) ─────────────────────────────
    const countryRaw = await PageView.aggregate([
      { $match: { ts: { $gte: last30d }, country: { $ne: 'Unknown' } } },
      { $group: { _id: '$country', name: { $first: '$countryName' }, views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 20 },
    ]);
    const countries = countryRaw.map(c => ({
      code: c._id,
      name: c.name || c._id,
      views: c.views,
    }));

    // ── Top pages (last 30 days) ──────────────────────────────────────────────
    const topPagesRaw = await PageView.aggregate([
      { $match: { ts: { $gte: last30d } } },
      { $group: { _id: '$path', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]);
    const topPages = topPagesRaw.map(p => ({ path: p._id, views: p.views }));

    res.json({
      pageViews: { today: todayViews, week: weekViews, month: monthViews, total: totalViews },
      active:    { last1min, last5min, last1hr, last24hr, last7d },
      hourly,
      daily,
      countries,
      topPages,
    });
  } catch (e) {
    console.error('[admin/analytics]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 25;
    const sort  = req.query.sort || '-createdAt';
    const q     = req.query.q   || '';

    const filter = q
      ? { $or: [
          { email: { $regex: q, $options: 'i' } },
          { displayName: { $regex: q, $options: 'i' } },
          { username: { $regex: q, $options: 'i' } },
        ]}
      : {};

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip((page-1)*limit).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, pages: Math.ceil(total/limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/admin/matches ────────────────────────────────────────────────────
router.get('/matches', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const matches = await Match.find().sort('-createdAt').limit(limit).lean();
    res.json({ matches });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/admin/tools ──────────────────────────────────────────────────────
router.get('/tools', requireAdmin, async (req, res) => {
  try {
    // Placeholder — extend as tools grow
    res.json({ faceScores: [], credits: [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/admin/user/:id/grant-sub ───────────────────────────────────────
router.post('/user/:id/grant-sub', requireAdmin, async (req, res) => {
  try {
    const { planId = 'premium', days = 30 } = req.body;
    const planNames = { beginner: 'Beginner Plan', premium: 'Premium Plan', pro: 'Pro Plan' };
    const startDate  = new Date();
    const expiryDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

    await User.findByIdAndUpdate(req.params.id, {
      $set: {
        'subscription.planId':    planId,
        'subscription.planName':  planNames[planId] || 'Admin Grant',
        'subscription.status':    'active',
        'subscription.startDate': startDate,
        'subscription.expiryDate': expiryDate,
        'subscription.paymentId': 'ADMIN_GRANT',
      }
    });
    res.json({ ok: true, expiryDate });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
