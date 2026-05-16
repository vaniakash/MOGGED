'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, SkipForward, CheckCircle2, Clock, Cpu } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { useFaceMesh } from '@/hooks/useFaceMesh';
import { useWebRTC } from '@/hooks/useWebRTC';
import { FaceScore } from '@/lib/faceAnalysis';
import { Socket } from 'socket.io-client';
import ResultScreen from '@/components/ResultScreen';
import VideoPanel from '@/components/VideoPanel';
import QueueScreen from '@/components/QueueScreen';

// Universal UUID — crypto.randomUUID() unsupported on older Android browsers
function genUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

type Phase = 'idle' | 'queuing' | 'connected' | 'analyzing' | 'waiting_opponent' | 'result';

interface MatchResult {
  scoreA: { score: FaceScore; traits: string[] };
  scoreB: { score: FaceScore; traits: string[] };
  winner: 'A' | 'B';
  winnerSocketId: string;
  eloResult?: { newRatingA: number; newRatingB: number; changeA: number; changeB: number };
}

export default function BattlePage() {
  const [phase, setPhase]             = useState<Phase>('idle');
  const [socket, setSocket]           = useState<Socket | null>(null);
  const [roomId, setRoomId]           = useState<string | null>(null);
  const [role, setRole]               = useState<'initiator' | 'receiver' | null>(null);
  const [queuePos, setQueuePos]       = useState(0);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [mySocketId, setMySocketId]   = useState('');
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // SERVER-SYNCED countdown state
  const [countdown, setCountdown]     = useState<number | null>(null);
  const countdownIntervalRef          = useRef<NodeJS.Timeout | null>(null);
  const serverStartTimeRef            = useRef<number>(0);
  const countdownDurationRef          = useRef<number>(10000);

  // Track if we've sent peer_ready to server
  const peerReadySentRef = useRef(false);

  const localVideoRef  = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const { localStream, remoteStream, connected: peerConnected } = useWebRTC({ socket, roomId, role });
  const {
    score: myScore, faceDetected, initState,
    startAnalysis, stopAnalysis, preInit, getFinalScore,
  } = useFaceMesh(localVideoRef);

  // Bind video streams to video elements
  useEffect(() => {
    if (localVideoRef.current  && localStream)  localVideoRef.current.srcObject  = localStream;
  }, [localStream]);
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  // Pre-load the AI model as soon as this page mounts — before any match
  useEffect(() => { preInit(); }, [preInit]);

  // ── When WebRTC peer stream arrives → tell server we're ready ──────────
  // Also: 20s timeout fallback so countdown isn't blocked if WebRTC is slow
  const peerReadyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (peerConnected && remoteStream && socket && roomId && !peerReadySentRef.current) {
      peerReadySentRef.current = true;
      if (peerReadyTimeoutRef.current) clearTimeout(peerReadyTimeoutRef.current);
      socket.emit('peer_ready', { roomId });
      console.log('[Battle] peer_ready sent (stream connected)');
    }
  }, [peerConnected, remoteStream, socket, roomId]);

  // 20s timeout: send peer_ready even if WebRTC stream never arrives
  useEffect(() => {
    if (phase === 'connected' && socket && roomId && !peerReadySentRef.current) {
      peerReadyTimeoutRef.current = setTimeout(() => {
        if (!peerReadySentRef.current && socket && roomId) {
          peerReadySentRef.current = true;
          socket.emit('peer_ready', { roomId });
          console.log('[Battle] peer_ready sent (20s timeout fallback)');
        }
      }, 20000);
    }
    return () => {
      if (peerReadyTimeoutRef.current) clearTimeout(peerReadyTimeoutRef.current);
    };
  }, [phase, socket, roomId]);

  // ── Server-synced countdown helpers ────────────────────────────────────
  const startLocalCountdown = useCallback((serverTime: number, durationMs: number) => {
    serverStartTimeRef.current  = serverTime;
    countdownDurationRef.current = durationMs;

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    const tick = () => {
      const elapsed = Date.now() - serverTime;
      const remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      }
    };
    tick();
    countdownIntervalRef.current = setInterval(tick, 200); // 200ms for smooth display
  }, []);

  const submitScore = useCallback(() => {
    if (scoreSubmitted || !socket || !roomId) return;
    const final = getFinalScore();
    const score = final || { total: 5.0, symmetry: 0.5, jawScore: 0.5, eyeScore: 0.5, harmony: 0.5, traits: ['🤷 No Score'], verdict: 'N/A' };
    setScoreSubmitted(true);
    setPhase('waiting_opponent');
    socket.emit('submit_score', { roomId, score, traits: score.traits });
    stopAnalysis();
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    console.log('[Battle] Score submitted:', score.total);
  }, [scoreSubmitted, getFinalScore, socket, roomId, stopAnalysis]);

  // ── Socket setup ────────────────────────────────────────────────────────
  useEffect(() => {
    const s = getSocket();
    s.connect();
    setSocket(s);
    setMySocketId(s.id || '');

    s.on('connect', () => setMySocketId(s.id || ''));

    s.on('queue_position', ({ position }: { position: number }) => setQueuePos(position));

    s.on('matched', ({ roomId: rid, role: r }: { roomId: string; role: 'initiator' | 'receiver' }) => {
      setRoomId(rid);
      setRole(r);
      setPhase('connected');
      setOpponentLeft(false);
      peerReadySentRef.current = false;
    });

    // !! SERVER-SYNCED COUNTDOWN !!
    // Server fires this when BOTH peers have signalled peer_ready
    s.on('countdown_start', ({ serverTime, durationMs }: { serverTime: number; durationMs: number }) => {
      console.log('[Battle] countdown_start received from server:', { serverTime, durationMs });
      setPhase('analyzing');
      startLocalCountdown(serverTime, durationMs);
      startAnalysis(); // begin FaceMesh on this device
    });

    // Server deadline: submit whatever score we have NOW
    s.on('submit_now', () => {
      console.log('[Battle] submit_now received from server');
      submitScore();
    });

    s.on('opponent_left', () => {
      setOpponentLeft(true);
      stopAnalysis();
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setCountdown(null);
      setTimeout(() => setOpponentLeft(false), 3500);
    });

    s.on('match_result', (r: MatchResult) => {
      setMatchResult(r);
      setPhase('result');
      stopAnalysis();
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    });

    return () => {
      s.off('connect'); s.off('queue_position'); s.off('matched');
      s.off('countdown_start'); s.off('submit_now');
      s.off('opponent_left'); s.off('match_result');
      s.disconnect();
    };
  }, [stopAnalysis, startAnalysis, startLocalCountdown, submitScore]);

  // ── Auto-submit when local countdown hits 0 ─────────────────────────────
  useEffect(() => {
    if (countdown === 0 && phase === 'analyzing' && !scoreSubmitted) {
      submitScore();
    }
  }, [countdown, phase, scoreSubmitted, submitScore]);

  // ── Queue helpers ────────────────────────────────────────────────────────
  const joinQueue = useCallback(() => {
    if (!socket) return;
    setPhase('queuing');
    setMatchResult(null);
    setScoreSubmitted(false);
    setCountdown(null);
    peerReadySentRef.current = false;
    const sid = localStorage.getItem('sessionId') || genUUID();
    localStorage.setItem('sessionId', sid);
    socket.emit('join_queue', { sessionId: sid });
  }, [socket]);

  const nextMatch = useCallback(() => {
    if (!socket) return;
    setPhase('queuing');
    setMatchResult(null);
    setScoreSubmitted(false);
    setCountdown(null);
    setOpponentLeft(false);
    peerReadySentRef.current = false;
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    socket.emit('next_match');
  }, [socket]);

  const isWinner = matchResult?.winnerSocketId === mySocketId;
  const isUrgent = countdown !== null && countdown <= 3;

  return (
    <div className="page">
      {/* ── NAV ── */}
      <nav className="nav">
        <a href="/" className="nav-logo">OMMOGALE</a>
        <div className="nav-actions">
          {initState === 'loading' && (
            <div className="flex items-center gap-2" style={{ fontSize: 12, color: '#fbbf24' }}>
              <Cpu size={12} color="#fbbf24" />
              <span>Loading AI<span className="loading-dots"><span>.</span><span>.</span><span>.</span></span></span>
            </div>
          )}
          {myScore && phase === 'analyzing' && (
            <motion.div className="card flex items-center gap-2"
              style={{ padding: '6px 12px', borderRadius: 99 }}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="dot dot-green" style={{ animation: 'pulse-glow 1.5s ease-in-out infinite' }} />
              <span className="text-green font-semibold" style={{ fontSize: 13 }}>
                {myScore.total.toFixed(1)}
              </span>
            </motion.div>
          )}
          {phase !== 'idle' && phase !== 'queuing' && (
            <button id="skip-btn" className="btn btn-ghost btn-sm" onClick={nextMatch}>
              <SkipForward size={14} /> Skip
            </button>
          )}
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="page-content">
        <AnimatePresence mode="wait">

          {/* IDLE */}
          {phase === 'idle' && (
            <motion.div key="idle" className="text-center container-sm"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
              <div className="font-display gradient-text" style={{ fontSize: 80, lineHeight: 1, marginBottom: 16 }}>
                READY?
              </div>
              <p className="text-secondary mb-8" style={{ maxWidth: 380, margin: '0 auto 32px', lineHeight: 1.6 }}>
                You&apos;ll be matched with a random stranger. Both cameras go live, a 10-second AI analysis runs, and the server decides who mogged who.
              </p>
              <motion.button id="start-battle-btn" className="btn btn-primary btn-xl"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={joinQueue}>
                <Zap size={20} strokeWidth={2.5} /> START BATTLE
              </motion.button>
            </motion.div>
          )}

          {/* QUEUING */}
          {phase === 'queuing' && (
            <motion.div key="queuing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QueueScreen position={queuePos} onCancel={() => { socket?.emit('leave_queue'); setPhase('idle'); }} />
            </motion.div>
          )}

          {/* BATTLE / ANALYZING / WAITING */}
          {(phase === 'connected' || phase === 'analyzing' || phase === 'waiting_opponent') && (
            <motion.div key="battle" className="w-full container-lg"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>

              {/* Opponent left banner */}
              <AnimatePresence>
                {opponentLeft && (
                  <motion.div className="card card-pink text-center"
                    style={{ padding: '12px 20px', marginBottom: 16, borderRadius: 14 }}
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <span className="neon-pink font-semibold">Opponent disconnected.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── WAITING FOR OPPONENT ── */}
              {phase === 'connected' && (
                <motion.div
                  className="text-center"
                  style={{ padding: '20px 0 12px' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {/* Big waiting text */}
                  <motion.div
                    className="font-display"
                    style={{
                      fontSize: 'clamp(28px, 6vw, 48px)',
                      letterSpacing: '0.08em',
                      background: 'linear-gradient(135deg, #a855f7, #00f5d4)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginBottom: 8,
                    }}
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    WAITING FOR OPPONENT
                  </motion.div>

                  {/* Animated dots */}
                  <div className="flex items-center justify-center gap-3" style={{ marginBottom: 8 }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i}
                        style={{ width: 10, height: 10, borderRadius: '50%', background: '#a855f7' }}
                        animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                      />
                    ))}
                  </div>

                  <p className="text-muted" style={{ fontSize: 13 }}>
                    {peerConnected
                      ? 'Connected — waiting for both cameras to sync…'
                      : 'Connecting video streams…'
                    }
                  </p>
                </motion.div>
              )}

              {/* ── SERVER-SYNCED COUNTDOWN ── */}
              {phase === 'analyzing' && countdown !== null && (
                <motion.div className="text-center mb-4"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  <motion.div
                    className="font-display"
                    style={{
                      fontSize: 'clamp(36px, 8vw, 64px)',
                      color: isUrgent ? '#ff2d78' : '#00f5d4',
                      textShadow: isUrgent
                        ? '0 0 40px rgba(255,45,120,0.9)'
                        : '0 0 30px rgba(0,245,212,0.8)',
                    }}
                    animate={isUrgent ? { scale: [1, 1.12, 1] } : {}}
                    transition={{ duration: 0.5, repeat: isUrgent ? Infinity : 0 }}
                  >
                    {initState !== 'ready' ? '⏳ AI Loading…' : `Analyzing… ${countdown}s`}
                  </motion.div>
                  {/* Progress bar synced to server time */}
                  <div className="score-bar mx-auto mt-3" style={{ height: 6, maxWidth: 320 }}>
                    <motion.div className="score-bar-fill"
                      style={{
                        background: isUrgent
                          ? 'linear-gradient(90deg, #ff2d78, #ff6b6b)'
                          : 'linear-gradient(90deg, #a855f7, #00f5d4)',
                        width: countdown !== null
                          ? `${((countdownDurationRef.current / 1000 - countdown) / (countdownDurationRef.current / 1000)) * 100}%`
                          : '0%',
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Video panels */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <VideoPanel videoRef={localVideoRef}  label="YOU"      score={phase === 'analyzing' ? myScore : null} isLocal={true}  faceDetected={faceDetected} color="cyan" />
                <VideoPanel videoRef={remoteVideoRef} label="OPPONENT" score={null}                                    isLocal={false} faceDetected={null}         color="pink" />
              </div>

              {/* Analyzing: AI model loading warning + lock-in button */}
              {phase === 'analyzing' && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  {initState !== 'ready' && (
                    <div className="card text-center mb-3" style={{
                      padding: '10px 20px', borderRadius: 14,
                      borderColor: 'rgba(251,191,36,0.4)',
                    }}>
                      <p style={{ color: '#fbbf24', fontSize: 13, fontWeight: 600 }}>
                        🤖 AI model loading (first-time ~15s) — score will auto-submit when ready
                      </p>
                    </div>
                  )}
                  <button id="lock-score-btn" className="btn btn-primary w-full"
                    style={{ width: '100%', fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.12em', padding: '14px', borderRadius: 14 }}
                    onClick={submitScore}>
                    🔒 LOCK IN SCORE NOW
                  </button>
                </motion.div>
              )}

              {/* Waiting for opponent */}
              {phase === 'waiting_opponent' && (
                <motion.div className="card card-purple text-center"
                  style={{ padding: 28, borderRadius: 20 }}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle2 size={22} color="#00f5d4" />
                    <span className="font-display neon-cyan" style={{ fontSize: 26 }}>Score Submitted</span>
                  </div>
                  <p className="text-secondary loading-dots">
                    Waiting for opponent <span>.</span><span>.</span><span>.</span>
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* RESULT — full screen takeover */}
          {phase === 'result' && matchResult && (
            <ResultScreen
              result={matchResult}
              isWinner={isWinner}
              mySocketId={mySocketId}
              onNext={nextMatch}
              onHome={() => { window.location.href = '/'; }}
            />
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
