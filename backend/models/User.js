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
  email:           { type: String, default: null },
  displayName:     { type: String, default: null },
  photoURL:        { type: String, default: null },
  provider:        { type: String, default: 'anonymous' }, // 'anonymous' | 'google'
  // Profile completion fields
  profileComplete: { type: Boolean, default: false },
  nationality:     { type: String, default: null },
  age:             { type: Number, default: null },
  gender:          { type: String, default: null }, // 'male'|'female'|'other'|'prefer_not'
  // Timestamps
  createdAt:       { type: Date, default: Date.now },
  lastSeen:        { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
