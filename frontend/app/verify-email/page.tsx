'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function VerifyEmailContent() {
  const params = useSearchParams();
  const token  = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Invalid link — no token found.'); return; }
    (async () => {
      try {
        const res  = await fetch(`${BACKEND_URL}/api/auth/email/verify-email`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) { setStatus('error'); setMessage(data.error || 'Verification failed.'); return; }
        // Auto-log them in
        if (data.sessionId) {
          localStorage.setItem('omogl_session', data.sessionId);
          localStorage.setItem('omogl_user', JSON.stringify(data.user));
          window.dispatchEvent(new Event('storage'));
        }
        setStatus('success');
        setMessage(data.message || 'Email verified!');
      } catch { setStatus('error'); setMessage('Network error. Please try again.'); }
    })();
  }, [token]);

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
        boxShadow: `0 0 60px ${status === 'success' ? 'rgba(74,222,128,0.12)' : status === 'error' ? 'rgba(248,113,113,0.12)' : 'rgba(168,85,247,0.1)'}`,
      }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
            <h1 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 700 }}>Verifying your email…</h1>
            <p style={{ color: '#64748b', fontSize: 14 }}>Just a moment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
            <h1 style={{ color: '#4ade80', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>You're in!</h1>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>{message}</p>
            <Link href="/" style={{ display: 'block', padding: '14px', borderRadius: 10, background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              ⚔️ Enter the Arena
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 20 }}>❌</div>
            <h1 style={{ color: '#f87171', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Verification Failed</h1>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>{message}</p>
            <Link href="/login" style={{ display: 'block', padding: '14px', borderRadius: 10, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Verifying…</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
