'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Flame, Swords, Minus, TrendingUp } from 'lucide-react';

interface Leader { sessionId: string; username: string; elo: number; wins: number; losses: number; matches: number; }

function getRank(elo: number) {
  if (elo >= 1400) return { label: 'GIGACHAD',  color: '#fbbf24', icon: <Crown  size={18} color="#fbbf24" /> };
  if (elo >= 1200) return { label: 'CHAD',       color: '#00f5d4', icon: <Flame  size={18} color="#00f5d4" /> };
  if (elo >= 1100) return { label: 'HIGH TIER',  color: '#a855f7', icon: <TrendingUp size={18} color="#a855f7" /> };
  if (elo >= 1000) return { label: 'AVERAGE',    color: '#94a3b8', icon: <Minus  size={18} color="#94a3b8" /> };
  return                  { label: 'NPC',        color: '#ff2d78', icon: <Swords size={18} color="#ff2d78" /> };
}

const RANK_NUM_COLORS = ['#fbbf24', '#94a3b8', '#cd7c3a'];

export default function LeaderboardClient() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leaderboard`)
      .then(r => r.json())
      .then(d => { setLeaders(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="page" style={{ position: 'relative', zIndex: 1 }}>
      <div className="container-md" style={{ padding: '48px 16px' }}>

        {/* Back */}
        <motion.a
          href="/"
          className="flex items-center gap-2 text-secondary mb-8"
          style={{ fontSize: 13, textDecoration: 'none', width: 'fit-content' }}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ color: 'var(--clr-text)' }}
        >
          <ArrowLeft size={15} /> Back to Home
        </motion.a>

        <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display gradient-text mb-2" style={{ fontSize: 48 }}>LEADERBOARD</h1>
          <p className="text-secondary mb-8" style={{ fontSize: 14 }}>The most unmoggable faces on the internet</p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="text-center" style={{ padding: '80px 0' }}>
            <p className="neon-purple font-semibold loading-dots" style={{ fontSize: 18 }}>
              Loading <span>.</span><span>.</span><span>.</span>
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && leaders.length === 0 && (
          <div className="card text-center" style={{ padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏜️</div>
            <p className="text-secondary mb-6">No battles yet. Be the first to mog.</p>
            <a
              href="/battle"
              className="btn btn-primary"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.12em', fontSize: 18 }}
            >
              <Swords size={17} /> START BATTLE
            </a>
          </div>
        )}

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leaders.map((l, i) => {
            const rank    = getRank(l.elo);
            const winRate = l.matches > 0 ? Math.round((l.wins / l.matches) * 100) : 0;
            const numClr  = RANK_NUM_COLORS[i] ?? '#475569';

            return (
              <motion.div
                key={l.sessionId}
                className="card flex items-center gap-4"
                style={{
                  padding: '14px 16px',
                  borderRadius: 16,
                  borderColor: i === 0 ? 'rgba(251,191,36,0.4)' : i === 1 ? 'rgba(148,163,184,0.3)' : i === 2 ? 'rgba(180,100,50,0.3)' : 'var(--clr-border)',
                  boxShadow: i === 0 ? '0 0 24px rgba(251,191,36,0.1)' : 'none',
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {/* Rank # */}
                <div className="font-display" style={{ fontSize: 28, color: numClr, width: 36, textAlign: 'center', flexShrink: 0 }}>
                  {i + 1}
                </div>

                {/* Rank icon avatar */}
                <div
                  className="avatar-md flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--clr-border)', flexShrink: 0 }}
                >
                  {rank.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {l.username || `Anon #${l.sessionId.slice(0, 6)}`}
                  </div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    {l.wins}W {l.losses}L · {winRate}% WR
                  </div>
                </div>

                {/* Rank badge */}
                <div
                  className="badge"
                  style={{ color: rank.color, background: `${rank.color}18`, border: `1px solid ${rank.color}40`, fontSize: 11 }}
                >
                  {rank.label}
                </div>

                {/* ELO */}
                <div className="font-display" style={{ fontSize: 24, color: rank.color, textShadow: `0 0 16px ${rank.color}60`, flexShrink: 0 }}>
                  {l.elo}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
