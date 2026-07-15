// Server Component — no 'use client'. Exports metadata, renders crawlable HTML.
import type { Metadata } from 'next';
import HomepageHero from '@/components/HomepageHero';

export const metadata: Metadata = {
  title: 'Omogl — Face Battle Arena | Get Mogged Online',
  description:
    'Join live face battles, compare looks, climb ELO rankings, and see who gets mogged. Omogl is the internet\'s real-time competitive face arena — AI-judged, stranger-matched, brutally honest.',
  alternates: {
    canonical: 'https://omogl.com',
  },
};



export default function HomePage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      zIndex: 1,
      paddingTop: 24,
      paddingBottom: 48,
    }}>

      {/* ── TOP LOGO ── */}
      <div style={{ marginBottom: 16, zIndex: 100, display: 'flex', justifyContent: 'center' }}>
        <a href="/">
          <img src="/logo.png" alt="Omogl Logo" style={{ height: 80, objectFit: 'contain' }} />
        </a>
      </div>

      {/* ── FOR SALE BANNER ── */}


      {/* ── INTERACTIVE HERO (client component) ── */}
      <HomepageHero />

      {/* ── SEO CONTENT SECTION ─────────────────────────────────────────────
          Server-rendered, crawlable by Googlebot, positioned below the fold.
      ─────────────────────────────────────────────────────────────────── */}
      <section
        style={{
          width: '100%',
          maxWidth: 640,
          margin: '0 auto',
          padding: '0 16px',
          position: 'relative',
          zIndex: 1,
          marginTop: 32,
        }}
        aria-label="About Omogl"
      >
        <h1
          style={{
            fontFamily: 'Bebas Neue, cursive',
            fontSize: 'clamp(32px, 6vw, 52px)',
            lineHeight: 1.1,
            textAlign: 'center',
            marginBottom: 12,
            background: 'linear-gradient(135deg, #00f5d4 0%, #a855f7 50%, #ff2d78 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Omogl — The Internet&apos;s Face Arena
        </h1>
        <h2
          style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: 'clamp(15px, 2.5vw, 20px)',
            marginBottom: 32,
            fontWeight: 500,
          }}
        >
          Get Rated. Get Ranked. Get Mogged.
        </h2>

        {/* About card */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20,
          padding: '28px',
          marginBottom: 20,
        }}>
          <p style={{ color: '#64748b', lineHeight: 1.75, fontSize: 15 }}>
            <strong style={{ color: '#f8fafc' }}>Omogl</strong> is a live competitive face battle
            platform where you face strangers or friends in real-time webcam matches. Our AI analyzes
            both faces simultaneously — measuring <strong style={{ color: '#00f5d4' }}>facial symmetry</strong>,{' '}
            <strong style={{ color: '#00f5d4' }}>canthal tilt (hunter eyes)</strong>,{' '}
            <strong style={{ color: '#00f5d4' }}>jawline sharpness</strong>, and{' '}
            <strong style={{ color: '#00f5d4' }}>facial thirds harmony</strong> — then declares a winner.
            Winner <strong style={{ color: '#f8fafc' }}>mogs</strong>. Loser gets{' '}
            <strong style={{ color: '#ff2d78' }}>mogged</strong>.
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────── */}
      <footer style={{
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        marginBottom: 32,
        padding: '0 16px',
      }}>
        <p style={{ color: '#334155', fontSize: 12, marginBottom: 12 }}>
          We do not sell your data. The AI already roasted you for free.
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          fontSize: 12,
          fontWeight: 600,
          color: '#a855f7',
        }}>
          <a href="/privacy" style={{ color: '#a855f7', textDecoration: 'none' }}>Privacy Policy</a>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
          <a href="/terms" style={{ color: '#a855f7', textDecoration: 'none' }}>Terms of Use</a>
        </div>
      </footer>
    </main>
  );
}
