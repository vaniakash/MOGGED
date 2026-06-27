// Server Component — /mogged landing page
// Targets: mogged, mogging, mogger, what does mogged mean, face battle, looksmaxxing
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'What Does Mogged Mean? | Face Battle Arena — Omogl',
  description:
    'Mogged means to be physically dominated in looks by another person. Discover the meaning of mogged, mogging, and mogger culture — and test yourself in a live AI face battle on Omogl.',
  alternates: {
    canonical: 'https://omogl.com/mogged',
  },
  openGraph: {
    title: 'What Does Mogged Mean? | Face Battle Arena — Omogl',
    description:
      'Mogged means to be physically dominated in looks by another person. Test yourself in a live AI face battle.',
    url: 'https://omogl.com/mogged',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What does mogged mean?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mogged means to be physically dominated or outclassed in attractiveness, height, presence, or overall looks by another person. If someone "mogs" you, their appearance makes yours look lesser by comparison. The word comes from internet culture and looksmaxxing communities.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where did mogged come from?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The term "mog" originated from looksmaxxing forums and spread through Reddit communities like r/Lookism, before exploding on TikTok and Twitter/X. It derives from "AMOG" (Alpha Male Of the Group), originally a term from pick-up artist culture that evolved into a broader concept of physically dominating others simply through your presence and looks.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a mogger?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A mogger is someone who consistently out-competes others in looks, height, or physical presence. A mogger walks into a room and everyone looks lesser by comparison. On Omogl, high-ELO players who win most face battles are considered moggers.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is mogging?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mogging is the act of physically dominating or outclassing another person. You can mog someone passively (just by standing next to them and looking better) or actively (through deliberately emphasizing your physical advantages). In online culture, mogging refers to any situation where one person\'s looks or presence makes another look inferior.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I know if I got mogged?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'On Omogl, you find out immediately. You go live on webcam against a random stranger, the AI analyzes both faces for 10 seconds — measuring symmetry, canthal tilt (hunter eyes), jawline sharpness, and facial harmony — and the server reveals who scored higher. The loser got mogged. The winner mogged.',
      },
    },
  ],
};

export default function MoggedPage() {
  return (
    <main
      className="page"
      style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}
    >
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Nav */}
      <nav className="nav">
        <a href="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo-omogl.png" alt="Omogl" style={{ height: 56, objectFit: 'contain' }} />
        </a>
        <div className="nav-actions">
          <a href="/leaderboard" className="btn btn-ghost btn-sm">Leaderboard</a>
          <a href="/battle" className="btn btn-primary btn-sm">Battle Now</a>
        </div>
      </nav>

      <div className="container-md" style={{ padding: '60px 16px 80px' }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 24 }}>
          <ol style={{ display: 'flex', gap: 8, listStyle: 'none', fontSize: 12, color: '#475569' }}>
            <li><a href="/" style={{ color: '#a855f7' }}>Omogl</a></li>
            <li style={{ color: '#475569' }}>/</li>
            <li style={{ color: '#94a3b8' }}>Mogged</li>
          </ol>
        </nav>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            className="font-display gradient-text"
            style={{ fontSize: 'clamp(52px, 10vw, 96px)', lineHeight: 1, marginBottom: 16 }}
          >
            MOGGED
          </div>
          <h1
            style={{
              fontSize: 'clamp(20px, 4vw, 32px)',
              fontWeight: 700,
              color: '#f8fafc',
              marginBottom: 16,
            }}
          >
            What Does Mogged Mean?
          </h1>
          <p
            className="text-secondary"
            style={{ maxWidth: 600, margin: '0 auto 32px', fontSize: 16, lineHeight: 1.75 }}
          >
            Mogged means to be physically dominated or outclassed in attractiveness by another person.
            When someone mogs you, their looks, height, or presence makes yours appear lesser by comparison.
          </p>
          <a
            href="/battle"
            className="btn btn-primary btn-lg"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.12em', fontSize: 20 }}
          >
            ⚔️ Find Out If You Get Mogged
          </a>
        </div>

        {/* What mogged means — main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 56 }}>

          <section className="card" style={{ padding: '32px 28px', borderRadius: 20 }}>
            <h2 className="font-display neon-purple" style={{ fontSize: 28, marginBottom: 16 }}>
              The Full Definition
            </h2>
            <p className="text-secondary" style={{ lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>
              <strong style={{ color: '#f8fafc' }}>Mogged</strong> (verb, past tense of &ldquo;mog&rdquo;) — to be physically dominated
              by another person in terms of attractiveness, facial features, height, or overall presence.
              If person A mogs person B, person B has been mogged.
            </p>
            <p className="text-secondary" style={{ lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>
              The word originated in{' '}
              <strong style={{ color: '#f8fafc' }}>looksmaxxing communities</strong> — forums focused
              on maximizing physical attractiveness — before spreading to Reddit, TikTok, Twitter/X, and
              mainstream Gen-Z internet culture.
            </p>
            <p className="text-secondary" style={{ lineHeight: 1.8, fontSize: 15 }}>
              It comes from <em>AMOG</em> (Alpha Male Of the Group), originally used in pick-up artist
              communities, which evolved into the broader concept of physical domination through looks alone.
            </p>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              {
                term: 'Mogged',
                color: '#ff2d78',
                def: 'To be outclassed in looks by another person. The loser of a face battle. "I got absolutely mogged."',
              },
              {
                term: 'Mogger',
                color: '#00f5d4',
                def: 'Someone who consistently dominates others in looks. High ELO on Omogl = certified mogger.',
              },
              {
                term: 'Mogging',
                color: '#a855f7',
                def: 'The act of physically dominating someone with your looks. Can happen passively just by standing next to them.',
              },
              {
                term: 'Mog',
                color: '#fbbf24',
                def: 'The root verb. "To mog someone" means to make their looks appear inferior by comparison.',
              },
            ].map(({ term, color, def }) => (
              <div
                key={term}
                className="card"
                style={{
                  padding: '24px 20px',
                  borderRadius: 18,
                  borderColor: `${color}40`,
                  boxShadow: `0 0 20px ${color}12`,
                }}
              >
                <div
                  className="font-display"
                  style={{ fontSize: 32, color, textShadow: `0 0 20px ${color}80`, marginBottom: 10 }}
                >
                  {term}
                </div>
                <p className="text-secondary" style={{ fontSize: 13, lineHeight: 1.7 }}>
                  {def}
                </p>
              </div>
            ))}
          </div>

          <section className="card" style={{ padding: '32px 28px', borderRadius: 20 }}>
            <h2 className="font-display" style={{ fontSize: 26, marginBottom: 16, color: '#fbbf24' }}>
              Mogging in Context
            </h2>
            <p className="text-secondary" style={{ lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>
              Mogging isn&apos;t just about who&apos;s more attractive in absolute terms. It&apos;s fundamentally
              comparative — you mog someone <em>relative to them</em>. A person who might be average in one
              context can mog someone else in another. The looksmaxxing community obsesses over specific
              factors that drive mogging:
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none' }}>
              {[
                ['🦅', 'Canthal tilt (hunter eyes)', 'The angle of the outer vs inner corners of the eyes. Positive tilt = hunter eyes = mog material.'],
                ['💪', 'Jawline sharpness', 'A defined, sharp jaw mogs rounder, softer jaw shapes. The most discussed physical feature in mogging culture.'],
                ['✨', 'Facial symmetry', 'More symmetric faces consistently mog asymmetric ones.'],
                ['📐', 'Facial thirds', 'How evenly your face divides into forehead, mid-face, and lower face thirds. Harmony mogs disharmony.'],
                ['📏', 'Height', 'Classic mogger advantage. Tall people passively mog in social settings.'],
                ['🎯', 'Frame / bone structure', 'Broader shoulders, wider jaw, higher cheekbones — structural advantages that are hard to fake.'],
              ].map(([emoji, title, desc]) => (
                <li
                  key={title as string}
                  style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{emoji}</span>
                  <div>
                    <strong style={{ color: '#f8fafc', fontSize: 14 }}>{title}</strong>
                    <span className="text-secondary" style={{ fontSize: 13 }}> — {desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* FAQ */}
        <section style={{ marginBottom: 56 }}>
          <h2 className="font-display text-center" style={{ fontSize: 32, marginBottom: 24, color: '#a855f7' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { q: 'Where did mogged come from?', a: 'From "AMOG" (Alpha Male Of the Group) in pick-up artist forums, which evolved in looksmaxxing communities on Reddit before spreading to TikTok and mainstream internet culture.' },
              { q: 'Is mogging just about looks?', a: 'Originally yes, but the term has expanded. You can mog someone in height, wealth, status, charisma, or skill. In Omogl, mogging is specifically about AI-scored facial features.' },
              { q: 'What does it mean to be a mogger?', a: 'A mogger consistently wins face-to-face comparisons. On Omogl, reaching CHAD or GIGACHAD rank makes you an official mogger.' },
              { q: 'Can I test if I get mogged?', a: 'Yes — go to Omogl\'s battle arena, get matched with a random stranger, and find out in real time who mogs who. The AI doesn\'t lie.' },
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
          <div className="font-display gradient-text" style={{ fontSize: 'clamp(36px, 6vw, 64px)', marginBottom: 12 }}>
            STOP READING. START MOGGING.
          </div>
          <p className="text-secondary" style={{ marginBottom: 28, fontSize: 15 }}>
            The AI is waiting. Your face is next. Find out where you stand.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/battle"
              className="btn btn-primary btn-lg"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.12em', fontSize: 20 }}
            >
              ⚔️ Enter the Arena
            </a>
            <a href="/hunter-eyes-test" className="btn btn-ghost btn-lg">
              🦅 Hunter Eyes Test
            </a>
          </div>
        </div>

        {/* Internal linking */}
        <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {[
            { label: '🏠 Omogl Home', href: '/' },
            { label: '🦅 Hunter Eyes Test', href: '/hunter-eyes-test' },
            { label: '📈 Looksmaxxing Guide', href: '/looksmax' },
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
