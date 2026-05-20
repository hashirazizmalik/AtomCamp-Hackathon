// src/hooks/useEmergencyContacts.js
import { useState, useEffect } from 'react';
import { DUMMY_CONTACTS } from '../utils/dummyData';

const STORAGE_KEY = 'vitavoice_contacts';

export const useEmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setContacts(JSON.parse(stored));
    } else {
      // Pre-seed dummy contacts
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DUMMY_CONTACTS));
      setContacts(DUMMY_CONTACTS);
    }
  }, []);

  const save = (updated) => {
    setContacts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addContact = (contact) => {
    const updated = [...contacts, { ...contact, id: Date.now() }];
    save(updated);
  };

  const removeContact = (id) => {
    save(contacts.filter((c) => c.id !== id));
  };

  const updateContact = (id, data) => {
    save(contacts.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  return { contacts, addContact, removeContact, updateContact };
};
