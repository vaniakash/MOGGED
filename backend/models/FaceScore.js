const mongoose = require('mongoose');

const FaceScoreSchema = new mongoose.Schema({
  sessionId:     { type: String, required: true, index: true },
  overall_score: { type: Number },
  jawline:       { type: Number },
  symmetry:      { type: Number },
  eyes:          { type: Number },
  skin:          { type: Number },
  cheekbones:    { type: Number },
  tips:          [{ type: String }],
  createdAt:     { type: Date, default: Date.now },
});

module.exports = mongoose.model('FaceScore', FaceScoreSchema);
