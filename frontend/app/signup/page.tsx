'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { initGSI, renderGSIButton, whenGSIReady } from '@/lib/gsi';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase', ok: /[a-z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
    { label: 'Special char', ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['#f87171', '#f87171', '#fbbf24', '#4ade80', '#4ade80', '#a855f7'];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i < score ? colors[score] : 'rgba(255,255,255,0.08)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
        {checks.map(c => (
          <span key={c.label} style={{ fontSize: 11, color: c.ok ? '#4ade80' : '#475569' }}>
            {c.ok ? '✓' : '○'} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'email' | 'done'>('email');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) router.replace('/');
  }, [user]);

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
      router.push('/');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/email/signup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Signup failed.');
      setMode('done');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 10, boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#f8fafc', fontSize: 14, outline: 'none', fontFamily: 'inherit',
    transition: 'border 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#050508',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)' }} />
      </div>

      <div style={{
        position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24,
        padding: '44px 40px', width: '100%', maxWidth: 420,
        backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(168,85,247,0.1)',
      }}>
        <a href="/" style={{ display: 'inline-block', marginBottom: 28 }}>
          <img src="/logo.png" alt="Omogl" style={{ height: 48, objectFit: 'contain' }} />
        </a>

        {mode === 'done' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h1 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Check your inbox</h1>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              We sent a verification link to <strong style={{ color: '#a855f7' }}>{email}</strong>. Click it to activate your account.
            </p>
            <Link href="/login" style={{ display: 'block', padding: '13px', borderRadius: 10, background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', textAlign: 'center' }}>
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ color: '#f8fafc', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Create Account</h1>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28 }}>Join the Arena and start climbing the leaderboard.</p>

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
              <div>
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
                <PasswordStrength password={password} />
              </div>
              <input type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={{...inputStyle, borderColor: confirm && confirm !== password ? '#f87171' : 'rgba(255,255,255,0.1)'}} />

              {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>⚠️ {error}</p>}

              <button type="submit" disabled={loading} style={{
                padding: '14px', borderRadius: 10, border: 'none',
                background: loading ? 'rgba(168,85,247,0.4)' : 'linear-gradient(135deg, #a855f7, #7c3aed)',
                color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ color: '#334155', fontSize: 12 }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div ref={btnRef} />
            </div>

            <p style={{ textAlign: 'center', color: '#475569', fontSize: 13, marginTop: 24 }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#a855f7', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
