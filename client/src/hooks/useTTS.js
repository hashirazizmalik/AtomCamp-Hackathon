import { useCallback } from 'react';
import { useMockTTS } from './useMockTTS';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://atomcamp-hackathon-production.up.railway.app';

export const useTTS = () => {
  const { speak: speakBrowser } = useMockTTS();

  const speak = useCallback(async (text, lang = 'en') => {
    if (!text) return;

    try {
      const response = await fetch(`${API_BASE}/api/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: lang }),
      });

      if (response.ok) {
        const contentType = response.headers.get('Content-Type') || '';
        if (contentType.includes('audio')) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          await new Promise((resolve) => {
            const audio = new Audio(url);
            audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
            audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
            audio.play().catch(resolve);
          });
          return;
        }
      }
    } catch (err) {
      console.warn('ElevenLabs server TTS failed:', err.message);
    }

    await speakBrowser(text, lang);
  }, [speakBrowser]);

  return { speak };
};
