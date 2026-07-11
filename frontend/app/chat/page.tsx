import { Metadata } from 'next';
import ChatPageClient from '@/components/ChatPageClient';
import AuthGuard from '@/components/AuthGuard';

export const metadata: Metadata = {
  title: 'Omogl - Find Your Stranger Love',
  description: 'Connect with strangers in a 1-on-1 private text chat.',
};

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatPageClient />
    </AuthGuard>
  );
}
