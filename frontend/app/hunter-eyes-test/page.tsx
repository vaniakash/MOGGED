// Server Component — /hunter-eyes-test landing page
// Targets: hunter eyes test, canthal tilt test, prey eyes vs hunter eyes, hunter eyes meaning
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hunter Eyes Test — Canthal Tilt Checker | Omogle',
  description:
    'Do you have hunter eyes? Learn what hunter eyes (positive canthal tilt) are, how to test your canthal tilt, and battle live to see how your eyes score against real people on Omogle.',
  alternates: {
    canonical: 'https://omogle.vercel.app/hunter-eyes-test',
  },
  openGraph: {
    title: 'Hunter Eyes Test — Canthal Tilt Checker | Omogle',
    description:
      'Do you have hunter eyes? Test your canthal tilt in a live AI face battle on Omogle.',
    url: 'https://omogle.vercel.app/hunter-eyes-test',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What are hunter eyes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hunter eyes refer to a positive canthal tilt — where the outer corners of the eyes are positioned higher than the inner corners. This gives the eyes an intense, focused, predatory appearance. In looksmaxxing culture, hunter eyes are considered one of the most attractive facial features a person can have.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is canthal tilt?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Canthal tilt is the angle formed by the inner and outer corners (canthi) of the eye. Positive canthal tilt means the outer corner is higher than the inner corner (hunter eyes). Neutral canthal tilt means they are level. Negative canthal tilt means the outer corner is lower than the inner corner (prey eyes or puppy eyes).',
      },
    },
    {
      '@type': 'Question',
      name: 'What are prey eyes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Prey eyes (also called puppy eyes or negative canthal tilt) are the opposite of hunter eyes. The outer corners of the eyes droop downward, giving a softer, more vulnerable appearance. In looksmaxxing culture, prey eyes are considered less dominant and less attractive than hunter eyes.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I test my canthal tilt?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can test your canthal tilt on Omogle\'s face battle arena. Our AI uses MediaPipe FaceMesh to detect the angle of your outer and inner eye corners in real time during a live webcam battle. You\'ll receive a canthal tilt score and a hunter eyes or negative canthal tilt label as part of your face analysis result.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can you change your canthal tilt?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Natural canthal tilt is determined by bone structure and is difficult to change without surgery (canthoplasty). However, makeup techniques like extending eyeliner upward can visually simulate positive canthal tilt. Eye exercises do not change bone structure. Looksmaxxers often focus on improving other features to compensate for neutral or negative canthal tilt.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do hunter eyes affect attractiveness?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Research suggests that eye shape and expression significantly affect perceived attractiveness and dominance. Positive canthal tilt is associated with an intense, confident appearance that many people find attractive. Omogle\'s AI weights canthal tilt as 30% of the total eye score, alongside eye spacing and openness.',
      },
    },
  ],
};

export default function HunterEyesTestPage() {
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
          <img src="/logo-omogle.png" alt="Omogle" style={{ height: 56, objectFit: 'contain' }} />
        </a>
        <div className="nav-actions">
          <a href="/leaderboard" className="btn btn-ghost btn-sm">Leaderboard</a>
          <a href="/battle" className="btn btn-primary btn-sm">Take the Test</a>
        </div>
      </nav>

      <div className="container-md" style={{ padding: '60px 16px 80px' }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 24 }}>
          <ol style={{ display: 'flex', gap: 8, listStyle: 'none', fontSize: 12, color: '#475569' }}>
            <li><a href="/" style={{ color: '#a855f7' }}>Omogle</a></li>
            <li style={{ color: '#475569' }}>/</li>
            <li style={{ color: '#94a3b8' }}>Hunter Eyes Test</li>
          </ol>
        </nav>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            className="font-display"
            style={{
              fontSize: 'clamp(64px, 12vw, 120px)',
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            <span style={{ color: '#00f5d4', textShadow: '0 0 40px rgba(0,245,212,0.6)' }}>🦅</span>
          </div>
          <h1
            className="font-display gradient-text"
            style={{ fontSize: 'clamp(28px, 6vw, 52px)', marginBottom: 16, lineHeight: 1.1 }}
          >
            Hunter Eyes Test
          </h1>
          <p
            className="text-secondary"
            style={{ maxWidth: 580, margin: '0 auto 12px', fontSize: 16, lineHeight: 1.75 }}
          >
            Do you have <strong style={{ color: '#00f5d4' }}>hunter eyes</strong> (positive canthal tilt) or{' '}
            <strong style={{ color: '#ff2d78' }}>prey eyes</strong> (negative canthal tilt)?
            Our AI measures your canthal tilt live using 468 facial landmarks.
          </p>
          <p className="text-secondary" style={{ marginBottom: 32, fontSize: 14 }}>
            Go live. Get analyzed. Find out if you have the eyes of a mogger.
          </p>
          <a
            href="/battle"
            className="btn btn-primary btn-lg"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.12em', fontSize: 20 }}
          >
            🦅 Test My Canthal Tilt
          </a>
        </div>

        {/* Hunter vs Prey Eyes */}
        <section style={{ marginBottom: 48 }}>
          <h2
            className="font-display text-center"
            style={{ fontSize: 32, marginBottom: 28, color: '#f8fafc' }}
          >
            Hunter Eyes vs Prey Eyes
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div
              className="card"
              style={{
                padding: '28px 24px',
                borderRadius: 20,
                borderColor: 'rgba(0,245,212,0.4)',
                boxShadow: '0 0 24px rgba(0,245,212,0.12)',
              }}
            >
              <div className="font-display neon-cyan" style={{ fontSize: 28, marginBottom: 12 }}>
                🦅 Hunter Eyes
              </div>
              <div className="badge" style={{ marginBottom: 16, borderColor: 'rgba(0,245,212,0.4)', color: '#00f5d4' }}>
                Positive Canthal Tilt
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Outer eye corner sits HIGHER than inner corner',
                  'Gives an intense, focused, predatory look',
                  'Associated with confidence and dominance',
                  'Common in people perceived as highly attractive',
                  'Classic example: model-tier eyes, sharp upward tilt',
                ].map(point => (
                  <li key={point} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: '#00f5d4', flexShrink: 0 }}>✓</span>
                    <span className="text-secondary" style={{ fontSize: 13 }}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="card"
              style={{
                padding: '28px 24px',
                borderRadius: 20,
                borderColor: 'rgba(255,45,120,0.35)',
                boxShadow: '0 0 24px rgba(255,45,120,0.08)',
              }}
            >
              <div className="font-display neon-pink" style={{ fontSize: 28, marginBottom: 12 }}>
                😶 Prey Eyes
              </div>
              <div className="badge" style={{ marginBottom: 16, borderColor: 'rgba(255,45,120,0.4)', color: '#ff2d78' }}>
                Negative Canthal Tilt
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Outer eye corner sits LOWER than inner corner',
                  'Gives a softer, more vulnerable appearance',
                  'Sometimes called "puppy eyes"',
                  'Associated with approachability but less dominance',
                  'Droopy outer corners characteristic appearance',
                ].map(point => (
                  <li key={point} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: '#ff2d78', flexShrink: 0 }}>—</span>
                    <span className="text-secondary" style={{ fontSize: 13 }}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* How Omogle tests it */}
        <section className="card" style={{ padding: '32px 28px', borderRadius: 20, marginBottom: 48 }}>
          <h2 className="font-display" style={{ fontSize: 26, marginBottom: 20, color: '#fbbf24' }}>
            How Omogle Measures Your Canthal Tilt
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                step: '01',
                color: '#00f5d4',
                title: 'Live Webcam Analysis',
                desc: 'Your webcam feeds into MediaPipe FaceMesh, which maps 468 precise facial landmarks in real time.',
              },
              {
                step: '02',
                color: '#a855f7',
                title: 'Canthal Point Detection',
                desc: 'The AI identifies landmarks 33 (left outer canthus), 133 (left inner canthus), 263 (right outer canthus), and 362 (right inner canthus).',
              },
              {
                step: '03',
                color: '#fbbf24',
                title: 'Tilt Angle Calculation',
                desc: 'The Y-coordinate difference between outer and inner corners determines your canthal tilt angle. Positive = hunter eyes. Negative = prey eyes.',
              },
              {
                step: '04',
                color: '#ff2d78',
                title: 'Scored & Compared',
                desc: 'Your canthal tilt score combines with symmetry, jaw, and harmony scores. The higher total score in a battle wins. Your ELO updates.',
              },
            ].map(({ step, color, title, desc }) => (
              <div
                key={step}
                style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}
              >
                <span
                  className="font-display"
                  style={{ fontSize: 28, color, textShadow: `0 0 16px ${color}80`, flexShrink: 0, width: 40 }}
                >
                  {step}
                </span>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: 14, display: 'block', marginBottom: 4 }}>{title}</strong>
                  <p className="text-secondary" style={{ fontSize: 13, lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 56 }}>
          <h2 className="font-display text-center" style={{ fontSize: 32, marginBottom: 24, color: '#a855f7' }}>
            Hunter Eyes FAQ
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { q: 'What is positive canthal tilt?', a: 'Positive canthal tilt means the outer corners of your eyes are positioned higher than the inner corners. This creates the "hunter eyes" appearance — intense, focused, and dominant-looking.' },
              { q: 'Are hunter eyes genetic?', a: 'Yes, canthal tilt is primarily determined by your bone structure and orbital anatomy — both genetic. While makeup can visually simulate positive canthal tilt, actual structural canthal tilt cannot be changed without surgical procedures like canthoplasty.' },
              { q: 'Do hunter eyes actually matter for attractiveness?', a: 'In looksmaxxing research and cultural preference studies, positive canthal tilt is consistently associated with perceived attractiveness and dominance. Omogle\'s AI scores it as a significant component of the eye score. That said, it\'s one of many factors — jaw, symmetry, and harmony all matter too.' },
              { q: 'Can I fake hunter eyes?', a: 'Makeup artists use upward-flicked eyeliner to simulate positive canthal tilt. Mewing and facial exercises will not change canthal tilt since it\'s orbital bone structure, not soft tissue.' },
              { q: 'What other features does Omogle analyze?', a: 'Beyond canthal tilt, Omogle measures facial symmetry (nose and mouth alignment), jawline sharpness (jaw-to-face-height ratio), eye spacing (inner-to-outer ratio), and facial thirds harmony. Each dimension contributes to your total face score.' },
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
          className="card card-cyan text-center"
          style={{ padding: '48px 32px', borderRadius: 24 }}
        >
          <div className="font-display neon-cyan" style={{ fontSize: 'clamp(32px, 6vw, 56px)', marginBottom: 12 }}>
            🦅 OR 😶 ?
          </div>
          <p className="text-secondary" style={{ marginBottom: 28, fontSize: 15, maxWidth: 480, margin: '0 auto 28px' }}>
            Stop guessing. Go live, get scanned, and find out if you have the canthal tilt of a mogger
            or the eyes of an NPC.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/battle"
              className="btn btn-primary btn-lg"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.12em', fontSize: 20 }}
            >
              🦅 Start My Hunter Eyes Test
            </a>
            <a href="/mogged" className="btn btn-ghost btn-lg">
              💀 What Does Mogged Mean?
            </a>
          </div>
        </div>

        {/* Internal linking */}
        <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {[
            { label: '🏠 Omogle Home', href: '/' },
            { label: '💀 Mogged Meaning', href: '/mogged' },
            { label: '📈 Looksmaxxing', href: '/looksmax' },
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
