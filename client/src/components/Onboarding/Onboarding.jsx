// src/components/Onboarding/Onboarding.jsx
import { useState } from 'react';
import { ContactForm } from './ContactForm';
import { ContactList } from './ContactList';
import { useEmergencyContacts } from '../../hooks/useEmergencyContacts';

export const Onboarding = ({ onComplete }) => {
  const { contacts, addContact, removeContact } = useEmergencyContacts();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {/* Header */}
        <div className="onboarding-header">
          <div className="logo-pulse">
            <span className="logo-icon">🩺</span>
          </div>
          <h1 className="onboarding-title">VitaVoice</h1>
          <p className="onboarding-subtitle">AI Doctor Voice Agent</p>
          <p className="onboarding-desc">
            Set up your emergency contacts. VitaVoice will alert them instantly if a health crisis is detected.
          </p>
        </div>

        {/* Contact section */}
        <div className="contacts-section">
          <div className="contacts-header">
            <h2>Emergency Contacts</h2>
            <span className="contact-count">{contacts.length}/5</span>
          </div>

          <ContactList contacts={contacts} onRemove={removeContact} />

          {!showForm && contacts.length < 5 && (
            <button
              id="add-contact-btn"
              className="btn-add-contact"
              onClick={() => setShowForm(true)}
            >
              <span>+</span> Add Contact
            </button>
          )}

          {showForm && (
            <ContactForm
              onAdd={(c) => { addContact(c); setShowForm(false); }}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>

        {/* Launch button */}
        <button
          id="launch-vitavoice-btn"
          className="btn-launch"
          disabled={contacts.length === 0}
          onClick={onComplete}
        >
          {contacts.length === 0
            ? 'Add at least one contact to continue'
            : '🎙️ Launch VitaVoice'}
        </button>

        <p className="onboarding-disclaimer">
          ⚠️ For demo purposes only. Not a substitute for real medical care.
        </p>
      </div>
    </div>
  );
};
