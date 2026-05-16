const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  userA: { type: String, required: true },
  userB: { type: String, required: true },
  scoreA: { type: Number },
  scoreB: { type: Number },
  eloA: { type: Number },
  eloB: { type: Number },
  eloChangeA: { type: Number },
  eloChangeB: { type: Number },
  winner: { type: String },
  roomId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Match', MatchSchema);
