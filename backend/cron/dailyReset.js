const cron   = require('node-cron');
const Streak = require('../models/Streak');

function startCron() {
  // Run every day at 00:05 UTC — check for broken streaks
  cron.schedule('5 0 * * *', async () => {
    console.log('[cron] Running daily streak reset check…');
    try {
      const yesterday = new Date(Date.now() - 86400000);
      // Anyone whose lastCheckin is before yesterday hasn't checked in → reset
      const result = await Streak.updateMany(
        { lastCheckin: { $lt: new Date(yesterday.toDateString()) }, count: { $gt: 0 } },
        { $set: { count: 0 } }
      );
      console.log(`[cron] Streak reset: ${result.modifiedCount} users`);
    } catch (e) {
      console.error('[cron] Streak reset error:', e.message);
    }
  }, { timezone: 'UTC' });

  console.log('[cron] Daily streak reset scheduled (00:05 UTC)');
}

module.exports = { startCron };
