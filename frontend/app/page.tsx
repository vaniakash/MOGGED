'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Zap, Trophy, Link2 } from 'lucide-react';

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
    <main className="page-center" style={{ paddingTop: 64, paddingBottom: 64, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* ── TOP STATUS BAR ─────────────────── */}
      <div className="w-full text-center py-2" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 10 }}>
        <span className="text-xs text-secondary font-medium">You’re playing as Guest. <a href="#" className="hover:underline text-white font-bold">Claim your rank with Google.</a></span>
      </div>

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

      {/* ── HERO SECTION ─────────────────────────── */}
      <motion.div
        className="text-center mb-6"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ position: 'relative', zIndex: 1, marginTop: 20 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8" style={{ background: 'rgba(0, 245, 212, 0.08)', border: '1px solid rgba(0, 245, 212, 0.2)' }}>
           <div className="w-2 h-2 rounded-full bg-[#00f5d4]" style={{ animation: 'pulse-glow 2s infinite' }} />
           <span className="text-xs font-bold" style={{ color: '#00f5d4', letterSpacing: '0.05em' }}>1,482 ONLINE</span>
        </div>
        
        <h1 className="font-display gradient-text" style={{ fontSize: 'clamp(64px, 15vw, 140px)', lineHeight: 0.85, letterSpacing: '0.01em', textShadow: '0 0 40px rgba(168,85,247,0.3)', marginBottom: 24, textTransform: 'uppercase' }}>
          OMOGLE
        </h1>
        
        <p className="text-secondary text-base md:text-xl font-medium mb-4 max-w-md mx-auto leading-relaxed">
          Your face vs a random stranger. <br/>The algorithm decides who mogs.
        </p>
        
        <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#ff2d78' }}>
          Mog or be mogged.
        </p>
      </motion.div>

      {/* ── HERO CARD (ARENA) ────────────────────── */}
      <motion.div
        className="card container-sm mb-10"
        style={{ padding: '32px 24px', position: 'relative', zIndex: 1, background: 'rgba(10,10,14,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* VS visual */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <motion.div
            className="avatar-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,245,212,0.1), rgba(0,245,212,0.02))',
              border: '2px solid rgba(0,245,212,0.3)',
              fontSize: 32,
            }}
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🧑
          </motion.div>

          <motion.div
            className="font-display"
            style={{ fontSize: 48, color: '#4a4a5a', textShadow: '0 0 24px rgba(255,255,255,0.1)' }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            VS
          </motion.div>

          <motion.div
            className="avatar-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255,45,120,0.1), rgba(255,45,120,0.02))',
              border: '2px solid rgba(255,45,120,0.3)',
              fontSize: 32,
            }}
            animate={{ rotate: [0, -5, 0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          >
            🧑
          </motion.div>
        </div>

        {/* Meme quote */}
        <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIdx}
              className="text-secondary italic text-center leading-relaxed"
              style={{ fontSize: 14, fontWeight: 500 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45 }}
            >
              {MEME_QUOTES[quoteIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* CTA */}
        <motion.button
          id="enter-battle-btn"
          className="btn flex flex-col items-center justify-center"
          style={{ 
            width: '100%', 
            borderRadius: 16, 
            background: 'linear-gradient(135deg, #ff2d78, #a855f7)', 
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 0 40px rgba(255, 45, 120, 0.4)',
            padding: '20px 0',
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 0 60px rgba(255, 45, 120, 0.7)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/battle')}
        >
          <div className="flex items-center gap-3 text-white font-display uppercase tracking-[0.1em]" style={{ fontSize: 28, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            <Zap size={24} strokeWidth={3} fill="currentColor" />
            ENTER THE ARENA
          </div>
          <span className="text-xs text-white opacity-80 mt-1 font-medium tracking-wide">The AI has no mercy.</span>
        </motion.button>

        {/* Friend Battle */}
        <motion.button
          id="friend-battle-btn"
          className="btn btn-ghost w-full mt-4"
          style={{ width: '100%', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}
          whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.06)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/battle?mode=friend')}
        >
          <Link2 size={16} /> Challenge a Specific Friend
        </motion.button>

        <p className="text-center text-muted mt-5" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Webcam required · 18+ · Entertainment purposes only
        </p>
      </motion.div>

      {/* ── STATS ────────────────────────── */}
      <motion.div
        className="flex justify-center gap-10 text-center mb-10 w-full max-w-md"
        style={{ position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        {[
          { label: 'Battles Today', value: '12,847' },
          { label: 'Avg Score',     value: '6.4' },
        ].map(s => (
          <div key={s.label}>
            <div className="font-display text-white" style={{ fontSize: 32, textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>{s.value}</div>
            <div className="text-muted text-xs font-bold uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* ── LEADERBOARD PREVIEW ─────────────────── */}
      <motion.div
        className="container-sm mb-12"
        style={{ position: 'relative', zIndex: 1, padding: '24px', borderRadius: 20, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <Trophy size={16} color="#fbbf24" />
            <h3 className="font-display text-lg tracking-wider text-white">LIVE RANKINGS</h3>
          </div>
          <a href="/leaderboard" className="text-xs text-muted hover:text-white transition-colors uppercase font-bold tracking-wider">View Top 100 →</a>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { rank: 1, name: 'GigaChad99', elo: 2450 },
            { rank: 2, name: 'SymmetryGod', elo: 2310 },
            { rank: 3, name: 'HunterEyes', elo: 2285 },
          ].map((p, i) => (
            <div key={p.rank} className="flex items-center justify-between p-3 rounded-xl" style={{ background: i === 0 ? 'linear-gradient(90deg, rgba(251,191,36,0.1), transparent)' : 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-4">
                <span className="font-display text-muted w-4 text-center">{p.rank}</span>
                <span className="font-medium text-sm text-gray-200">{p.name}</span>
              </div>
              <span className="font-display text-white" style={{ textShadow: i === 0 ? '0 0 10px rgba(251,191,36,0.5)' : 'none' }}>{p.elo}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── HOW IT WORKS ─────────────────── */}
      <motion.div
        className="container-sm"
        style={{ position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        <p className="text-center text-muted text-xs font-bold uppercase tracking-widest mb-6">
          Rules of the Arena
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { step: '01', text: 'Allow camera access' },
            { step: '02', text: 'Get matched with a random stranger' },
            { step: '03', text: 'AI analyzes attractiveness & symmetry' },
            { step: '04', text: 'One player gets mogged' },
          ].map(item => (
            <div key={item.step} className="flex items-center gap-4" style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <span className="font-display" style={{ fontSize: 24, width: 30, flexShrink: 0, color: 'rgba(255,255,255,0.15)' }}>{item.step}</span>
              <span className="text-gray-300 text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── FOOTER / LEGAL ─────────────────── */}
      <div className="text-center mt-16" style={{ position: 'relative', zIndex: 1 }}>
        <p className="text-muted text-xs mb-3 font-medium">We do not sell your data. The AI already roasted you for free.</p>
        <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#4b5563' }}>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
          <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
        </div>
      </div>
    </main>
  );
}
