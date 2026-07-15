'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { initGSI, renderGSIButton, whenGSIReady } from '@/lib/gsi';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function LoginPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);
  const isSignedIn = !!user;

  useEffect(() => {
    return whenGSIReady(() => {
      initGSI(handleGoogleCredential);
      renderGSIButton(btnRef.current, 300);
    });
  }, []);

  async function handleGoogleCredential(response: { credential: string }) {
    setLoading(true); setError('');
    try {
      const existingSession = localStorage.getItem('omogl_session');
      const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential, sessionId: existingSession }),
      });
      if (!res.ok) throw new Error('Google sign-in failed');
      const data = await res.json();
      localStorage.setItem('omogl_session', data.sessionId);
      localStorage.setItem('omogl_user', JSON.stringify(data.user));
      window.dispatchEvent(new StorageEvent('storage', { key: 'omogl_user', newValue: JSON.stringify(data.user) }));
      setSuccess(true);
      const redirect = new URLSearchParams(window.location.search).get('redirect') || '/';
      setTimeout(() => router.push(redirect), 1000);
    } catch (e: any) { setError(e.message || 'Something went wrong'); }
    finally { setLoading(false); }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setUnverified(false);
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/email/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.unverified) { setUnverified(true); return; }
        return setError(data.error || 'Login failed.');
      }
      localStorage.setItem('omogl_session', data.sessionId);
      localStorage.setItem('omogl_user', JSON.stringify(data.user));
      window.dispatchEvent(new StorageEvent('storage', { key: 'omogl_user', newValue: JSON.stringify(data.user) }));
      setSuccess(true);
      const redirect = new URLSearchParams(window.location.search).get('redirect') || '/';
      setTimeout(() => router.push(redirect), 1000);
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  async function handleResendVerify() {
    setResendSent(false);
    await fetch(`${BACKEND_URL}/api/auth/email/resend-verify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setResendSent(true);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 10, boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#f8fafc', fontSize: 14, outline: 'none', fontFamily: 'inherit',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#050508',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,245,212,0.08) 0%, transparent 70%)' }} />
      </div>

      <div style={{
        position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24,
        padding: '48px 40px', width: '100%', maxWidth: 420,
        textAlign: 'center', backdropFilter: 'blur(20px)',
        boxShadow: '0 0 60px rgba(168,85,247,0.1)',
      }}>
        <a href="/" style={{ display: 'inline-block', marginBottom: 32 }}>
          <img src="/logo.png" alt="Omogl" style={{ height: 56, objectFit: 'contain' }} />
        </a>

        {isSignedIn ? (
          <>
            <div style={{ marginBottom: 20 }}>
              {user.photoURL && <img src={user.photoURL} alt={user.displayName} style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid rgba(168,85,247,0.5)', margin: '0 auto 12px', display: 'block' }} />}
              <h1 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{user.displayName}</h1>
              <p style={{ color: '#64748b', fontSize: 14 }}>{user.email}</p>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
              {[{ label: 'ELO', value: user.elo }, { label: 'Wins', value: user.wins }, { label: 'Losses', value: user.losses }].map(({ label, value }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 16px', minWidth: 72 }}>
                  <div style={{ color: '#a855f7', fontSize: 18, fontWeight: 700 }}>{value}</div>
                  <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
            <button onClick={() => router.push('/')} style={{ width: '100%', padding: '14px', borderRadius: 99, background: 'linear-gradient(135deg, #a855f7, #7c3aed)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 12 }}>⚔️ Go to Arena</button>
            <button onClick={signOut} style={{ width: '100%', padding: '12px', borderRadius: 99, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', fontSize: 14, cursor: 'pointer' }}>Sign out</button>
          </>
        ) : (
          <>
            <h1 style={{ color: '#f8fafc', fontSize: 26, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>Join the Arena</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Sign in to track your ELO and climb the leaderboard.</p>

            {success ? (
              <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: 14, fontWeight: 600 }}>✅ Signed in! Redirecting…</div>
            ) : (
              <>
                {/* Google */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <div ref={btnRef} id="google-signin-btn" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                  <span style={{ color: '#334155', fontSize: 12 }}>or</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                </div>

                {/* Email login form */}
                <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
                  <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                  <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />

                  <div style={{ textAlign: 'right', marginTop: -4 }}>
                    <Link href="/forgot-password" style={{ color: '#64748b', fontSize: 12, textDecoration: 'none' }}>Forgot password?</Link>
                  </div>

                  {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>⚠️ {error}</p>}
                  {unverified && (
                    <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8, padding: '12px', fontSize: 13 }}>
                      <p style={{ color: '#fbbf24', margin: '0 0 8px' }}>⚠️ Email not verified yet.</p>
                      {resendSent
                        ? <p style={{ color: '#4ade80', margin: 0, fontSize: 12 }}>✓ New link sent! Check your inbox.</p>
                        : <button type="button" onClick={handleResendVerify} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', fontSize: 12, padding: 0, textDecoration: 'underline' }}>Resend verification email</button>
                      }
                    </div>
                  )}

                  <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: 10, border: 'none', background: loading ? 'rgba(168,85,247,0.4)' : 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                    {loading ? 'Signing in…' : 'Log In'}
                  </button>
                </form>

                <p style={{ color: '#475569', fontSize: 13, marginTop: 24 }}>
                  Don't have an account?{' '}
                  <Link href="/signup" style={{ color: '#a855f7', fontWeight: 600, textDecoration: 'none' }}>Create Account</Link>
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
