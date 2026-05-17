'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Zap, Link2, Globe, Users, Target, Activity, HelpCircle } from 'lucide-react';

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Omogle",
    "applicationCategory": "EntertainmentApplication",
    "description": "Live 1v1 face battle platform where strangers compete in real time while AI judges attractiveness, facial symmetry, and overall aura.",
    "operatingSystem": "All",
    "url": "https://omogle.vercel.app",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <main className="page-center" style={{ paddingTop: 64, paddingBottom: 64, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
        <h1 className="font-display flex flex-col" style={{ lineHeight: 0.85, letterSpacing: '0.01em', marginBottom: 24, textTransform: 'uppercase' }}>
          <span className="gradient-text" style={{ fontSize: 'clamp(64px, 15vw, 140px)', textShadow: '0 0 40px rgba(168,85,247,0.3)' }}>OMOGLE</span>
          <span style={{ fontSize: 'clamp(20px, 4vw, 36px)', color: '#00f5d4', marginTop: '16px', letterSpacing: '0.05em' }}>THE INTERNET’S FACE ARENA</span>
        </h1>
        
        <p className="text-secondary text-base md:text-xl font-medium mb-4 max-w-lg mx-auto leading-relaxed">
          Live 1v1 face battles judged by AI. <br/>Compete against random strangers, gain Elo, and climb the global leaderboard.
        </p>
      </motion.div>

      {/* ── HERO CARD (ARENA) ────────────────────── */}
      <motion.div
        className="card container-sm mb-16"
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

      {/* ── SOCIAL PROOF SECTION ─────────────────── */}
      <motion.div
        className="flex flex-wrap justify-center gap-8 text-center mb-16 w-full max-w-3xl px-4"
        style={{ position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        {[
          { label: 'Battles Completed', value: '120k+', icon: <Activity size={24} color="#00f5d4"/> },
          { label: 'Ranked Players',    value: '5k+',   icon: <Users size={24} color="#a855f7"/> },
          { label: 'Countries',         value: '40+',   icon: <Globe size={24} color="#3b82f6"/> },
          { label: 'Live Arena',        value: '24/7',  icon: <Target size={24} color="#ff2d78"/> },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center gap-2">
            {s.icon}
            <div className="font-display text-white" style={{ fontSize: 32, textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>{s.value}</div>
            <div className="text-muted text-xs font-bold uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* ── LONG-FORM SEO CONTENT ─────────────────── */}
      <div className="container-md text-left w-full px-6 mb-16" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
        
        <h2 className="font-display text-2xl text-white mb-4 tracking-wider" style={{ color: '#00f5d4' }}>What is Omogle?</h2>
        <p className="text-gray-300 mb-10 leading-relaxed font-medium">
          Omogle is a live AI-powered face battle platform where users compete in realtime webcam matchups against random strangers worldwide. The platform uses artificial intelligence to analyze facial attractiveness, symmetry, confidence, and overall presence to determine winners. Players gain Elo points, climb leaderboards, and compete for top rankings in the global mog arena.
        </p>

        <h2 className="font-display text-2xl text-white mb-4 tracking-wider" style={{ color: '#ff2d78' }}>How Omogle Works</h2>
        <p className="text-gray-300 mb-10 leading-relaxed font-medium">
          Users enter live 1v1 face battles using their webcam. Once matched, Omogle’s AI analyzes both participants in real time using face analysis technology and attractiveness scoring systems. Winners receive Elo rating increases while losers lose ranking points. The platform combines random video chat, competitive ranking systems, and AI-powered judging into a single social experience.
        </p>

        <h2 className="font-display text-2xl text-white mb-4 tracking-wider" style={{ color: '#a855f7' }}>Features</h2>
        <ul className="text-gray-300 mb-10 leading-relaxed font-medium grid grid-cols-1 sm:grid-cols-2 gap-3">
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full"/> Live 1v1 webcam battles</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full"/> AI-powered attractiveness analysis</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full"/> Real-time face scoring</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full"/> Global Elo leaderboards</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full"/> Random stranger matchmaking</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full"/> Competitive ranking system</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full"/> Facial symmetry analysis</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full"/> Live online arena</li>
        </ul>

      </div>

      {/* ── FAQ SECTION ─────────────────── */}
      <div className="container-md w-full px-6 mb-16" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
        <h2 className="font-display text-2xl text-white mb-8 tracking-wider text-center">FREQUENTLY ASKED QUESTIONS</h2>
        <div className="flex flex-col gap-6">
          {[
            { q: "What is Omogle?", a: "Omogle is an AI-powered live face battle platform where strangers compete in realtime webcam matchups and AI decides who wins based on attractiveness and facial analysis." },
            { q: "How does the AI judge faces?", a: "Omogle uses AI face analysis systems that evaluate facial symmetry, proportions, confidence, and overall appearance during live battles." },
            { q: "Is Omogle free?", a: "Yes, users can join live 1v1 face battles and compete in the arena for free." },
            { q: "Can I play with friends?", a: "Yes, Omogle supports private challenges and friend battles in addition to random matchmaking." },
            { q: "What is the Elo ranking system?", a: "Elo is a competitive ranking system that increases when players win battles and decreases when they lose." }
          ].map((faq, idx) => (
            <div key={idx} className="card p-6" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 className="font-semibold text-lg text-white mb-2 flex items-start gap-2">
                <HelpCircle size={20} color="#00f5d4" className="mt-0.5 shrink-0" />
                {faq.q}
              </h3>
              <p className="text-gray-400 pl-7 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER / LEGAL ─────────────────── */}
      <footer className="w-full text-center mt-8 pt-10 pb-4 border-t border-white/5" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-bold uppercase tracking-wider mb-8 px-4" style={{ color: '#6b7280' }}>
          <a href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</a>
          <a href="/how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="/faq" className="hover:text-white transition-colors">FAQ</a>
          <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-white transition-colors">Terms of Use</a>
          <a href="/rankings" className="hover:text-white transition-colors">Rankings</a>
          <a href="/live-battles" className="hover:text-white transition-colors">Live Battles</a>
        </div>
        
        <p className="text-muted text-xs font-medium">© {new Date().getFullYear()} Omogle. All rights reserved. The AI already roasted you for free.</p>
      </footer>
    </main>
  );
}
