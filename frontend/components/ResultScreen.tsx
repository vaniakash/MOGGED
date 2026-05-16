'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { FaceScore } from '@/lib/faceAnalysis';
import { Zap, Home, Crown, Skull } from 'lucide-react';

interface MatchResult {
  scoreA: { score: FaceScore; traits: string[] };
  scoreB: { score: FaceScore; traits: string[] };
  winner: 'A' | 'B';
  winnerSocketId: string;
  eloResult?: { newRatingA: number; newRatingB: number; changeA: number; changeB: number };
}

interface Props {
  result: MatchResult;
  isWinner: boolean;
  mySocketId: string;
  onNext: () => void;
  onHome: () => void;
}

function AnimatedScore({ target, delay = 0 }: { target: number; delay?: number }) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const startAt = Date.now() + delay * 1000;
    const dur = 1800;
    const tick = () => {
      const now = Date.now();
      if (now < startAt) { raf.current = requestAnimationFrame(tick); return; }
      const p = Math.min((now - startAt) / dur, 1);
      setVal(parseFloat(((1 - Math.pow(1 - p, 3)) * target).toFixed(1)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, delay]);

  return <>{val.toFixed(1)}</>;
}

export default function ResultScreen({ result, isWinner, mySocketId, onNext, onHome }: Props) {
  const [phase, setPhase] = useState<'splash' | 'detail'>('splash');
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number; color: string }[]>([]);

  const myScore  = mySocketId === result.winnerSocketId
    ? (result.winner === 'A' ? result.scoreA : result.scoreB)
    : (result.winner === 'A' ? result.scoreB : result.scoreA);
  const oppScore = mySocketId === result.winnerSocketId
    ? (result.winner === 'A' ? result.scoreB : result.scoreA)
    : (result.winner === 'A' ? result.scoreA : result.scoreB);

  const myTotal  = myScore?.score?.total  ?? 0;
  const oppTotal = oppScore?.score?.total ?? 0;
  const myTraits = myScore?.traits ?? [];

  const winnerColor = '#00f5d4';
  const loserColor  = '#ff2d78';
  const mainColor   = isWinner ? winnerColor : loserColor;

  useEffect(() => {
    const colors = isWinner
      ? ['#00f5d4', '#a855f7', '#fbbf24', '#4ade80']
      : ['#ff2d78', '#ff6b6b', '#f87171', '#ef4444'];

    setParticles(Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      vx: (Math.random() - 0.5) * 300,
      vy: -(50 + Math.random() * 300),
      color: colors[i % colors.length],
    })));

    const t = setTimeout(() => setPhase('detail'), 2200);
    return () => clearTimeout(t);
  }, [isWinner]);

  const eloChange = isWinner ? result.eloResult?.changeA : result.eloResult?.changeB;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: isWinner
        ? 'radial-gradient(ellipse at center, #001a12 0%, #050508 60%)'
        : 'radial-gradient(ellipse at center, #1a0008 0%, #050508 60%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 100, overflow: 'hidden',
    }}>

      {/* ── BG glow ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: isWinner
          ? 'radial-gradient(circle at 50% 40%, rgba(0,245,212,0.18) 0%, transparent 65%)'
          : 'radial-gradient(circle at 50% 40%, rgba(255,45,120,0.18) 0%, transparent 65%)',
      }} />

      {/* ── Particles ── */}
      {particles.map(p => (
        <motion.div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          width: 10, height: 10, borderRadius: '50%',
          background: p.color, boxShadow: `0 0 12px ${p.color}`,
          pointerEvents: 'none',
        }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.vx, y: p.vy, scale: 0, rotate: 720 }}
          transition={{ duration: 2 + Math.random(), ease: 'easeOut' }}
        />
      ))}

      {/* ── SPLASH PHASE ── */}
      <AnimatePresence mode="wait">
        {phase === 'splash' && (
          <motion.div key="splash" style={{ textAlign: 'center' }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}>

            {isWinner
              ? <Crown size={80} color="#fbbf24" style={{ margin: '0 auto 16px', filter: 'drop-shadow(0 0 24px #fbbf24)' }} />
              : <Skull  size={80} color="#ff2d78" style={{ margin: '0 auto 16px', filter: 'drop-shadow(0 0 24px #ff2d78)' }} />
            }

            <motion.div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(52px, 10vw, 88px)',
                lineHeight: 1,
                color: mainColor,
                textShadow: `0 0 60px ${mainColor}cc, 0 0 120px ${mainColor}44`,
                letterSpacing: '0.06em',
              }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              {isWinner ? 'YOU MOGGED HIM' : 'YOU GOT MOGGED'}
            </motion.div>

            <motion.div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 6vw, 56px)',
                color: '#fff',
                marginTop: 16,
                textShadow: `0 0 24px ${mainColor}80`,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {myTotal.toFixed(1)} / 10
            </motion.div>
          </motion.div>
        )}

        {/* ── DETAIL PHASE ── */}
        {phase === 'detail' && (
          <motion.div key="detail"
            style={{ width: '100%', maxWidth: 520, padding: '0 16px', textAlign: 'center' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>

            {/* Verdict banner */}
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 7vw, 64px)',
              color: mainColor,
              textShadow: `0 0 40px ${mainColor}aa`,
              lineHeight: 1.1,
              marginBottom: 8,
            }}>
              {isWinner ? 'YOU MOGGED HIM' : 'YOU GOT MOGGED'}
            </div>

            {/* Scores side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 20 }}>

              {/* MY SCORE */}
              <div className="card" style={{
                padding: '20px 12px', borderRadius: 18, textAlign: 'center',
                borderColor: isWinner ? 'rgba(0,245,212,0.5)' : 'rgba(255,45,120,0.4)',
                boxShadow: isWinner ? '0 0 40px rgba(0,245,212,0.2)' : '0 0 40px rgba(255,45,120,0.1)',
              }}>
                <div className="text-muted text-xs uppercase tracking-widest font-semibold mb-2">YOU</div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 64, lineHeight: 1,
                  color: isWinner ? winnerColor : loserColor,
                  textShadow: `0 0 32px ${isWinner ? winnerColor : loserColor}80`,
                }}>
                  <AnimatedScore target={myTotal} delay={0.2} />
                </div>
                {isWinner && (
                  <div className="flex items-center justify-center gap-1 mt-2" style={{ color: '#fbbf24', fontSize: 13, fontWeight: 700 }}>
                    <Crown size={12} color="#fbbf24" /> WINNER
                  </div>
                )}
              </div>

              {/* VS divider */}
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 32, color: '#a855f7',
                textShadow: '0 0 20px rgba(168,85,247,0.8)',
              }}>VS</div>

              {/* OPP SCORE */}
              <div className="card" style={{
                padding: '20px 12px', borderRadius: 18, textAlign: 'center',
                borderColor: !isWinner ? 'rgba(0,245,212,0.5)' : 'rgba(255,45,120,0.3)',
                boxShadow: !isWinner ? '0 0 40px rgba(0,245,212,0.2)' : 'none',
              }}>
                <div className="text-muted text-xs uppercase tracking-widest font-semibold mb-2">OPPONENT</div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 64, lineHeight: 1,
                  color: !isWinner ? winnerColor : loserColor,
                  textShadow: `0 0 32px ${!isWinner ? winnerColor : loserColor}80`,
                }}>
                  <AnimatedScore target={oppTotal} delay={0.5} />
                </div>
                {!isWinner && (
                  <div className="flex items-center justify-center gap-1 mt-2" style={{ color: '#fbbf24', fontSize: 13, fontWeight: 700 }}>
                    <Crown size={12} color="#fbbf24" /> WINNER
                  </div>
                )}
              </div>
            </div>

            {/* Trait badges */}
            {myTraits.length > 0 && (
              <motion.div
                className="flex flex-wrap gap-2 justify-center mb-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {myTraits.map(t => (
                  <span key={t} className="badge" style={{ fontSize: 13, padding: '6px 14px' }}>{t}</span>
                ))}
              </motion.div>
            )}

            {/* ELO change */}
            {result.eloResult && eloChange !== undefined && (
              <motion.div
                className="card text-center"
                style={{ padding: '10px 16px', borderRadius: 14, marginBottom: 20, fontSize: 14 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <span className="text-secondary">ELO: </span>
                <span style={{ color: eloChange >= 0 ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                  {eloChange >= 0 ? '+' : ''}{eloChange}
                </span>
                <span className="text-secondary"> → {isWinner ? result.eloResult.newRatingA : result.eloResult.newRatingB}</span>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              className="flex justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <button id="home-btn" className="btn btn-ghost" onClick={onHome}>
                <Home size={15} /> Home
              </button>
              <button
                id="next-match-btn"
                className="btn btn-primary"
                style={{
                  fontFamily: 'var(--font-display)', letterSpacing: '0.12em',
                  fontSize: 20, padding: '14px 40px',
                }}
                onClick={onNext}
              >
                <Zap size={18} strokeWidth={2.5} /> NEXT MATCH
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
