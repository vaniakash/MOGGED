/**
 * trackPageView middleware
 * ─────────────────────────────────────────────────────────────────────────────
 * Records every frontend page view that the frontend POSTs to /api/track/pageview.
 * The frontend calls this on every route change with { path, sessionId }.
 *
 * Country detection uses the Cloudflare `cf-ipcountry` header (available in prod),
 * falling back to a static map if the header is missing (local dev).
 */

const express   = require('express');
const PageView  = require('../models/PageView');
const router    = express.Router();

// Very minimal ISO→name map for display (expand as needed)
const COUNTRY_NAMES = {
  IN: 'India', US: 'United States', GB: 'United Kingdom', DE: 'Germany',
  FR: 'France', AU: 'Australia', CA: 'Canada', SG: 'Singapore', JP: 'Japan',
  BR: 'Brazil', NG: 'Nigeria', PK: 'Pakistan', BD: 'Bangladesh', NP: 'Nepal',
  PH: 'Philippines', ID: 'Indonesia', MY: 'Malaysia', TH: 'Thailand', AE: 'UAE',
  SA: 'Saudi Arabia', EG: 'Egypt', KE: 'Kenya', ZA: 'South Africa',
  RU: 'Russia', CN: 'China', KR: 'South Korea', TR: 'Turkey', IT: 'Italy',
  ES: 'Spain', MX: 'Mexico', AR: 'Argentina', CO: 'Colombia', VN: 'Vietnam',
  UA: 'Ukraine', PL: 'Poland', NL: 'Netherlands', SE: 'Sweden', NO: 'Norway',
};

// Paths to ignore (API calls, static assets, etc.)
const IGNORE_PATHS = new Set(['/favicon.ico', '/robots.txt', '/sitemap.xml']);

// POST /api/track/pageview  — called by the frontend on every route change
router.post('/pageview', async (req, res) => {
  try {
    const { path, sessionId } = req.body;

    // Ignore non-page paths
    if (!path || IGNORE_PATHS.has(path) || path.startsWith('/api') || path.startsWith('/_next')) {
      return res.json({ ok: true });
    }

    // Country from Cloudflare header (production), or X-Country header for testing
    const countryCode = (
      req.headers['cf-ipcountry'] ||
      req.headers['x-country'] ||
      'Unknown'
    ).toUpperCase().slice(0, 2);

    const countryName = COUNTRY_NAMES[countryCode] || countryCode;

    // Grab real IP (Cloudflare forwards CF-Connecting-IP)
    const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    const ua = (req.headers['user-agent'] || '').slice(0, 200);

    await PageView.create({
      path,
      sessionId: sessionId || null,
      country:     countryCode !== 'XX' ? countryCode : 'Unknown',
      countryName: countryCode !== 'XX' ? countryName : 'Unknown',
      ip,
      ua,
    });

    return res.json({ ok: true });
  } catch (e) {
    // Never fail silently on the client side — tracking is non-critical
    return res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
