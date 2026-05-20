import { useState } from 'react';
import { Onboarding } from './components/Onboarding/Onboarding';
import { VoiceAgent } from './components/VoiceAgent/VoiceAgent';

function App() {
  const [showContacts, setShowContacts] = useState(false);

  if (showContacts) {
    return <Onboarding onComplete={() => setShowContacts(false)} />;
  }

  return <VoiceAgent onBackToContacts={() => setShowContacts(true)} />;
}

export default App;
