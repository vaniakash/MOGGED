'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Shield, Sparkles, Activity, Crosshair, Users } from 'lucide-react';
import Link from 'next/link';

export default function ToolsHubPage() {
  const router = useRouter();

  const tools = [
    {
      id: 'face-score',
      title: 'Face Score AI',
      desc: 'Get brutally honest AI analysis and numeric breakdown of your facial features.',
      icon: <Activity size={32} color="#a855f7" strokeWidth={1.5} />,
      link: '/tools/face-score',
      premium: false,
    },
    {
      id: 'celebrity-match',
      title: 'Celebrity Match',
      desc: 'Find the top 5 celebrities you resemble with cosine similarity matching.',
      icon: <Users size={32} color="#4ade80" strokeWidth={1.5} />,
      link: '/tools/celebrity-match',
      premium: false,
    },
    {
      id: 'async-duel',
      title: 'Duel The Leaderboard',
      desc: 'Face off against a random snapshot from the global leaderboard for ELO.',
      icon: <Crosshair size={32} color="#f87171" strokeWidth={1.5} />,
      link: '/tools/async-duel',
      premium: false,
    },
    {
      id: 'glow-up',
      title: 'Glow-Up Simulator',
      desc: 'Generate photorealistic glow-ups (haircut, skincare, lighting) using AI.',
      icon: <Sparkles size={32} color="#fbbf24" strokeWidth={1.5} />,
      link: '/tools/glow-up',
      premium: true,
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050508',
      color: '#f8fafc',
      padding: '40px 16px',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: '#64748b', fontSize: 13, fontWeight: 600,
          textDecoration: 'none', marginBottom: 32,
        }}>
          ← Back to Arena
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{
            fontFamily: 'Bebas Neue, cursive',
            fontSize: 'clamp(48px, 8vw, 72px)',
            lineHeight: 1,
            color: '#f8fafc',
            marginBottom: 12,
          }}>Solo Tools &amp; Labs</h1>
          <p style={{
            color: '#94a3b8',
            fontSize: 15,
            lineHeight: 1.6,
            maxWidth: 600,
            marginBottom: 48,
          }}>
            Experiment with our experimental AI face analysis models. These tools are built using the Pollinations AI gen models.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {tools.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => router.push(t.link)}
              style={{
                background: '#0f1115',
                border: '1px solid #1e222a',
                borderRadius: 16,
                padding: '28px 24px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = '#1e222a';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {t.premium && (
                <span style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'rgba(251,191,36,0.1)',
                  color: '#fbbf24', fontSize: 11, fontWeight: 700,
                  padding: '4px 10px', borderRadius: 99,
                  border: '1px solid rgba(251,191,36,0.2)',
                }}>
                  PREMIUM
                </span>
              )}
              <div style={{ marginBottom: 20 }}>{t.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#f8fafc' }}>
                {t.title}
              </h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
                {t.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
