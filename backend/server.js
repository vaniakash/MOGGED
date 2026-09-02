require('dotenv').config();
const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const cors     = require('cors');
const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { calculateElo } = require('./utils/elo');
const User      = require('./models/User');
const Match     = require('./models/Match');
const AppStats  = require('./models/AppStats');

const app    = express();
const server = http.createServer(app);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'fallback_secret';
const ADMIN_EMAIL      = process.env.ADMIN_EMAIL || 'akashrana49927@gmail.com';
const ADMIN_PASSWORD   = process.env.ADMIN_PASSWORD || 'aku79020';
const googleClient     = new OAuth2Client(GOOGLE_CLIENT_ID);

// Dynamic CORS — accepts any Vercel preview/prod URL + localhost + ngrok
function isAllowedOrigin(origin) {
  if (!origin) return true; // server-to-server
  if (origin === 'http://localhost:3000') return true;
  if (origin === 'http://10.202.98.220:3000') return true;
  if (origin.endsWith('.vercel.app')) return true;
  if (origin.includes('ngrok-free.app')) return true;
  if (origin.includes('onrender.com')) return true;
  if (origin.includes('omogl.com')) return true;
  if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return true;
  return false;
}

const corsOptions = {
  origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
  credentials: true,
};

const io = new Server(server, {
  cors: { ...corsOptions, methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.text({ type: 'text/plain' })); // needed for navigator.sendBeacon

// ── MongoDB ────────────────────────────────────────────────────────────────
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(e  => console.warn('⚠️  MongoDB failed:', e.message));
} else {
  console.warn('⚠️  No MONGODB_URI – running without persistence');
}

// ── Admin JWT middleware ───────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(auth.slice(7), ADMIN_JWT_SECRET);
    if (!payload.admin) return res.status(403).json({ error: 'Forbidden' });
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── In-memory state ────────────────────────────────────────────────────────
const waitingQueue    = [];
const chatWaitingQueue = [];
const rooms           = new Map();
const chatRooms       = new Map();
const socketToRoom    = new Map();
const socketToChatRoom = new Map();
const socketToSession = new Map();
const roomTimers      = new Map();
const privateRooms    = new Map();
const globalChatHistory = [];

const COUNTDOWN_SECS = 10;

// ── REST ───────────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));

// ── Google OAuth — verify ID token and upsert user ─────────────────────────
app.post('/api/auth/google', async (req, res) => {
  const { idToken, sessionId: existingSessionId } = req.body;
  if (!idToken) return res.status(400).json({ error: 'Missing idToken' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name: displayName, picture: photoURL } = payload;

    // Check if this Google account already has a user
    let user = await User.findOne({ googleId });

    if (user) {
      // Merge: if there's an existing anonymous session with history, carry it over
      if (existingSessionId && existingSessionId !== user.sessionId) {
        const anonUser = await User.findOne({ sessionId: existingSessionId });
        if (anonUser && anonUser.matches > 0 && anonUser.provider === 'anonymous') {
          // Merge ELO/stats from anon session
          user.elo     = Math.max(user.elo, anonUser.elo);
          user.matches += anonUser.matches;
          user.wins    += anonUser.wins;
          user.losses  += anonUser.losses;
          await User.deleteOne({ sessionId: existingSessionId });
        }
      }
      user.displayName = displayName;
      user.photoURL    = photoURL;
      user.lastSeen    = new Date();
      await user.save();
    } else {
      // New Google user — try to inherit existing anonymous session
      const sessionId = existingSessionId || uuidv4();
      const anonUser  = await User.findOne({ sessionId });

      if (anonUser && anonUser.provider === 'anonymous') {
        // Upgrade anonymous user to Google account
        anonUser.googleId    = googleId;
        anonUser.email       = email;
        anonUser.displayName = displayName;
        anonUser.photoURL    = photoURL;
        anonUser.provider    = 'google';
        anonUser.lastSeen    = new Date();
        await anonUser.save();
        user = anonUser;
      } else {
        // Completely new user
        const newSessionId = uuidv4();
        user = await User.create({
          sessionId: newSessionId,
          googleId, email, displayName, photoURL,
          provider: 'google',
        });
      }
    }

    return res.json({
      sessionId:       user.sessionId,
      user: {
        googleId:        user.googleId,
        email:           user.email,
        displayName:     user.displayName,
        photoURL:        user.photoURL,
        elo:             user.elo,
        wins:            user.wins,
        losses:          user.losses,
        matches:         user.matches,
        profileComplete: user.profileComplete || false,
        username:        user.username || '',
        nationality:     user.nationality || '',
        age:             user.age || null,
        gender:          user.gender || '',
        subscription: {
          status:     user.subscription?.status || 'none',
          planId:     user.subscription?.planId || null,
          planName:   user.subscription?.planName || null,
          expiryDate: user.subscription?.expiryDate || null,
          startDate:  user.subscription?.startDate || null,
        },
        hasActiveSub: user.subscription?.status === 'active' &&
          user.subscription?.expiryDate &&
          new Date(user.subscription.expiryDate) > new Date(),
      },
    });
  } catch (err) {
    console.error('Google auth error:', err.message);
    return res.status(401).json({ error: 'Invalid Google token' });
  }
});

// ── Profile Completion ────────────────────────────────────────────────────
app.put('/api/profile', async (req, res) => {
  const { sessionId, username, nationality, age, gender } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

  try {
    const user = await User.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          username:        (username || '').trim().slice(0, 32),
          nationality:     (nationality || '').trim().slice(0, 60),
          age:             age ? Math.max(13, Math.min(120, parseInt(age))) : null,
          gender:          gender || null,
          profileComplete: true,
          lastSeen:        new Date(),
        },
      },
      { new: true }
    ).select('sessionId username nationality age gender profileComplete elo wins losses displayName photoURL');

    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ── Get current user by sessionId ─────────────────────────────────────────
app.get('/api/me', async (req, res) => {
  const sessionId = req.query.sessionId || req.headers['x-session-id'];
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });
  try {
    const user = await User.findOne({ sessionId })
      .select('sessionId googleId email displayName photoURL elo wins losses matches profileComplete username nationality age gender provider subscription');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Auto-expire subscription if past expiry date
    const sub = user.subscription || {};
    if (sub.status === 'active' && sub.expiryDate && new Date(sub.expiryDate) <= new Date()) {
      await User.findOneAndUpdate({ sessionId }, { $set: { 'subscription.status': 'expired' } });
      sub.status = 'expired';
    }

    const hasActiveSub = sub.status === 'active' && sub.expiryDate && new Date(sub.expiryDate) > new Date();

    return res.json({
      sessionId: user.sessionId,
      user: {
        googleId:        user.googleId,
        email:           user.email,
        displayName:     user.displayName,
        photoURL:        user.photoURL,
        elo:             user.elo,
        wins:            user.wins,
        losses:          user.losses,
        matches:         user.matches,
        profileComplete: user.profileComplete || false,
        username:        user.username || '',
        nationality:     user.nationality || '',
        age:             user.age || null,
        gender:          user.gender || '',
        subscription: {
          status:     sub.status || 'none',
          planId:     sub.planId || null,
          planName:   sub.planName || null,
          expiryDate: sub.expiryDate || null,
          startDate:  sub.startDate || null,
        },
        hasActiveSub,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ── Solo Tools (Pollinations AI) ───────────────────────────────────────────
const faceScoreRoute     = require('./routes/faceScore').router;
const celebrityMatchRoute = require('./routes/celebrityMatch');
const asyncDuelRoute      = require('./routes/asyncDuel');
const glowUpRoute         = require('./routes/glowUp');
const streakRoute         = require('./routes/streak');
const authEmailRoute      = require('./routes/authEmail');
const paymentRoute        = require('./routes/payment');
const { startCron }       = require('./cron/dailyReset');

app.use('/api/face-score', faceScoreRoute);
app.use('/api/celebrity-match', celebrityMatchRoute);
app.use('/api/duel/async', asyncDuelRoute);
app.use('/api/glow-up', glowUpRoute);
app.use('/api/streak', streakRoute);
app.use('/api/auth/email', authEmailRoute);
app.use('/api/payment', paymentRoute);

// Start cron for daily streak resets
startCron();

// ── Arena Press Tracker ────────────────────────────────────────────────────
// Frontend calls this when user clicks ⚔️ Enter The Arena
app.post('/api/arena/press', async (req, res) => {
  try {
    const stats = await AppStats.inc({ arenaButtonPresses: 1 });
    res.json({ ok: true, total: stats.arenaButtonPresses });
  } catch (e) {
    res.json({ ok: true }); // non-fatal
  }
});

// ── Admin Login ───────────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ admin: true, email }, ADMIN_JWT_SECRET, { expiresIn: '24h' });
  return res.json({ token });
});

// ── Admin Stats ────────────────────────────────────────────────────────────
app.get('/api/admin/stats', requireAdmin, async (_, res) => {
  try {
    const [totalUsers, totalMatches, googleUsers, appStats] = await Promise.all([
      User.countDocuments(),
      Match.countDocuments(),
      User.countDocuments({ provider: 'google' }),
      AppStats.get(),
    ]);
    const activeQueue        = waitingQueue.length;
    const activeBattles      = rooms.size;
    const activeChat         = chatRooms.size;
    const arenaButtonPresses = appStats?.arenaButtonPresses ?? 0;
    const battlesStarted     = appStats?.battlesStarted ?? 0;
    res.json({
      totalUsers, totalMatches, googleUsers,
      activeQueue, activeBattles, activeChat,
      arenaButtonPresses, battlesStarted,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin Users List ───────────────────────────────────────────────────────
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);
    const skip  = (page - 1) * limit;
    const sort  = req.query.sort || '-createdAt'; // default newest first

    const [users, total] = await Promise.all([
      User.find()
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('sessionId displayName email provider elo wins losses matches createdAt lastSeen photoURL username nationality age gender profileComplete'),
      User.countDocuments(),
    ]);

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin Matches List ─────────────────────────────────────────────────────
app.get('/api/admin/matches', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const matches = await Match.find().sort('-createdAt').limit(limit).lean();
    res.json({ matches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: Arena Stats ─────────────────────────────────────────────────────
app.get('/api/admin/arena-stats', requireAdmin, (req, res) => {
  res.json({ arenaButtonPresses, battlesStarted });
});

// Admin Tools endpoint
const FaceScore = require('./models/FaceScore');
const Credit    = require('./models/Credit');
const PageView  = require('./models/PageView');

app.get('/api/admin/tools', requireAdmin, async (req, res) => {
  try {
    const [faceScores, credits] = await Promise.all([
      FaceScore.find().sort('-createdAt').limit(50).lean(),
      Credit.find().sort('-updatedAt').limit(50).lean(),
    ]);
    res.json({ faceScores, credits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin Analytics ────────────────────────────────────────────────────────
app.get('/api/admin/analytics', requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now); startOfToday.setHours(0,0,0,0);
    const last1min  = new Date(now.getTime() - 60_000);
    const last5min  = new Date(now.getTime() - 5 * 60_000);
    const last1hr   = new Date(now.getTime() - 60 * 60_000);
    const last24hr  = new Date(now.getTime() - 24 * 60 * 60_000);
    const last7d    = new Date(now.getTime() - 7 * 24 * 60 * 60_000);
    const last30d   = new Date(now.getTime() - 30 * 24 * 60 * 60_000);

    const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - 6); startOfWeek.setHours(0,0,0,0);
    const startOfMonth = new Date(now); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);

    const [
      active1min, active5min, active1hr, active24hr, active7d,
      todayViews, weekViews, monthViews, totalViews,
      pricingToday, pricingWeek, pricingMonth, pricingTotal,
      hourlyRaw, dailyRaw, countryRaw, topPagesRaw, planClicksRaw,
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
      // /pricing page visits
      PageView.countDocuments({ path: '/pricing', ts: { $gte: startOfToday } }),
      PageView.countDocuments({ path: '/pricing', ts: { $gte: startOfWeek } }),
      PageView.countDocuments({ path: '/pricing', ts: { $gte: startOfMonth } }),
      PageView.countDocuments({ path: '/pricing' }),
      // Hourly chart: last 24 h
      PageView.aggregate([
        { $match: { ts: { $gte: last24hr } } },
        { $group: { _id: { y: { $year: '$ts' }, m: { $month: '$ts' }, d: { $dayOfMonth: '$ts' }, h: { $hour: '$ts' } }, views: { $sum: 1 }, uniq: { $addToSet: '$sessionId' } } },
        { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1, '_id.h': 1 } },
      ]),
      // Daily chart: last 30 days
      PageView.aggregate([
        { $match: { ts: { $gte: last30d } } },
        { $group: { _id: { y: { $year: '$ts' }, m: { $month: '$ts' }, d: { $dayOfMonth: '$ts' } }, views: { $sum: 1 }, uniq: { $addToSet: '$sessionId' } } },
        { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
      ]),
      // Country breakdown
      PageView.aggregate([
        { $match: { ts: { $gte: last30d }, country: { $ne: 'Unknown' } } },
        { $group: { _id: '$country', name: { $first: '$countryName' }, views: { $sum: 1 } } },
        { $sort: { views: -1 } }, { $limit: 20 },
      ]),
      // Top pages (exclude plan click events)
      PageView.aggregate([
        { $match: { ts: { $gte: last30d }, path: { $not: /^\/pricing\/click\// } } },
        { $group: { _id: '$path', views: { $sum: 1 } } },
        { $sort: { views: -1 } }, { $limit: 10 },
      ]),
      // Plan click counts (all time)
      PageView.aggregate([
        { $match: { path: { $regex: '^/pricing/click/' } } },
        { $group: { _id: '$path', clicks: { $sum: 1 }, uniq: { $addToSet: '$sessionId' } } },
        { $sort: { clicks: -1 } },
      ]),
    ]);

    // Build plan clicks map: { beginner: {clicks, uniq}, premium: ..., pro: ... }
    const planClickMap = { beginner: { clicks: 0, uniq: 0 }, premium: { clicks: 0, uniq: 0 }, pro: { clicks: 0, uniq: 0 } };
    planClicksRaw.forEach(r => {
      const planId = r._id.replace('/pricing/click/', '');
      if (planClickMap[planId] !== undefined) {
        planClickMap[planId] = { clicks: r.clicks, uniq: (r.uniq || []).filter(Boolean).length };
      }
    });

    res.json({
      pageViews: { today: todayViews, week: weekViews, month: monthViews, total: totalViews },
      pricingPageViews: { today: pricingToday, week: pricingWeek, month: pricingMonth, total: pricingTotal },
      active:    { last1min: active1min, last5min: active5min, last1hr: active1hr, last24hr: active24hr, last7d: active7d },
      hourly:    hourlyRaw.map(b => ({ label: `${String(b._id.h).padStart(2,'0')}:00`, views: b.views, users: (b.uniq||[]).filter(Boolean).length })),
      daily:     dailyRaw.map(b => ({ label: `${b._id.d}/${b._id.m}`, views: b.views, users: (b.uniq||[]).filter(Boolean).length })),
      countries: countryRaw.map(c => ({ code: c._id, name: c.name || c._id, views: c.views })),
      topPages:  topPagesRaw.map(p => ({ path: p._id, views: p.views })),
      planClicks: planClickMap,
    });
  } catch (e) {
    console.error('[admin/analytics]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Page View Tracking ─────────────────────────────────────────────────────
const COUNTRY_NAMES = {
  IN:'India',US:'United States',GB:'United Kingdom',DE:'Germany',FR:'France',
  AU:'Australia',CA:'Canada',SG:'Singapore',JP:'Japan',BR:'Brazil',NG:'Nigeria',
  PK:'Pakistan',BD:'Bangladesh',NP:'Nepal',PH:'Philippines',ID:'Indonesia',
  MY:'Malaysia',TH:'Thailand',AE:'UAE',SA:'Saudi Arabia',EG:'Egypt',KE:'Kenya',
  ZA:'South Africa',RU:'Russia',CN:'China',KR:'South Korea',TR:'Turkey',
  IT:'Italy',ES:'Spain',MX:'Mexico',AR:'Argentina',CO:'Colombia',VN:'Vietnam',
  UA:'Ukraine',PL:'Poland',NL:'Netherlands',SE:'Sweden',NO:'Norway',
};

app.post('/api/track/pageview', async (req, res) => {
  try {
    const { path, sessionId } = req.body;
    if (!path || path.startsWith('/api') || path.startsWith('/_next')) return res.json({ ok: true });
    const countryCode = (req.headers['cf-ipcountry'] || req.headers['x-country'] || 'Unknown').toUpperCase().slice(0,2);
    const countryName = COUNTRY_NAMES[countryCode] || countryCode;
    const ip = req.headers['cf-connecting-ip'] || (req.headers['x-forwarded-for']||'').split(',')[0] || req.ip;
    await PageView.create({
      path,
      sessionId: sessionId || null,
      country:     countryCode !== 'XX' && countryCode !== 'Un' ? countryCode : 'Unknown',
      countryName: countryCode !== 'XX' && countryCode !== 'Un' ? countryName : 'Unknown',
      ip,
      ua: (req.headers['user-agent'] || '').slice(0, 200),
    });
    return res.json({ ok: true });
  } catch (e) {
    return res.json({ ok: false });
  }
});

// ── Plan click tracking ─────────────────────────────────────────────────────
// Called when a user clicks a pricing plan button.
// Uses sendBeacon (text/plain) so it survives page navigation.
app.post('/api/track/plan-click', async (req, res) => {
  try {
    // sendBeacon sends body as text/plain — parse it if needed
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    const { planId, sessionId } = body || {};
    if (!planId) return res.json({ ok: false, reason: 'no planId' });

    const countryCode = (req.headers['cf-ipcountry'] || req.headers['x-country'] || 'Unknown').toUpperCase().slice(0,2);
    const ip = req.headers['cf-connecting-ip'] || (req.headers['x-forwarded-for']||'').split(',')[0] || req.ip;

    await PageView.create({
      path: `/pricing/click/${planId}`,
      sessionId: sessionId || null,
      country:     countryCode !== 'XX' && countryCode !== 'Un' ? countryCode : 'Unknown',
      countryName: COUNTRY_NAMES[countryCode] || countryCode,
      ip,
      ua: (req.headers['user-agent'] || '').slice(0, 200),
    });
    console.log(`[track/plan-click] ✅ planId=${planId} sessionId=${String(sessionId||'').slice(0,8)}`);
    return res.json({ ok: true });
  } catch (e) {
    console.error('[track/plan-click] ❌', e.message);
    return res.json({ ok: false, error: e.message });
  }
});

// GET /api/track/debug-clicks — shows all stored plan clicks (dev tool)
app.get('/api/track/debug-clicks', async (req, res) => {
  try {
    const clicks = await PageView.find(
      { path: { $regex: '^/pricing/click/' } },
      { path: 1, sessionId: 1, ts: 1, _id: 0 }
    ).sort({ ts: -1 }).limit(50);
    return res.json({ total: clicks.length, clicks });
  } catch (e) {
    return res.json({ error: e.message });
  }
});


// ── Leaderboard ────────────────────────────────────────────────────────────
app.get('/api/leaderboard', async (_, res) => {
  try {
    const leaders = await User.find().sort({ elo: -1 }).limit(20)
      .select('sessionId username displayName photoURL elo wins losses matches provider');
    res.json(leaders);
  } catch { res.json([]); }
});

app.post('/api/session', async (_, res) => {
  const sessionId = uuidv4();
  try {
    const user = await User.create({ sessionId });
    res.json({ sessionId, elo: user.elo });
  } catch { res.json({ sessionId, elo: 1000 }); }
});

// ── Helpers ────────────────────────────────────────────────────────────────
function removeFromQueue(socketId) {
  const idx = waitingQueue.findIndex(u => u.socketId === socketId);
  if (idx !== -1) waitingQueue.splice(idx, 1);
}

function removeFromChatQueue(socketId) {
  const idx = chatWaitingQueue.findIndex(u => u.socketId === socketId);
  if (idx !== -1) chatWaitingQueue.splice(idx, 1);
}

function clearRoomTimer(roomId) {
  if (roomTimers.has(roomId)) {
    clearTimeout(roomTimers.get(roomId));
    roomTimers.delete(roomId);
  }
}

function createRoom(userA, userB) {
  const roomId = uuidv4();
  rooms.set(roomId, {
    userA:     { socketId: userA.socketId, sessionId: userA.sessionId },
    userB:     { socketId: userB.socketId, sessionId: userB.sessionId },
    scoreA:    null,
    scoreB:    null,
    readyA:    false,
    readyB:    false,
    countdown: false,
    startTime: null,
  });
  socketToRoom.set(userA.socketId, roomId);
  socketToRoom.set(userB.socketId, roomId);
  AppStats.inc({ battlesStarted: 1 }).catch(() => {});
  return roomId;
}

function tryMatch() {
  while (waitingQueue.length >= 2) {
    const userA = waitingQueue.shift();
    const userB = waitingQueue.shift();
    if (!io.sockets.sockets.get(userA.socketId)) { waitingQueue.unshift(userB); continue; }
    if (!io.sockets.sockets.get(userB.socketId)) { waitingQueue.unshift(userA); continue; }

    const roomId  = createRoom(userA, userB);
    const socketA = io.sockets.sockets.get(userA.socketId);
    const socketB = io.sockets.sockets.get(userB.socketId);
    socketA.join(roomId);
    socketB.join(roomId);
    socketA.emit('matched', { roomId, role: 'initiator' });
    socketB.emit('matched', { roomId, role: 'receiver'  });
    console.log(`🎭 Matched: ${userA.socketId} ↔ ${userB.socketId} in room ${roomId}`);
  }
}

function tryChatMatch() {
  while (chatWaitingQueue.length >= 2) {
    const userA = chatWaitingQueue.shift();
    const userB = chatWaitingQueue.shift();
    if (!io.sockets.sockets.get(userA.socketId)) { chatWaitingQueue.unshift(userB); continue; }
    if (!io.sockets.sockets.get(userB.socketId)) { chatWaitingQueue.unshift(userA); continue; }

    const roomId = uuidv4();
    chatRooms.set(roomId, {
      userA: { socketId: userA.socketId, sessionId: userA.sessionId },
      userB: { socketId: userB.socketId, sessionId: userB.sessionId }
    });
    socketToChatRoom.set(userA.socketId, roomId);
    socketToChatRoom.set(userB.socketId, roomId);

    const socketA = io.sockets.sockets.get(userA.socketId);
    const socketB = io.sockets.sockets.get(userB.socketId);
    socketA.join(roomId);
    socketB.join(roomId);

    socketA.emit('chat_matched', { roomId, role: 'initiator' });
    socketB.emit('chat_matched', { roomId, role: 'receiver' });
    console.log(`💬 Chat Matched: ${userA.socketId} ↔ ${userB.socketId} in room ${roomId}`);
  }
}

// ── SERVER-SYNCED COUNTDOWN ────────────────────────────────────────────────
function startCountdown(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.countdown) return;
  room.countdown = true;
  room.startTime = Date.now();

  console.log(`⏱  Countdown started for room ${roomId}`);

  io.to(roomId).emit('countdown_start', {
    serverTime:    room.startTime,
    durationMs:    COUNTDOWN_SECS * 1000,
  });

  const t = setTimeout(async () => {
    const r = rooms.get(roomId);
    if (!r) return;

    io.to(roomId).emit('submit_now');
    console.log(`📢 submit_now sent to room ${roomId}`);

    const forceTimer = setTimeout(async () => {
      const r2 = rooms.get(roomId);
      if (!r2 || (r2.scoreA && r2.scoreB)) return;
      console.log(`⚠️  Forcing result for room ${roomId} (timeout fallback)`);
      await resolveMatch(roomId);
    }, 3000);
    roomTimers.set(`${roomId}_force`, forceTimer);

  }, COUNTDOWN_SECS * 1000);

  roomTimers.set(roomId, t);
}

// ── RESOLVE MATCH ──────────────────────────────────────────────────────────
async function resolveMatch(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  if (!room.scoreA) room.scoreA = { score: { total: 5.0, symmetry: 0.5, jawScore: 0.5, eyeScore: 0.5, harmony: 0.5 }, traits: ['🤷 No Score'] };
  if (!room.scoreB) room.scoreB = { score: { total: 5.0, symmetry: 0.5, jawScore: 0.5, eyeScore: 0.5, harmony: 0.5 }, traits: ['🤷 No Score'] };

  const totalA = typeof room.scoreA.score === 'object' ? room.scoreA.score.total : room.scoreA.score;
  const totalB = typeof room.scoreB.score === 'object' ? room.scoreB.score.total : room.scoreB.score;
  const winner = totalA >= totalB ? 'A' : 'B';

  let eloResult = null;
  try {
    // Always record the match, regardless of whether users are in DB
    const userADoc = await User.findOne({ sessionId: room.userA.sessionId });
    const userBDoc = await User.findOne({ sessionId: room.userB.sessionId });

    let eloA = 1000, eloB = 1000, changeA = 0, changeB = 0;
    if (userADoc && userBDoc) {
      const elo = calculateElo(userADoc.elo, userBDoc.elo, winner);
      eloResult = elo;
      eloA = userADoc.elo; eloB = userBDoc.elo;
      changeA = elo.changeA; changeB = elo.changeB;
      await User.updateOne({ sessionId: room.userA.sessionId }, {
        $inc: { matches: 1, wins: winner === 'A' ? 1 : 0, losses: winner === 'B' ? 1 : 0 },
        $set: { elo: elo.newRatingA, lastSeen: new Date() },
      });
      await User.updateOne({ sessionId: room.userB.sessionId }, {
        $inc: { matches: 1, wins: winner === 'B' ? 1 : 0, losses: winner === 'A' ? 1 : 0 },
        $set: { elo: elo.newRatingB, lastSeen: new Date() },
      });
    }

    // Always save the match record
    await Match.create({
      userA: room.userA.sessionId, userB: room.userB.sessionId,
      scoreA: totalA, scoreB: totalB,
      eloA, eloB,
      eloChangeA: changeA, eloChangeB: changeB,
      winner, roomId,
    });
  } catch (e) { console.warn('DB error (non-fatal):', e.message); }

  io.to(roomId).emit('match_result', {
    scoreA:        room.scoreA,
    scoreB:        room.scoreB,
    winner,
    eloResult,
    winnerSocketId: winner === 'A' ? room.userA.socketId : room.userB.socketId,
  });

  console.log(`🏆 Result: ${winner} wins (${totalA} vs ${totalB}) in room ${roomId}`);
  clearRoomTimer(roomId);
  clearRoomTimer(`${roomId}_force`);
}

// ── SOCKET.IO ──────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Connected: ${socket.id}`);

  // Send current global chat history to the new user
  socket.emit('global_chat_history', globalChatHistory);

  // ── GLOBAL CHAT ─────────────────────────────────────────────────────────
  socket.on('send_global_chat', (data) => {
    // data: { user: string, text: string }
    const msg = {
      id: uuidv4(),
      user: (data.user || 'Anonymous').slice(0, 32),
      text: (data.text || '').slice(0, 200),
      timestamp: Date.now()
    };
    
    globalChatHistory.push(msg);
    if (globalChatHistory.length > 50) {
      globalChatHistory.shift();
    }
    
    io.emit('receive_global_chat', msg);
  });

  // ── PRIVATE ROOM — Create ───────────────────────────────────────────────
  socket.on('create_private_room', ({ sessionId }) => {
    for (const [code, data] of privateRooms.entries()) {
      if (data.socketId === socket.id) privateRooms.delete(code);
    }
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const sid  = sessionId || socketToSession.get(socket.id) || uuidv4();
    socketToSession.set(socket.id, sid);
    privateRooms.set(code, { socketId: socket.id, sessionId: sid });
    socket.emit('private_room_created', { code });
    console.log(`🔒 Private room created: ${code} by ${socket.id}`);
  });

  // ── PRIVATE ROOM — Join ─────────────────────────────────────────────────
  socket.on('join_private_room', ({ code, sessionId }) => {
    const entry = privateRooms.get(code.toUpperCase());
    if (!entry) {
      socket.emit('private_room_error', { message: 'Room not found. Check the code and try again.' });
      return;
    }
    if (entry.socketId === socket.id) {
      socket.emit('private_room_error', { message: 'You cannot join your own room!' });
      return;
    }
    const creatorSocket = io.sockets.sockets.get(entry.socketId);
    if (!creatorSocket) {
      privateRooms.delete(code.toUpperCase());
      socket.emit('private_room_error', { message: 'Room creator disconnected. Ask them to create a new room.' });
      return;
    }
    const sid = sessionId || socketToSession.get(socket.id) || uuidv4();
    socketToSession.set(socket.id, sid);
    privateRooms.delete(code.toUpperCase());

    const userA = { socketId: entry.socketId, sessionId: entry.sessionId };
    const userB = { socketId: socket.id,       sessionId: sid };
    const roomId = createRoom(userA, userB);
    creatorSocket.join(roomId);
    socket.join(roomId);
    creatorSocket.emit('matched', { roomId, role: 'initiator', private: true });
    socket.emit('matched',        { roomId, role: 'receiver',  private: true });
    console.log(`🤝 Private match: ${entry.socketId} ↔ ${socket.id} (code ${code})`);
  });

  // ── Join queue ────────────────────────────────────────────────────────
  socket.on('join_queue', ({ sessionId }) => {
    const sid = sessionId || uuidv4();
    socketToSession.set(socket.id, sid);
    removeFromQueue(socket.id);
    waitingQueue.push({ socketId: socket.id, sessionId: sid });
    socket.emit('queue_position', { position: waitingQueue.length });
    console.log(`⏳ Queued: ${socket.id} (q=${waitingQueue.length})`);
    tryMatch();
  });

  socket.on('leave_queue', () => {
    removeFromQueue(socket.id);
    socket.emit('queue_left');
  });

  // ── TEXT CHAT MATCHMAKING ───────────────────────────────────────────────
  socket.on('join_chat_queue', ({ sessionId }) => {
    const sid = sessionId || uuidv4();
    socketToSession.set(socket.id, sid);
    removeFromChatQueue(socket.id);
    chatWaitingQueue.push({ socketId: socket.id, sessionId: sid });
    console.log(`💬 Queued for chat: ${socket.id} (q=${chatWaitingQueue.length})`);
    tryChatMatch();
  });

  socket.on('leave_chat_queue', () => {
    removeFromChatQueue(socket.id);
  });

  socket.on('chat_message', ({ roomId, text }) => {
    socket.to(roomId).emit('chat_message', { senderId: socket.id, text });
  });

  socket.on('next_chat_match', () => {
    const roomId = socketToChatRoom.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit('chat_opponent_left');
      const room = chatRooms.get(roomId);
      if (room) {
        const otherId = room.userA.socketId === socket.id ? room.userB.socketId : room.userA.socketId;
        socketToChatRoom.delete(otherId);
      }
      socketToChatRoom.delete(socket.id);
      chatRooms.delete(roomId);
      socket.leave(roomId);
    }
    removeFromChatQueue(socket.id);
    const sessionId = socketToSession.get(socket.id) || uuidv4();
    chatWaitingQueue.push({ socketId: socket.id, sessionId });
    tryChatMatch();
  });

  // ── WebRTC signaling ──────────────────────────────────────────────────
  socket.on('webrtc_signal', ({ roomId, signal }) => {
    socket.to(roomId).emit('webrtc_signal', { signal, from: socket.id });
  });

  // ── PEER READY → triggers server countdown ────────────────────────────
  socket.on('peer_ready', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    if (room.userA.socketId === socket.id) room.readyA = true;
    if (room.userB.socketId === socket.id) room.readyB = true;

    console.log(`✅ peer_ready: ${socket.id} in room ${roomId} (A=${room.readyA} B=${room.readyB})`);

    if (room.readyA && room.readyB) {
      startCountdown(roomId);
    }
  });

  // ── Score submission ───────────────────────────────────────────────────
  socket.on('submit_score', async ({ roomId, score, traits }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const isA = room.userA.socketId === socket.id;
    const isB = room.userB.socketId === socket.id;

    if (isA && !room.scoreA) { room.scoreA = { score, traits }; console.log(`📊 Score A: ${typeof score === 'object' ? score.total : score}`); }
    if (isB && !room.scoreB) { room.scoreB = { score, traits }; console.log(`📊 Score B: ${typeof score === 'object' ? score.total : score}`); }

    if (room.scoreA && room.scoreB) {
      await resolveMatch(roomId);
    }
  });

  // ── Next match ─────────────────────────────────────────────────────────
  socket.on('next_match', () => {
    const roomId = socketToRoom.get(socket.id);
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        const otherId = room.userA.socketId === socket.id ? room.userB.socketId : room.userA.socketId;
        socket.to(roomId).emit('opponent_left');
        socketToRoom.delete(otherId);
      }
      clearRoomTimer(roomId);
      clearRoomTimer(`${roomId}_force`);
      socketToRoom.delete(socket.id);
      rooms.delete(roomId);
      socket.leave(roomId);
    }
    removeFromQueue(socket.id);
    const sessionId = socketToSession.get(socket.id) || uuidv4();
    waitingQueue.push({ socketId: socket.id, sessionId });
    socket.emit('queue_position', { position: waitingQueue.length });
    tryMatch();
  });

  // ── Disconnect ─────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`❌ Disconnected: ${socket.id}`);
    for (const [code, data] of privateRooms.entries()) {
      if (data.socketId === socket.id) { privateRooms.delete(code); break; }
    }
    removeFromQueue(socket.id);
    const roomId = socketToRoom.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit('opponent_left');
      const room = rooms.get(roomId);
      if (room) {
        const otherId = room.userA.socketId === socket.id ? room.userB.socketId : room.userA.socketId;
        socketToRoom.delete(otherId);
      }
      clearRoomTimer(roomId);
      clearRoomTimer(`${roomId}_force`);
      socketToRoom.delete(socket.id);
      rooms.delete(roomId);
    }
    
    removeFromChatQueue(socket.id);
    const chatRoomId = socketToChatRoom.get(socket.id);
    if (chatRoomId) {
      socket.to(chatRoomId).emit('chat_opponent_left');
      const cRoom = chatRooms.get(chatRoomId);
      if (cRoom) {
        const otherId = cRoom.userA.socketId === socket.id ? cRoom.userB.socketId : cRoom.userA.socketId;
        socketToChatRoom.delete(otherId);
      }
      socketToChatRoom.delete(socket.id);
      chatRooms.delete(chatRoomId);
    }

    socketToSession.delete(socket.id);
  });
});

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 OmmoGale backend running on port ${PORT}`));
