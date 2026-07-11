import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/lib/auth';

const GA_ID = 'G-8EJNTCLJ6D';

export const viewport: Viewport = {
  themeColor: '#050508',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://omogl.com'),
  title: {
    default: 'Omogl — Face Battle Arena | Get Mogged Online',
    template: '%s | Omogl'
  },
  description: 'Join live face battles, compare looks, climb ELO rankings, and see who gets mogged. Omogl is the internet\'s real-time competitive face arena — AI-judged, stranger-matched, brutally honest.',
  keywords: [
    'omogl', 'mogged', 'mogging', 'face battle', 'AI face analysis',
    'looksmaxxing', 'looksmax', 'hunter eyes test', 'canthal tilt',
    'facial symmetry test', 'face rating AI', 'attractiveness battle',
    'mogger', 'face duel', 'elo ranking', 'online face battle',
  ],
  authors: [{ name: 'Omogl' }],
  creator: 'Omogl',
  publisher: 'Omogl',
  alternates: {
    canonical: 'https://omogl.com/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Omogl — Face Battle Arena | Get Mogged Online',
    description: 'Join live face battles, compare looks, climb ELO rankings, and see who gets mogged. The internet\'s real-time competitive face arena.',
    url: 'https://omogl.com/',
    siteName: 'Omogl',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 1200,
        height: 630,
        alt: 'Omogl — The Internet\'s Face Arena',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omogl — Face Battle Arena | Get Mogged Online',
    description: 'Join live face battles, compare looks, climb ELO rankings, and see who gets mogged.',
    images: ['/android-chrome-512x512.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: '1wtS_iaxJD4SYCzjM1eNG3mV-xsjGPkLWcjYXpYVwbg',
  },
};

// ── JSON-LD Schema Markup ─────────────────────────────────────────────────
const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Omogl',
  url: 'https://omogl.com/',
  description: 'Real-time competitive face battle platform. Get matched with strangers, have your face analyzed by AI, and see who gets mogged. ELO-ranked matchmaking with hunter eyes detection, facial symmetry scoring, and live result reveals.',
  applicationCategory: 'EntertainmentApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Real-time webcam face battles',
    'AI-powered facial analysis',
    'ELO ranking system',
    'Hunter eyes detection',
    'Facial symmetry scoring',
    'Friend battle rooms',
    'Live leaderboard',
  ],
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Omogl',
  url: 'https://omogl.com/',
  logo: 'https://omogl.com/android-chrome-512x512.png',
  description: 'Omogl is the internet\'s real-time competitive face battle platform. Face off against strangers or friends, get AI-analyzed, and find out who gets mogged.',
  sameAs: [],
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
        {/* JSON-LD Schema — server-rendered, always crawlable by Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Suppress MediaPipe WASM info logs — must run before Next.js dev overlay registers */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            function _isWASMLog(s) {
              if (typeof s !== 'string') return false;
              return (
                s.indexOf('XNNPACK') !== -1 ||
                s.indexOf('INFO:') !== -1 ||
                s.indexOf('OpenGL error checking') !== -1 ||
                s.indexOf('face_landmarker_graph') !== -1 ||
                s.indexOf('gl_context.cc') !== -1 ||
                s.indexOf('TensorFlow Lite') !== -1
              );
            }
            var _oe = console.error, _ow = console.warn, _ol = console.log, _oi = console.info;
            console.error = function() { if (_isWASMLog(arguments[0])) return; _oe.apply(console, arguments); };
            console.warn  = function() { if (_isWASMLog(arguments[0])) return; _ow.apply(console, arguments); };
            console.info  = function() { if (_isWASMLog(arguments[0])) return; _oi.apply(console, arguments); };
            console.log   = function() { if (_isWASMLog(arguments[0])) return; _ol.apply(console, arguments); };
            window.addEventListener('error', function(e) {
              if (_isWASMLog(e.message)) { e.stopImmediatePropagation(); e.preventDefault(); return false; }
            }, true);
            window.addEventListener('unhandledrejection', function(e) {
              var msg = e.reason && (e.reason.message || String(e.reason));
              if (_isWASMLog(msg)) { e.stopImmediatePropagation(); e.preventDefault(); }
            }, true);
          })();
        `}} />
      </head>
      <body>
        <AuthProvider>
        {children}
        </AuthProvider>

        {/* ── Google Analytics GA4 ──────────────────────────────────────── */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </body>
    </html>
  );
}
