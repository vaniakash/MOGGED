'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function PasswordCheck({ label, ok }: { label: string; ok: boolean }) {
  return <span style={{ fontSize: 11, color: ok ? '#4ade80' : '#475569' }}>{ok ? '✓' : '○'} {label}</span>;
}

function ResetContent() {
  const params   = useSearchParams();
  const router   = useRouter();
  const token    = params.get('token') || '';
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [done, setDone]           = useState(false);

  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase',     ok: /[A-Z]/.test(password) },
    { label: 'Lowercase',     ok: /[a-z]/.test(password) },
    { label: 'Number',        ok: /[0-9]/.test(password) },
    { label: 'Special char',  ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const barColors = ['#f87171', '#f87171', '#fbbf24', '#4ade80', '#4ade80', '#a855f7'];

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      const res  = await fetch(`${BACKEND_URL}/api/auth/email/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Reset failed.');
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 10, boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#f8fafc', fontSize: 14, outline: 'none', fontFamily: 'inherit',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#050508',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, padding: '48px 40px', maxWidth: 420, width: '100%',
        backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(168,85,247,0.1)',
      }}>
        <a href="/" style={{ display: 'inline-block', marginBottom: 28 }}>
          <img src="/logo.png" alt="Omogl" style={{ height: 48, objectFit: 'contain' }} />
        </a>

        {!token ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h1 style={{ color: '#f87171', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Invalid Link</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>This reset link is missing a token. Please request a new one.</p>
            <Link href="/forgot-password" style={{ display: 'block', padding: '13px', borderRadius: 10, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7', fontWeight: 700, fontSize: 14, textDecoration: 'none', textAlign: 'center' }}>
              Request New Link
            </Link>
          </div>
        ) : done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔑</div>
            <h1 style={{ color: '#4ade80', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Password Updated!</h1>
            <p style={{ color: '#64748b', fontSize: 14 }}>Redirecting you to login…</p>
          </div>
        ) : (
          <>
            <h1 style={{ color: '#f8fafc', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Set New Password</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>Choose a strong password for your account.</p>

            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
                {password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                      {[0,1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < score ? barColors[score] : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                      {checks.map(c => <PasswordCheck key={c.label} {...c} />)}
                    </div>
                  </div>
                )}
              </div>
              <input type="password" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={{ ...inputStyle, borderColor: confirm && confirm !== password ? '#f87171' : 'rgba(255,255,255,0.1)' }} />

              {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>⚠️ {error}</p>}

              <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: 10, border: 'none', background: loading ? 'rgba(168,85,247,0.4)' : 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Loading…</div>}>
      <ResetContent />
    </Suspense>
  );
}
