'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Zap, Bot, Trophy, Camera, Link2, Cpu, Swords } from 'lucide-react';

const MEME_QUOTES = [
  '"You either mog, or get mogged."',
  '"The AI has no mercy. Neither do we."',
  '"Your face is now data."',
  '"NPC faces get exposed here."',
  '"Hunter eyes vs NPC stare — who wins?"',
];

export default function HomePage() {
  const router = useRouter();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; color: string; delay: number; dur: number }[]>([]);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % MEME_QUOTES.length), 3200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setParticles(
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ['#ff2d78', '#00f5d4', '#a855f7', '#fbbf24'][i % 4],
        delay: Math.random() * 6,
        dur: 4 + Math.random() * 4,
      }))
    );
  }, []);

  return (
    <main className="page-center" style={{ paddingTop: 48, paddingBottom: 48 }}>

      {/* Floating particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'fixed',
            bottom: -10,
            left: `${p.x}%`,
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 10px ${p.color}`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
          animate={{ y: [0, -(700 + Math.random() * 400)], opacity: [0, 1, 1, 0], scale: [0, 1, 1, 0] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeOut' }}
        />
      ))}

      {/* ── LOGO ─────────────────────────── */}
      <motion.div
        className="text-center mb-8"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div className="flex items-center justify-center mb-3">
          <img src="/omogle-logo.svg" alt="Ommogale" style={{ height: 80, objectFit: 'contain' }} />
        </div>
        <p className="text-secondary text-lg">AI-Powered Face Battle Arena</p>
      </motion.div>

      {/* ── HERO CARD ────────────────────── */}
      <motion.div
        className="card card-purple container-sm mb-8"
        style={{ padding: 32, position: 'relative', zIndex: 1 }}
        initial={{ scale: 0.82, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* VS visual */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <motion.div
            className="avatar-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,245,212,0.18), rgba(0,245,212,0.04))',
              border: '2px solid rgba(0,245,212,0.4)',
              fontSize: 32,
            }}
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🧑
          </motion.div>

          <motion.div
            className="font-display"
            style={{ fontSize: 48, color: '#a855f7', textShadow: '0 0 24px rgba(168,85,247,0.8)' }}
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            VS
          </motion.div>

          <motion.div
            className="avatar-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255,45,120,0.18), rgba(255,45,120,0.04))',
              border: '2px solid rgba(255,45,120,0.4)',
              fontSize: 32,
            }}
            animate={{ rotate: [0, -5, 0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          >
            🧑
          </motion.div>
        </div>

        {/* Meme quote */}
        <AnimatePresence mode="wait">
          <motion.p
            key={quoteIdx}
            className="text-secondary italic text-center mb-8 leading-relaxed"
            style={{ fontSize: 15 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45 }}
          >
            {MEME_QUOTES[quoteIdx]}
          </motion.p>
        </AnimatePresence>

        {/* Feature grid */}
        <div className="grid-3 gap-3 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
          {[
            { icon: <Swords size={22} color="#00f5d4" />, label: 'Random Match' },
            { icon: <Bot size={22} color="#a855f7" />,    label: 'AI Analysis' },
            { icon: <Trophy size={22} color="#fbbf24" />, label: 'ELO Ranking' },
          ].map(f => (
            <div
              key={f.label}
              className="card text-center"
              style={{ padding: '12px 8px', borderRadius: 14 }}
            >
              <div className="flex justify-center mb-2">{f.icon}</div>
              <div className="text-xs text-secondary font-semibold">{f.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          id="enter-battle-btn"
          className="btn btn-primary btn-xl w-full"
          style={{ width: '100%', borderRadius: 16 }}
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => router.push('/battle')}
        >
          <Zap size={20} strokeWidth={2.5} />
          ENTER THE ARENA
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Friend Battle */}
        <motion.button
          id="friend-battle-btn"
          className="btn btn-ghost w-full"
          style={{ width: '100%', borderRadius: 14, borderColor: 'rgba(168,85,247,0.4)', color: '#a855f7' }}
          whileHover={{ scale: 1.02, borderColor: 'rgba(168,85,247,0.8)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/battle?mode=friend')}
        >
          <Link2 size={17} /> CHALLENGE A FRIEND
        </motion.button>

        <p className="text-center text-muted text-xs mt-4">
          Webcam required · 18+ · Entertainment purposes only
        </p>
      </motion.div>

      {/* ── STATS ────────────────────────── */}
      <motion.div
        className="flex gap-8 text-center mb-12"
        style={{ position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        {[
          { label: 'Battles Today', value: '12,847' },
          { label: 'Moggers',       value: '4,231' },
          { label: 'Avg Score',     value: '6.4' },
        ].map(s => (
          <div key={s.label}>
            <div className="font-display neon-cyan" style={{ fontSize: 26 }}>{s.value}</div>
            <div className="text-muted text-xs">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* ── HOW IT WORKS ─────────────────── */}
      <motion.div
        className="container-sm"
        style={{ position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
      >
        <p className="text-center text-muted text-xs font-semibold uppercase tracking-widest mb-5">
          How It Works
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { step: '01', icon: <Camera size={18} color="#00f5d4" />, text: 'Allow camera access & join the queue' },
            { step: '02', icon: <Link2 size={18} color="#a855f7" />,  text: 'Get matched with a random stranger via WebRTC' },
            { step: '03', icon: <Cpu   size={18} color="#fbbf24" />, text: 'AI analyzes both faces in real-time' },
            { step: '04', icon: <Swords size={18} color="#ff2d78"/>, text: 'Scores revealed — MOG or get MOGGED' },
          ].map(item => (
            <div key={item.step} className="card flex items-center gap-4" style={{ padding: '14px 16px', borderRadius: 14 }}>
              <span className="neon-purple font-display" style={{ fontSize: 22, width: 30, flexShrink: 0 }}>{item.step}</span>
              {item.icon}
              <span className="text-secondary text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
