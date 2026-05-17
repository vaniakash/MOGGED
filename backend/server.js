require('dotenv').config();
const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const cors     = require('cors');
const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
const { v4: uuidv4 } = require('uuid');
const { calculateElo } = require('./utils/elo');
const User  = require('./models/User');
const Match = require('./models/Match');

const app    = express();
const server = http.createServer(app);

// Dynamic CORS — accepts any Vercel preview/prod URL + localhost + ngrok
function isAllowedOrigin(origin) {
  if (!origin) return true; // server-to-server
  if (origin === 'http://localhost:3000') return true;
  if (origin === 'http://10.202.98.220:3000') return true;
  if (origin.endsWith('.vercel.app')) return true;       // all Vercel URLs
  if (origin.includes('ngrok-free.app')) return true;   // ngrok dev tunnels
  if (origin.includes('onrender.com')) return true;     // render previews
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

// ── In-memory state ────────────────────────────────────────────────────────
const waitingQueue    = [];         // [{ socketId, sessionId }]
const rooms           = new Map();  // roomId → RoomState
const socketToRoom    = new Map();  // socketId → roomId
const socketToSession = new Map();  // socketId → sessionId
const roomTimers      = new Map();  // roomId → timer
const privateRooms    = new Map();  // code → { socketId, sessionId }  (friend battle)

const COUNTDOWN_SECS = 10;

// ── REST ───────────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));

app.get('/api/leaderboard', async (_, res) => {
  try {
    const leaders = await User.find().sort({ elo: -1 }).limit(20)
      .select('sessionId username elo wins losses matches');
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
    readyA:    false,   // WebRTC peer connected on A's side
    readyB:    false,   // WebRTC peer connected on B's side
    countdown: false,   // has countdown started?
    startTime: null,    // server timestamp when countdown fired
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

// ── SERVER-SYNCED COUNTDOWN ────────────────────────────────────────────────
// Called when both peers signal their WebRTC stream is live
function startCountdown(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.countdown) return;  // already started
  room.countdown = true;
  room.startTime = Date.now();

  console.log(`⏱  Countdown started for room ${roomId}`);

  // Emit to BOTH clients simultaneously with the exact server timestamp
  io.to(roomId).emit('countdown_start', {
    serverTime:    room.startTime,
    durationMs:    COUNTDOWN_SECS * 1000,
  });

  // Server-side: after COUNTDOWN_SECS, force score collection regardless
  const t = setTimeout(async () => {
    const r = rooms.get(roomId);
    if (!r) return;

    // Tell clients to submit NOW (they should have submitted already, but this is the hard deadline)
    io.to(roomId).emit('submit_now');
    console.log(`📢 submit_now sent to room ${roomId}`);

    // Give clients 3 extra seconds to submit, then force result with whatever we have
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

  // If one score is missing, give them a fallback score
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
        $set: { elo: elo.newRatingA },
      });
      await User.updateOne({ sessionId: room.userB.sessionId }, {
        $inc: { matches: 1, wins: winner === 'B' ? 1 : 0, losses: winner === 'A' ? 1 : 0 },
        $set: { elo: elo.newRatingB },
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
  // Friend generates a short code and waits; other friend joins with the code
  socket.on('create_private_room', ({ sessionId }) => {
    // Remove any existing private room this socket created
    for (const [code, data] of privateRooms.entries()) {
      if (data.socketId === socket.id) privateRooms.delete(code);
    }
    const code = Math.random().toString(36).slice(2, 8).toUpperCase(); // e.g. "A3F8X2"
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
    // Match the two friends directly
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

  // ── WebRTC signaling ──────────────────────────────────────────────────
  socket.on('webrtc_signal', ({ roomId, signal }) => {
    socket.to(roomId).emit('webrtc_signal', { signal, from: socket.id });
  });

  // ── PEER READY → triggers server countdown ────────────────────────────
  // Client emits this when their WebRTC stream is live (remoteStream received)
  socket.on('peer_ready', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    if (room.userA.socketId === socket.id) room.readyA = true;
    if (room.userB.socketId === socket.id) room.readyB = true;

    console.log(`✅ peer_ready: ${socket.id} in room ${roomId} (A=${room.readyA} B=${room.readyB})`);

    // When BOTH are ready → fire the synchronized countdown
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

    // Both scores in → resolve immediately
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
    // Clean up private room if this socket was a creator
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
    socketToSession.delete(socket.id);
  });
});

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 OmmoGale backend running on port ${PORT}`));
