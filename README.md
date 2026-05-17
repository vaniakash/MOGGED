# 🔥 OmmoGale — AI Face Battle Arena

> Random stranger video battle. AI-analyzed faces. Mog or get mogged.

---

## 🚀 Quick Start (Local Dev)

### 1. Backend
```bash
cd backend
cp .env.example .env
# Fill in MONGODB_URI and REDIS_URL (optional for local)
npm install
npm start
# → http://localhost:4000
```

### 2. Frontend
```bash
cd frontend
# .env.local already configured for localhost
npm install
npm run dev
# → http://localhost:3000
```

---

## 🗂 Project Structure

```
ommogale/
├── backend/
│   ├── models/
│   │   ├── User.js           # MongoDB user schema + ELO
│   │   └── Match.js          # MongoDB match schema
│   ├── utils/
│   │   └── elo.js            # ELO rating calculator
│   ├── server.js             # Express + Socket.IO server
│   ├── .env.example          # Environment variable template
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── page.tsx           # Landing / homepage
    │   ├── battle/page.tsx    # Core battle experience
    │   ├── leaderboard/page.tsx
    │   ├── layout.tsx
    │   └── globals.css        # Full design system
    ├── components/
    │   ├── VideoPanel.tsx     # Webcam panel with score overlay
    │   ├── QueueScreen.tsx    # Matchmaking waiting UI
    │   ├── AnalyzingOverlay.tsx # Live AI analysis UI
    │   └── ResultScreen.tsx   # Dramatic reveal screen
    ├── hooks/
    │   ├── useFaceMesh.ts     # MediaPipe FaceMesh hook
    │   └── useWebRTC.ts       # simple-peer WebRTC hook
    ├── lib/
    │   ├── socket.ts          # Singleton Socket.IO client
    │   └── faceAnalysis.ts    # Face landmark scoring engine
    └── types/
        └── simple-peer.d.ts   # TypeScript declarations
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 4000) |
| `MONGODB_URI` | No* | MongoDB Atlas connection string |
| `REDIS_URL` | No* | Redis Cloud/Upstash URL |
| `CLIENT_URL` | No | Frontend URL for CORS (default: localhost:3000) |
| `NODE_ENV` | No | `development` or `production` |

> *Without MongoDB, the app runs in memory-only mode (no persistence, but fully functional)

### Frontend (`frontend/.env.local`)
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Backend URL (e.g. `https://your-app.onrender.com`) |

---

## 🔌 Socket.IO Event Architecture

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_queue` | `{ sessionId }` | Enter matchmaking queue |
| `leave_queue` | — | Leave queue |
| `webrtc_signal` | `{ roomId, signal }` | Forward WebRTC signaling data |
| `submit_score` | `{ roomId, score, traits }` | Submit face analysis result |
| `next_match` | — | Skip current / re-queue |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `queue_position` | `{ position }` | Current queue position |
| `matched` | `{ roomId, role, opponentId }` | Matched with opponent |
| `webrtc_signal` | `{ signal, from }` | WebRTC signal relay |
| `score_update` | `{ scoreA, scoreB }` | Partial score update |
| `match_result` | `{ scoreA, scoreB, winner, eloResult, winnerSocketId }` | Final results |
| `opponent_left` | — | Opponent disconnected |
| `queue_left` | — | Confirmed queue exit |

---

## 🤖 AI Analysis System

Face analysis runs **100% client-side** via MediaPipe FaceMesh (468 landmarks).

### Metrics Computed
| Metric | Method |
|--------|--------|
| **Symmetry** | Deviation of nose/mouth midpoints from eye midpoint |
| **Eye Score** | Spacing ratio + canthal tilt + openness aspect ratio |
| **Jaw Score** | Jaw width / face height ratio vs ideal 0.78 |
| **Harmony** | Facial thirds (top/mid/bottom) deviation |
| **Total** | Weighted sum scaled to 4.0–9.8 |

### Trait Labels
- 🦅 Hunter Eyes / 😶 Negative Canthal Tilt
- 💪 Sharp Jawline / 🫤 Weak Jawline
- ✨ High Symmetry / 🌀 Asymmetric Face
- 👀 Wide/Close-Set Eyes / 👁️ Ideal Eye Spacing
- 🔥 Gigachad Aura / 💀 NPC Face

---

## 🏆 ELO Ranking Tiers
| ELO | Rank |
|-----|------|
| 1400+ | 👑 GIGACHAD |
| 1200–1399 | 🔥 CHAD |
| 1100–1199 | 💪 HIGH TIER |
| 1000–1099 | 😐 AVERAGE |
| <1000 | 💀 NPC |

---

## 🚀 Deployment

### Backend → Render
1. Connect GitHub repo to Render
2. Set **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. Add environment variables (PORT, MONGODB_URI, CLIENT_URL)

### Frontend → Vercel
1. Connect GitHub repo to Vercel
2. Set **Root Directory**: `frontend`
3. Add `NEXT_PUBLIC_BACKEND_URL` = your Render URL

### MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Whitelist all IPs (`0.0.0.0/0`) or Render IPs
3. Copy connection string → `MONGODB_URI`

---

## 📱 Features
- ✅ Random matchmaking via Socket.IO queue
- ✅ Peer-to-peer video via WebRTC (simple-peer)
- ✅ Client-side AI face analysis (MediaPipe FaceMesh)
- ✅ Live score bars during analysis
- ✅ 3-2-1 countdown reveal animation
- ✅ Animated score counters
- ✅ Particle burst winner effects
- ✅ ELO ranking system
- ✅ MongoDB persistence (optional)
- ✅ Leaderboard
- ✅ Next/skip button
- ✅ Mobile responsive
- ✅ Dark neon Gen-Z aesthetic



pkill -f "node server.js" 2>/dev/null; sleep 1; cd backend && node server.js &