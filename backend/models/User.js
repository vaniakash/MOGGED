const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  sessionId:       { type: String, required: true, unique: true },
  username:        { type: String, default: '' },
  elo:             { type: Number, default: 1000 },
  matches:         { type: Number, default: 0 },
  wins:            { type: Number, default: 0 },
  losses:          { type: Number, default: 0 },
  // Google OAuth fields
  googleId:        { type: String, default: null, sparse: true },
  email:           { type: String, default: null, lowercase: true },
  displayName:     { type: String, default: null },
  photoURL:        { type: String, default: null },
  provider:        { type: String, default: 'anonymous' }, // 'anonymous' | 'google' | 'email' | 'google+email'
  // Email/Password auth fields
  passwordHash:         { type: String, default: null },
  emailVerified:        { type: Boolean, default: false },
  emailVerifyToken:     { type: String, default: null },
  emailVerifyExpires:   { type: Date,   default: null },
  passwordResetToken:   { type: String, default: null },
  passwordResetExpires: { type: Date,   default: null },
  loginAttempts:        { type: Number, default: 0 },
  lockUntil:            { type: Date,   default: null },
  // Profile completion fields
  profileComplete: { type: Boolean, default: false },
  nationality:     { type: String, default: null },
  age:             { type: Number, default: null },
  gender:          { type: String, default: null }, // 'male'|'female'|'other'|'prefer_not'
  // Subscription
  subscription: {
    planId:     { type: String, default: null },      // 'beginner' | 'premium' | 'pro'
    planName:   { type: String, default: null },
    paymentId:  { type: String, default: null },      // PayPal Capture ID
    txnId:      { type: String, default: null },      // PayPal Order ID
    status:     { type: String, default: 'none' },    // 'none' | 'active' | 'expired'
    startDate:  { type: Date,   default: null },
    expiryDate: { type: Date,   default: null },
    amountPaid: { type: Number, default: null },
    currency:   { type: String, default: null },
  },
  // Timestamps
  createdAt:       { type: Date, default: Date.now },
  lastSeen:        { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
