'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface Stats {
  totalUsers: number;
  totalMatches: number;
  googleUsers: number;
  activeQueue: number;
  activeBattles: number;
  activeChat: number;
}

interface AdminUser {
  _id: string;
  sessionId: string;
  displayName: string | null;
  email: string | null;
  provider: string;
  elo: number;
  wins: number;
  losses: number;
  matches: number;
  createdAt: string;
  lastSeen: string;
  photoURL: string | null;
  username: string | null;
  nationality: string | null;
  age: number | null;
  gender: string | null;
  profileComplete: boolean;
}

interface AdminMatch {
  _id: string;
  userA: string;
  userB: string;
  scoreA: number;
  scoreB: number;
  winner: string;
  eloChangeA: number;
  eloChangeB: number;
  createdAt: string;
}

type Tab = 'overview' | 'users' | 'matches' | 'tools';

function StatCard({ label, value, sub, color = '#a855f7' }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: '20px 24px',
      minWidth: 140,
      flex: '1 1 140px',
    }}>
      <div style={{ color, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ color: '#f8fafc', fontSize: 13, fontWeight: 600, marginTop: 6 }}>{label}</div>
      {sub && <div style={{ color: '#475569', fontSize: 11, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function shortId(id: string) {
  return id.slice(0, 8) + '…';
}

export default function AdminDashboardPage() {
  const router  = useRouter();
  const [token, setToken]     = useState<string | null>(null);
  const [tab, setTab]         = useState<Tab>('overview');
  const [stats, setStats]     = useState<Stats | null>(null);
  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [toolsData, setToolsData] = useState<{ faceScores: any[], credits: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersPage, setUsersPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortUsers, setSortUsers]   = useState('-elo');
  const [searchQ, setSearchQ]       = useState('');

  // Auth guard
  useEffect(() => {
    const t = sessionStorage.getItem('admin_token');
    if (!t) { router.replace('/admin/login'); return; }
    setToken(t);
  }, [router]);

  const authFetch = useCallback(async (url: string) => {
    const t = sessionStorage.getItem('admin_token');
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (res.status === 401) { router.replace('/admin/login'); throw new Error('Unauthorized'); }
    return res.json();
  }, [router]);

  // Load stats
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      authFetch(`${BACKEND_URL}/api/admin/stats`),
      authFetch(`${BACKEND_URL}/api/admin/matches?limit=50`),
    ]).then(([s, m]) => {
      setStats(s);
      setMatches(m.matches || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [token, authFetch]);

  // Load users when tab switches or page/sort changes
  useEffect(() => {
    if (!token || tab !== 'users') return;
    authFetch(`${BACKEND_URL}/api/admin/users?page=${usersPage}&limit=25&sort=${sortUsers}`)
      .then(d => {
        setUsers(d.users || []);
        setTotalPages(d.pages || 1);
      }).catch(console.error);
  }, [token, tab, usersPage, sortUsers, authFetch]);

  // Load tools data
  useEffect(() => {
    if (!token || tab !== 'tools') return;
    authFetch(`${BACKEND_URL}/api/admin/tools`)
      .then(d => setToolsData(d))
      .catch(console.error);
  }, [token, tab, authFetch]);

  function handleLogout() {
    sessionStorage.removeItem('admin_token');
    router.push('/admin/login');
  }

  const filteredUsers = searchQ.trim()
    ? users.filter(u =>
        (u.displayName || '').toLowerCase().includes(searchQ.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQ.toLowerCase()) ||
        u.sessionId.toLowerCase().includes(searchQ.toLowerCase())
      )
    : users;

  if (!token || loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#050508',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#a855f7', fontFamily: "'Inter', sans-serif", fontSize: 16,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🛡️</div>
          Loading admin panel…
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050508',
      fontFamily: "'Inter', sans-serif",
      color: '#f8fafc',
    }}>
      {/* Top bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5,5,8,0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 56,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#f8fafc' }}>Omogl</span>
          <span style={{
            background: 'rgba(168,85,247,0.2)', color: '#a855f7',
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
            border: '1px solid rgba(168,85,247,0.3)', letterSpacing: '0.06em',
          }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/" style={{ color: '#475569', fontSize: 13, textDecoration: 'none' }}>← Site</a>
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 14px', borderRadius: 8,
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.2)',
              color: '#f87171', fontSize: 13, cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: '#475569', fontSize: 13 }}>Real-time monitoring of Omogl activity</p>
        </div>

        {/* Live activity bar */}
        {stats && (
          <div style={{
            display: 'flex', gap: 10, marginBottom: 28,
            flexWrap: 'wrap',
          }}>
            {[
              { label: 'In queue', value: stats.activeQueue, dot: '#fbbf24' },
              { label: 'Active battles', value: stats.activeBattles, dot: '#f87171' },
              { label: 'Active chats', value: stats.activeChat, dot: '#00f5d4' },
            ].map(({ label, value, dot }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 99, padding: '6px 14px',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, display: 'inline-block' }} />
                <span style={{ color: '#94a3b8', fontSize: 12 }}>{label}:</span>
                <span style={{ color: '#f8fafc', fontSize: 12, fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stat cards */}
        {stats && (
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
            <StatCard label="Total Users" value={stats.totalUsers} color="#a855f7" sub="all-time registrations" />
            <StatCard label="Total Battles" value={stats.totalMatches} color="#00f5d4" sub="completed matches" />
            <StatCard label="Google Accounts" value={stats.googleUsers} color="#4ade80" sub="signed in via Google" />
            <StatCard label="Anonymous" value={stats.totalUsers - stats.googleUsers} color="#fbbf24" sub="no account linked" />
          </div>
        )}

        {/* Tab nav */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 24,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12, padding: 4,
          width: 'fit-content',
        }}>
          {(['overview', 'users', 'matches', 'tools'] as Tab[]).map(t => (
            <button
              key={t}
              id={`admin-tab-${t}`}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 20px', borderRadius: 8, border: 'none',
                background: tab === t ? 'rgba(168,85,247,0.25)' : 'transparent',
                color: tab === t ? '#a855f7' : '#475569',
                fontWeight: tab === t ? 700 : 400,
                fontSize: 13, cursor: 'pointer',
                fontFamily: 'inherit',
                textTransform: 'capitalize',
                transition: 'all 0.15s',
              }}
            >
              {t === 'overview' ? '📊 Overview' : t === 'users' ? '👥 Users' : t === 'matches' ? '⚔️ Matches' : '🔬 Tools'}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {tab === 'overview' && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, color: '#94a3b8' }}>
              Recent Battles (last 50)
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['Player A', 'Score A', 'vs', 'Score B', 'Player B', 'Winner', 'Date'].map(h => (
                      <th key={h} style={{
                        padding: '10px 12px', textAlign: 'left',
                        color: '#475569', fontWeight: 600, fontSize: 11,
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matches.slice(0, 20).map((m, i) => (
                    <tr key={m._id} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    }}>
                      <td style={{ padding: '10px 12px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 11 }}>{shortId(m.userA)}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: m.winner === 'A' ? '#4ade80' : '#f87171' }}>
                        {m.scoreA?.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>vs</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: m.winner === 'B' ? '#4ade80' : '#f87171' }}>
                        {m.scoreB?.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 11 }}>{shortId(m.userB)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 99,
                          background: m.winner === 'A' ? 'rgba(74,222,128,0.1)' : 'rgba(168,85,247,0.1)',
                          color: m.winner === 'A' ? '#4ade80' : '#a855f7',
                          fontSize: 11, fontWeight: 700,
                        }}>
                          Player {m.winner}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {formatDate(m.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Users Tab ── */}
        {tab === 'users' && (
          <div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
              <input
                placeholder="Search name, email, or session…"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                style={{
                  flex: '1 1 220px', maxWidth: 320,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f8fafc', fontSize: 13, outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <select
                value={sortUsers}
                onChange={e => { setSortUsers(e.target.value); setUsersPage(1); }}
                style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f8fafc', fontSize: 13, cursor: 'pointer',
                  fontFamily: 'inherit', outline: 'none',
                }}
              >
                <option value="-elo">Sort: Highest ELO</option>
                <option value="elo">Sort: Lowest ELO</option>
                <option value="-matches">Sort: Most Matches</option>
                <option value="-createdAt">Sort: Newest</option>
                <option value="createdAt">Sort: Oldest</option>
              </select>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['User', 'ELO', 'W/L/M', 'Provider', 'Nationality', 'Age', 'Gender', 'Profile', 'Joined'].map(h => (
                      <th key={h} style={{
                        padding: '10px 12px', textAlign: 'left',
                        color: '#475569', fontWeight: 600, fontSize: 11,
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u._id} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {u.photoURL ? (
                            <img src={u.photoURL} alt="" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
                          ) : (
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                              background: 'rgba(168,85,247,0.2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, color: '#a855f7',
                            }}>?</div>
                          )}
                          <div>
                            <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: 13 }}>
                              {u.username || u.displayName || <span style={{ color: '#334155', fontStyle: 'italic' }}>Anonymous</span>}
                            </div>
                            <div style={{ color: '#475569', fontSize: 11 }}>{u.email || <span style={{ fontFamily: 'monospace' }}>{shortId(u.sessionId)}</span>}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ color: '#a855f7', fontWeight: 700 }}>{u.elo}</span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8' }}>
                        <span style={{ color: '#4ade80' }}>{u.wins}W</span>
                        {' / '}
                        <span style={{ color: '#f87171' }}>{u.losses}L</span>
                        {' / '}
                        <span>{u.matches}M</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 99,
                          background: u.provider === 'google' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                          color: u.provider === 'google' ? '#4ade80' : '#475569',
                          fontSize: 11, fontWeight: 700,
                          border: `1px solid ${u.provider === 'google' ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}`,
                        }}>
                          {u.provider === 'google' ? 'G Google' : 'Anon'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 12 }}>
                        {u.nationality || <span style={{ color: '#334155' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 12 }}>
                        {u.age || <span style={{ color: '#334155' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 12 }}>
                        {u.gender ? (
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: 99,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            fontSize: 11, textTransform: 'capitalize',
                          }}>
                            {u.gender === 'prefer_not' ? 'N/A' : u.gender}
                          </span>
                        ) : <span style={{ color: '#334155' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 99,
                          background: u.profileComplete ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)',
                          color: u.profileComplete ? '#4ade80' : '#fbbf24',
                          fontSize: 11, fontWeight: 700,
                          border: `1px solid ${u.profileComplete ? 'rgba(74,222,128,0.2)' : 'rgba(251,191,36,0.2)'}`,
                        }}>
                          {u.profileComplete ? '✓ Complete' : '⚠ Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569', whiteSpace: 'nowrap', fontSize: 12 }}>
                        {formatDate(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#334155' }}>No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
              <button
                onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                disabled={usersPage <= 1}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: usersPage <= 1 ? '#334155' : '#94a3b8',
                  cursor: usersPage <= 1 ? 'not-allowed' : 'pointer', fontSize: 13,
                }}
              >← Prev</button>
              <span style={{ padding: '8px 16px', color: '#64748b', fontSize: 13 }}>
                {usersPage} / {totalPages}
              </span>
              <button
                onClick={() => setUsersPage(p => Math.min(totalPages, p + 1))}
                disabled={usersPage >= totalPages}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: usersPage >= totalPages ? '#334155' : '#94a3b8',
                  cursor: usersPage >= totalPages ? 'not-allowed' : 'pointer', fontSize: 13,
                }}
              >Next →</button>
            </div>
          </div>
        )}

        {/* ── Matches Tab ── */}
        {tab === 'matches' && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, color: '#94a3b8' }}>
              All Recent Battles
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['Player A', 'Score A', 'vs', 'Score B', 'Player B', 'Winner', 'ELO Change', 'Date'].map(h => (
                      <th key={h} style={{
                        padding: '10px 12px', textAlign: 'left',
                        color: '#475569', fontWeight: 600, fontSize: 11,
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m, i) => (
                    <tr key={m._id} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    }}>
                      <td style={{ padding: '10px 12px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 11 }}>{shortId(m.userA)}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: m.winner === 'A' ? '#4ade80' : '#f87171' }}>
                        {m.scoreA?.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>vs</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: m.winner === 'B' ? '#4ade80' : '#f87171' }}>
                        {m.scoreB?.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 11 }}>{shortId(m.userB)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 99,
                          background: m.winner === 'A' ? 'rgba(74,222,128,0.1)' : 'rgba(168,85,247,0.1)',
                          color: m.winner === 'A' ? '#4ade80' : '#a855f7',
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {m.winner}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12 }}>
                        <span style={{ color: '#4ade80' }}>+{m.eloChangeA ?? '?'}</span>
                        <span style={{ color: '#334155' }}> / </span>
                        <span style={{ color: '#f87171' }}>{m.eloChangeB ?? '?'}</span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {formatDate(m.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tools Tab ── */}
        {tab === 'tools' && toolsData && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
              
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, color: '#94a3b8' }}>Recent Face Scores</h2>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', padding: 16 }}>
                  {toolsData.faceScores.length === 0 ? <div style={{ color: '#64748b', fontSize: 13 }}>No face scores yet.</div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {toolsData.faceScores.map((fs: any) => (
                        <div key={fs._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)' }}>
                          <div>
                            <div style={{ fontSize: 13, color: '#f8fafc', fontWeight: 600, marginBottom: 4 }}>Score: <span style={{ color: '#a855f7' }}>{fs.overall_score}/10</span></div>
                            <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{shortId(fs.sessionId)}</div>
                          </div>
                          <div style={{ fontSize: 11, color: '#475569', textAlign: 'right' }}>
                            <div>{formatDate(fs.createdAt)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, color: '#94a3b8' }}>Glow-Up Credits</h2>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', padding: 16 }}>
                  {toolsData.credits.length === 0 ? <div style={{ color: '#64748b', fontSize: 13 }}>No credits tracking yet.</div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {toolsData.credits.map((c: any) => (
                        <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)' }}>
                          <div>
                            <div style={{ fontSize: 13, color: '#f8fafc', fontWeight: 600, marginBottom: 4 }}>Balance: <span style={{ color: '#fbbf24' }}>{c.balance}</span></div>
                            <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{shortId(c.sessionId)}</div>
                          </div>
                          <div style={{ fontSize: 11, color: '#475569', textAlign: 'right' }}>
                            <div>{formatDate(c.updatedAt)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
