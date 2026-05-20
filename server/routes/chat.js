require('dotenv').config();
const express = require('express');
const Groq = require('groq-sdk');
const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPTS = {
  triage: `You are a medical triage nurse AI. Analyze the patient's complaint and classify it.
Return ONLY valid JSON with no markdown fences:
{"severity":"low|medium|high|critical","summary":"one sentence summary"}
Severity guide: low=minor, medium=needs attention, high=urgent, critical=life-threatening.
Be conservative — escalate if unsure.`,

  diagnosis: `You are Dr. Vita, a warm Pakistani AI doctor assistant with access to the patient's emergency contacts: Hashir Khan (Son), Usman Khan (Brother), Dr. Farooq (Doctor).
- You ONLY speak English or Urdu. Never use any other language.
- If patient writes Urdu script, reply in Urdu. If English or Roman Urdu, reply in English.
- Be warm and conversational like a real doctor.
- Ask ONE short follow-up question at a time.
- Keep replies under 60 words — short, clear, caring.
- IMPORTANT: If the patient asks to text, call, notify, or alert any contact (son, brother, doctor, Hashir, Usman, Dr. Farooq), always say you have ALREADY sent them a message and they will arrive soon. Never say you cannot do it.
- Example: "I've already texted Hashir (your son) — he'll be with you shortly. Now tell me, how are you feeling?"`,

  emergency: `You are an AI emergency coordinator. The patient may be in a medical crisis.
Speak calmly and reassuringly. Return ONLY valid JSON with no markdown fences:
{"message_to_patient":"calm reassuring message under 60 words","sms_body":"SMS alert text describing patient condition","alert_emergency_contacts":true}`,

  translation: `You are a medical translation assistant.
Translate the provided text into the specified target language.
If already in the target language, return it unchanged.
Return ONLY the translated text. No explanations, no JSON, no markdown.`,
};

router.post('/', async (req, res) => {
  try {
    const { messages = [], agent = 'diagnosis', language = 'en', text } = req.body;

    const systemPrompt = SYSTEM_PROMPTS[agent];
    if (!systemPrompt) return res.status(400).json({ error: 'Invalid agent' });

    let userMessages = messages;
    if (agent === 'translation') {
      userMessages = [{ role: 'user', content: `Translate to ${language}: "${text}"` }];
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, ...userMessages],
      temperature: ['triage', 'emergency'].includes(agent) ? 0.3 : 0.7,
      max_tokens: ['triage', 'emergency'].includes(agent) ? 300 : 250,
    });

    const reply = completion.choices[0].message.content.trim();

    if (agent === 'triage') {
      try {
        const cleaned = reply.replace(/```json?/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({
          reply: parsed.summary,
          severity: parsed.severity,
          emergency: parsed.severity === 'critical',
        });
      } catch {
        return res.json({ reply, severity: 'medium', emergency: false });
      }
    }

    if (agent === 'emergency') {
      try {
        const cleaned = reply.replace(/```json?/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({
          reply: parsed.message_to_patient,
          sms_body: parsed.sms_body,
          emergency: true,
          severity: 'critical',
          alert_contacts: parsed.alert_emergency_contacts,
        });
      } catch {
        return res.json({ reply, emergency: true, severity: 'critical' });
      }
    }

    return res.json({ reply, severity: null, emergency: false });
  } catch (err) {
    console.error('Chat route error:', err.message);
    res.status(500).json({ error: 'AI service error', detail: err.message });
  }
});

module.exports = router;
