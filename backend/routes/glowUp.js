const express = require('express');
const multer  = require('multer');
const sharp   = require('sharp');
const axios   = require('axios');
const FormData = require('form-data');
const Credit  = require('../models/Credit');
const { incrementStreak } = require('./faceScore');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const VARIANTS = {
  skincare: 'same person, clear radiant glowing skin, even skin tone, same facial structure and identity, photorealistic portrait',
  haircut:  'same person, modern fresh stylish haircut, well-groomed hair, same facial structure, photorealistic portrait',
  beard:    'same person, well-groomed neat beard, same facial structure and identity, masculine, photorealistic portrait',
  lighting: 'same person, professional studio photography lighting, dramatic shadows, same facial structure, editorial photorealistic portrait',
};

// GET /api/credits?sessionId=xxx
router.get('/credits', async (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });
  const credit = await Credit.findOneAndUpdate(
    { sessionId },
    { $setOnInsert: { sessionId, balance: 3 } },
    { upsert: true, new: true }
  );
  return res.json({ balance: credit.balance, history: credit.history.slice(-5) });
});

// POST /api/glow-up
router.post('/', upload.single('selfie'), async (req, res) => {
  const sessionId = req.body.sessionId || req.headers['x-session-id'];
  const variant   = req.body.variant || 'skincare';
  if (!req.file)         return res.status(400).json({ error: 'No image uploaded' });
  if (!sessionId)        return res.status(400).json({ error: 'Missing sessionId' });
  if (!VARIANTS[variant]) return res.status(400).json({ error: 'Invalid variant' });

  // Credit check
  let credit = await Credit.findOne({ sessionId });
  if (!credit) {
    credit = await Credit.create({ sessionId, balance: 3 });
  }
  if (credit.balance <= 0) {
    return res.status(402).json({ error: 'No credits remaining.', balance: 0 });
  }

  try {
    // Resize selfie
    const resized = await sharp(req.file.buffer)
      .resize(512, 512, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toBuffer();

    const prompt = VARIANTS[variant];
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 999999);

    // 1. Upload to Pollinations media storage first
    const form = new FormData();
    form.append("file", resized, { filename: "selfie.jpg", contentType: "image/jpeg" });
    const uploadRes = await axios.post("https://media.pollinations.ai/upload", form, {
      headers: { Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY}`, ...form.getHeaders() },
    });
    const imageUrl = uploadRes.data.url || uploadRes.data;

    // 2. Gen image-to-image
    const genUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?model=kontext&image=${encodeURIComponent(imageUrl)}&seed=${seed}`;
    const imageRes = await axios.get(
      genUrl,
      {
        responseType: 'arraybuffer',
        timeout: 60000,
        headers: { Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY}` },
      }
    );

    // Deduct credit
    await Credit.findOneAndUpdate(
      { sessionId },
      {
        $inc: { balance: -1 },
        $push: {
          history: { amount: -1, reason: `glow-up:${variant}`, createdAt: new Date() },
        },
        updatedAt: new Date(),
      }
    );

    await incrementStreak(sessionId, 'glow-up');

    const newBalance = credit.balance - 1;

    // Return both original (resized) + generated as base64 pair
    res.json({
      original: resized.toString('base64'),
      generated: Buffer.from(imageRes.data).toString('base64'),
      variant,
      creditsRemaining: newBalance,
    });
  } catch (err) {
    console.error('[glow-up]', err.message);
    return res.status(500).json({ error: 'Generation failed. Credit not deducted.' });
  }
});

module.exports = router;
