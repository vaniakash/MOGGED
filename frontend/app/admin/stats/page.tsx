'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Analytics {
  pageViews: { today: number; week: number; month: number; total: number };
  active:    { last1min: number; last5min: number; last1hr: number; last24hr: number; last7d: number };
  hourly:    { label: string; views: number; users: number }[];
  daily:     { label: string; views: number; users: number }[];
  countries: { code: string; name: string; views: number }[];
  topPages:  { path: string; views: number }[];
}

// ── Tiny bar-chart component (no dependencies) ────────────────────────────────
function BarChart({
  data, keyV, keyU, color = '#a855f7', height = 120,
}: {
  data: { label: string; views: number; users?: number }[];
  keyV: 'views';
  keyU?: 'users';
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data.map(d => d[keyV]), 1);
  const showCount = Math.min(data.length, 30);
  const slice = data.slice(-showCount);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height, padding: '0 4px', overflow: 'hidden' }}>
      {slice.map((d, i) => {
        const pct = (d[keyV] / max) * 100;
        return (
          <div
            key={i}
            title={`${d.label}\nViews: ${d[keyV]}${keyU ? `\nUsers: ${d[keyU as 'users']}` : ''}`}
            style={{
              flex: 1,
              height: `${Math.max(pct, 2)}%`,
              background: `linear-gradient(180deg, ${color} 0%, ${color}55 100%)`,
              borderRadius: '3px 3px 0 0',
              minWidth: 4,
              position: 'relative',
              cursor: 'default',
              transition: 'opacity 0.15s',
            }}
          />
        );
      })}
    </div>
  );
}

// ── StatCard ───────────────────────────────────────────────────────────────────
function Card({ label, value, sub, color = '#a855f7', pulse = false }: {
  label: string; value: string | number; sub?: string; color?: string; pulse?: boolean;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${color}25`,
      borderRadius: 16,
      padding: '20px 24px',
      flex: '1 1 140px',
      minWidth: 130,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {pulse && (
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: color,
            display: 'inline-block',
            boxShadow: `0 0 6px ${color}`,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        )}
        <span style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      </div>
      <div style={{ color, fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: '#334155', fontSize: 11, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ── Country flag emoji helper ─────────────────────────────────────────────────
function flag(code: string) {
  if (code.length !== 2) return '🌐';
  return code.toUpperCase().split('').map(c => String.fromCodePoint(127397 + c.charCodeAt(0))).join('');
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminStatsPage() {
  const router  = useRouter();
  const [token, setToken]     = useState<string | null>(null);
  const [data,  setData]      = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,  setError]    = useState('');
  const [chart,  setChart]    = useState<'hourly' | 'daily'>('daily');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem('admin_token');
    if (!t) { router.replace('/admin/login'); return; }
    setToken(t);
  }, [router]);

  const load = useCallback(async (t: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.status === 401) { router.replace('/admin/login'); return; }
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      setData(d);
      setError('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!token) return;
    load(token);
    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(() => load(token), 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [token, load]);

  const totalCountryViews = data ? data.countries.reduce((s, c) => s + c.views, 0) : 1;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050508',
      fontFamily: "'Inter', sans-serif",
      color: '#f8fafc',
      padding: '32px 24px',
      maxWidth: 1200,
      margin: '0 auto',
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes spin  { to{transform:rotate(360deg)} }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => router.push('/admin')}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', color: '#94a3b8', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ← Admin
            </button>
            <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 36, letterSpacing: '0.02em', margin: 0 }}>
              📊 Site Analytics
            </h1>
          </div>
          <p style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>
            Page views · Active users · Country breakdown · Auto-refreshes every 30s
          </p>
        </div>
        <button
          onClick={() => token && load(token)}
          style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 10, padding: '9px 20px', color: '#a855f7', fontSize: 13, cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}
        >
          ↻ Refresh
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(168,85,247,0.2)', borderTop: '3px solid #a855f7', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#475569' }}>Loading analytics…</span>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '16px 20px', color: '#f87171', marginBottom: 24 }}>
          ⚠️ {error}
        </div>
      )}

      {data && !loading && (
        <>
          {/* ── Section 1: Live Active Users ─────────────────────────────── */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              🟢 Active Users (Live)
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Card label="Right Now" value={data.active.last1min} color="#4ade80" pulse sub="last 1 min" />
              <Card label="Last 5 min" value={data.active.last5min} color="#4ade80" sub="unique sessions" />
              <Card label="Last Hour" value={data.active.last1hr} color="#38bdf8" sub="unique sessions" />
              <Card label="Last 24 h" value={data.active.last24hr} color="#a855f7" sub="unique sessions" />
              <Card label="Last 7 days" value={data.active.last7d} color="#f59e0b" sub="unique sessions" />
            </div>
          </section>

          {/* ── Section 2: Page View Totals ─────────────────────────────── */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              📄 Page Views
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Card label="Today" value={data.pageViews.today.toLocaleString()} color="#00f5d4" sub="since midnight" />
              <Card label="This Week" value={data.pageViews.week.toLocaleString()} color="#a855f7" sub="last 7 days" />
              <Card label="This Month" value={data.pageViews.month.toLocaleString()} color="#f59e0b" sub="since 1st" />
              <Card label="All Time" value={data.pageViews.total.toLocaleString()} color="#ff2d78" sub="last 90 days stored" />
            </div>
          </section>

          {/* ── Section 3: Charts ────────────────────────────────────────── */}
          <section style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                📈 Traffic Chart
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['daily', 'hourly'] as const).map(c => (
                  <button key={c} onClick={() => setChart(c)} style={{
                    padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    background: chart === c ? '#a855f7' : 'rgba(255,255,255,0.05)',
                    border: chart === c ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    color: chart === c ? '#fff' : '#64748b',
                  }}>
                    {c === 'daily' ? 'Last 30 Days' : 'Last 24 Hours'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 20px 16px' }}>
              {(chart === 'daily' ? data.daily : data.hourly).length === 0 ? (
                <div style={{ textAlign: 'center', color: '#334155', padding: '40px 0', fontSize: 14 }}>
                  No data yet — visit some pages to start tracking!
                </div>
              ) : (
                <>
                  <BarChart
                    data={chart === 'daily' ? data.daily : data.hourly}
                    keyV="views"
                    keyU="users"
                    color={chart === 'daily' ? '#a855f7' : '#00f5d4'}
                    height={140}
                  />
                  {/* X-axis labels */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingInline: 4 }}>
                    {(() => {
                      const items = chart === 'daily' ? data.daily : data.hourly;
                      const show = items.slice(-30);
                      const step = Math.max(1, Math.floor(show.length / 6));
                      return show.filter((_, i) => i % step === 0 || i === show.length - 1).map((d, i) => (
                        <span key={i} style={{ color: '#334155', fontSize: 10 }}>{d.label}</span>
                      ));
                    })()}
                  </div>
                  <div style={{ display: 'flex', gap: 20, marginTop: 12, justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#475569' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: chart === 'daily' ? '#a855f7' : '#00f5d4' }} />
                      Views
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#475569' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }} />
                      Hover bar for unique users
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ── Section 4: Country + Top Pages (side-by-side) ──────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 36 }}>

            {/* Countries */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                🌍 Countries (last 30 days)
              </h2>
              {data.countries.length === 0 ? (
                <p style={{ color: '#334155', fontSize: 13 }}>No country data yet. Country detection requires Cloudflare in production.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {data.countries.map((c, i) => {
                    const pct = Math.round((c.views / totalCountryViews) * 100);
                    return (
                      <div key={c.code}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 16 }}>{flag(c.code)}</span>
                            <span style={{ fontSize: 13, color: '#94a3b8' }}>{c.name}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: '#475569' }}>{pct}%</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', minWidth: 40, textAlign: 'right' }}>{c.views.toLocaleString()}</span>
                          </div>
                        </div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${pct}%`,
                            background: i === 0 ? '#a855f7' : i === 1 ? '#00f5d4' : i === 2 ? '#f59e0b' : '#334155',
                            borderRadius: 99,
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Pages */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                🔥 Top Pages (last 30 days)
              </h2>
              {data.topPages.length === 0 ? (
                <p style={{ color: '#334155', fontSize: 13 }}>No page view data yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.topPages.map((p, i) => {
                    const maxV = data.topPages[0]?.views || 1;
                    const pct  = Math.round((p.views / maxV) * 100);
                    return (
                      <div key={p.path}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'monospace' }}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`} {p.path || '/'}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>{p.views.toLocaleString()}</span>
                        </div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${pct}%`,
                            background: 'linear-gradient(90deg, #ff2d78, #a855f7)',
                            borderRadius: 99,
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer note */}
          <p style={{ color: '#1e293b', fontSize: 11, textAlign: 'center' }}>
            Data stored for 90 days · Country data requires Cloudflare in production · Refreshes every 30s
          </p>
        </>
      )}
    </div>
  );
}
