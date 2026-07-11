'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

/**
 * Wrap any page with this component to require authentication.
 * Redirects to /login immediately if the user is not signed in.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [user, isLoading, router]);

  // Show nothing (blank screen) while checking auth or redirecting
  if (isLoading || !user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#050508',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid rgba(168,85,247,0.2)',
          borderTop: '3px solid #a855f7',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#475569', fontSize: 14 }}>Checking access…</p>
      </div>
    );
  }

  return <>{children}</>;
}
