export const EmergencyBanner = ({ contacts = [], message = '', onDismiss }) => {
  return (
    <div className="emergency-overlay" role="alert" aria-live="assertive" id="emergency-banner">
      <div className="emergency-card">
        <div className="emergency-pulse-ring" />
        <div className="emergency-header">
          <span className="emergency-icon">🚨</span>
          <h2>EMERGENCY ALERT DISPATCHED</h2>
        </div>
        <p className="emergency-msg">
          Emergency contacts have been notified via SMS. Stay calm — help is on the way.
        </p>

        {contacts.length > 0 && (
          <div className="emergency-contacts">
            <p className="alerted-label">📱 SMS sent to:</p>
            {contacts.map((c, i) => (
              <div key={i} className="alerted-contact">
                <div className="alerted-contact-info">
                  <strong>{c.name}</strong>
                  {c.relation && <span className="alerted-relation"> ({c.relation})</span>}
                  {c.phone && <span className="alerted-phone">{c.phone}</span>}
                </div>
                <span className="sms-sent-badge">✓ Sent</span>
              </div>
            ))}
          </div>
        )}

        {message && (
          <div className="emergency-sms-preview">
            <p className="sms-label">Message sent:</p>
            <p className="sms-text">"{message}"</p>
          </div>
        )}

        <div className="emergency-actions">
          <a href="tel:115" className="btn-emergency-call">📞 Call 115 (Emergency)</a>
          <button className="btn-dismiss" onClick={onDismiss} id="dismiss-emergency-btn">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
