// src/components/Onboarding/ContactForm.jsx
import { useState } from 'react';

const defaultForm = { name: '', phone: '', relation: '' };

export const ContactForm = ({ onAdd, onCancel }) => {
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.');
      return;
    }
    onAdd(form);
    setForm(defaultForm);
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <h3 className="form-title">Add Emergency Contact</h3>
      {error && <p className="form-error">{error}</p>}
      <div className="form-group">
        <label>Full Name *</label>
        <input
          type="text"
          placeholder="e.g. Ahmed Khan"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Phone Number *</label>
        <input
          type="tel"
          placeholder="+92-300-0000001"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Relationship</label>
        <input
          type="text"
          placeholder="e.g. Wife, Son, Doctor"
          value={form.relation}
          onChange={(e) => setForm({ ...form, relation: e.target.value })}
        />
      </div>
      <div className="form-actions">
        {onCancel && <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn-primary">Add Contact</button>
      </div>
    </form>
  );
};
