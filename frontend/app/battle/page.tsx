// Server Component wrapper — exports metadata for /battle route
import type { Metadata } from 'next';
import { Suspense } from 'react';
import BattlePageClient from '@/components/BattlePageClient';

export const metadata: Metadata = {
  title: 'Face Battle Arena — Go Live & Get Mogged',
  description: 'Enter the live face battle arena. Get matched with a random stranger, let the AI analyze both faces for 10 seconds, and find out who gets mogged. ELO-ranked matchmaking.',
  alternates: {
    canonical: 'https://omogle.vercel.app/battle',
  },
};

export default function BattlePage() {
  return (
    <Suspense fallback={null}>
      <BattlePageClient />
    </Suspense>
  );
}
