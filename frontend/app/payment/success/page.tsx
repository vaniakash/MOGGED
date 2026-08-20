'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [planName, setPlanName] = useState('');
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const sessionId = localStorage.getItem('omogl_session');
    if (!sessionId) { router.replace('/'); return; }

    // Refresh user from server (subscription is now active)
    fetch(`${BACKEND_URL}/api/me?sessionId=${sessionId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          localStorage.setItem('omogl_user', JSON.stringify(data.user));
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'omogl_user',
            newValue: JSON.stringify(data.user),
          }));
          setPlanName(data.user?.subscription?.planName || 'Premium');
        }
      })
      .catch(() => {});

    // Countdown to arena
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          router.push('/battle');
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050508',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(74,222,128,0.08) 0%, transparent 60%)',
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(74,222,128,0.3)',
          borderRadius: 28,
          padding: '56px 44px',
          textAlign: 'center',
          maxWidth: 460,
          width: '100%',
          boxShadow: '0 0 80px rgba(74,222,128,0.12)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4ade80, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 40px rgba(74,222,128,0.4)',
            fontSize: 36,
          }}
        >
          ✓
        </motion.div>

        <h1 style={{
          fontFamily: 'Bebas Neue, cursive',
          fontSize: 48,
          color: '#f8fafc',
          marginBottom: 12,
          letterSpacing: '0.02em',
        }}>
          Payment Successful!
        </h1>

        {planName && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: 99, padding: '6px 18px', marginBottom: 20,
            fontSize: 13, fontWeight: 700, color: '#a855f7',
          }}>
            🏆 {planName} Activated
          </div>
        )}

        <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
          Your subscription is now active. Welcome to the arena, warrior.
        </p>

        {/* Countdown ring */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 12, marginBottom: 28,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            border: '3px solid rgba(74,222,128,0.3)',
            borderTop: '3px solid #4ade80',
            animation: 'spin 1s linear infinite',
            flexShrink: 0,
          }} />
          <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>
            Entering arena in <strong style={{ color: '#4ade80' }}>{countdown}s</strong>…
          </p>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <button
          onClick={() => router.push('/battle')}
          style={{
            width: '100%', padding: '15px',
            borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #4ade80, #22c55e)',
            color: '#050508', fontWeight: 800, fontSize: 16,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          ⚔️ Enter Arena Now
        </button>
      </motion.div>
    </div>
  );
}
