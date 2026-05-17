'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Swords, Check, Camera, ScanFace, Trophy, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const StepCard = ({ num, title, desc, icon }: any) => (
  <div className="flex-1 rounded-2xl p-5 flex flex-col gap-3 w-full" style={{ background: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 flex items-center justify-center rounded bg-black border border-white/10 text-xs font-mono text-gray-400">
        {num}
      </div>
      <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-200">{title}</h3>
    </div>
    <p className="text-[11px] text-gray-500 leading-relaxed flex gap-2 items-start mt-1">
      <span className="mt-0.5">{icon}</span>
      {desc}
    </p>
  </div>
);

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return null; // Avoid hydration mismatch on initial render

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* TOP BAR */}
      <div className="w-full flex justify-between items-center px-4 py-3" style={{ backgroundColor: '#050505', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">👻</span>
        </div>
        <div className="text-gray-400 font-mono flex-1 text-center" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
          You're playing as a Guest. Click here to claim your rank with Google.
        </div>
        <button className="px-4 py-1.5 rounded-full border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors" style={{ fontSize: '9px', letterSpacing: '0.15em', fontWeight: 600 }}>
          CLAIM
        </button>
      </div>

      {/* GLOW BACKGROUND */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '1000px', height: '400px', background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-5xl mx-auto" style={{ position: 'relative', zIndex: 1, paddingBottom: '60px', paddingTop: '40px' }}>
        
        {/* TOP BADGE */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#a855f7', boxShadow: '0 0 10px #a855f7' }} />
          <span className="text-gray-300 font-mono uppercase" style={{ fontSize: '9px', letterSpacing: '0.15em' }}>LIVE 1V1 MOG ARENA</span>
        </div>

        {/* LOGO */}
        <h1 className="font-display tracking-tighter" style={{ fontSize: 'clamp(60px, 14vw, 150px)', lineHeight: 0.85, marginBottom: 24, textShadow: '0 0 50px rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800 }}>
          OMMOGLE
        </h1>

        {/* ONLINE BADGE */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full mb-12" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          <span className="font-mono uppercase font-bold" style={{ fontSize: '9px', letterSpacing: '0.15em', color: '#10b981' }}>1501 ONLINE</span>
        </div>

        {/* MAIN CARD */}
        <motion.div 
          className="w-full max-w-3xl rounded-[32px] flex flex-col items-center justify-center cursor-pointer group mb-8"
          style={{ background: 'linear-gradient(180deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.8) 100%)', border: '1px solid rgba(255,255,255,0.05)', padding: '60px 20px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
          whileHover={{ scale: 1.01, borderColor: 'rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.99 }}
          onClick={() => router.push('/battle')}
        >
          <div className="relative mb-8">
            <Swords size={56} strokeWidth={1} color="#fff" className="opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-md" />
            <motion.div 
              className="absolute top-0 right-0 w-2 h-2 rounded-full bg-yellow-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ transform: 'translate(50%, -50%)', boxShadow: '0 0 10px #facc15' }}
            />
          </div>
          
          <h2 className="text-xl sm:text-2xl tracking-[0.25em] font-bold text-white mb-8 text-center uppercase">ENTER THE ARENA</h2>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-full transition-colors group-hover:bg-[#064e3b]" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <Check size={12} color="#10b981" />
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: '#10b981' }}>VERIFIED · FIND MATCH</span>
          </div>
        </motion.div>

        {/* 3 STEPS CARDS */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-4 mt-2">
          <StepCard 
            num="1" 
            title="CAMERA CHECK" 
            desc="Complete a quick camera check to get started." 
            icon={<Camera size={14} className="opacity-70 mt-0.5" />} 
          />
          <ChevronRight size={16} className="hidden md:block text-gray-700 shrink-0" />
          <StepCard 
            num="2" 
            title="SOLO PSL SCAN" 
            desc="Take a Solo PSL Scan to verify you mog." 
            icon={<span className="text-[12px] mt-0.5">🧪</span>} 
          />
          <ChevronRight size={16} className="hidden md:block text-gray-700 shrink-0" />
          <StepCard 
            num="3" 
            title="COMPETE AND CLIMB THE RANKS" 
            desc="Win matches, earn points, and climb the ladder." 
            icon={<Swords size={14} className="text-gray-400 mt-0.5" />} 
          />
        </div>

        {/* LEADERBOARD BUTTON */}
        <motion.div 
          className="w-full max-w-4xl rounded-2xl mt-6 p-5 flex items-center justify-between cursor-pointer group"
          style={{ background: 'linear-gradient(90deg, rgba(30,20,0,0.6) 0%, rgba(15,15,15,0.6) 100%)', border: '1px solid rgba(251, 191, 36, 0.15)' }}
          whileHover={{ scale: 1.01, borderColor: 'rgba(251, 191, 36, 0.3)' }}
          onClick={() => router.push('/leaderboard')}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(251, 191, 36, 0.1)' }}>
              <Trophy size={18} color="#fbbf24" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-500">VIEW LEADERBOARD</span>
              <span className="text-[11px] text-gray-500 mt-1">See top players and rankings.</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-600 group-hover:text-yellow-500 transition-colors" />
        </motion.div>

        {/* SEO EXPANDABLE SECTION */}
        <button 
          onClick={() => setShowSeo(!showSeo)}
          className="mt-16 text-[9px] font-bold tracking-[0.2em] uppercase text-gray-600 hover:text-gray-300 transition-colors flex items-center gap-2"
        >
          {showSeo ? 'HIDE ABOUT OMOGLE' : 'READ ABOUT OMOGLE'}
          <motion.div animate={{ rotate: showSeo ? -90 : 90 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={12} />
          </motion.div>
        </button>

        <AnimatePresence>
          {showSeo && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-3xl text-left overflow-hidden mt-8 border-t border-white/5 pt-8"
            >
              <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-300 mb-3">What is Omogle?</h2>
              <p className="text-[11px] text-gray-500 mb-8 leading-relaxed">
                Omogle is a live AI-powered face battle platform where users compete in realtime webcam matchups against random strangers worldwide. The platform uses artificial intelligence to analyze facial attractiveness, symmetry, confidence, and overall presence to determine winners. Players gain Elo points, climb leaderboards, and compete for top rankings in the global mog arena.
              </p>

              <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-300 mb-3">How Omogle Works</h2>
              <p className="text-[11px] text-gray-500 mb-8 leading-relaxed">
                Users enter live 1v1 face battles using their webcam. Once matched, Omogle’s AI analyzes both participants in real time using face analysis technology and attractiveness scoring systems. Winners receive Elo rating increases while losers lose ranking points. The platform combines random video chat, competitive ranking systems, and AI-powered judging into a single social experience.
              </p>

              <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-300 mb-3">Features</h2>
              <ul className="text-[11px] text-gray-500 mb-12 leading-relaxed grid grid-cols-1 sm:grid-cols-2 gap-2">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-gray-500 rounded-full"/> Live 1v1 webcam battles</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-gray-500 rounded-full"/> AI-powered attractiveness analysis</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-gray-500 rounded-full"/> Real-time face scoring</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-gray-500 rounded-full"/> Global Elo leaderboards</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-gray-500 rounded-full"/> Random stranger matchmaking</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-gray-500 rounded-full"/> Competitive ranking system</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-gray-500 rounded-full"/> Facial symmetry analysis</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-gray-500 rounded-full"/> Live online arena</li>
              </ul>

              <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-300 mb-6 text-center">FREQUENTLY ASKED QUESTIONS</h2>
              <div className="flex flex-col gap-4">
                {[
                  { q: "What is Omogle?", a: "Omogle is an AI-powered live face battle platform where strangers compete in realtime webcam matchups and AI decides who wins based on attractiveness and facial analysis." },
                  { q: "How does the AI judge faces?", a: "Omogle uses AI face analysis systems that evaluate facial symmetry, proportions, confidence, and overall appearance during live battles." },
                  { q: "Is Omogle free?", a: "Yes, users can join live 1v1 face battles and compete in the arena for free." },
                  { q: "Can I play with friends?", a: "Yes, Omogle supports private challenges and friend battles in addition to random matchmaking." },
                  { q: "What is the Elo ranking system?", a: "Elo is a competitive ranking system that increases when players win battles and decreases when they lose." }
                ].map((faq, idx) => (
                  <div key={idx} className="p-4" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <h3 className="font-semibold text-[11px] uppercase tracking-wider text-gray-300 mb-2">
                      {faq.q}
                    </h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FOOTER */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-20 text-[9px] font-bold tracking-[0.2em] uppercase text-gray-600">
          <a href="/privacy-policy" className="hover:text-gray-300 transition-colors">PRIVACY POLICY</a>
          <span className="hidden sm:inline">·</span>
          <a href="/terms" className="hover:text-gray-300 transition-colors">TERMS OF USE</a>
          <span className="hidden sm:inline">·</span>
          <a href="/settings" className="hover:text-gray-300 transition-colors">SETTINGS</a>
        </div>

      </div>
    </main>
  );
}
