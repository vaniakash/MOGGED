const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  sessionId:    { type: String, required: true, index: true },
  txnId:        { type: String, required: true, unique: true },
  planId:       { type: String, required: true },   // 'beginner' | 'premium' | 'pro'
  planName:     { type: String, required: true },
  amount:       { type: Number, required: true },
  currency:     { type: String, default: 'INR' },
  status:       { type: String, default: 'pending' }, // 'pending' | 'success' | 'failed'
  payuMihpayid: { type: String, default: null },
  payuMode:     { type: String, default: null },      // net banking, card, upi, etc.
  payuResponse: { type: mongoose.Schema.Types.Mixed, default: null }, // full PayU response
  startDate:    { type: Date, default: null },
  expiryDate:   { type: Date, default: null },
}, { timestamps: true }); // auto-manages createdAt + updatedAt

module.exports = mongoose.model('Subscription', SubscriptionSchema);
