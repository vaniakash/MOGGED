'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PaymentFailurePage() {
  const router = useRouter();

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
        background: 'radial-gradient(ellipse at center, rgba(248,113,113,0.06) 0%, transparent 60%)',
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(248,113,113,0.25)',
          borderRadius: 28,
          padding: '56px 44px',
          textAlign: 'center',
          maxWidth: 460,
          width: '100%',
          boxShadow: '0 0 60px rgba(248,113,113,0.08)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(248,113,113,0.15)',
            border: '2px solid rgba(248,113,113,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: 36,
          }}
        >
          ✕
        </motion.div>

        <h1 style={{
          fontFamily: 'Bebas Neue, cursive',
          fontSize: 44,
          color: '#f8fafc',
          marginBottom: 12,
          letterSpacing: '0.02em',
        }}>
          Payment Cancelled
        </h1>

        <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
          Your payment didn't go through or was cancelled. No charges were made.{' '}
          Pick a plan and try again — the arena is waiting.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => router.push('/pricing')}
            style={{
              width: '100%', padding: '15px',
              borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              color: '#fff', fontWeight: 800, fontSize: 16,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 24px rgba(168,85,247,0.3)',
            }}
          >
            ⚔️ Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              width: '100%', padding: '13px',
              borderRadius: 12,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#475569', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
