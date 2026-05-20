const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { contacts = [], message = '' } = req.body;

  if (process.env.TWILIO_ACCOUNT_SID === 'mock' || !process.env.TWILIO_ACCOUNT_SID) {
    console.log('\n🚨 ===== VITAVOICE MOCK EMERGENCY ALERT =====');
    contacts.forEach((c) => {
      console.log(`📱 [MOCK SMS] TO: ${c.name} (${c.phone})`);
      console.log(`   MESSAGE: ${message}\n`);
    });
    console.log('============================================\n');
    return res.json({ sent: contacts.length, mode: 'mock' });
  }

  // Production: real Twilio
  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const results = await Promise.allSettled(
      contacts.map((c) =>
        client.messages.create({
          body: message,
          from: process.env.TWILIO_FROM_NUMBER,
          to: c.phone,
        })
      )
    );
    res.json({ sent: results.filter((r) => r.status === 'fulfilled').length, mode: 'live' });
  } catch (err) {
    console.error('Twilio error:', err.message);
    res.status(500).json({ error: 'SMS dispatch failed' });
  }
});

module.exports = router;
