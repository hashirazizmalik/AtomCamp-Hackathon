// src/agents/diagnosisAgent.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://atomcamp-hackathon-production.up.railway.app';

export const diagnosisAgent = async (userMessage, conversationHistory = [], language = 'en') => {
  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, agent: 'diagnosis', language }),
  });
  if (!res.ok) throw new Error('Diagnosis agent failed');
  return res.json(); // { reply }
};
