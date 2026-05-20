// src/components/VoiceAgent/StatusIndicator.jsx
export const STATUS_LABELS = {
  idle:      { label: 'Say "Hey VitaVoice"', icon: '🎙️', color: 'status-idle' },
  awake:     { label: 'Waking up…',           icon: '⚡', color: 'status-awake' },
  listening: { label: 'Listening…',           icon: '👂', color: 'status-listening' },
  thinking:  { label: 'Thinking…',            icon: '🧠', color: 'status-thinking' },
  speaking:  { label: 'Speaking…',            icon: '🔊', color: 'status-speaking' },
  error:     { label: 'Error — try again',    icon: '⚠️', color: 'status-error' },
};

export const StatusIndicator = ({ status }) => {
  const s = STATUS_LABELS[status] || STATUS_LABELS.idle;
  return (
    <div className={`status-indicator ${s.color}`} id="status-indicator">
      <span className="status-icon">{s.icon}</span>
      <span className="status-label">{s.label}</span>
      {status === 'thinking' && (
        <span className="thinking-dots">
          <span /><span /><span />
        </span>
      )}
    </div>
  );
};
