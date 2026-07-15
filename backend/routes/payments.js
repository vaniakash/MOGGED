const express = require('express');
const crypto  = require('crypto');
const Razorpay = require('razorpay');
const User         = require('../models/User');
const Subscription = require('../models/Subscription');

const router = express.Router();

// ── Two Razorpay instances (lazy — created on first use) ───────────────────
let _razorpayIN   = null;
let _razorpayINTL = null;

function getRazorpayIN() {
  if (!_razorpayIN) {
    if (!process.env.RAZORPAY_KEY_ID_IN || !process.env.RAZORPAY_KEY_SECRET_IN) {
      throw new Error('Missing RAZORPAY_KEY_ID_IN / RAZORPAY_KEY_SECRET_IN env vars');
    }
    _razorpayIN = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID_IN,
      key_secret: process.env.RAZORPAY_KEY_SECRET_IN,
    });
  }
  return _razorpayIN;
}

function getRazorpayINTL() {
  if (!_razorpayINTL) {
    if (!process.env.RAZORPAY_KEY_ID_INTL || !process.env.RAZORPAY_KEY_SECRET_INTL) {
      throw new Error('Missing RAZORPAY_KEY_ID_INTL / RAZORPAY_KEY_SECRET_INTL env vars');
    }
    _razorpayINTL = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID_INTL,
      key_secret: process.env.RAZORPAY_KEY_SECRET_INTL,
    });
  }
  return _razorpayINTL;
}

// ── Plan definitions ─────────────────────────────────────────────────────
const PLANS = {
  trial: {
    label:       '7-Day Trial',
    durationDays: 7,
    amountINR:   25000,   // paise  → ₹250
    amountUSD:   300,     // cents  → $3.00
  },
  pro: {
    label:       'Pro Monthly',
    durationDays: 30,
    amountINR:   85000,   // paise  → ₹850
    amountUSD:   1000,    // cents  → $10.00
  },
  girls: {
    label:       'Girls Only Monthly',
    durationDays: 30,
    amountINR:   165000,  // paise  → ₹1650
    amountUSD:   2000,    // cents  → $20.00
  },
};

function isIndia(country) {
  return country === 'IN' || country === 'India' || country === 'Indian';
}

// ── POST /api/payments/create-order ─────────────────────────────────────
// Body: { plan, country, sessionId }
router.post('/create-order', async (req, res) => {
  try {
    const { plan, country, sessionId } = req.body;
    if (!plan || !PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });
    if (!sessionId)             return res.status(400).json({ error: 'Missing sessionId' });

    const useIndia   = isIndia(country);
    const razorpay   = useIndia ? getRazorpayIN() : getRazorpayINTL();
    const planData   = PLANS[plan];
    const amount     = useIndia ? planData.amountINR : planData.amountUSD;
    const currency   = useIndia ? 'INR' : 'USD';
    const keyId      = useIndia ? process.env.RAZORPAY_KEY_ID_IN : process.env.RAZORPAY_KEY_ID_INTL;

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `omogl_${plan}_${sessionId.slice(0, 8)}_${Date.now()}`,
      notes: { plan, sessionId, country: country || 'unknown' },
    });

    res.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId,           // tell frontend which public key to use
      gateway:  useIndia ? 'india' : 'international',
      plan,
      planLabel: planData.label,
    });
  } catch (err) {
    console.error('[create-order]', err.message);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

// ── POST /api/payments/verify ────────────────────────────────────────────
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, sessionId, plan, country, gateway }
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      sessionId, plan, country, gateway, amount, currency,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !sessionId || !plan) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Pick the right secret based on gateway
    const secret = (gateway === 'india')
      ? process.env.RAZORPAY_KEY_SECRET_IN
      : process.env.RAZORPAY_KEY_SECRET_INTL;

    const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected  = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature — payment verification failed' });
    }

    // Find user
    const user = await User.findOne({ sessionId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Deactivate any existing active subscriptions for this session
    await Subscription.updateMany(
      { sessionId, status: 'active' },
      { $set: { status: 'cancelled' } }
    );

    // Calculate expiry
    const planData  = PLANS[plan];
    const startDate = new Date();
    const expiresAt = new Date(startDate.getTime() + planData.durationDays * 24 * 60 * 60 * 1000);

    // Create subscription record
    const sub = await Subscription.create({
      sessionId,
      userId:    user._id,
      plan,
      status:    'active',
      startDate,
      expiresAt,
      paymentId: razorpay_payment_id,
      orderId:   razorpay_order_id,
      amount:    amount || 0,
      currency:  currency || (gateway === 'india' ? 'INR' : 'USD'),
      gateway:   gateway || 'india',
      country:   country || null,
    });

    console.log(`✅ Subscription activated: ${plan} for ${sessionId} → expires ${expiresAt.toISOString()}`);

    res.json({
      success:    true,
      plan,
      expiresAt:  expiresAt.toISOString(),
      daysLeft:   planData.durationDays,
    });
  } catch (err) {
    console.error('[verify]', err.message);
    res.status(500).json({ error: 'Failed to verify payment', details: err.message });
  }
});

module.exports = router;
