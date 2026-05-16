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
