'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const PLANS = [
  {
    id:       'trial',
    name:     '7-Day Trial',
    badge:    null,
    emoji:    '⚡',
    priceUSD: '$3',
    priceINR: '₹250',
    period:   'one-time',
    color:    '#64748b',
    glow:     'rgba(100,116,139,0.4)',
    border:   'rgba(100,116,139,0.5)',
    features: [
      'Full access for 7 days',
      'Live face battles',
      'ELO ranked matchmaking',
      'AI face analysis (468 landmarks)',
      'Friend battle rooms',
      'Leaderboard access',
    ],
  },
  {
    id:       'pro',
    name:     'Pro Monthly',
    badge:    'MOST POPULAR',
    emoji:    '👑',
    priceUSD: '$10',
    priceINR: '₹850',
    period:   '/month',
    color:    '#a855f7',
    glow:     'rgba(168,85,247,0.5)',
    border:   'rgba(168,85,247,0.7)',
    features: [
      'Unlimited monthly access',
      'Priority matchmaking queue',
      'All Trial features',
      'Premium profile badge',
      'Advanced face analytics',
      'Battle history & replays',
    ],
  },
  {
    id:       'girls',
    name:     'Girls Only',
    badge:    'EXCLUSIVE',
    emoji:    '♀️',
    priceUSD: '$20',
    priceINR: '₹1,650',
    period:   '/month',
    color:    '#ec4899',
    glow:     'rgba(236,72,153,0.5)',
    border:   'rgba(236,72,153,0.7)',
    features: [
      'Match exclusively with girls',
      'All Pro features included',
      'Priority matchmaking',
      'Girls-only leaderboard',
      'Exclusive profile badge',
      'VIP support',
    ],
  },
];

const INDIAN_COUNTRIES = ['IN', 'India'];

interface CheckoutClientProps {
  redirectTo?: string;
}

export default function CheckoutClient({ redirectTo = '/battle' }: CheckoutClientProps) {
  const router = useRouter();
  const [country, setCountry]     = useState('IN');
  const [loading, setLoading]     = useState<string | null>(null);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const sessionId = typeof window !== 'undefined' ? localStorage.getItem('omogl_session') : null;

  const isIndia = INDIAN_COUNTRIES.includes(country) || country === 'IN';

  async function handleCheckout(planId: string) {
    if (!sessionId) { router.push('/login'); return; }
    setError('');
    setLoading(planId);

    try {
      // 1. Create order
      const orderRes = await fetch(`${BACKEND_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, country, sessionId }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      // 2. Open Razorpay checkout
      const user = JSON.parse(localStorage.getItem('omogl_user') || '{}');
      await new Promise<void>((resolve, reject) => {
        const options = {
          key:         orderData.keyId,
          amount:      orderData.amount,
          currency:    orderData.currency,
          name:        'Omogl',
          description: orderData.planLabel,
          order_id:    orderData.orderId,
          image:       '/logo.png',
          prefill: {
            name:  user.displayName || user.username || '',
            email: user.email || '',
          },
          theme: { color: '#a855f7' },
          handler: async (response: any) => {
            try {
              // 3. Verify payment
              const verifyRes = await fetch(`${BACKEND_URL}/api/payments/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id:   response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature:  response.razorpay_signature,
                  sessionId,
                  plan:     planId,
                  country,
                  gateway:  orderData.gateway,
                  amount:   orderData.amount,
                  currency: orderData.currency,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');

              // 4. Save subscription info locally
              const updatedUser = { ...user, subscriptionPlan: planId, subscriptionExpiry: verifyData.expiresAt };
              localStorage.setItem('omogl_user', JSON.stringify(updatedUser));
              window.dispatchEvent(new StorageEvent('storage', { key: 'omogl_user', newValue: JSON.stringify(updatedUser) }));

              resolve();
              setSuccess(true);
              setTimeout(() => router.push(redirectTo), 2000);
            } catch (err: any) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(null);
              reject(new Error('Payment cancelled'));
            },
          },
        };

        if (typeof window !== 'undefined' && (window as any).Razorpay) {
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          reject(new Error('Razorpay not loaded'));
        }
      });
    } catch (err: any) {
      if (err.message !== 'Payment cancelled') {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(null);
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 48, color: '#a855f7', marginBottom: 8 }}>
          YOU'RE IN THE ARENA
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 16 }}>Subscription activated. Redirecting to the battle...</p>
        <div style={{
          width: 200, height: 3, background: 'linear-gradient(90deg, #a855f7, #00f5d4)',
          borderRadius: 99, margin: '24px auto 0', animation: 'grow 2s ease-out forwards',
        }} />
        <style>{`@keyframes grow { from { width: 0; } to { width: 200px; } }`}</style>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" onLoad={() => setScriptReady(true)} />

      {/* Country Selector */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <label style={{ color: '#64748b', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
          YOUR BILLING COUNTRY
        </label>
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            color: '#f8fafc',
            padding: '10px 20px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="IN">🇮🇳 India (Pay in ₹ INR)</option>
          <option value="US">🇺🇸 United States</option>
          <option value="GB">🇬🇧 United Kingdom</option>
          <option value="AU">🇦🇺 Australia</option>
          <option value="CA">🇨🇦 Canada</option>
          <option value="SG">🇸🇬 Singapore</option>
          <option value="AE">🇦🇪 UAE</option>
          <option value="OTHER">🌍 Other Country</option>
        </select>
        {isIndia && (
          <p style={{ color: '#00f5d4', fontSize: 12, marginTop: 6, fontWeight: 600 }}>
            ✓ UPI, Cards, Net Banking, Wallets available
          </p>
        )}
      </div>

      {/* Plan Cards */}
      <div style={{
        display: 'flex',
        gap: 20,
        justifyContent: 'center',
        flexWrap: 'wrap',
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        {PLANS.map(plan => (
          <div
            key={plan.id}
            style={{
              position: 'relative',
              background: plan.id === 'pro'
                ? 'linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(10,10,22,0.95) 60%)'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${plan.border}`,
              borderRadius: 24,
              padding: '36px 32px',
              width: 320,
              boxShadow: plan.id === 'pro' ? `0 0 60px ${plan.glow}` : 'none',
              transform: plan.id === 'pro' ? 'translateY(-12px)' : 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default',
            }}
          >
            {plan.badge && (
              <div style={{
                position: 'absolute',
                top: -14,
                left: '50%',
                transform: 'translateX(-50%)',
                background: `linear-gradient(90deg, ${plan.color}, ${plan.color}cc)`,
                color: '#fff',
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: '0.12em',
                padding: '4px 18px',
                borderRadius: 99,
                whiteSpace: 'nowrap',
              }}>
                {plan.badge}
              </div>
            )}

            {/* Emoji + Name */}
            <div style={{ fontSize: 36, marginBottom: 8 }}>{plan.emoji}</div>
            <h3 style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: 26,
              color: '#f8fafc',
              margin: '0 0 4px',
              letterSpacing: '0.04em',
            }}>
              {plan.name}
            </h3>

            {/* Price */}
            <div style={{ margin: '20px 0 24px', display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              <span style={{
                fontFamily: 'Bebas Neue, cursive',
                fontSize: 54,
                color: plan.color,
                lineHeight: 1,
                textShadow: `0 0 30px ${plan.glow}`,
              }}>
                {isIndia ? plan.priceINR : plan.priceUSD}
              </span>
              <span style={{ color: '#475569', fontSize: 15, paddingBottom: 6 }}>
                {plan.period}
              </span>
            </div>

            {/* Features */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {plan.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#94a3b8', fontSize: 14 }}>
                  <span style={{ color: plan.color, flexShrink: 0, fontWeight: 700, fontSize: 16, lineHeight: 1.4 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button
              id={`checkout-${plan.id}`}
              onClick={() => handleCheckout(plan.id)}
              disabled={!!loading}
              style={{
                width: '100%',
                padding: '14px 0',
                borderRadius: 14,
                background: loading === plan.id
                  ? 'rgba(255,255,255,0.05)'
                  : plan.id === 'pro'
                    ? `linear-gradient(90deg, ${plan.color}, #7c3aed)`
                    : `rgba(${plan.id === 'girls' ? '236,72,153' : '100,116,139'},0.15)`,
                color: '#fff',
                fontFamily: 'Bebas Neue, cursive',
                fontSize: 18,
                letterSpacing: '0.08em',
                cursor: loading ? 'not-allowed' : 'pointer',
                border: `1px solid ${plan.border}`,
                transition: 'all 0.2s',
                opacity: loading && loading !== plan.id ? 0.5 : 1,
              } as any}
            >
              {loading === plan.id ? '⏳ Opening Checkout...' : `⚔️ GET ${plan.name.toUpperCase()}`}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          textAlign: 'center', marginTop: 32, padding: '16px 24px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12, color: '#fca5a5', fontSize: 14, maxWidth: 500, margin: '32px auto 0',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Security note */}
      <p style={{ textAlign: 'center', color: '#334155', fontSize: 12, marginTop: 32 }}>
        🔒 Payments secured by Razorpay · No data stored · Cancel anytime
      </p>

      <style>{`
        #checkout-pro:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(168,85,247,0.5);
        }
        #checkout-trial:hover:not(:disabled), #checkout-girls:hover:not(:disabled) {
          transform: translateY(-2px);
        }
      `}</style>
    </>
  );
}
