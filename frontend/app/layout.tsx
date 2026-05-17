import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#050508',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://omogle.vercel.app'),
  title: {
    default: 'omogle — the internet’s face arena',
    template: '%s | omogle'
  },
  description: '1v1 live face battles, AI-judged, Elo ranked. Your jawline is now competitive. Snap into the arena — see who mogs in real time.',
  keywords: ['mogging', 'face battle', 'AI face analysis', 'looksmaxxing', 'random video chat', 'omogle', 'elo ranking'],
  authors: [{ name: 'Omogle' }],
  creator: 'Omogle',
  publisher: 'Omogle',
  alternates: {
    canonical: '/',
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
    title: 'omogle — the internet’s face arena',
    description: '1v1 live face battles, AI-judged, Elo ranked. Your jawline is now competitive.',
    url: 'https://omogle.vercel.app',
    siteName: 'omogle',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'omogle — the internet’s face arena',
    description: '1v1 live face battles, AI-judged, Elo ranked. Your jawline is now competitive.',
  },
  icons: {
    icon: '/omogle-logo.svg',
    shortcut: '/omogle-logo.svg',
    apple: '/omogle-logo.svg',
  },
  verification: {
    google: '1wtS_iaxJD4SYCzjM1eNG3mV-xsjGPkLWcjYXpYVwbg',
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

            // 1. Patch console methods
            var _oe = console.error, _ow = console.warn, _ol = console.log, _oi = console.info;
            console.error = function() { if (_isWASMLog(arguments[0])) return; _oe.apply(console, arguments); };
            console.warn  = function() { if (_isWASMLog(arguments[0])) return; _ow.apply(console, arguments); };
            console.info  = function() { if (_isWASMLog(arguments[0])) return; _oi.apply(console, arguments); };
            console.log   = function() { if (_isWASMLog(arguments[0])) return; _ol.apply(console, arguments); };

            // 2. Intercept window error events (capture phase = before Next.js handler)
            window.addEventListener('error', function(e) {
              if (_isWASMLog(e.message)) {
                e.stopImmediatePropagation();
                e.preventDefault();
                return false;
              }
            }, true);

            // 3. Intercept unhandled promise rejections too
            window.addEventListener('unhandledrejection', function(e) {
              var msg = e.reason && (e.reason.message || String(e.reason));
              if (_isWASMLog(msg)) {
                e.stopImmediatePropagation();
                e.preventDefault();
              }
            }, true);
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
