const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Credit = require('../models/Credit');
const User = require('../models/User');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = 'receipt_1' } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Minimum amount is 100 paise.' });
    }

    const options = {
      amount, // amount in smallest currency unit (paise)
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('[create-order]', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// POST /api/payments/verify-payment
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      sessionId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !sessionId) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Signature is valid. Give user credits.
      // E.g., 100 INR = 10000 paise = 10 Credits
      const creditsToAdd = 10;
      
      const credit = await Credit.findOneAndUpdate(
        { sessionId },
        { 
          $inc: { balance: creditsToAdd },
          $push: {
            history: {
              amount: creditsToAdd,
              reason: `razorpay_purchase_${razorpay_payment_id}`,
              createdAt: new Date()
            }
          },
          $setOnInsert: { sessionId }
        },
        { upsert: true, new: true }
      );
      
      return res.json({ 
        success: true, 
        message: 'Payment verified successfully.', 
        credits: credit.balance 
      });
    } else {
      return res.status(400).json({ error: 'Invalid signature. Payment verification failed.' });
    }
  } catch (error) {
    console.error('[verify-payment]', error);
    res.status(500).json({ error: 'Failed to verify payment', details: error.message });
  }
});

module.exports = router;
