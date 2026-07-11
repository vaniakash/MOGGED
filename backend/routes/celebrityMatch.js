const express  = require('express');
const multer   = require('multer');
const sharp    = require('sharp');
const { pollinations } = require('../lib/pollinations');
const { incrementStreak } = require('./faceScore');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/celebrity-match
router.post('/', upload.single('selfie'), async (req, res) => {
  const sessionId = req.body.sessionId || req.headers['x-session-id'];
  if (!req.file)  return res.status(400).json({ error: 'No image uploaded' });
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

  try {
    const resized = await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
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
              text: `Analyze this face and find the top 5 celebrities this person most resembles based on facial features (bone structure, eye shape, jawline, nose, overall vibe). Include celebrities from Hollywood, Bollywood, K-pop, sports — be diverse. Return ONLY valid JSON:
{
  "matches": [
    { "name": "<Celebrity Full Name>", "similarity": <number 60-99>, "reason": "<one specific facial feature they share, 5-8 words>" },
    { "name": "<Celebrity Full Name>", "similarity": <number 55-90>, "reason": "<one specific facial feature they share>" },
    { "name": "<Celebrity Full Name>", "similarity": <number 50-85>, "reason": "<one specific facial feature they share>" },
    { "name": "<Celebrity Full Name>", "similarity": <number 45-80>, "reason": "<one specific facial feature they share>" },
    { "name": "<Celebrity Full Name>", "similarity": <number 40-75>, "reason": "<one specific facial feature they share>" }
  ],
  "caption": "<one punchy, funny, shareable 8-word caption about their celebrity matches>",
  "vibe": "<one adjective describing their overall facial aesthetic, e.g. 'Regal', 'Boyish', 'Fierce', 'Angelic'>"
}
No markdown, no explanation, JSON only.`,
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
    raw = raw.replace(/^```json?\n?/, '').replace(/```$/, '').trim();
    const result = JSON.parse(raw);

    await incrementStreak(sessionId, 'celebrity-match');

    return res.json(result);
  } catch (err) {
    console.error('[celebrity-match]', err.message);
    return res.status(500).json({ error: 'Match failed. Please try again.' });
  }
});

module.exports = router;
