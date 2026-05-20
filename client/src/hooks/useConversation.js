import { useCallback, useRef, useState } from 'react';
import { Conversation } from '@11labs/client';

const AGENT_ID = 'agent_7401kr8ec5mweh38ka1mngtvz512';

export const useConversation = ({ onMessage, onModeChange }) => {
  const convRef   = useRef(null);
  const [status, setStatus] = useState('disconnected'); // disconnected | connecting | connected

  const start = useCallback(async () => {
    if (convRef.current) return;
    setStatus('connecting');
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const conv = await Conversation.startSession({
        agentId: AGENT_ID,
        onConnect:    ()      => setStatus('connected'),
        onDisconnect: ()      => { setStatus('disconnected'); convRef.current = null; },
        onMessage:    (msg)   => onMessage?.(msg),
        onModeChange: (props) => onModeChange?.(props.mode),  // 'speaking' | 'listening'
        onError:      (err)   => console.error('ElevenLabs agent error:', err),
      });
      convRef.current = conv;
    } catch (err) {
      console.error('Failed to start ElevenLabs session:', err);
      setStatus('disconnected');
    }
  }, [onMessage, onModeChange]);

  const stop = useCallback(async () => {
    await convRef.current?.endSession();
    convRef.current = null;
    setStatus('disconnected');
  }, []);

  return { start, stop, status };
};
