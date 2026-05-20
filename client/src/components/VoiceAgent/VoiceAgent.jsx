import { useState, useCallback, useRef, useEffect } from 'react';
import { useConversation } from '../../hooks/useConversation';
import { useTTS } from '../../hooks/useTTS';
import { useEmergencyContacts } from '../../hooks/useEmergencyContacts';
import { diagnosisAgent } from '../../agents/diagnosisAgent';
import { emergencyAgent } from '../../agents/emergencyAgent';
import { hasEmergencyKeyword } from '../../utils/emergencyKeywords';
import { PATIENT_NAME, PATIENT_LOCATION } from '../../utils/dummyData';
import { StatusIndicator } from './StatusIndicator';
import { EmergencyBanner } from '../EmergencyBanner';

export const VoiceAgent = ({ onBackToContacts }) => {
  const [started, setStarted]       = useState(false);
  const [agentMode, setAgentMode]   = useState('idle');   // idle | listening | speaking
  const [textInput, setTextInput]   = useState('');
  const [messages, setMessages]     = useState([]);
  const [emergency, setEmergency]   = useState(null);
  const [lang, setLang]             = useState('en');
  const [textBusy, setTextBusy]     = useState(false);

  const { contacts } = useEmergencyContacts();
  const { speak }    = useTTS();
  const chatScrollRef = useRef(null);
  const textInputRef  = useRef(null);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const addMessage = useCallback((role, content, meta = {}) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date(), ...meta }]);
  }, []);

  const triggerEmergency = useCallback(async (text) => {
    addMessage('system', '🚨 Emergency protocol activated — alerting contacts…');
    try {
      const result = await emergencyAgent(text, contacts, PATIENT_NAME, PATIENT_LOCATION);
      addMessage('assistant', result.reply, { severity: 'critical' });
      setEmergency({ contacts, message: result.sms_body });
    } catch (err) {
      console.error('Emergency error:', err);
    }
  }, [contacts, addMessage]);

  // ElevenLabs agent callbacks
  const handleMessage = useCallback((msg) => {
    if (!msg?.message) return;
    const role = msg.source === 'user' ? 'user' : 'assistant';
    addMessage(role, msg.message);
    if (role === 'user' && hasEmergencyKeyword(msg.message)) {
      triggerEmergency(msg.message);
    }
  }, [addMessage, triggerEmergency]);

  const handleModeChange = useCallback((mode) => {
    setAgentMode(mode === 'speaking' ? 'speaking' : mode === 'listening' ? 'listening' : 'idle');
  }, []);

  const { start: startAgent, stop: stopAgent, status: agentStatus } = useConversation({
    onMessage: handleMessage,
    onModeChange: handleModeChange,
  });

  // HELP button
  const handleHelp = useCallback(async () => {
    setStarted(true);
    await startAgent();
  }, [startAgent]);

  // Mic orb toggle
  const handleMicClick = useCallback(async () => {
    if (!started) { handleHelp(); return; }
    if (agentStatus === 'connected') { await stopAgent(); setAgentMode('idle'); return; }
    await startAgent();
  }, [started, agentStatus, handleHelp, startAgent, stopAgent]);

  // Text input — uses OpenAI backend + ElevenLabs TTS
  const handleTextSubmit = useCallback(async () => {
    const text = textInput.trim();
    if (!text || textBusy) return;
    setTextInput('');
    setTextBusy(true);
    addMessage('user', text);

    if (hasEmergencyKeyword(text)) {
      await triggerEmergency(text);
      setTextBusy(false);
      return;
    }

    try {
      const result = await diagnosisAgent(text, messages.filter(m => m.role !== 'system'), lang);
      addMessage('assistant', result.reply);
      await speak(result.reply, lang);
    } catch (err) {
      console.error('Text agent error:', err);
      addMessage('assistant', "Sorry, I'm having trouble connecting. Please try again.", { isError: true });
    }
    setTextBusy(false);
    textInputRef.current?.focus();
  }, [textInput, textBusy, addMessage, messages, lang, speak, triggerEmergency]);

  // Derive orb status
  const orbStatus = agentStatus === 'connecting' ? 'thinking'
    : agentMode === 'speaking'  ? 'speaking'
    : agentMode === 'listening' ? 'listening'
    : textBusy                  ? 'thinking'
    : 'idle';

  const severityColor = { low: '#00E5CF', medium: '#FFD700', high: '#FF8C00', critical: '#FF2D55' };

  return (
    <div className="voice-agent">
      {emergency && (
        <EmergencyBanner
          contacts={emergency.contacts}
          message={emergency.message}
          onDismiss={() => setEmergency(null)}
        />
      )}

      <header className="va-header">
        <button className="btn-back" onClick={onBackToContacts}>← Contacts</button>
        <div className="va-logo"><span>🩺</span><span className="va-title">VitaVoice</span></div>
        <button className="lang-toggle" onClick={() => setLang(l => l === 'en' ? 'ur' : 'en')}>
          {lang === 'en' ? '🇵🇰 اردو' : '🇬🇧 English'}
        </button>
      </header>

      {/* ── HELP screen ── */}
      {!started && (
        <div className="help-start-section">
          <div className="help-logo-ring">🩺</div>
          <p className="help-prompt">{lang === 'ur' ? 'کیا آپ ٹھیک نہیں؟' : 'Are you feeling unwell?'}</p>
          <button className="btn-help-big" onClick={handleHelp} id="help-btn">
            🆘 {lang === 'ur' ? 'مدد' : 'HELP'}
          </button>
          <p className="help-sub">{lang === 'ur' ? 'ڈاکٹر وٹا سے بات کریں' : 'Tap to speak with Dr. Vita'}</p>
          <p className="help-contacts-note">
            {lang === 'ur' ? 'ہنگامی رابطے:' : 'Emergency contacts:'} {contacts.map(c => c.name).join(', ')}
          </p>
          <button className="btn-test-emergency" onClick={() => triggerEmergency('Demo emergency: patient needs immediate help')}>
            🚨 {lang === 'ur' ? 'ہنگامی الرٹ ٹیسٹ' : 'Demo: Trigger Emergency Alert'}
          </button>
        </div>
      )}

      {/* ── Active conversation ── */}
      {started && (
        <>
          <div className="orb-section">
            <div className={`mic-orb mic-orb--${orbStatus}`} onClick={handleMicClick} role="button" tabIndex={0}>
              <div className="orb-ring orb-ring-1" />
              <div className="orb-ring orb-ring-2" />
              <div className="orb-ring orb-ring-3" />
              <div className="orb-core">
                {orbStatus === 'thinking' ? (
                  <div className="orb-thinking"><span/><span/><span/></div>
                ) : orbStatus === 'speaking' ? (
                  <div className="orb-speaking"><span/><span/><span/><span/><span/></div>
                ) : (
                  <span className="orb-mic-icon">{orbStatus === 'listening' ? '🔴' : '🎙️'}</span>
                )}
              </div>
            </div>

            <StatusIndicator status={orbStatus} />

            {agentStatus === 'connecting' && (
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Connecting to Dr. Vita…</p>
            )}
          </div>

          <div className="chat-section" ref={chatScrollRef} id="chat-transcript">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble chat-bubble--${msg.role} ${msg.isError ? 'chat-bubble--error' : ''}`}>
                {msg.role === 'assistant' && <div className="bubble-avatar">🩺</div>}
                <div className="bubble-body">
                  <p className="bubble-text">{msg.content}</p>
                  {msg.severity && msg.role === 'assistant' && (
                    <span className="severity-tag" style={{ color: severityColor[msg.severity] || severityColor.low }}>
                      {msg.severity?.toUpperCase()}
                    </span>
                  )}
                  <span className="bubble-time">
                    {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {msg.role === 'user' && <div className="bubble-avatar">👤</div>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Text input ── */}
      {started && (
        <div className="text-input-row">
          <input
            ref={textInputRef}
            className="text-input"
            type="text"
            placeholder={lang === 'ur' ? 'یہاں لکھیں…' : 'Type here if mic is unavailable…'}
            value={textInput}
            disabled={textBusy}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
          />
          <button className="btn-send" onClick={handleTextSubmit} disabled={textBusy || !textInput.trim()}>
            {lang === 'ur' ? 'بھیجیں' : 'Send'}
          </button>
        </div>
      )}

      <div className="va-hint">
        {!started ? 'Tap HELP to begin'
          : orbStatus === 'listening' ? '🔴 Listening — speak now'
          : orbStatus === 'speaking'  ? '🔊 Dr. Vita is speaking…'
          : orbStatus === 'thinking'  ? '⏳ Connecting…'
          : 'Tap mic to speak · or type below'}
      </div>
    </div>
  );
};
