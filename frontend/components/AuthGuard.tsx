'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const Spinner = ({ message }: { message: string }) => (
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
    <p style={{ color: '#475569', fontSize: 14 }}>{message}</p>
  </div>
);

/**
 * AuthGuard — redirects to /login if user is not signed in.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return <Spinner message="Checking access…" />;
  return <>{children}</>;
}

/**
 * SubscriptionGuard — requires both authentication AND an active subscription.
 * Redirects to /login if not logged in, /pricing if logged in but not subscribed.
 */
export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, hasActiveSub } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login?redirect=/battle');
      return;
    }
    if (!hasActiveSub()) {
      router.replace('/pricing');
    }
  }, [user, isLoading, hasActiveSub, router]);

  if (isLoading) return <Spinner message="Checking subscription…" />;
  if (!user) return <Spinner message="Redirecting to login…" />;
  if (!hasActiveSub()) return <Spinner message="Redirecting to pricing…" />;

  return <>{children}</>;
}

