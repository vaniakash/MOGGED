'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

/**
 * usePageViewTracker
 * Fires a lightweight POST to /api/track/pageview on every route change.
 * Call this once in layout.tsx (or a top-level client component).
 */
export function usePageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    const sessionId = typeof window !== 'undefined'
      ? localStorage.getItem('omogl_session')
      : null;

    // Fire and forget — never block rendering
    fetch(`${BACKEND_URL}/api/track/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, sessionId }),
      keepalive: true,
    }).catch(() => {}); // silently swallow any network errors
  }, [pathname]);
}
