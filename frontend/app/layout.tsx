import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OmmoGale — AI Mogging Battle',
  description: 'Random face battle powered by AI. Get matched, get analyzed, get mogged — or mog them back.',
  keywords: ['mogging', 'face battle', 'AI face analysis', 'random video chat', 'ommogale'],
  openGraph: {
    title: 'OmmoGale — AI Mogging Battle',
    description: 'Can you escape the mog? Face off in the AI arena.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
