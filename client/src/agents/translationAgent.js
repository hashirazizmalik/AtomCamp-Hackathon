const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://atomcamp-hackathon-production.up.railway.app';

export const translationAgent = async (text, targetLanguage = 'en') => {
  if (targetLanguage === 'en') return text;
  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, agent: 'translation', language: targetLanguage }),
    });
    if (!res.ok) return text;
    const data = await res.json();
    return data.reply || text;
  } catch {
    return text;
  }
};

// Simple script-based detection — no API call, no wrong language
export const detectLanguage = (text) => {
  if (/[؀-ۿ]/.test(text)) return 'ur';
  return 'en';
};
