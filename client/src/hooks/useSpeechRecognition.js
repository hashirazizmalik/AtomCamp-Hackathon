import { useRef, useCallback } from 'react';

export const useSpeechRecognition = ({ onResult, onEnd }) => {
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  const start = useCallback((lang = 'en-US') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { onEnd?.('', 'not-supported'); return; }

    try { recognitionRef.current?.stop(); } catch {}
    clearTimeout(silenceTimerRef.current);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;       // keep listening through silence
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    let finalTranscript = '';
    let hasSpeech = false;
    let errorCode = null;

    recognition.onresult = (event) => {
      clearTimeout(silenceTimerRef.current);
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t;
          hasSpeech = true;
        } else {
          interim += t;
          hasSpeech = true;
        }
      }
      onResult?.(finalTranscript || interim);

      // Stop 1.5s after last speech
      silenceTimerRef.current = setTimeout(() => {
        try { recognition.stop(); } catch {}
      }, 1500);
    };

    recognition.onerror = (e) => {
      console.warn('STT error:', e.error);
      errorCode = e.error;
      if (e.error === 'no-speech') {
        // restart automatically on no-speech
        errorCode = null;
        try { recognition.stop(); recognition.start(); } catch {}
      }
    };

    recognition.onend = () => {
      clearTimeout(silenceTimerRef.current);
      onEnd?.(finalTranscript, hasSpeech ? null : errorCode);
    };

    try { recognition.start(); } catch (err) {
      console.warn('STT start error:', err.message);
      onEnd?.('', 'start-failed');
    }
  }, [onResult, onEnd]);

  const stop = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    try { recognitionRef.current?.stop(); } catch {}
  }, []);

  return { start, stop };
};
