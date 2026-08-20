const mongoose = require('mongoose');

// One document per page view event
const PageViewSchema = new mongoose.Schema({
  path:      { type: String, required: true, index: true },  // e.g. '/', '/battle', '/pricing'
  sessionId: { type: String, default: null, index: true },   // omogl_session if present
  country:   { type: String, default: 'Unknown' },           // ISO 2-letter code from cf-ipcountry or geoip
  countryName: { type: String, default: 'Unknown' },
  ip:        { type: String, default: null },
  ua:        { type: String, default: null },                 // user agent (truncated)
  ts:        { type: Date,   default: Date.now, index: true },// timestamp, keep for time bucketing
}, { versionKey: false });

// TTL: auto-delete docs older than 90 days
PageViewSchema.index({ ts: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('PageView', PageViewSchema);
