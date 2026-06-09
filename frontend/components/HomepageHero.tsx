'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Camera, Crosshair, ScanFace, Skull } from 'lucide-react';

const PHRASES = [
  "THE INTERNET'S FACE ARENA",
  "MOG OR GET MOGGED",
  "ONLY ONE FACE WINS",
  "PROVE YOUR GENETICS",
];

export default function HomepageHero() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [countIdx, setCountIdx] = useState(0);

  useEffect(() => {
    setMounted(true);
    const t1 = setInterval(() => setCountIdx(i => (i + 1) % PHRASES.length), 2800);
    return () => clearInterval(t1);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>

      {/* ── LIVE TICKER BAR ─────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            borderRadius: 9999,
            background: '#0f1115',
            border: '1px solid #1e222a',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#f8fafc',
          }}
        >
          {/* Simple dot */}
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171' }} />
          
          <AnimatePresence mode="wait">
            <motion.span
              key={countIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              style={{ color: '#94a3b8' }}
            >
              {PHRASES[countIdx]}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── MAIN HERO ────────────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
        
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 8 }}
        >
          <div style={{
            fontFamily: 'Bebas Neue, cursive',
            fontSize: 'clamp(72px, 14vw, 140px)',
            lineHeight: 0.9,
            letterSpacing: '0.02em',
            color: '#f8fafc',
          }}>
            <span style={{ display: 'block' }}>MOG</span>
            <span style={{ display: 'block', color: '#64748b' }}>OR GET</span>
            <span style={{ display: 'block' }}>MOGGED</span>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: 'clamp(13px, 2vw, 16px)',
            fontWeight: 500,
            letterSpacing: '0.05em',
            marginBottom: 24,
          }}
        >
          Omogle 1v1 Face Arena · Real-Time AI Face Scanning · 468 Landmarks
        </motion.p>

        {/* ── BATTLE CARD ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #1e222a',
            background: '#0f1115',
            marginBottom: 48,
          }}
        >
          <div style={{ padding: 'clamp(24px, 5vw, 40px)' }}>

            {/* Split Screen Arena Preview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: 16,
              alignItems: 'center',
              marginBottom: 32,
            }}>
              {/* Player A */}
              <div style={{
                borderRadius: 12,
                border: '1px solid #1e222a',
                background: '#181b21',
                padding: '24px 16px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⚔️</div>
                <div style={{
                  fontFamily: 'Bebas Neue, cursive',
                  fontSize: 32,
                  color: '#f8fafc',
                  marginBottom: 4,
                }}>7.8</div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>YOU</div>
                <div style={{
                  marginTop: 16,
                  padding: '6px 12px',
                  background: '#2a2f3a',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#f8fafc',
                  fontWeight: 600,
                }}>🦅 Hunter Eyes</div>
              </div>

              {/* VS Divider */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'Bebas Neue, cursive',
                  fontSize: 'clamp(24px, 4vw, 40px)',
                  color: '#64748b',
                  lineHeight: 1,
                }}>VS</div>
                <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.1em', marginTop: 8 }}>
                  SCANNING
                </div>
              </div>

              {/* Player B */}
              <div style={{
                borderRadius: 12,
                border: '1px solid #1e222a',
                background: '#181b21',
                padding: '24px 16px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⚔️</div>
                <div style={{
                  fontFamily: 'Bebas Neue, cursive',
                  fontSize: 32,
                  color: '#f8fafc',
                  marginBottom: 4,
                }}>5.2</div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>STRANGER</div>
                <div style={{
                  marginTop: 16,
                  padding: '6px 12px',
                  background: '#2a2f3a',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#f8fafc',
                  fontWeight: 600,
                }}>💀 NPC Face</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                id="enter-battle-btn"
                onClick={() => router.push('/battle')}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#f8fafc',
                  color: '#050508',
                  fontFamily: 'inherit',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
              >
                ⚔️ Enter The Arena
              </button>

              <button
                id="friend-battle-btn"
                onClick={() => router.push('/battle?mode=friend')}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  border: '1px solid #2a2f3a',
                  background: '#181b21',
                  color: '#94a3b8',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#1e222a'}
                onMouseOut={(e) => e.currentTarget.style.background = '#181b21'}
              >
                🔗 Friend Battle
              </button>

              <button
                id="stranger-love-btn"
                onClick={() => router.push('/chat')}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  border: '1px solid #2a2f3a',
                  background: '#181b21',
                  color: '#f87171',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.2s',
                  marginTop: 4,
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#1e222a'}
                onMouseOut={(e) => e.currentTarget.style.background = '#181b21'}
              >
                💬 Find Your Stranger Love
              </button>
            </div>
          </div>

          {/* Legal footer inside card */}
          <div style={{
            padding: '16px',
            textAlign: 'center',
            fontSize: 11,
            color: '#475569',
            fontWeight: 500,
            letterSpacing: '0.04em',
            borderTop: '1px solid #1e222a',
          }}>
            WEBCAM REQUIRED · 18+ · ENTERTAINMENT ONLY · AI JUDGED
          </div>
        </motion.div>

        {/* ── HOW IT WORKS — horizontal steps ─────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{ marginBottom: 48 }}
        >
          <p style={{
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: '#64748b',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}>How It Works</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
          }}>
            {[
              { num: '1', icon: <Camera size={24} color="#f8fafc" strokeWidth={1.5} />, title: 'Camera On', desc: 'Allow webcam & join queue' },
              { num: '2', icon: <Crosshair size={24} color="#f8fafc" strokeWidth={1.5} />, title: 'Get Matched', desc: 'Paired with a random stranger' },
              { num: '3', icon: <ScanFace size={24} color="#f8fafc" strokeWidth={1.5} />, title: 'AI Judges', desc: '468 facial landmarks scanned' },
              { num: '4', icon: <Skull size={24} color="#f8fafc" strokeWidth={1.5} />, title: 'Verdict', desc: 'MOG or get MOGGED. No mercy.' },
            ].map((step, i) => (
              <div
                key={step.num}
                style={{
                  padding: '24px 16px',
                  borderRadius: 12,
                  background: '#0f1115',
                  border: '1px solid #1e222a',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontSize: 11,
                  color: '#64748b',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  marginBottom: 16,
                }}>STEP {step.num}</div>
                <div style={{ fontSize: 24, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{step.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc', marginBottom: 6 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.4 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
