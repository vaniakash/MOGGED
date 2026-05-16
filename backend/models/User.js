const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  username: { type: String, default: '' },
  elo: { type: Number, default: 1000 },
  matches: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
