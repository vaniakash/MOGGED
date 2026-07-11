const mongoose = require('mongoose');

const StreakSchema = new mongoose.Schema({
  sessionId:   { type: String, required: true, unique: true, index: true },
  count:       { type: Number, default: 0 },
  lastCheckin: { type: Date, default: null },
  badges:      [{ type: String }], // e.g. '7-day-streak', '30-day-streak'
  updatedAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Streak', StreakSchema);
