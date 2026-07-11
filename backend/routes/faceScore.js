const express  = require('express');
const multer   = require('multer');
const sharp    = require('sharp');
const { pollinations } = require('../lib/pollinations');
const FaceScore = require('../models/FaceScore');
const Streak   = require('../models/Streak');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/face-score
// Accepts: multipart/form-data with "selfie" file + sessionId field
router.post('/', upload.single('selfie'), async (req, res) => {
  const sessionId = req.body.sessionId || req.headers['x-session-id'];
  if (!req.file)   return res.status(400).json({ error: 'No image uploaded' });
  if (!sessionId)  return res.status(400).json({ error: 'Missing sessionId' });

  try {
    // Resize to max 1024px to cut token cost
    const resized = await sharp(req.file.buffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const imageBase64 = resized.toString('base64');

    const response = await pollinations.chat.completions.create({
      model: 'qwen-vision',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a brutally honest AI face analysis tool for entertainment purposes. Analyze this face and return ONLY valid JSON with this exact structure. Be specific with the numeric scores — avoid clustering everything at 7-8, use the full range 1-10:
{
  "overall_score": <number 1-10>,
  "jawline": <number 1-10>,
  "symmetry": <number 1-10>,
  "eyes": <number 1-10>,
  "skin": <number 1-10>,
  "cheekbones": <number 1-10>,
  "verdict": "<one punchy sentence, 8-12 words, about their face>",
  "tips": ["<specific improvement tip 1>", "<specific improvement tip 2>", "<specific tip 3>"]
}
No markdown, no explanation, return ONLY the JSON object.`,
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
    });

    let raw = response.choices[0].message.content.trim();
    // Strip markdown code fences if present
    raw = raw.replace(/^```json?\n?/, '').replace(/```$/, '').trim();
    const result = JSON.parse(raw);

    // Store in DB
    await FaceScore.create({ sessionId, ...result });

    // Auto-increment streak
    await incrementStreak(sessionId, 'face-score');

    return res.json({ ...result, savedAt: new Date() });
  } catch (err) {
    console.error('[face-score]', err.message);
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

// GET /api/face-score/history
router.get('/history', async (req, res) => {
  const sessionId = req.query.sessionId || req.headers['x-session-id'];
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });
  const history = await FaceScore.find({ sessionId }).sort({ createdAt: -1 }).limit(10);
  return res.json(history);
});

async function incrementStreak(sessionId, feature) {
  try {
    const today = new Date().toDateString();
    const streak = await Streak.findOne({ sessionId });
    if (streak) {
      const lastCheckinDay = streak.lastCheckin ? new Date(streak.lastCheckin).toDateString() : null;
      if (lastCheckinDay === today) return streak; // already checked in today
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newCount = lastCheckinDay === yesterday ? streak.count + 1 : 1;
      const badges = [...streak.badges];
      if ([7, 30, 100].includes(newCount) && !badges.includes(`${newCount}-day-streak`)) {
        badges.push(`${newCount}-day-streak`);
      }
      return Streak.findOneAndUpdate({ sessionId }, { count: newCount, lastCheckin: new Date(), badges, updatedAt: new Date() }, { new: true });
    } else {
      return Streak.create({ sessionId, count: 1, lastCheckin: new Date() });
    }
  } catch (e) { /* non-fatal */ }
}

module.exports = { router, incrementStreak };
