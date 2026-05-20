// src/hooks/useMockTTS.js
import { useCallback } from 'react';
import { toBCP47 } from '../utils/languageDetect';

export const useMockTTS = () => {
  const speak = useCallback((text, lang = 'en') => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = toBCP47(lang);
      utterance.rate = 0.92;
      utterance.pitch = 0.95;

      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const bcp = toBCP47(lang);
        const preferred =
          voices.find((v) => v.lang === bcp && !v.localService) ||
          voices.find((v) => v.lang.startsWith(lang)) ||
          voices[0];
        if (preferred) utterance.voice = preferred;
      };

      if (window.speechSynthesis.getVoices().length) setVoice();
      else window.speechSynthesis.onvoiceschanged = setVoice;

      utterance.onend = resolve;
      utterance.onerror = resolve;
      window.speechSynthesis.speak(utterance);

      // Fallback timeout in case onend never fires
      setTimeout(resolve, Math.max(3000, text.length * 75));
    });
  }, []);

  return { speak };
};
