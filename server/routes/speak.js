require('dotenv').config();
const express = require('express');
const https   = require('https');
const fetch   = require('node-fetch');
const router  = express.Router();

const agent = new https.Agent({ rejectUnauthorized: false });

router.post('/', async (req, res) => {
  const { text, language = 'en' } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const apiKey  = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'cjVigY5qzO86Huf0OWal';

  if (!apiKey || apiKey === 'mock') return res.json({ mock: true, text });

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        agent,
        headers: {
          'xi-api-key':   apiKey,
          'Content-Type': 'application/json',
          'Accept':       'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.55, similarity_boost: 0.80, style: 0.2 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('ElevenLabs error:', response.status, err);
      return res.json({ mock: true, text, error: 'ElevenLabs failed' });
    }

    const buf = await response.buffer();
    res.set('Content-Type', 'audio/mpeg');
    res.set('Content-Length', buf.length);
    res.send(buf);
  } catch (err) {
    console.error('ElevenLabs fetch error:', err.message);
    return res.json({ mock: true, text, error: err.message });
  }
});

module.exports = router;
