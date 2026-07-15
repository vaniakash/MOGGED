'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface SubscriptionStatus {
  active: boolean;
  plan: string | null;
  expiresAt: string | null;
  daysLeft: number;
}

interface Props {
  children: React.ReactNode;
}

export default function SubscriptionGuard({ children }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<'loading' | 'active' | 'inactive'>('loading');

  useEffect(() => {
    const sessionId = localStorage.getItem('omogl_session');

    // Not logged in → AuthGuard will handle redirect
    if (!sessionId) {
      setStatus('inactive');
      return;
    }

    fetch(`${BACKEND_URL}/api/subscription/status?sessionId=${sessionId}`)
      .then(r => r.json())
      .then((data: SubscriptionStatus) => {
        if (data.active) {
          setStatus('active');
        } else {
          // Redirect to pricing with ?redirect=currentPath
          router.replace(`/pricing?redirect=${encodeURIComponent(pathname)}`);
        }
      })
      .catch(() => {
        // On network error, allow access (fail open during dev)
        setStatus('active');
      });
  }, [pathname]);

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#050508',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        color: '#a855f7',
        fontFamily: 'Bebas Neue, cursive',
        fontSize: 24,
        letterSpacing: '0.1em',
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '3px solid rgba(168,85,247,0.2)',
          borderTop: '3px solid #a855f7',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        VERIFYING ACCESS...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === 'inactive') return null;

  return <>{children}</>;
}
