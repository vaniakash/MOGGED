const mongoose = require('mongoose');

const PLANS = {
  trial: { durationDays: 7,   label: 'Trial' },
  pro:   { durationDays: 30,  label: 'Pro' },
  girls: { durationDays: 30,  label: 'Girls Only' },
};

const SubscriptionSchema = new mongoose.Schema({
  sessionId:  { type: String, required: true, index: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Plan
  plan:       { type: String, enum: ['trial', 'pro', 'girls'], required: true },
  status:     { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active', index: true },

  // Dates
  startDate:  { type: Date, default: Date.now },
  expiresAt:  { type: Date, required: true },

  // Payment details
  paymentId:  { type: String, default: null },
  orderId:    { type: String, default: null },
  amount:     { type: Number, default: 0 },   // in smallest unit (paise or cents)
  currency:   { type: String, default: 'INR' },
  gateway:    { type: String, enum: ['india', 'international'], default: 'india' },
  country:    { type: String, default: null },

  // Admin flags
  grantedByAdmin: { type: Boolean, default: false },
  adminNote:      { type: String, default: null },

  createdAt:  { type: Date, default: Date.now },
  updatedAt:  { type: Date, default: Date.now },
});

// Compound index for fast active-subscription lookups
SubscriptionSchema.index({ sessionId: 1, status: 1 });
SubscriptionSchema.index({ expiresAt: 1, status: 1 });

// Auto-update updatedAt
SubscriptionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Static: get active subscription for a sessionId (also auto-expires stale ones)
SubscriptionSchema.statics.getActive = async function (sessionId) {
  const now = new Date();

  // Auto-expire any subscriptions that have passed their expiresAt
  await this.updateMany(
    { sessionId, status: 'active', expiresAt: { $lte: now } },
    { $set: { status: 'expired' } }
  );

  return this.findOne({ sessionId, status: 'active', expiresAt: { $gt: now } })
    .sort({ expiresAt: -1 })
    .lean();
};

// Helper: plan duration
SubscriptionSchema.statics.PLANS = PLANS;

module.exports = mongoose.model('Subscription', SubscriptionSchema);
