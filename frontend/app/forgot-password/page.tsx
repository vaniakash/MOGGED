'use client';

import { useState } from 'react';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${BACKEND_URL}/api/auth/email/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Request failed.');
      setSent(true);
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#050508',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, padding: '48px 40px', maxWidth: 420, width: '100%',
        textAlign: 'center', backdropFilter: 'blur(20px)',
        boxShadow: '0 0 60px rgba(168,85,247,0.1)',
      }}>
        <a href="/" style={{ display: 'inline-block', marginBottom: 28 }}>
          <img src="/logo.png" alt="Omogl" style={{ height: 48, objectFit: 'contain' }} />
        </a>

        {sent ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h1 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Check your inbox</h1>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              If an account exists for <strong style={{ color: '#a855f7' }}>{email}</strong>, we've sent a reset link. Check your spam folder too.
            </p>
            <Link href="/login" style={{ display: 'block', padding: '13px', borderRadius: 10, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Back to Login
            </Link>
          </>
        ) : (
          <>
            <h1 style={{ color: '#f8fafc', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Forgot Password?</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Enter your email and we'll send you a link to reset your password.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
              <input
                type="email" placeholder="Email address" value={email}
                onChange={e => setEmail(e.target.value)} required
                style={{ width: '100%', padding: '13px 16px', borderRadius: 10, boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
              />
              {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>⚠️ {error}</p>}
              <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: 10, border: 'none', background: loading ? 'rgba(168,85,247,0.4)' : 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <p style={{ color: '#475569', fontSize: 13, marginTop: 24 }}>
              Remembered it?{' '}
              <Link href="/login" style={{ color: '#a855f7', fontWeight: 600, textDecoration: 'none' }}>Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
