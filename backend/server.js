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
const User         = require('./models/User');
const Match        = require('./models/Match');
const Subscription = require('./models/Subscription');

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
      .select('sessionId googleId email displayName photoURL elo wins losses matches profileComplete username nationality age gender provider');
    if (!user) return res.status(404).json({ error: 'User not found' });
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
const paymentsRoute       = require('./routes/payments');
const { startCron }       = require('./cron/dailyReset');

app.use('/api/face-score', faceScoreRoute);
app.use('/api/celebrity-match', celebrityMatchRoute);
app.use('/api/duel/async', asyncDuelRoute);
app.use('/api/glow-up', glowUpRoute);
app.use('/api/streak', streakRoute);
app.use('/api/auth/email', authEmailRoute);
app.use('/api/payments', paymentsRoute);

// Start cron for daily streak resets
startCron();

// ── Subscription Status ────────────────────────────────────────────────────
app.get('/api/subscription/status', async (req, res) => {
  const sessionId = req.query.sessionId || req.headers['x-session-id'];
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });
  try {
    const sub = await Subscription.getActive(sessionId);
    if (!sub) return res.json({ active: false, plan: null, expiresAt: null, daysLeft: 0 });
    const daysLeft = Math.max(0, Math.ceil((new Date(sub.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)));
    res.json({ active: true, plan: sub.plan, expiresAt: sub.expiresAt, daysLeft, gateway: sub.gateway });
  } catch (e) {
    res.status(500).json({ error: e.message });
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
    const now = new Date();
    const [totalUsers, totalMatches, googleUsers, activeSubsCount, revenue] = await Promise.all([
      User.countDocuments(),
      Match.countDocuments(),
      User.countDocuments({ provider: 'google' }),
      Subscription.countDocuments({ status: 'active', expiresAt: { $gt: now } }),
      Subscription.aggregate([
        { $group: {
          _id: '$plan',
          count: { $sum: 1 },
          totalPaise: { $sum: '$amount' },
        }},
      ]),
    ]);
    const activeQueue   = waitingQueue.length;
    const activeBattles = rooms.size;
    const activeChat    = chatRooms.size;
    res.json({ totalUsers, totalMatches, googleUsers, activeQueue, activeBattles, activeChat, activeSubsCount, revenue });
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

// ── Admin Subscriptions List ───────────────────────────────────────────────
app.get('/api/admin/subscriptions', requireAdmin, async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 25);
    const skip   = (page - 1) * limit;
    const status = req.query.status; // filter by status

    const filter = status ? { status } : {};
    const [subs, total] = await Promise.all([
      Subscription.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
      Subscription.countDocuments(filter),
    ]);

    // Enrich with user info
    const enriched = await Promise.all(subs.map(async sub => {
      const user = await User.findOne({ sessionId: sub.sessionId })
        .select('displayName email photoURL username').lean();
      return { ...sub, user: user || null };
    }));

    res.json({ subscriptions: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: Manually Grant Subscription ────────────────────────────────────
app.post('/api/admin/subscriptions/grant', requireAdmin, async (req, res) => {
  try {
    const { sessionId, plan, days, note } = req.body;
    if (!sessionId || !plan || !days) return res.status(400).json({ error: 'Missing fields' });

    const user = await User.findOne({ sessionId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Cancel existing active subs
    await Subscription.updateMany({ sessionId, status: 'active' }, { $set: { status: 'cancelled' } });

    const startDate = new Date();
    const expiresAt = new Date(startDate.getTime() + parseInt(days) * 24 * 60 * 60 * 1000);

    const sub = await Subscription.create({
      sessionId, userId: user._id, plan, status: 'active',
      startDate, expiresAt, amount: 0, currency: 'INR',
      gateway: 'india', grantedByAdmin: true, adminNote: note || 'Manual grant',
    });

    res.json({ success: true, subscription: sub });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: Extend Subscription ─────────────────────────────────────────────
app.post('/api/admin/subscriptions/:id/extend', requireAdmin, async (req, res) => {
  try {
    const { days } = req.body;
    if (!days) return res.status(400).json({ error: 'Missing days' });

    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });

    const base = sub.expiresAt > new Date() ? sub.expiresAt : new Date();
    sub.expiresAt = new Date(base.getTime() + parseInt(days) * 24 * 60 * 60 * 1000);
    sub.status = 'active';
    await sub.save();

    res.json({ success: true, expiresAt: sub.expiresAt });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: Cancel Subscription ─────────────────────────────────────────────
app.post('/api/admin/subscriptions/:id/cancel', requireAdmin, async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'cancelled' } },
      { new: true }
    );
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: Revenue Stats ────────────────────────────────────────────────────
app.get('/api/admin/revenue', requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const [byPlan, total, activeCount] = await Promise.all([
      Subscription.aggregate([
        { $match: { grantedByAdmin: { $ne: true } } },
        { $group: {
          _id: { plan: '$plan', currency: '$currency' },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        }},
      ]),
      Subscription.countDocuments({ grantedByAdmin: { $ne: true } }),
      Subscription.countDocuments({ status: 'active', expiresAt: { $gt: now } }),
    ]);
    res.json({ byPlan, total, activeCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin Tools endpoint
const FaceScore = require('./models/FaceScore');
const Credit    = require('./models/Credit');
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
    const userADoc = await User.findOne({ sessionId: room.userA.sessionId });
    const userBDoc = await User.findOne({ sessionId: room.userB.sessionId });
    if (userADoc && userBDoc) {
      const elo = calculateElo(userADoc.elo, userBDoc.elo, winner);
      eloResult  = elo;
      await User.updateOne({ sessionId: room.userA.sessionId }, {
        $inc: { matches: 1, wins: winner === 'A' ? 1 : 0, losses: winner === 'B' ? 1 : 0 },
        $set: { elo: elo.newRatingA, lastSeen: new Date() },
      });
      await User.updateOne({ sessionId: room.userB.sessionId }, {
        $inc: { matches: 1, wins: winner === 'B' ? 1 : 0, losses: winner === 'A' ? 1 : 0 },
        $set: { elo: elo.newRatingB, lastSeen: new Date() },
      });
      await Match.create({
        userA: room.userA.sessionId, userB: room.userB.sessionId,
        scoreA: totalA, scoreB: totalB,
        eloA: userADoc.elo, eloB: userBDoc.elo,
        eloChangeA: elo.changeA, eloChangeB: elo.changeB,
        winner, roomId,
      });
    }
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
