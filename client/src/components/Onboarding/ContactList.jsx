// src/components/Onboarding/ContactList.jsx
import { useState } from 'react';

const RELATION_ICONS = {
  brother: '👨', sister: '👩', wife: '👩', husband: '👨',
  son: '👦', daughter: '👧', mother: '👩', father: '👨',
  doctor: '🩺', friend: '🤝', default: '👤',
};

const getIcon = (relation = '') => {
  const key = relation.toLowerCase();
  return Object.entries(RELATION_ICONS).find(([k]) => key.includes(k))?.[1] || RELATION_ICONS.default;
};

export const ContactList = ({ contacts, onRemove }) => {
  const [confirmId, setConfirmId] = useState(null);

  if (contacts.length === 0) {
    return (
      <div className="contact-empty">
        <span className="empty-icon">📋</span>
        <p>No contacts added yet.<br />Add at least one emergency contact.</p>
      </div>
    );
  }

  return (
    <div className="contact-list">
      {contacts.map((c) => (
        <div key={c.id} className="contact-card">
          <div className="contact-avatar">{getIcon(c.relation)}</div>
          <div className="contact-info">
            <span className="contact-name">{c.name}</span>
            <span className="contact-phone">{c.phone}</span>
            {c.relation && <span className="contact-relation">{c.relation}</span>}
          </div>
          {confirmId === c.id ? (
            <div className="contact-confirm">
              <button className="btn-danger-sm" onClick={() => { onRemove(c.id); setConfirmId(null); }}>Remove</button>
              <button className="btn-ghost-sm" onClick={() => setConfirmId(null)}>Cancel</button>
            </div>
          ) : (
            <button className="btn-remove" onClick={() => setConfirmId(c.id)} aria-label="Remove contact">✕</button>
          )}
        </div>
      ))}
    </div>
  );
};
