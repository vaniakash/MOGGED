// Server Component — /looksmax landing page
// Targets: looksmax, looksmaxxing, facial symmetry test, attractiveness battle, face rating AI
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Looksmaxxing & Facial Symmetry Test | Omogle Face Battle',
  description:
    'Looksmaxxing means maximizing your physical attractiveness. Test your facial symmetry, jawline, hunter eyes, and face rating live on Omogle — the AI face battle platform built for the looksmax community.',
  alternates: {
    canonical: 'https://omogle.vercel.app/looksmax',
  },
  openGraph: {
    title: 'Looksmaxxing & Facial Symmetry Test | Omogle Face Battle',
    description:
      'Test your facial symmetry, jawline, and hunter eyes in live AI face battles. Built for the looksmax community.',
    url: 'https://omogle.vercel.app/looksmax',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is looksmaxxing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Looksmaxxing is the practice of systematically maximizing your physical attractiveness through lifestyle changes, skincare, fitness, grooming, and in some cases medical procedures. The goal is to improve your facial and physical features to the maximum of your genetic potential. The looksmaxxing community discusses facial features like canthal tilt, jawline, bone structure, facial symmetry, and techniques like mewing, bulking, and skincare routines.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a facial symmetry test?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A facial symmetry test measures how symmetrical your face is — whether your left and right sides align closely. High facial symmetry is associated with genetic health and attractiveness. Omogle\'s AI measures your facial symmetry in real time using MediaPipe FaceMesh, analyzing the alignment of your nose tip, mouth, and eye positions relative to your face\'s center axis.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is mewing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mewing is a tongue posture technique popularized by orthodontist Dr. Mike Mew, involving placing the entire tongue against the roof of the mouth. Proponents claim it can gradually improve jaw definition and facial structure over time. It is popular in looksmaxxing communities as a soft-tissue looksmax technique.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is Omogle useful for looksmaxxing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Omogle gives looksmaxxers a real-time, competitive benchmark. Instead of analyzing photos in a mirror or forum, you compete live against real people. The AI scores your canthal tilt (hunter eyes), jawline sharpness, facial symmetry, and facial thirds harmony — then compares you directly to another person. Winning means you genuinely scored higher on those dimensions. Your ELO tracks progress over time.',
      },
    },
    {
      '@type': 'Question',
      name: 'What facial features does the AI rate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Omogle\'s AI rates: (1) Facial Symmetry — alignment of nose, mouth, and eyes relative to center; (2) Eye Score — canthal tilt (hunter eyes), eye spacing ratio, and eye openness; (3) Jawline — jaw width to face height ratio; (4) Facial Thirds Harmony — how evenly the face divides into thirds from forehead to chin. All four combine into a total score from 4.0 to 9.8.',
      },
    },
  ],
};

export default function LooksmaxPage() {
  return (
    <main className="page" style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Nav */}
      <nav className="nav">
        <a href="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo-omogle.png" alt="Omogle" style={{ height: 32, objectFit: 'contain' }} />
        </a>
        <div className="nav-actions">
          <a href="/leaderboard" className="btn btn-ghost btn-sm">Leaderboard</a>
          <a href="/battle" className="btn btn-primary btn-sm">Rate My Face</a>
        </div>
      </nav>

      <div className="container-md" style={{ padding: '60px 16px 80px' }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 24 }}>
          <ol style={{ display: 'flex', gap: 8, listStyle: 'none', fontSize: 12, color: '#475569' }}>
            <li><a href="/" style={{ color: '#a855f7' }}>Omogle</a></li>
            <li style={{ color: '#475569' }}>/</li>
            <li style={{ color: '#94a3b8' }}>Looksmax</li>
          </ol>
        </nav>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h1
            className="font-display gradient-text"
            style={{ fontSize: 'clamp(36px, 8vw, 72px)', marginBottom: 16, lineHeight: 1.05 }}
          >
            Looksmaxxing &amp;<br />Facial Symmetry Test
          </h1>
          <p
            className="text-secondary"
            style={{ maxWidth: 600, margin: '0 auto 12px', fontSize: 16, lineHeight: 1.75 }}
          >
            <strong style={{ color: '#f8fafc' }}>Looksmaxxing</strong> is the practice of maximizing your physical
            attractiveness. Omogle is where you test it — live, against real people, scored by AI.
          </p>
          <p className="text-secondary" style={{ marginBottom: 32, fontSize: 14 }}>
            Canthal tilt · Jawline · Symmetry · Facial thirds — all measured in real time.
          </p>
          <a
            href="/battle"
            className="btn btn-primary btn-lg"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.12em', fontSize: 20 }}
          >
            📊 Test My Face Rating
          </a>
        </div>

        {/* What is looksmaxxing */}
        <section className="card" style={{ padding: '32px 28px', borderRadius: 20, marginBottom: 24 }}>
          <h2 className="font-display neon-purple" style={{ fontSize: 26, marginBottom: 16 }}>
            What Is Looksmaxxing?
          </h2>
          <p className="text-secondary" style={{ lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>
            Looksmaxxing is the systematic pursuit of maximizing your physical attractiveness. Practitioners
            analyze their facial features in detail — jaw structure, canthal tilt, facial symmetry, bone
            structure, skin quality — and then take targeted action to improve them within their genetic potential.
          </p>
          <p className="text-secondary" style={{ lineHeight: 1.8, fontSize: 15 }}>
            The looksmaxxing community developed vocabulary now mainstream in Gen-Z internet culture:{' '}
            <a href="/mogged" style={{ color: '#a855f7' }}>mogged</a>,{' '}
            <a href="/hunter-eyes-test" style={{ color: '#a855f7' }}>hunter eyes</a>,
            mogger, NPC face, mewing, looksmax, and facial thirds harmony.
          </p>
        </section>

        {/* Looksmax techniques */}
        <section style={{ marginBottom: 48 }}>
          <h2 className="font-display" style={{ fontSize: 28, marginBottom: 20, color: '#fbbf24', textAlign: 'center' }}>
            Common Looksmaxxing Techniques
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { emoji: '👅', title: 'Mewing', color: '#00f5d4', desc: 'Tongue posture technique — entire tongue against roof of mouth. Claimed to improve jaw definition and facial structure over time.' },
              { emoji: '💪', title: 'Gym / Bulk', color: '#ff2d78', desc: 'Building muscle mass improves facial aesthetics through neck thickness, face fat reduction, and overall physical presence.' },
              { emoji: '💧', title: 'Skincare', color: '#a855f7', desc: 'Clearer skin, reduced inflammation, and improved skin texture significantly affect perceived attractiveness and face score.' },
              { emoji: '✂️', title: 'Haircut / Grooming', color: '#fbbf24', desc: 'A haircut that frames your face correctly enhances jaw visibility, face shape, and overall look.' },
              { emoji: '😴', title: 'Sleep Optimization', color: '#4ade80', desc: 'Sleep deprivation causes inflammation, dark circles, and puffiness — all of which reduce face score. 8+ hours matters.' },
              { emoji: '🥩', title: 'Diet / Nutrition', color: '#00f5d4', desc: 'Body fat percentage affects face fat. Lower body fat generally improves jaw definition and facial sharpness.' },
            ].map(({ emoji, title, color, desc }) => (
              <div
                key={title}
                className="card"
                style={{
                  padding: '24px 20px',
                  borderRadius: 18,
                  borderColor: `${color}30`,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</div>
                <strong style={{ color: '#f8fafc', fontSize: 14, display: 'block', marginBottom: 8 }}>{title}</strong>
                <p className="text-secondary" style={{ fontSize: 13, lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What Omogle scores */}
        <section className="card" style={{ padding: '32px 28px', borderRadius: 20, marginBottom: 48 }}>
          <h2 className="font-display" style={{ fontSize: 26, marginBottom: 20, color: '#00f5d4' }}>
            What Omogle&apos;s AI Actually Scores
          </h2>
          <p className="text-secondary" style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
            Omogle uses <strong style={{ color: '#f8fafc' }}>MediaPipe FaceMesh</strong> to detect 468 facial
            landmarks in real time via your webcam. Four dimensions are scored:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Facial Symmetry', weight: '25%', color: '#a855f7', desc: 'Measures alignment of nose tip and mouth center relative to the midpoint between your inner eye corners. High symmetry = closer to center.' },
              { label: 'Eye Score', weight: '30%', color: '#00f5d4', desc: 'Combines canthal tilt (hunter eyes angle), inner/outer eye spacing ratio, and eye aspect ratio (openness). Highest-weighted category.' },
              { label: 'Jawline Sharpness', weight: '20%', color: '#fbbf24', desc: 'Jaw width divided by face height. Ideal masculine ratio: ~0.78. Broader, more defined jaws score higher.' },
              { label: 'Facial Thirds Harmony', weight: '25%', color: '#ff2d78', desc: 'Measures how evenly your face divides into upper third (forehead), mid-third (eyes to nose), and lower third (nose to chin). Golden ratio alignment.' },
            ].map(({ label, weight, color, desc }) => (
              <div
                key={label}
                style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}
              >
                <div style={{
                  flexShrink: 0,
                  background: `${color}18`,
                  border: `1px solid ${color}40`,
                  borderRadius: 10,
                  padding: '8px 12px',
                  textAlign: 'center',
                  minWidth: 60,
                }}>
                  <div className="font-display" style={{ color, fontSize: 20 }}>{weight}</div>
                </div>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: 14, display: 'block', marginBottom: 4 }}>{label}</strong>
                  <p className="text-secondary" style={{ fontSize: 13, lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 56 }}>
          <h2 className="font-display text-center" style={{ fontSize: 32, marginBottom: 24, color: '#a855f7' }}>
            Looksmaxxing FAQ
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { q: 'What is a good face score on Omogle?', a: 'Scores range from 4.0 to 9.8. The majority of users score between 5.5 and 7.5 (Average to Mid-High). A score above 7.5 puts you in the top tier. Above 8.5 is Gigachad territory. Most face battles are decided by small margins.' },
              { q: 'Does looksmaxxing actually work?', a: 'Soft looksmaxxing (skincare, fitness, grooming, haircut) has clear measurable impact on perceived attractiveness. Hard looksmaxxing (surgery, orthotropics) has more dramatic effects but carries significant risks. The community consensus is: maximize what you can control, accept what you cannot.' },
              { q: 'What is facial thirds harmony?', a: 'Facial thirds harmony is the principle that an attractive face divides vertically into three roughly equal sections: forehead (hairline to brow), mid-face (brow to nose bottom), and lower face (nose bottom to chin). When these thirds are equal, the face is considered harmonious.' },
              { q: 'Can I track my progress on Omogle?', a: 'Yes — your ELO rating tracks across all your battles. If you\'re looksmaxxing and improving, you should see your ELO trend upward over time as you win more face battles. The global leaderboard shows where you rank against all users.' },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="card"
                style={{ padding: '16px 20px', borderRadius: 16, cursor: 'pointer' }}
              >
                <summary
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: '#f8fafc',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  {q}
                  <span style={{ color: '#a855f7', flexShrink: 0, fontSize: 18 }}>+</span>
                </summary>
                <p className="text-secondary" style={{ marginTop: 12, fontSize: 13, lineHeight: 1.7 }}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div
          className="card card-purple text-center"
          style={{ padding: '48px 32px', borderRadius: 24 }}
        >
          <div className="font-display gradient-text" style={{ fontSize: 'clamp(32px, 6vw, 56px)', marginBottom: 12 }}>
            RATE YOUR FACE. FOR REAL.
          </div>
          <p className="text-secondary" style={{ marginBottom: 28, fontSize: 15, maxWidth: 480, margin: '0 auto 28px' }}>
            No photo uploads. No static selfie analysis. Go live, compete against a real person,
            and get your AI face score in a genuine head-to-head battle.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/battle"
              className="btn btn-primary btn-lg"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.12em', fontSize: 20 }}
            >
              📊 Start Face Rating Test
            </a>
            <a href="/hunter-eyes-test" className="btn btn-ghost btn-lg">
              🦅 Hunter Eyes Test
            </a>
          </div>
        </div>

        {/* Internal linking */}
        <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {[
            { label: '🏠 Omogle Home', href: '/' },
            { label: '💀 Mogged Meaning', href: '/mogged' },
            { label: '🦅 Hunter Eyes Test', href: '/hunter-eyes-test' },
            { label: '🏆 Leaderboard', href: '/leaderboard' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              className="badge"
              style={{ padding: '8px 14px', fontSize: 13, borderColor: 'rgba(168,85,247,0.3)', color: '#a855f7' }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
