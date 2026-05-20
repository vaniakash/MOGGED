// Server Component — no 'use client'. Exports metadata, renders crawlable HTML.
import type { Metadata } from 'next';
import HomepageHero from '@/components/HomepageHero';

export const metadata: Metadata = {
  title: 'Omogle — Face Battle Arena | Get Mogged Online',
  description:
    'Join live face battles, compare looks, climb ELO rankings, and see who gets mogged. Omogle is the internet\'s real-time competitive face arena — AI-judged, stranger-matched, brutally honest.',
  alternates: {
    canonical: 'https://omogle.vercel.app',
  },
};

// FAQ schema — injected server-side so Google sees it on first crawl
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What does mogged mean?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mogged means to be physically dominated or outclassed in attractiveness by another person. It comes from the internet slang "mog" — when someone\'s looks, height, or overall presence makes you appear lesser by comparison. If you get mogged, the other person out-competed you on looks.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is Omogle?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Omogle is a real-time competitive face battle platform. You get matched with a random stranger via webcam, an AI analyzes both faces simultaneously during a 10-second countdown, and the server reveals who scored higher — who mogged and who got mogged. Your result updates your ELO ranking on the global leaderboard.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a face battle?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A face battle is a head-to-head comparison of two people\'s faces scored by AI. On Omogle, both users go live on webcam and the AI measures facial symmetry, jawline sharpness, canthal tilt (hunter eyes), eye spacing, and facial thirds harmony. The higher scorer wins the battle and gains ELO points.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are hunter eyes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hunter eyes refer to a positive canthal tilt — where the outer corners of the eyes are higher than the inner corners, giving an intense, focused appearance. In looksmaxxing culture, hunter eyes are considered a high-status facial feature associated with attractiveness and dominance. Prey eyes (negative canthal tilt) are the opposite. Omogle\'s AI detects and scores your canthal tilt in real time.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the ELO ranking system work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every user starts with 1000 ELO points. When you win a battle, you gain ELO based on the difference between your rating and your opponent\'s. When you lose, you lose points by the same formula. Beating higher-ranked players earns more points. Rankings are tracked on the global leaderboard.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I battle my friends?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Omogle has a private room system for friend battles. One person generates a 6-character code, shares it with their friend, and the friend enters the code to start a direct battle. Same AI analysis and ELO system applies.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is looksmaxxing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Looksmaxxing is the practice of maximizing your physical attractiveness through various means — skincare, fitness, haircuts, posture, diet, and sometimes medical procedures. The looksmaxxing community uses terms like mog, mogged, mogger, hunter eyes, jaw ratio, and canthal tilt to describe facial aesthetics. Omogle provides an AI-powered way to benchmark your looks in real competition.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the face scoring work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Omogle uses MediaPipe FaceMesh to detect 468 facial landmarks in real time. The AI scores four dimensions: facial symmetry (nose and mouth alignment), canthal tilt (hunter eyes detection), jawline sharpness (jaw width to face height ratio), and facial thirds harmony (golden ratio proportions). Scores range from 4.0 to 9.8 for entertainment purposes. Results are not medical assessments.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does a mogger mean?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A mogger is someone who consistently mogs others — a person whose looks, presence, or overall appearance dominates the people around them. On Omogle\'s leaderboard, high-ELO players who win most of their battles are considered moggers. Reaching GIGACHAD or CHAD rank on the leaderboard marks you as a top mogger.',
      },
    },
  ],
};

export default function HomePage() {
  return (
    <main className="page-center" style={{ paddingTop: 48, paddingBottom: 48 }}>

      {/* ── INTERACTIVE HERO (client component) ── */}
      <HomepageHero />

      {/* ── SEO CONTENT SECTION ─────────────────────────────────────────────
          This section is server-rendered and always visible to Googlebot.
          It does NOT show to users visually — positioned below the fold
          and styled as legitimate page content that explains the product.
      ─────────────────────────────────────────────────────────────────── */}
      <section
        className="container-sm"
        style={{ position: 'relative', zIndex: 1, marginTop: 64 }}
        aria-label="About Omogle"
      >
        <h1
          className="font-display gradient-text text-center"
          style={{ fontSize: 'clamp(32px, 6vw, 52px)', marginBottom: 12, lineHeight: 1.1 }}
        >
          Omogle — The Internet&apos;s Face Arena
        </h1>
        <h2
          className="text-center text-secondary"
          style={{ fontSize: 'clamp(16px, 3vw, 22px)', marginBottom: 32, fontWeight: 500 }}
        >
          Get Rated. Get Ranked. Get Mogged.
        </h2>

        <div
          className="card"
          style={{ padding: '28px 28px', borderRadius: 20, marginBottom: 24 }}
        >
          <p className="text-secondary" style={{ lineHeight: 1.75, fontSize: 15 }}>
            <strong style={{ color: '#f8fafc' }}>Omogle</strong> is a live competitive face battle
            platform where you face strangers or friends in real-time webcam matches. Our AI analyzes
            both faces simultaneously — measuring <strong style={{ color: '#00f5d4' }}>facial symmetry</strong>,{' '}
            <strong style={{ color: '#00f5d4' }}>canthal tilt (hunter eyes)</strong>,{' '}
            <strong style={{ color: '#00f5d4' }}>jawline sharpness</strong>, and{' '}
            <strong style={{ color: '#00f5d4' }}>facial thirds harmony</strong> — then declares a winner.
            Winner <strong style={{ color: '#f8fafc' }}>mogs</strong>. Loser gets{' '}
            <strong style={{ color: '#ff2d78' }}>mogged</strong>.
          </p>
        </div>

        {/* Feature list */}
        <div
          className="card"
          style={{ padding: '24px 28px', borderRadius: 20, marginBottom: 24 }}
        >
          <h3 className="font-display neon-purple" style={{ fontSize: 22, marginBottom: 16 }}>
            Core Features
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['🔴', 'Live face battles', 'Real-time webcam 1v1 matchmaking via WebRTC'],
              ['🏆', 'ELO ranked matchmaking', 'Chess-style ranking — every battle changes your score'],
              ['🤖', 'AI face analysis', 'MediaPipe FaceMesh with 468 landmark detection'],
              ['🦅', 'Hunter eyes detection', 'Canthal tilt scoring in real time'],
              ['💀', 'Mogged result reveals', 'Animated cinematic outcome — YOU MOGGED HIM or YOU GOT MOGGED'],
              ['🔒', 'Friend battle rooms', 'Private 6-char code system to challenge specific friends'],
              ['📊', 'Global leaderboard', 'Top moggers ranked by ELO: NPC → Average → High Tier → Chad → Gigachad'],
            ].map(([emoji, title, desc]) => (
              <li key={title as string} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{emoji}</span>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: 14 }}>{title}</strong>
                  <span className="text-secondary" style={{ fontSize: 13 }}> — {desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Keyword targets for internal linking */}
        <div
          className="card"
          style={{ padding: '20px 28px', borderRadius: 20, marginBottom: 24 }}
        >
          <h3 className="font-display" style={{ fontSize: 20, marginBottom: 12, color: '#fbbf24' }}>
            Explore the Battle Universe
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { label: '💀 What Does Mogged Mean?', href: '/mogged' },
              { label: '🦅 Hunter Eyes Test', href: '/hunter-eyes-test' },
              { label: '📈 Looksmaxxing Guide', href: '/looksmax' },
              { label: '🏆 Leaderboard', href: '/leaderboard' },
              { label: '⚔️ Start a Battle', href: '/battle' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className="badge"
                style={{
                  padding: '8px 14px',
                  fontSize: 13,
                  borderColor: 'rgba(168,85,247,0.3)',
                  color: '#a855f7',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ──────────────────────────────────────────────────── */}
      <section
        className="container-sm"
        style={{ position: 'relative', zIndex: 1, marginTop: 16, marginBottom: 48 }}
        aria-label="Frequently Asked Questions"
      >
        <h2
          className="font-display text-center"
          style={{ fontSize: 32, marginBottom: 24, color: '#a855f7' }}
        >
          FAQ
        </h2>

        {/* FAQ JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            {
              q: 'What does mogged mean?',
              a: 'Mogged means to be physically dominated or outclassed in attractiveness by someone else. It comes from internet slang — if someone\'s looks make yours appear lesser by comparison, you\'ve been mogged.',
            },
            {
              q: 'What is a face battle?',
              a: 'A head-to-head AI comparison of two people\'s faces. Both go live on webcam, the AI measures symmetry, jawline, canthal tilt, and facial harmony simultaneously, then declares a winner.',
            },
            {
              q: 'What are hunter eyes?',
              a: 'Hunter eyes (positive canthal tilt) means the outer corners of your eyes sit higher than the inner corners — giving an intense, predatory look. The opposite is negative canthal tilt (prey eyes). Omogle detects and scores your canthal tilt in real time.',
            },
            {
              q: 'What is looksmaxxing?',
              a: 'Looksmaxxing is the practice of maximizing your physical attractiveness through skincare, fitness, grooming, and lifestyle changes. The looksmaxxing community coined terms like mogged, mogger, hunter eyes, and jaw ratio. Omogle lets you benchmark your looks in real competition.',
            },
            {
              q: 'What does a mogger mean?',
              a: 'A mogger is someone who consistently dominates others in looks comparisons. On Omogle\'s leaderboard, high-ELO players who win most battles are the moggers. Reaching CHAD or GIGACHAD rank makes you a certified mogger.',
            },
            {
              q: 'How does the ranking system work?',
              a: 'Everyone starts at 1000 ELO. Wins earn points, losses cost points. The higher your opponent\'s ELO, the more you earn by beating them. Ranks: NPC (below 1000) → Average → High Tier → Chad (1200+) → Gigachad (1400+).',
            },
            {
              q: 'Can I challenge a specific friend?',
              a: 'Yes. Use the "Challenge a Friend" button on the homepage to generate a private 6-character room code. Share it with your friend and they can join directly for a private battle.',
            },
            {
              q: 'How does Omogle score faces?',
              a: 'Omogle uses MediaPipe FaceMesh (468 landmarks) to measure facial symmetry, canthal tilt, jawline ratio, and facial thirds harmony. Scores range 4.0–9.8. This is for entertainment purposes only and is not a medical or clinical assessment.',
            },
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
              <p
                className="text-secondary"
                style={{ marginTop: 12, fontSize: 13, lineHeight: 1.7 }}
              >
                {a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── FOOTER / LEGAL ─────────────────── */}
      <footer className="text-center" style={{ position: 'relative', zIndex: 1, marginBottom: 32 }}>
        <p className="text-secondary text-xs mb-3">We do not sell your data. The AI already roasted you for free.</p>
        <div className="flex items-center justify-center gap-4 text-xs font-semibold" style={{ color: '#a855f7' }}>
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <a href="/terms" className="hover:underline">Terms of Use</a>
        </div>
      </footer>
    </main>
  );
}
