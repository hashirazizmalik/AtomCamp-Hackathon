// src/agents/emergencyAgent.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://atomcamp-hackathon-production.up.railway.app';

export const emergencyAgent = async (userMessage, contacts = [], patientName = 'Patient', location = '') => {
  // 1. Get emergency response from GPT
  const chatRes = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: userMessage }],
      agent: 'emergency',
    }),
  });
  if (!chatRes.ok) throw new Error('Emergency agent failed');
  const chatData = await chatRes.json();

  const smsBody = chatData.sms_body ||
    `🚨 VitaVoice EMERGENCY: ${patientName} reported "${userMessage}" at ${new Date().toLocaleTimeString()}. Location: ${location || 'Unknown'}.`;

  // 2. Dispatch mock SMS alert
  await fetch(`${API_BASE}/api/alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contacts, message: smsBody }),
  });

  return { reply: chatData.reply, sms_body: smsBody, emergency: true };
};
