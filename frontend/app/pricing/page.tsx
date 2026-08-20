'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const PLANS = [
  {
    id: 'beginner',
    name: 'Beginner',
    price: '$2.99',
    priceINR: '₹249',
    period: '/month',
    badge: null,
    color: '#00f5d4',
    glow: 'rgba(0,245,212,0.15)',
    features: [
      '⚔️ Unlimited arena battles',
      '📊 ELO ranking & leaderboard',
      '🤖 AI face analysis every match',
      '🏆 Win/Loss tracking',
    ],
    cta: 'Start Fighting',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$4.99',
    priceINR: '₹419',
    period: '/month',
    badge: 'MOST POPULAR',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.18)',
    features: [
      '⚔️ Everything in Beginner',
      '📈 Detailed score breakdown',
      '🔒 Private battle rooms',
      '💬 Stranger chat mode',
      '📸 Looksmax analysis tools',
    ],
    cta: 'Go Premium',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    priceINR: '₹839',
    period: '/month',
    badge: 'BEST VALUE',
    color: '#ff2d78',
    glow: 'rgba(255,45,120,0.15)',
    features: [
      '⚔️ Everything in Premium',
      '🌟 Celebrity match analysis',
      '🔥 Priority matchmaking',
      '📊 Advanced ELO insights',
      '🎯 Hunter Eyes precision test',
      '👑 Pro badge on profile',
    ],
    cta: 'Go Pro',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, sessionId, isLoading, hasActiveSub } = useAuth();
  const [initiating, setInitiating] = useState<string | null>(null);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const [payuData, setPayuData] = useState<Record<string, string> | null>(null);

  // Redirect to arena if already subscribed
  useEffect(() => {
    if (!isLoading && user && hasActiveSub()) {
      router.replace('/battle');
    }
  }, [isLoading, user, hasActiveSub, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?redirect=/pricing');
    }
  }, [isLoading, user, router]);

  // Auto-submit PayU form when payuData is set
  useEffect(() => {
    if (payuData && formRef.current) {
      formRef.current.submit();
    }
  }, [payuData]);

  async function handleSelectPlan(planId: string) {
    if (!sessionId || !user) {
      router.push('/login?redirect=/pricing');
      return;
    }
    setInitiating(planId);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/payment/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          planId,
          email: user.email,
          name: user.displayName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment initiation failed.');
      // Build the PayU form data and trigger auto-submit
      setPayuData(data);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
      setInitiating(null);
    }
  }

  if (isLoading || !user) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050508',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,245,212,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '48px 20px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <a href="/" style={{ display: 'inline-block', marginBottom: 32 }}>
            <img src="/logo.png" alt="Omogl" style={{ height: 52, objectFit: 'contain' }} />
          </a>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)',
              borderRadius: 99, padding: '6px 16px', marginBottom: 20,
              fontSize: 12, fontWeight: 700, color: '#a855f7',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              ⚔️ One Step Away From The Arena
            </div>

            <h1 style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: 'clamp(44px, 7vw, 80px)',
              lineHeight: 1,
              color: '#f8fafc',
              marginBottom: 16,
              letterSpacing: '0.02em',
            }}>
              Choose Your Battle Plan
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: 'clamp(14px, 2vw, 17px)',
              maxWidth: 520,
              margin: '0 auto',
              lineHeight: 1.7,
            }}>
              Pick a plan to unlock the arena. Cancel anytime. No face data is stored after analysis.
            </p>
          </motion.div>
        </div>

        {/* Plan Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}>
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              style={{
                position: 'relative',
                borderRadius: 24,
                border: `1px solid ${plan.id === 'premium' ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.08)'}`,
                background: plan.id === 'premium'
                  ? 'linear-gradient(160deg, rgba(168,85,247,0.08) 0%, rgba(13,13,20,1) 60%)'
                  : 'rgba(255,255,255,0.02)',
                overflow: 'hidden',
                boxShadow: plan.id === 'premium' ? `0 0 60px ${plan.glow}` : 'none',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  background: plan.id === 'premium'
                    ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                    : 'linear-gradient(135deg, #ff2d78, #c4004a)',
                  padding: '5px 16px',
                  borderBottomLeftRadius: 12,
                  fontSize: 10, fontWeight: 800, color: '#fff',
                  letterSpacing: '0.1em',
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ padding: '32px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Plan name & price */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: plan.color,
                    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
                  }}>
                    {plan.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{
                      fontFamily: 'Bebas Neue, cursive',
                      fontSize: 52,
                      color: '#f8fafc',
                      lineHeight: 1,
                    }}>
                      {plan.price}
                    </span>
                    <span style={{ color: '#475569', fontSize: 14 }}>{plan.period}</span>
                  </div>
                  <div style={{ color: '#334155', fontSize: 13, marginTop: 4 }}>
                    {plan.priceINR}/month (billed in INR)
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 24 }} />

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ color: '#94a3b8', fontSize: 14, display: 'flex', gap: 10 }}>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  id={`plan-${plan.id}-btn`}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={!!initiating}
                  style={{
                    marginTop: 28,
                    width: '100%', padding: '14px',
                    borderRadius: 12,
                    background: initiating === plan.id
                      ? 'rgba(168,85,247,0.3)'
                      : plan.id === 'premium'
                        ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                        : plan.id === 'pro'
                          ? 'linear-gradient(135deg, #ff2d78, #c4004a)'
                          : `linear-gradient(135deg, ${plan.color}22, ${plan.color}44)`,
                    color: plan.id === 'beginner' ? plan.color : '#fff',
                    border: plan.id === 'beginner' ? `1px solid ${plan.color}44` : 'none',
                    fontWeight: 800, fontSize: 15,
                    cursor: initiating ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                    boxShadow: plan.id === 'premium' && !initiating ? '0 4px 24px rgba(168,85,247,0.3)' : 'none',
                  }}
                >
                  {initiating === plan.id ? '⏳ Redirecting to PayU…' : `${plan.cta} →`}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            textAlign: 'center', padding: '14px 20px', borderRadius: 12,
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
            color: '#f87171', fontSize: 14, marginBottom: 24,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Footer notes */}
        <div style={{ textAlign: 'center', color: '#334155', fontSize: 13, lineHeight: 1.8 }}>
          <p>🔒 Secure payments via PayU • 30-day subscription • Cancel anytime</p>
          <p>All prices in USD for display. Actual charge is in Indian Rupees (INR) via your PayU account.</p>
        </div>
      </div>

      {/* Hidden PayU auto-submit form */}
      {payuData && (
        <form
          ref={formRef}
          method="post"
          action={payuData.payuUrl}
          style={{ display: 'none' }}
        >
          {['key','txnid','amount','productinfo','firstname','email','phone',
            'surl','furl','hash','udf1','udf2'].map(field =>
            payuData[field] ? (
              <input key={field} type="hidden" name={field} value={payuData[field]} />
            ) : null
          )}
        </form>
      )}
    </div>
  );
}
