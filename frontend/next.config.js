/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: [
    '10.202.98.220',
    '2a55-2402-8100-2c39-8c95-7062-99ec-483a-3b9e.ngrok-free.app',
  ],

  // Required for MediaPipe WASM SIMD (SharedArrayBuffer)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy',   value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
    ];
  },

  turbopack: {
    resolveAlias: {
      fs:  { browser: './lib/empty.js' },
      net: { browser: './lib/empty.js' },
      tls: { browser: './lib/empty.js' },
    },
  },
};

module.exports = nextConfig;
