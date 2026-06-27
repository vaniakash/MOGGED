// Server Component wrapper — exports metadata for /leaderboard route
import type { Metadata } from 'next';
import LeaderboardClient from '@/components/LeaderboardClient';

export const metadata: Metadata = {
  title: 'Mogging Leaderboard — Top Moggers Ranked by ELO',
  description: 'The global Omogl leaderboard. See the top moggers ranked by ELO — from NPC to Average to High Tier, Chad, and Gigachad. Battle your way to the top.',
  alternates: {
    canonical: 'https://omogl.com/leaderboard',
  },
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
