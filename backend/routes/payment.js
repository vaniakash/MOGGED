const express = require('express');
const crypto  = require('crypto');
const { v4: uuidv4 } = require('uuid');
const User         = require('../models/User');
const Subscription = require('../models/Subscription');

const router = express.Router();

// ── Config ────────────────────────────────────────────────────────────────────
const PAYU_KEY      = process.env.PAYU_KEY;
const PAYU_SALT     = process.env.PAYU_SALT;
const PAYU_BASE_URL = process.env.PAYU_BASE_URL || 'https://secure.payu.in/_payment';
const SUCCESS_URL   = process.env.PAYU_SUCCESS_URL || 'http://localhost:3000/payment/success';
const FAILURE_URL   = process.env.PAYU_FAILURE_URL || 'http://localhost:3000/payment/failure';

// ── Plans ─────────────────────────────────────────────────────────────────────
const PLANS = {
  beginner: { id: 'beginner', name: 'Beginner Plan', amount: 249,  currency: 'INR', days: 30 },
  premium:  { id: 'premium',  name: 'Premium Plan',  amount: 419,  currency: 'INR', days: 30 },
  pro:      { id: 'pro',      name: 'Pro Plan',       amount: 839,  currency: 'INR', days: 30 },
};

// ── SHA512 helper ──────────────────────────────────────────────────────────────
function sha512(str) {
  return crypto.createHash('sha512').update(str).digest('hex');
}

// ── Generate PayU initiation hash ─────────────────────────────────────────────
// Format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
function generateHash(params) {
  const str = [
    PAYU_KEY,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 || '',
    params.udf2 || '',
    params.udf3 || '',
    params.udf4 || '',
    params.udf5 || '',
    '', '', '', '', '',
    PAYU_SALT,
  ].join('|');
  return sha512(str);
}

// ── Verify PayU response hash ──────────────────────────────────────────────────
// Format: SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
function verifyResponseHash(params) {
  const str = [
    PAYU_SALT,
    params.status,
    '', '', '', '', '',
    params.udf5 || '',
    params.udf4 || '',
    params.udf3 || '',
    params.udf2 || '',
    params.udf1 || '',
    params.email,
    params.firstname,
    params.productinfo,
    params.amount,
    params.txnid,
    PAYU_KEY,
  ].join('|');
  return sha512(str);
}

// ── Check if subscription is active ───────────────────────────────────────────
function isSubActive(user) {
  if (!user?.subscription?.status === 'active') return false;
  if (user.subscription.status !== 'active') return false;
  if (!user.subscription.expiryDate) return false;
  return new Date(user.subscription.expiryDate) > new Date();
}

// ── POST /api/payment/initiate ─────────────────────────────────────────────────
// Requires: { sessionId, planId, email, name }
router.post('/initiate', async (req, res) => {
  const { sessionId, planId, email, name } = req.body;

  if (!sessionId || !planId)
    return res.status(400).json({ error: 'Missing sessionId or planId' });

  const plan = PLANS[planId];
  if (!plan)
    return res.status(400).json({ error: 'Invalid plan' });

  try {
    const user = await User.findOne({ sessionId });
    if (!user)
      return res.status(404).json({ error: 'User not found. Please log in.' });

    // Allow re-initiation even if already subscribed (for renewal)
    const txnid       = `OMOGL_${uuidv4().replace(/-/g, '').slice(0, 16).toUpperCase()}`;
    const amount      = plan.amount.toFixed(2);
    const productinfo = plan.name;
    const firstname   = (name || user.displayName || 'Arena Fighter').split(' ')[0];
    const userEmail   = email || user.email || 'noemail@omogl.com';

    const hashParams = {
      txnid,
      amount,
      productinfo,
      firstname,
      email: userEmail,
      udf1: sessionId,    // store sessionId in udf1 for callback lookup
      udf2: planId,
    };

    const hash = generateHash(hashParams);

    // Create pending subscription record
    await Subscription.create({
      sessionId,
      txnId: txnid,
      planId: plan.id,
      planName: plan.name,
      amount: plan.amount,
      currency: plan.currency,
      status: 'pending',
    });

    return res.json({
      key:         PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email:       userEmail,
      phone:       '9999999999', // PayU requires phone; use placeholder
      surl:        SUCCESS_URL,
      furl:        FAILURE_URL,
      hash,
      payuUrl:     PAYU_BASE_URL,
      udf1:        sessionId,
      udf2:        planId,
    });
  } catch (err) {
    console.error('[payment/initiate]', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── POST /api/payment/callback ─────────────────────────────────────────────────
// PayU posts here after payment (server-to-server + browser redirect)
// This handles BOTH the S2S webhook and the browser POST-back redirect.
router.post('/callback', async (req, res) => {
  try {
    const p = req.body;
    console.log('[payment/callback] received:', JSON.stringify({ txnid: p.txnid, status: p.status, mihpayid: p.mihpayid }));

    // ── Verify hash ──────────────────────────────────────────────────────────
    const expectedHash = verifyResponseHash(p);
    if (expectedHash !== p.hash) {
      console.error('[payment/callback] Hash mismatch! Possible fraud attempt.');
      return res.status(400).json({ error: 'Invalid payment response (hash mismatch).' });
    }

    const sessionId = p.udf1;
    const planId    = p.udf2;
    const plan      = PLANS[planId];

    // ── Find the pending subscription record ─────────────────────────────────
    const subRecord = await Subscription.findOne({ txnId: p.txnid });
    if (!subRecord) {
      console.error('[payment/callback] No subscription record found for txnid:', p.txnid);
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    // ── Update audit record ───────────────────────────────────────────────────
    subRecord.status        = p.status === 'success' ? 'success' : 'failed';
    subRecord.payuMihpayid  = p.mihpayid;
    subRecord.payuMode      = p.mode;
    subRecord.payuResponse  = p;

    if (p.status === 'success' && plan) {
      const startDate  = new Date();
      const expiryDate = new Date(startDate.getTime() + plan.days * 24 * 60 * 60 * 1000);
      subRecord.startDate  = startDate;
      subRecord.expiryDate = expiryDate;
      await subRecord.save();

      // ── Activate subscription on user ───────────────────────────────────────
      await User.findOneAndUpdate(
        { sessionId },
        {
          $set: {
            'subscription.planId':    plan.id,
            'subscription.planName':  plan.name,
            'subscription.paymentId': p.mihpayid,
            'subscription.txnId':     p.txnid,
            'subscription.status':    'active',
            'subscription.startDate': startDate,
            'subscription.expiryDate': expiryDate,
            'subscription.amountPaid': plan.amount,
            'subscription.currency':   plan.currency,
          },
        }
      );
      console.log(`[payment/callback] ✅ Subscription activated for session ${sessionId} — ${plan.name}`);
    } else {
      await subRecord.save();
      console.log(`[payment/callback] ❌ Payment failed/cancelled for session ${sessionId}`);
    }

    // PayU expects a 200 OK for the server-to-server notification
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[payment/callback] Error:', err.message);
    return res.status(500).json({ error: 'Server error processing payment.' });
  }
});

// ── GET /api/payment/status ────────────────────────────────────────────────────
// Frontend calls this to check if the user has an active subscription
router.get('/status', async (req, res) => {
  const sessionId = req.query.sessionId || req.headers['x-session-id'];
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

  try {
    const user = await User.findOne({ sessionId }).select('subscription');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const sub = user.subscription || {};
    const active = sub.status === 'active' && sub.expiryDate && new Date(sub.expiryDate) > new Date();

    // Auto-expire if past expiry
    if (sub.status === 'active' && sub.expiryDate && new Date(sub.expiryDate) <= new Date()) {
      await User.findOneAndUpdate({ sessionId }, { $set: { 'subscription.status': 'expired' } });
      sub.status = 'expired';
    }

    return res.json({
      hasActiveSub: active,
      subscription: {
        status:     sub.status || 'none',
        planId:     sub.planId || null,
        planName:   sub.planName || null,
        expiryDate: sub.expiryDate || null,
        startDate:  sub.startDate || null,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
