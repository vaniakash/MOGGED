'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Camera, Crosshair, ScanFace, Skull, X } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

import { initGSI as initGSISingleton, renderGSIButton, whenGSIReady } from '@/lib/gsi';

const PHRASES = [
  "THE INTERNET'S FACE ARENA",
  "MOG OR GET MOGGED",
  "ONLY ONE FACE WINS",
  "PROVE YOUR GENETICS",
];

const NATIONALITIES = [
  'Afghan','Albanian','Algerian','American','Andorran','Angolan','Argentine','Armenian','Australian',
  'Austrian','Azerbaijani','Bahraini','Bangladeshi','Belarusian','Belgian','Bolivian','Bosnian',
  'Brazilian','British','Bulgarian','Cambodian','Cameroonian','Canadian','Chilean','Chinese',
  'Colombian','Congolese','Croatian','Cuban','Czech','Danish','Dominican','Dutch','Ecuadorian',
  'Egyptian','Emirati','Estonian','Ethiopian','Filipino','Finnish','French','Georgian','German',
  'Ghanaian','Greek','Guatemalan','Honduran','Hungarian','Indian','Indonesian','Iranian','Iraqi',
  'Irish','Israeli','Italian','Jamaican','Japanese','Jordanian','Kazakhstani','Kenyan','Korean',
  'Kuwaiti','Kyrgyz','Lebanese','Libyan','Lithuanian','Malaysian','Mexican','Moroccan','Nepalese',
  'New Zealander','Nigerian','Norwegian','Omani','Pakistani','Panamanian','Paraguayan','Peruvian',
  'Polish','Portuguese','Qatari','Romanian','Russian','Saudi','Senegalese','Serbian','Singaporean',
  'Slovakian','Slovenian','Somali','South African','Spanish','Sri Lankan','Sudanese','Swedish',
  'Swiss','Syrian','Taiwanese','Tanzanian','Thai','Tunisian','Turkish','Ugandan','Ukrainian',
  'Uruguayan','Uzbek','Venezuelan','Vietnamese','Yemeni','Zimbabwean','Other',
];

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  elo: number;
  wins: number;
  losses: number;
  profileComplete?: boolean;
  username?: string;
  nationality?: string;
  age?: number;
  gender?: string;
}

type ModalStep = 'login' | 'profile' | null;

export default function HomepageHero() {
  const router = useRouter();
  const btnRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted]         = useState(false);
  const [countIdx, setCountIdx]       = useState(0);
  const [user, setUser]               = useState<UserProfile | null>(null);
  const [sessionId, setSessionId]     = useState<string | null>(null);
  const [gsiReady, setGsiReady]       = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError]    = useState('');

  // Modal state
  const [modalStep, setModalStep] = useState<ModalStep>(null);

  // Profile form state
  const [pUsername, setPUsername]       = useState('');
  const [pNationality, setPNationality] = useState('');
  const [pAge, setPAge]                 = useState('');
  const [pGender, setPGender]           = useState('');
  const [pLoading, setPLoading]         = useState(false);
  const [pError, setPError]             = useState('');

  // ── Load from localStorage + refresh from server ────────────────────────
  useEffect(() => {
    setMounted(true);
    const storedUser    = localStorage.getItem('omogl_user');
    const storedSession = localStorage.getItem('omogl_session');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch {}
    }
    if (storedSession) {
      setSessionId(storedSession);
      // Refresh user data from server to ensure profileComplete is up-to-date
      fetch(`${BACKEND_URL}/api/me?sessionId=${storedSession}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.user) {
            localStorage.setItem('omogl_user', JSON.stringify(data.user));
            setUser(data.user);
          }
        })
        .catch(() => {}); // silently ignore — localStorage data is still used
    }
    const t1 = setInterval(() => setCountIdx(i => (i + 1) % PHRASES.length), 2800);
    return () => clearInterval(t1);
  }, []);


  useEffect(() => {
    if (!mounted) return;
    return whenGSIReady(() => {
      initGSISingleton(handleCredential);
      renderGSIButton(btnRef.current, Math.min(300, window.innerWidth - 64));
      setGsiReady(true);
    });
  }, [mounted]);

  // ── Re-render GSI button inside modal ──────────────────────────────────
  const modalBtnRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (modalStep !== 'login' || !modalBtnRef.current) return;
    const timer = setTimeout(() => renderGSIButton(modalBtnRef.current, 280), 200);
    return () => clearTimeout(timer);
  }, [modalStep]);

  // ── Google credential handler ───────────────────────────────────────────
  async function handleCredential(response: { credential: string }) {
    setSignInLoading(true);
    setSignInError('');
    try {
      const existingSession = localStorage.getItem('omogl_session');
      const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential, sessionId: existingSession }),
      });
      if (!res.ok) throw new Error('Sign-in failed');
      const data = await res.json();
      localStorage.setItem('omogl_session', data.sessionId);
      localStorage.setItem('omogl_user', JSON.stringify(data.user));
      setUser(data.user);
      setSessionId(data.sessionId);
      // Notify AuthProvider — storage event only fires cross-tab, so dispatch manually
      window.dispatchEvent(new StorageEvent('storage', { key: 'omogl_user', newValue: JSON.stringify(data.user) }));

      // Check if profile is complete
      if (!data.user.profileComplete) {
        // Pre-fill name from Google
        setPUsername(data.user.displayName || '');
        setModalStep('profile');
      } else {
        setModalStep(null);
        // If they were trying to enter arena, go now
        router.push('/battle');
      }
    } catch (err: any) {
      setSignInError('Sign-in failed. Please try again.');
    } finally {
      setSignInLoading(false);
    }
  }

  // ── Enter Arena click — zero friction, instant entry ─────────────────────
  function handleEnterArena() {
    // Fire-and-forget: track the arena button press
    fetch(`${BACKEND_URL}/api/arena/press`, { method: 'POST' }).catch(() => {});
    router.push('/battle');
  }

  // ── Stranger Love click ─────────────────────────────────────────────────
  function handleStrangerLove() {
    router.push('/chat');
  }

  // ── Profile form submit ─────────────────────────────────────────────────
  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pUsername.trim()) { setPError('Please enter a username.'); return; }
    if (!pNationality)     { setPError('Please select your nationality.'); return; }
    if (!pAge || parseInt(pAge) < 13) { setPError('You must be at least 13 years old.'); return; }
    if (!pGender)          { setPError('Please select your gender.'); return; }

    setPLoading(true);
    setPError('');
    try {
      const sid = localStorage.getItem('omogl_session');
      const res = await fetch(`${BACKEND_URL}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          username: pUsername.trim(),
          nationality: pNationality,
          age: parseInt(pAge),
          gender: pGender,
        }),
      });
      if (!res.ok) throw new Error('Could not save profile');
      const data = await res.json();
      const updatedUser = { ...user!, ...data.user, profileComplete: true };
      localStorage.setItem('omogl_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      // Notify AuthProvider — storage event only fires cross-tab, so dispatch manually
      window.dispatchEvent(new StorageEvent('storage', { key: 'omogl_user', newValue: JSON.stringify(updatedUser) }));
      setModalStep(null);
      router.push('/battle');
    } catch (err: any) {
      setPError(err.message || 'Something went wrong');
    } finally {
      setPLoading(false);
    }
  }

  function handleSignOut() {
    localStorage.removeItem('omogl_user');
    localStorage.removeItem('omogl_session');
    setUser(null);
    setSessionId(null);
    // Notify AuthProvider — storage event only fires cross-tab, so dispatch manually
    window.dispatchEvent(new StorageEvent('storage', { key: 'omogl_user', newValue: null }));
    const g = (window as any).google;
    if (g?.accounts?.id) g.accounts.id.disableAutoSelect();
    setTimeout(() => {
      const g2 = (window as any).google;
      if (g2?.accounts?.id && btnRef.current) {
        renderGSIButton(btnRef.current, 300);
      }
    }, 100);
  }

  if (!mounted) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 10,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#f8fafc', fontSize: 14, outline: 'none',
    fontFamily: 'inherit', transition: 'border-color 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', color: '#64748b', fontSize: 11,
    fontWeight: 700, marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: '0.06em',
  };

  return (
    <>
      {/* ════════════════════════ MODAL OVERLAY ════════════════════════ */}
      <AnimatePresence>
        {modalStep && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(5,5,8,0.88)',
              backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 16,
            }}
            onClick={e => { if (e.target === e.currentTarget) setModalStep(null); }}
          >
            <motion.div
              key="modal-card"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{
                background: '#0d0d14',
                border: '1px solid rgba(168,85,247,0.25)',
                borderRadius: 24, width: '100%', maxWidth: 440,
                boxShadow: '0 0 80px rgba(168,85,247,0.15)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setModalStep(null)}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%', width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#64748b',
                }}
              >
                <X size={16} />
              </button>

              {/* Purple glow top */}
              <div style={{
                position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
                width: 300, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* ── STEP 1: LOGIN ─────────────────────────────────────── */}
              {modalStep === 'login' && (
                <div style={{ padding: '44px 36px 36px', textAlign: 'center', position: 'relative' }}>
                  {/* Step indicator */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
                    <span style={{ width: 24, height: 4, borderRadius: 99, background: '#a855f7' }} />
                    <span style={{ width: 24, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.1)' }} />
                  </div>

                  <div style={{ fontSize: 36, marginBottom: 12 }}>⚔️</div>
                  <h2 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                    Enter The Arena
                  </h2>
                  <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
                    Sign in with Google to battle, track your ELO, and climb the global leaderboard.
                  </p>

                  {/* Google sign-in button */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <div ref={modalBtnRef} id="modal-google-btn" />
                  </div>

                  {signInLoading && (
                    <motion.p
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ color: '#a855f7', fontSize: 13, marginTop: 8 }}
                    >
                      Signing in…
                    </motion.p>
                  )}
                  {signInError && (
                    <p style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>⚠️ {signInError}</p>
                  )}

                  <div style={{
                    marginTop: 24, padding: '14px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12, fontSize: 12, color: '#334155', lineHeight: 1.7,
                  }}>
                    By continuing you agree to our{' '}
                    <a href="/terms" style={{ color: '#a855f7' }}>Terms</a> &amp;{' '}
                    <a href="/privacy" style={{ color: '#a855f7' }}>Privacy Policy</a>.
                    We never store or sell your facial data.
                  </div>
                </div>
              )}

              {/* ── STEP 2: PROFILE COMPLETION ───────────────────────── */}
              {modalStep === 'profile' && (
                <div style={{ padding: '44px 36px 36px', position: 'relative' }}>
                  {/* Step indicator */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
                    <span style={{ width: 24, height: 4, borderRadius: 99, background: '#4ade80' }} />
                    <span style={{ width: 24, height: 4, borderRadius: 99, background: '#a855f7' }} />
                  </div>

                  {user?.photoURL && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                      <img
                        src={user.photoURL}
                        alt="avatar"
                        style={{
                          width: 60, height: 60, borderRadius: '50%',
                          border: '2px solid rgba(168,85,247,0.5)',
                        }}
                      />
                    </div>
                  )}

                  <h2 style={{ color: '#f8fafc', fontSize: 20, fontWeight: 800, textAlign: 'center', marginBottom: 4 }}>
                    Complete Your Profile
                  </h2>
                  <p style={{ color: '#475569', fontSize: 13, textAlign: 'center', marginBottom: 28 }}>
                    Just a few details before you enter the arena
                  </p>

                  <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Username */}
                    <div>
                      <label style={labelStyle}>Arena Name</label>
                      <input
                        id="profile-username"
                        type="text"
                        value={pUsername}
                        onChange={e => setPUsername(e.target.value)}
                        placeholder="Your battle name"
                        maxLength={32}
                        required
                        style={inputStyle}
                      />
                    </div>

                    {/* Nationality */}
                    <div>
                      <label style={labelStyle}>Nationality 🌍</label>
                      <select
                        id="profile-nationality"
                        value={pNationality}
                        onChange={e => setPNationality(e.target.value)}
                        required
                        style={{ ...inputStyle, cursor: 'pointer' }}
                      >
                        <option value="" disabled>Select your nationality…</option>
                        {NATIONALITIES.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    {/* Age */}
                    <div>
                      <label style={labelStyle}>Age</label>
                      <input
                        id="profile-age"
                        type="number"
                        value={pAge}
                        onChange={e => setPAge(e.target.value)}
                        placeholder="Your age (13+)"
                        min={13} max={120}
                        required
                        style={inputStyle}
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label style={labelStyle}>Gender</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                          { value: 'male', label: '♂ Male' },
                          { value: 'female', label: '♀ Female' },
                          { value: 'other', label: '⚧ Other' },
                          { value: 'prefer_not', label: '🤐 Prefer not' },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            id={`gender-${opt.value}`}
                            onClick={() => setPGender(opt.value)}
                            style={{
                              padding: '11px 8px', borderRadius: 10, fontSize: 13,
                              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                              transition: 'all 0.15s',
                              background: pGender === opt.value
                                ? 'rgba(168,85,247,0.2)'
                                : 'rgba(255,255,255,0.04)',
                              border: pGender === opt.value
                                ? '1px solid rgba(168,85,247,0.6)'
                                : '1px solid rgba(255,255,255,0.1)',
                              color: pGender === opt.value ? '#a855f7' : '#64748b',
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {pError && (
                      <div style={{
                        padding: '11px 14px', borderRadius: 10,
                        background: 'rgba(248,113,113,0.1)',
                        border: '1px solid rgba(248,113,113,0.3)',
                        color: '#f87171', fontSize: 13,
                      }}>
                        ⚠️ {pError}
                      </div>
                    )}

                    <button
                      id="profile-submit-btn"
                      type="submit"
                      disabled={pLoading}
                      style={{
                        padding: '15px', borderRadius: 10, border: 'none',
                        background: pLoading
                          ? 'rgba(168,85,247,0.3)'
                          : 'linear-gradient(135deg, #a855f7, #7c3aed)',
                        color: '#fff', fontWeight: 800, fontSize: 16,
                        cursor: pLoading ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', marginTop: 4,
                        boxShadow: '0 4px 24px rgba(168,85,247,0.3)',
                      }}
                    >
                      {pLoading ? 'Saving…' : '⚔️ Enter the Arena →'}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════ MAIN HERO CONTENT ════════════════════ */}
      <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>

        {/* ── LIVE TICKER BAR ─────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              borderRadius: 9999, background: '#0f1115',
              border: '1px solid #1e222a', padding: '10px 24px',
              display: 'flex', alignItems: 'center', gap: 16,
              fontSize: 13, fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase', color: '#f8fafc',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171' }} />
            <AnimatePresence mode="wait">
              <motion.span
                key={countIdx}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }}
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
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 8 }}
          >
            <div style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: 'clamp(72px, 14vw, 140px)',
              lineHeight: 0.9, letterSpacing: '0.02em', color: '#f8fafc',
            }}>
              <span style={{ display: 'block' }}>MOG</span>
              <span style={{ display: 'block', color: '#64748b' }}>OR GET</span>
              <span style={{ display: 'block' }}>MOGGED</span>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{
              textAlign: 'center', color: '#94a3b8',
              fontSize: 'clamp(13px, 2vw, 16px)', fontWeight: 500,
              letterSpacing: '0.05em', marginBottom: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <span style={{
              display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
              background: '#4ade80',
              boxShadow: '0 0 0 0 rgba(74,222,128,0.7)',
              animation: 'pulse-dot 1.8s ease-in-out infinite',
            }} />
            500+ users active
          </motion.p>
          <style>{`
            @keyframes pulse-dot {
              0%   { box-shadow: 0 0 0 0 rgba(74,222,128,0.7); }
              70%  { box-shadow: 0 0 0 8px rgba(74,222,128,0); }
              100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); }
            }
          `}</style>

          {/* ── BATTLE CARD ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid #1e222a', background: '#0f1115',
              marginBottom: 16,
            }}
          >
            <div style={{ padding: 'clamp(24px, 5vw, 40px)' }}>


              {/* CTA Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* ── ENTER ARENA — requires login ── */}
                <button
                  id="enter-battle-btn"
                  onClick={handleEnterArena}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 8, border: 'none',
                    background: '#f8fafc', color: '#050508', fontFamily: 'inherit',
                    fontSize: 16, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 10, transition: 'background 0.2s', position: 'relative',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
                >
                  ⚔️ Enter The Arena
                </button>

              </div>
            </div>

            <div style={{
              padding: '16px', textAlign: 'center', fontSize: 11,
              color: '#475569', fontWeight: 500, letterSpacing: '0.04em',
              borderTop: '1px solid #1e222a',
            }}>
              WEBCAM REQUIRED · 18+ · ENTERTAINMENT ONLY · AI JUDGED
            </div>
          </motion.div>

          {/* ── GOOGLE SIGN-IN / ACCOUNT CARD ────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            style={{
              borderRadius: 16, border: '1px solid #1e222a',
              background: '#0f1115', marginBottom: 48, overflow: 'hidden',
            }}
          >
            {user ? (
              <div style={{
                padding: '20px 24px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="avatar" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(168,85,247,0.4)' }} />
                  ) : (
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg,#a855f7,#7c3aed)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 18,
                    }}>
                      {(user.username || user.displayName)?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 15 }}>
                      {user.username || user.displayName}
                      {user.nationality && (
                        <span style={{ color: '#64748b', fontSize: 12, fontWeight: 400, marginLeft: 6 }}>
                          · {user.nationality}
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>
                      <span style={{ color: '#a855f7', fontWeight: 700 }}>{user.elo} ELO</span>
                      {' · '}
                      <span style={{ color: '#4ade80' }}>{user.wins}W</span>
                      {' / '}
                      <span style={{ color: '#f87171' }}>{user.losses}L</span>
                      {!user.profileComplete && (
                        <span style={{
                          marginLeft: 8, padding: '2px 7px', borderRadius: 99,
                          background: 'rgba(251,191,36,0.15)', color: '#fbbf24',
                          fontSize: 10, fontWeight: 700, border: '1px solid rgba(251,191,36,0.3)',
                        }}>
                          Complete profile
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => router.push('/leaderboard')}
                    style={{
                      padding: '8px 14px', borderRadius: 8, border: '1px solid #2a2f3a',
                      background: '#181b21', color: '#94a3b8', fontFamily: 'inherit',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    🏆 Leaderboard
                  </button>
                  <button
                    id="signout-btn"
                    onClick={handleSignOut}
                    style={{
                      padding: '8px 14px', borderRadius: 8,
                      border: '1px solid rgba(248,113,113,0.2)',
                      background: 'rgba(248,113,113,0.08)',
                      color: '#f87171', fontFamily: 'inherit',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
                }}>
                  <div>
                    <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                      🏆 Track Your ELO
                    </div>
                    <div style={{ color: '#475569', fontSize: 13 }}>
                      Sign in to save battle history &amp; climb the leaderboard
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <a href="/login" style={{
                      padding: '10px 22px', borderRadius: 99,
                      background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                      color: '#fff', fontWeight: 700, fontSize: 14,
                      textDecoration: 'none', whiteSpace: 'nowrap',
                    }}>Log In</a>
                    <a href="/signup" style={{
                      padding: '10px 22px', borderRadius: 99,
                      background: 'transparent',
                      border: '1px solid rgba(168,85,247,0.4)',
                      color: '#a855f7', fontWeight: 700, fontSize: 14,
                      textDecoration: 'none', whiteSpace: 'nowrap',
                    }}>Create Account</a>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* ── HOW IT WORKS ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ marginBottom: 48 }}
          >
            <p style={{
              textAlign: 'center', fontSize: 12, fontWeight: 600,
              color: '#64748b', letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 24,
            }}>How It Works</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              {[
                { num: '1', icon: <Camera size={24} color="#f8fafc" strokeWidth={1.5} />, title: 'Sign In', desc: 'Login with Google & complete your profile' },
                { num: '2', icon: <Crosshair size={24} color="#f8fafc" strokeWidth={1.5} />, title: 'Get Matched', desc: 'Paired with a random stranger' },
                { num: '3', icon: <ScanFace size={24} color="#f8fafc" strokeWidth={1.5} />, title: 'AI Judges', desc: '468 facial landmarks scanned' },
                { num: '4', icon: <Skull size={24} color="#f8fafc" strokeWidth={1.5} />, title: 'Verdict', desc: 'MOG or get MOGGED. No mercy.' },
              ].map(step => (
                <div key={step.num} style={{
                  padding: '24px 16px', borderRadius: 12,
                  background: '#0f1115', border: '1px solid #1e222a', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 16 }}>STEP {step.num}</div>
                  <div style={{ fontSize: 24, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{step.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc', marginBottom: 6 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.4 }}>{step.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
}
