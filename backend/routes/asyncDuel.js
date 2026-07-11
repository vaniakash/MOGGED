const express  = require('express');
const multer   = require('multer');
const sharp    = require('sharp');
const { pollinations } = require('../lib/pollinations');
const User     = require('../models/User');
const Match    = require('../models/Match');
const FaceScore = require('../models/FaceScore');
const { calculateElo } = require('../utils/elo');
const { incrementStreak } = require('./faceScore');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/duel/async
// User uploads selfie → judged against a random leaderboard opponent
router.post('/', upload.single('selfie'), async (req, res) => {
  const sessionId = req.body.sessionId || req.headers['x-session-id'];
  if (!req.file)  return res.status(400).json({ error: 'No image uploaded' });
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

  // Rate limit: max 1 async duel per 5 minutes
  const recentMatch = await Match.findOne({
    $or: [{ userA: sessionId }, { userB: sessionId }],
    createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
  });
  if (recentMatch) {
    return res.status(429).json({ error: 'Rate limited: wait 5 minutes between async duels.' });
  }

  try {
    // Score the uploaded selfie
    const resized = await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    const imageBase64 = resized.toString('base64');

    const [scoreRes, user] = await Promise.all([
      pollinations.chat.completions.create({
        model: 'qwen-vision',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Rate this face on a scale of 1-10 for overall attractiveness and facial harmony. Return ONLY a JSON object: {"score": <number 1-10>, "verdict": "<10-word punchy judgment>", "trait": "<their best facial trait in 3 words>"}. No markdown, JSON only.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        }],
      }),
      User.findOne({ sessionId }),
    ]);

    let raw = scoreRes.choices[0].message.content.trim().replace(/^```json?\n?/, '').replace(/```$/, '').trim();
    const { score: userScore, verdict, trait } = JSON.parse(raw);

    // Pick a random opponent from the leaderboard (not ourselves, with ELO within ±200)
    const userElo = user?.elo || 1000;
    const opponents = await User.find({
      sessionId: { $ne: sessionId },
      googleId: { $ne: null }, // only real signed-in users
    }).sort({ elo: -1 }).limit(50);

    const opponent = opponents.length > 0
      ? opponents[Math.floor(Math.random() * opponents.length)]
      : { sessionId: 'leaderboard-phantom', displayName: 'The Algorithm', elo: 1000, username: 'TheAlgorithm' };

    // Determine opponent score (from their latest face score or ELO-derived estimate)
    const oppFaceScore = await FaceScore.findOne({ sessionId: opponent.sessionId }).sort({ createdAt: -1 });
    const opponentScore = oppFaceScore
      ? oppFaceScore.overall_score
      : Math.max(1, Math.min(10, 5 + (opponent.elo - 1000) / 100));

    // Judge: who wins?
    const winner = userScore > opponentScore ? 'user'
                 : userScore < opponentScore ? 'opponent'
                 : 'draw';

    // ELO update
    const eloResult = calculateElo(userElo, opponent.elo || 1000,
      winner === 'user' ? 'A' : winner === 'opponent' ? 'B' : 'draw');

    if (user) {
      await User.findOneAndUpdate({ sessionId }, {
        elo:    eloResult.newRatingA,
        wins:   user.wins   + (winner === 'user' ? 1 : 0),
        losses: user.losses + (winner === 'opponent' ? 1 : 0),
        matches: user.matches + 1,
      });
    }

    // Save match record
    await Match.create({
      userA: sessionId,
      userB: opponent.sessionId,
      scoreA: userScore,
      scoreB: opponentScore,
      eloA: userElo,
      eloB: opponent.elo || 1000,
      eloChangeA: eloResult.changeA,
      eloChangeB: eloResult.changeB,
      winner: winner === 'user' ? sessionId : opponent.sessionId,
    });

    // Increment streak
    await incrementStreak(sessionId, 'async-duel');

    return res.json({
      winner,
      userScore,
      opponentScore,
      verdict,
      trait,
      opponent: {
        displayName: opponent.username || opponent.displayName || 'Anonymous',
        elo: opponent.elo || 1000,
      },
      eloChange: eloResult.changeA,
      newElo: eloResult.newRatingA,
    });
  } catch (err) {
    console.error('[async-duel]', err.message);
    return res.status(500).json({ error: 'Duel failed. Please try again.' });
  }
});

module.exports = router;
