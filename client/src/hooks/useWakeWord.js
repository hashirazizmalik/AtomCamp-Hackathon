// src/hooks/useWakeWord.js
import { useEffect, useRef, useCallback } from 'react';

const WAKE_WORD = (import.meta.env.VITE_WAKE_WORD || 'vitavoice').toLowerCase().replace(/\s/g, '');

export const useWakeWord = (onActivated) => {
  const recognitionRef = useRef(null);
  const activeRef = useRef(false);
  const onActivatedRef = useRef(onActivated);
  onActivatedRef.current = onActivated;

  const stop = useCallback(() => {
    activeRef.current = false;
    try { recognitionRef.current?.stop(); } catch {}
  }, []);

  const start = useCallback(() => {
    activeRef.current = true;
    try { recognitionRef.current?.start(); } catch {}
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('')
        .toLowerCase()
        .replace(/\s/g, '');
      if (transcript.includes(WAKE_WORD)) {
        onActivatedRef.current();
      }
    };

    recognition.onend = () => {
      if (activeRef.current) {
        try { recognition.start(); } catch {}
      }
    };

    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') return;
      if (activeRef.current) {
        setTimeout(() => { try { recognition.start(); } catch {} }, 1000);
      }
    };

    activeRef.current = true;
    try { recognition.start(); } catch {}

    return () => {
      activeRef.current = false;
      try { recognition.stop(); } catch {}
    };
  }, []);

  return { stop, start };
};
