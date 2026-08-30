const express = require('express');
const axios = require('axios');
const User         = require('../models/User');
const Subscription = require('../models/Subscription');
const PageView     = require('../models/PageView');

const router = express.Router();

// ── Plans ─────────────────────────────────────────────────────────────────────
const PLANS = {
  beginner: { id: 'beginner', name: 'Beginner Plan', amount: 1.00,  currency: 'USD', days: 30 },
  premium:  { id: 'premium',  name: 'Premium Plan',  amount: 4.99,  currency: 'USD', days: 30 },
  pro:      { id: 'pro',      name: 'Pro Plan',      amount: 9.99,  currency: 'USD', days: 30 },
};

// ── PayPal Helper ──────────────────────────────────────────────────────────────
async function getPayPalAccessToken() {
  const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
  const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
  const PAYPAL_ENVIRONMENT = process.env.PAYPAL_ENVIRONMENT || 'sandbox';
  const baseURL = PAYPAL_ENVIRONMENT === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await axios.post(`${baseURL}/v1/oauth2/token`, 'grant_type=client_credentials', {
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  return { access_token: response.data.access_token, baseURL };
}

// ── POST /api/payment/create-paypal-order ──────────────────────────────────────
router.post('/create-paypal-order', async (req, res) => {
  const { sessionId, planId } = req.body;

  if (!sessionId || !planId)
    return res.status(400).json({ error: 'Missing sessionId or planId' });

  const plan = PLANS[planId];
  if (!plan)
    return res.status(400).json({ error: 'Invalid plan' });

  try {
    const user = await User.findOne({ sessionId });
    if (!user)
      return res.status(404).json({ error: 'User not found. Please log in.' });

    // Track plan click
    const ccountry = (
      req.headers['cf-ipcountry'] ||
      req.headers['x-country'] ||
      req.headers['x-vercel-ip-country'] ||
      'Unknown'
    ).toUpperCase().slice(0, 2);
    PageView.create({
      path: `/pricing/click/${planId}`,
      sessionId: sessionId || null,
      country:     ccountry && ccountry !== 'XX' ? ccountry : 'Unknown',
      countryName: ccountry || 'Unknown',
      ip: req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']?.split(',')[0] || req.ip,
      ua: (req.headers['user-agent'] || '').slice(0, 200),
    }).catch(() => {});

    // Call PayPal API
    const { access_token, baseURL } = await getPayPalAccessToken();

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: `${planId}_${Date.now()}`,
        amount: {
          currency_code: plan.currency,
          value: plan.amount.toFixed(2)
        },
        description: plan.name
      }]
    };

    const response = await axios.post(`${baseURL}/v2/checkout/orders`, orderPayload, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const orderData = response.data;

    // Create pending subscription record
    await Subscription.create({
      sessionId,
      txnId: orderData.id,
      planId: plan.id,
      planName: plan.name,
      amount: plan.amount,
      currency: plan.currency,
      status: 'pending',
      paypalOrderId: orderData.id
    });

    return res.json({ id: orderData.id });
  } catch (err) {
    console.error('[payment/create-paypal-order]', err.response?.data || err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── POST /api/payment/capture-paypal-order ─────────────────────────────────────
router.post('/capture-paypal-order', async (req, res) => {
  const { sessionId, orderID } = req.body;
  if (!sessionId || !orderID) return res.status(400).json({ error: 'Missing sessionId or orderID' });

  try {
    const { access_token, baseURL } = await getPayPalAccessToken();

    const response = await axios.post(`${baseURL}/v2/checkout/orders/${orderID}/capture`, {}, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const captureData = response.data;
    const subRecord = await Subscription.findOne({ paypalOrderId: orderID, sessionId });

    if (!subRecord) {
      console.error('[payment/capture-paypal-order] No subscription record found for orderID:', orderID);
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    if (captureData.status === 'COMPLETED') {
      const captureId = captureData.purchase_units[0].payments.captures[0].id;
      const plan = PLANS[subRecord.planId];
      
      const startDate = new Date();
      const expiryDate = new Date(startDate.getTime() + plan.days * 24 * 60 * 60 * 1000);

      subRecord.status = 'success';
      subRecord.paypalCaptureId = captureId;
      subRecord.paypalResponse = captureData;
      subRecord.startDate = startDate;
      subRecord.expiryDate = expiryDate;
      await subRecord.save();

      await User.findOneAndUpdate(
        { sessionId },
        {
          $set: {
            'subscription.planId':    plan.id,
            'subscription.planName':  plan.name,
            'subscription.paymentId': captureId,
            'subscription.txnId':     orderID,
            'subscription.status':    'active',
            'subscription.startDate': startDate,
            'subscription.expiryDate': expiryDate,
            'subscription.amountPaid': plan.amount,
            'subscription.currency':   plan.currency,
          },
        }
      );

      console.log(`[payment/capture-paypal-order] ✅ Subscription activated for session ${sessionId} — ${plan.name}`);
      return res.json({ success: true, captureData });
    } else {
      subRecord.status = 'failed';
      subRecord.paypalResponse = captureData;
      await subRecord.save();
      console.log(`[payment/capture-paypal-order] ❌ Payment failed/cancelled for session ${sessionId}`);
      return res.status(400).json({ error: 'Payment not completed', details: captureData });
    }
  } catch (err) {
    console.error('[payment/capture-paypal-order]', err.response?.data || err.message);
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
