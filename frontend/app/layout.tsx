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
        {/* Suppress MediaPipe WASM info logs before Next.js dev overlay hooks in */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var _origError = console.error;
            var _origWarn = console.warn;
            var _origLog = console.log;
            var _origInfo = console.info;
            function _isWASMLog(s) {
              return typeof s === 'string' && (
                s.indexOf('XNNPACK') !== -1 ||
                s.indexOf('INFO:') !== -1 ||
                s.indexOf('OpenGL error checking') !== -1 ||
                s.indexOf('face_landmarker_graph') !== -1 ||
                s.indexOf('gl_context.cc') !== -1
              );
            }
            console.error = function() { if (_isWASMLog(arguments[0])) return; _origError.apply(console, arguments); };
            console.warn  = function() { if (_isWASMLog(arguments[0])) return; _origWarn.apply(console, arguments); };
            console.info  = function() { if (_isWASMLog(arguments[0])) return; _origInfo.apply(console, arguments); };
            console.log   = function() { if (_isWASMLog(arguments[0])) return; _origLog.apply(console, arguments); };
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
