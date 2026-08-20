'use client';
import { usePageViewTracker } from '@/hooks/usePageViewTracker';

/** Invisible component — just fires tracking on every route change */
export default function PageTracker() {
  usePageViewTracker();
  return null;
}
