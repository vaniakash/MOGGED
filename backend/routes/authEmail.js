const express    = require('express');
const bcrypt     = require('bcryptjs');
const crypto     = require('crypto');
const rateLimit  = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const User       = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../lib/email');

const router = express.Router();

// ── Rate limiters ─────────────────────────────────────────────────────────────
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many signup attempts. Please try again in an hour.' },
  standardHeaders: true, legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true, legacyHeaders: false,
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many requests. Please try again in an hour.' },
  standardHeaders: true, legacyHeaders: false,
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function validatePassword(pwd) {
  if (pwd.length < 8)                          return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(pwd))                      return 'Password must contain an uppercase letter.';
  if (!/[a-z]/.test(pwd))                      return 'Password must contain a lowercase letter.';
  if (!/[0-9]/.test(pwd))                      return 'Password must contain a number.';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd))
                                               return 'Password must contain a special character.';
  return null;
}

function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

function buildUserResponse(user) {
  return {
    email:           user.email,
    displayName:     user.displayName,
    photoURL:        user.photoURL,
    elo:             user.elo,
    wins:            user.wins,
    losses:          user.losses,
    matches:         user.matches,
    provider:        user.provider,
    emailVerified:   user.emailVerified,
    profileComplete: user.profileComplete,
    username:        user.username,
    nationality:     user.nationality,
    age:             user.age,
    gender:          user.gender,
  };
}

// ── POST /api/auth/email/signup ───────────────────────────────────────────────
router.post('/signup', signupLimiter, async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email, and password are required.' });

  const emailLC = email.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLC))
    return res.status(400).json({ error: 'Invalid email address.' });

  const pwdError = validatePassword(password);
  if (pwdError) return res.status(400).json({ error: pwdError });

  try {
    // Check for existing user with same email
    const existing = await User.findOne({ email: emailLC });

    if (existing) {
      if (existing.provider === 'google' || existing.provider === 'google+email') {
        // Link email/password to existing Google account
        const passwordHash = await bcrypt.hash(password, 12);
        const token        = randomToken();
        existing.passwordHash      = passwordHash;
        existing.emailVerifyToken   = token;
        existing.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        existing.provider           = 'google+email';
        await existing.save();
        await sendVerificationEmail(emailLC, existing.displayName || name, token);
        return res.json({ message: 'Account linked! Please verify your email.', linked: true });
      }
      // Generic error — don't reveal account exists
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // New email user
    const passwordHash = await bcrypt.hash(password, 12);
    const token        = randomToken();
    const sessionId    = uuidv4();

    await User.create({
      sessionId,
      email:              emailLC,
      displayName:        name.trim().slice(0, 50),
      provider:           'email',
      passwordHash,
      emailVerified:      false,
      emailVerifyToken:   token,
      emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await sendVerificationEmail(emailLC, name, token);

    return res.status(201).json({
      message: 'Account created! Please check your email to verify your account.',
    });
  } catch (err) {
    console.error('[auth/email/signup]', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── POST /api/auth/email/login ────────────────────────────────────────────────
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  const emailLC = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: emailLC });

    // Generic error for both "not found" and "wrong password"
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Brute-force lock check
    if (user.lockUntil && user.lockUntil > new Date()) {
      const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(429).json({ error: `Account temporarily locked. Try again in ${mins} minute(s).` });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil    = new Date(Date.now() + 30 * 60 * 1000); // 30-min lock
        user.loginAttempts = 0;
      }
      await user.save();
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Successful login — clear brute-force counters
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil     = null;
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in.',
        unverified: true,
      });
    }

    user.lastSeen = new Date();
    await user.save();

    return res.json({
      sessionId: user.sessionId,
      user: buildUserResponse(user),
    });
  } catch (err) {
    console.error('[auth/email/login]', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── POST /api/auth/email/verify-email ────────────────────────────────────────
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Missing token.' });

  try {
    const user = await User.findOne({
      emailVerifyToken:   token,
      emailVerifyExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification link.' });
    }

    user.emailVerified      = true;
    user.emailVerifyToken   = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();

    return res.json({
      message: 'Email verified! You can now log in.',
      sessionId: user.sessionId,
      user: buildUserResponse(user),
    });
  } catch (err) {
    console.error('[auth/email/verify-email]', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /api/auth/email/resend-verify ───────────────────────────────────────
router.post('/resend-verify', forgotLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Always respond generically
    if (user && !user.emailVerified && user.passwordHash) {
      const token = randomToken();
      user.emailVerifyToken   = token;
      user.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
      await sendVerificationEmail(user.email, user.displayName, token);
    }
    return res.json({ message: 'If that email exists, a new verification link has been sent.' });
  } catch (err) {
    console.error('[auth/email/resend-verify]', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /api/auth/email/forgot-password ─────────────────────────────────────
router.post('/forgot-password', forgotLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user && user.passwordHash) {
      const token = randomToken();
      user.passwordResetToken   = token;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();
      await sendPasswordResetEmail(user.email, token);
    }
    // Always generic response
    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('[auth/email/forgot-password]', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /api/auth/email/reset-password ──────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and new password are required.' });

  const pwdError = validatePassword(password);
  if (pwdError) return res.status(400).json({ error: pwdError });

  try {
    const user = await User.findOne({
      passwordResetToken:   token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset link.' });
    }

    user.passwordHash         = await bcrypt.hash(password, 12);
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts        = 0;
    user.lockUntil            = null;
    await user.save();

    return res.json({ message: 'Password updated! You can now log in with your new password.' });
  } catch (err) {
    console.error('[auth/email/reset-password]', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
