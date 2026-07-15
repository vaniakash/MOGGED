'use client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleSignOut() {
    signOut();
    router.push('/');
  }

  // Prevent hydration mismatch by returning empty structure until mounted
  if (!mounted) {
    return (
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', background: '#0a0d14', borderBottom: '1px solid #1e222a',
        position: 'sticky', top: 0, zIndex: 50, height: 72
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="Omogl Logo" style={{ height: 32, objectFit: 'contain' }} />
        </Link>
      </nav>
    );
  }

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
      padding: '12px 24px', background: '#0a0d14', borderBottom: '1px solid #1e222a',
      position: 'sticky', top: 0, zIndex: 50, minHeight: 72
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
        <img src="/logo.png" alt="Omogl Logo" style={{ height: 32, objectFit: 'contain' }} />
      </Link>

      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" style={{ width: 36, height: 36, borderRadius: '50%' }} />
              ) : (
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#a855f7,#7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 16,
                }}>
                  {(user.username || user.displayName)?.[0] || '?'}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14 }}>
                  {user.username || user.displayName}
                </div>
                <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
                  <span style={{ color: '#a855f7', fontWeight: 700 }}>{user.elo} ELO</span>
                  {' · '}
                  <span style={{ color: '#4ade80' }}>{user.wins}W</span>
                  {' / '}
                  <span style={{ color: '#f87171' }}>{user.losses}L</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => router.push('/leaderboard')}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: '1px solid #2a2f3a',
                  background: '#181b21', color: '#94a3b8', fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                <Trophy size={14} /> Leaderboard
              </button>
              <button
                onClick={handleSignOut}
                style={{
                  padding: '6px 12px', borderRadius: 8,
                  border: '1px solid rgba(248,113,113,0.2)',
                  background: 'rgba(248,113,113,0.08)',
                  color: '#f87171', fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div className="hide-on-mobile">
              <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                🏆 Track Your ELO
              </div>
              <div style={{ color: '#475569', fontSize: 11 }}>
                Sign in to save battle history & climb
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/login" style={{
                padding: '8px 18px', borderRadius: 99,
                background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                color: '#fff', fontWeight: 700, fontSize: 13,
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}>Log In</Link>
              <Link href="/signup" style={{
                padding: '8px 18px', borderRadius: 99,
                background: 'transparent', border: '1px solid rgba(168,85,247,0.4)',
                color: '#a855f7', fontWeight: 700, fontSize: 13,
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}>Create Account</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
