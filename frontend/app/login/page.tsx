'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function LoginPage() {
  const { user, signOut, sessionId } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);

  // If already signed in, show account info
  const isSignedIn = !!user;

  useEffect(() => {
    if (typeof window === 'undefined' || !GOOGLE_CLIENT_ID) return;

    // Load GSI script
    const existing = document.getElementById('google-gsi');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'google-gsi';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGSI;
      document.head.appendChild(script);
    } else {
      initGSI();
    }
  }, []);

  function initGSI() {
    const g = (window as any).google;
    if (!g?.accounts?.id) return;

    g.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    if (btnRef.current) {
      g.accounts.id.renderButton(btnRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        width: 280,
        text: 'continue_with',
        logo_alignment: 'left',
      });
    }
  }

  async function handleCredential(response: { credential: string }) {
    setLoading(true);
    setError('');
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

      setSuccess(true);
      setTimeout(() => router.push('/'), 1200);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050508',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,245,212,0.08) 0%, transparent 70%)',
        }} />
      </div>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 400,
        textAlign: 'center',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 60px rgba(168,85,247,0.1)',
      }}>
        {/* Logo */}
        <a href="/" style={{ display: 'inline-block', marginBottom: 32 }}>
          <img src="/logo.png" alt="Omogl" style={{ height: 56, objectFit: 'contain' }} />
        </a>

        {isSignedIn ? (
          /* Already signed in — show account */
          <>
            <div style={{ marginBottom: 20 }}>
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  style={{
                    width: 72, height: 72, borderRadius: '50%',
                    border: '2px solid rgba(168,85,247,0.5)',
                    margin: '0 auto 12px',
                    display: 'block',
                  }}
                />
              )}
              <h1 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                {user.displayName}
              </h1>
              <p style={{ color: '#64748b', fontSize: 14 }}>{user.email}</p>
            </div>

            <div style={{
              display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28,
            }}>
              {[
                { label: 'ELO', value: user.elo },
                { label: 'Wins', value: user.wins },
                { label: 'Losses', value: user.losses },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '10px 16px',
                  minWidth: 72,
                }}>
                  <div style={{ color: '#a855f7', fontSize: 18, fontWeight: 700 }}>{value}</div>
                  <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/')}
              style={{
                width: '100%', padding: '14px', borderRadius: 99,
                background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                border: 'none', color: '#fff', fontWeight: 700, fontSize: 15,
                cursor: 'pointer', marginBottom: 12,
              }}
            >
              ⚔️ Go to Arena
            </button>
            <button
              onClick={signOut}
              style={{
                width: '100%', padding: '12px', borderRadius: 99,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#64748b', fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          /* Sign in view */
          <>
            <h1 style={{
              color: '#f8fafc', fontSize: 26, fontWeight: 800, marginBottom: 8,
              lineHeight: 1.2,
            }}>
              Join the Arena
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
              Sign in to track your ELO, save battle history, and climb the global leaderboard.
            </p>

            {success ? (
              <div style={{
                padding: '16px 20px', borderRadius: 12,
                background: 'rgba(74,222,128,0.1)',
                border: '1px solid rgba(74,222,128,0.3)',
                color: '#4ade80', fontSize: 14, fontWeight: 600,
              }}>
                ✅ Signed in! Redirecting...
              </div>
            ) : (
              <>
                {/* Google sign-in button rendered by GSI */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <div ref={btnRef} id="google-signin-btn" />
                </div>

                {loading && (
                  <p style={{ color: '#a855f7', fontSize: 13, marginTop: 8 }}>
                    Signing in...
                  </p>
                )}
                {error && (
                  <p style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>
                    {error}
                  </p>
                )}
              </>
            )}

            <div style={{
              marginTop: 32,
              padding: '16px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{ color: '#334155', fontSize: 12, lineHeight: 1.7 }}>
                By signing in you agree to our{' '}
                <a href="/terms" style={{ color: '#a855f7' }}>Terms</a> and{' '}
                <a href="/privacy" style={{ color: '#a855f7' }}>Privacy Policy</a>.
                We do not sell your data. Your ELO history is preserved.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
