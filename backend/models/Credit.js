const mongoose = require('mongoose');

const CreditSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  balance:   { type: Number, default: 3 }, // 3 free credits on join
  history: [{
    amount:    Number,
    reason:    String,
    createdAt: { type: Date, default: Date.now },
  }],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Credit', CreditSchema);
