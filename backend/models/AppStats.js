const mongoose = require('mongoose');

// ── Single-document stats store ─────────────────────────────────────────────
// There is always exactly ONE document in this collection (id = 'global').
// Use AppStats.inc({ field: delta }) to atomically increment any counter.
const schema = new mongoose.Schema({
  _id:               { type: String, default: 'global' },
  arenaButtonPresses:{ type: Number, default: 0 },
  battlesStarted:    { type: Number, default: 0 },
}, { _id: false, timestamps: false, versionKey: false });

schema.statics.inc = function (fields) {
  return this.findByIdAndUpdate(
    'global',
    { $inc: fields },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

schema.statics.get = function () {
  return this.findById('global').lean();
};

module.exports = mongoose.model('AppStats', schema);
