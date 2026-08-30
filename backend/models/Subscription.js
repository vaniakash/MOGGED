const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  sessionId:    { type: String, required: true, index: true },
  txnId:        { type: String, required: true, unique: true },
  planId:       { type: String, required: true },   // 'beginner' | 'premium' | 'pro'
  planName:     { type: String, required: true },
  amount:       { type: Number, required: true },
  currency:     { type: String, default: 'INR' },
  status:       { type: String, default: 'pending' }, // 'pending' | 'success' | 'failed'
  paypalOrderId:   { type: String, default: null },
  paypalCaptureId: { type: String, default: null },
  paypalResponse:  { type: mongoose.Schema.Types.Mixed, default: null }, // full PayPal response
  startDate:    { type: Date, default: null },
  expiryDate:   { type: Date, default: null },
}, { timestamps: true }); // auto-manages createdAt + updatedAt

module.exports = mongoose.model('Subscription', SubscriptionSchema);
