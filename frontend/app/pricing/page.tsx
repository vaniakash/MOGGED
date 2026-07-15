import type { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Omogl Pricing — Enter the Arena',
  description: 'Choose your Omogl battle plan. Trial, Pro, or Girls Only. Powered by AI face analysis and ELO ranked matchmaking.',
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params?.redirect || '/battle';

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050508',
      color: '#f8fafc',
      fontFamily: 'Inter, Space Grotesk, sans-serif',
      padding: '0 16px 80px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 800,
        height: 400,
        background: 'radial-gradient(ellipse, rgba(168,85,247,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Logo */}
      <div style={{ textAlign: 'center', paddingTop: 32, marginBottom: 4, position: 'relative', zIndex: 1 }}>
        <a href="/">
          <img src="/logo.png" alt="Omogl" style={{ height: 56, objectFit: 'contain' }} />
        </a>
      </div>

      {/* Hero Text */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, marginBottom: 56, paddingTop: 32 }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(168,85,247,0.12)',
          border: '1px solid rgba(168,85,247,0.3)',
          borderRadius: 99,
          padding: '6px 18px',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: '#a855f7',
          marginBottom: 20,
        }}>
          ⚔️ PAID MEMBERS ONLY
        </div>

        <h1 style={{
          fontFamily: 'Bebas Neue, cursive',
          fontSize: 'clamp(48px, 8vw, 88px)',
          lineHeight: 1,
          margin: '0 0 16px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #a855f7 50%, #ff2d78 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          CHOOSE YOUR
          <br />
          BATTLE PLAN
        </h1>

        <p style={{
          color: '#64748b',
          fontSize: 'clamp(15px, 2vw, 18px)',
          maxWidth: 460,
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Access the arena. Get matched. Mog or get mogged.
          <br />
          No free rides. No mercy.
        </p>

        {/* Stats bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 40,
          marginTop: 32,
          flexWrap: 'wrap',
        }}>
          {[
            ['500+', 'Active Warriors'],
            ['468', 'Face Landmarks'],
            ['10s', 'Battle Duration'],
          ].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 32, color: '#a855f7' }}>{val}</div>
              <div style={{ color: '#475569', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Component (Client) */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <CheckoutClient redirectTo={redirectTo} />
      </div>

      {/* Trust badges */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
        marginTop: 56,
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 1,
      }}>
        {[
          { icon: '🔒', text: 'Secure Payment' },
          { icon: '🚫', text: 'No Ads Ever' },
          { icon: '💳', text: 'UPI & Cards' },
          { icon: '🌍', text: 'Global Access' },
        ].map(({ icon, text }) => (
          <div key={text} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#475569',
            fontSize: 13,
            fontWeight: 600,
          }}>
            <span>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
