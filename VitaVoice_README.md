# 🩺 VitaVoice — AI Doctor Voice Agent

> **Always-on. Multilingual. Lifesaving.**  
> An intelligent, voice-activated AI doctor that listens, diagnoses, and alerts emergency contacts — all from your browser.

> 🧪 **Prototype Notice:** This is a proof-of-concept build. All contact data, SMS alerts, and API responses use **dummy/mock data**. No real messages are sent. No real patient data is stored. For demo purposes only.

---

## 📌 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Tech Stack](#-tech-stack)
4. [System Architecture](#-system-architecture)
5. [Multi-Agent Design](#-multi-agent-design)
6. [Prototype Dummy Data Map](#-prototype-dummy-data-map)
7. [File Structure](#-file-structure)
8. [Environment Variables](#-environment-variables)
9. [Installation & Local Setup](#-installation--local-setup)
10. [Emergency Contact System](#-emergency-contact-system)
11. [Wake Word & Voice Activation](#-wake-word--voice-activation)
12. [ElevenLabs Voice Integration](#-elevenlabs-voice-integration)
13. [Multilingual Support](#-multilingual-support)
14. [Push to GitHub](#-push-to-github)
15. [Deploy to Google Cloud Platform (GCP)](#-deploy-to-google-cloud-platform-gcp)
16. [API Reference](#-api-reference)
17. [Security Notes](#-security-notes)
18. [Roadmap](#-roadmap)

---

## 🧬 Project Overview

**VitaVoice** is a web-based AI voice agent that acts as a personal doctor. It is always listening (with permission), responds to a wake phrase, speaks back using a realistic doctor voice via ElevenLabs, supports multiple languages, and can dispatch emergency SMS alerts to pre-configured contacts when a health crisis is detected.

No separate app install is needed. Just open the browser tab, grant microphone access, and say:

> _"Hey VitaVoice, I'm feeling chest pain"_

The agent will assess the situation, respond medically, and if needed — **instantly alert your emergency contacts via SMS.**

In this prototype, all external services (ElevenLabs TTS, Twilio SMS) are **mocked** — the UI simulates the full experience without live API calls, so the demo runs cost-free and credential-free (except one real OpenAI key).

---

## ✨ Key Features

| Feature | Description | Prototype Status |
|---|---|---|
| 🎙️ Always-On Voice Activation | Wake-word detection using browser Web Speech API | ✅ Live (browser native) |
| 🧠 GPT-3.5 Turbo Intelligence | OpenAI for medical reasoning and triage | ✅ Live (real API) |
| 🔊 Realistic Doctor Voice | ElevenLabs TTS with professional medical voice | 🟡 Mocked (browser SpeechSynthesis) |
| 🌍 Multilingual | Detects and responds in the user's language | ✅ Live via GPT |
| 🚨 Emergency Contact Alerts | SMS dispatch on crisis detection | 🟡 Mocked (console log + UI banner) |
| 👥 Multi-Agent Architecture | Triage, diagnosis, dispatch, translation agents | ✅ Live via GPT |
| 📋 Emergency Contact Setup | Onboarding screen — contacts pre-seeded in prototype | ✅ Live (localStorage) |
| ☁️ GCP Deployment | Cloud Run backend + Firebase Hosting frontend | ✅ |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite) — UI framework
- **Tailwind CSS** — styling
- **Web Speech API** — wake word + speech-to-text (browser-native, free)
- **Browser SpeechSynthesis API** — TTS fallback in prototype (replaces ElevenLabs)

### Backend
- **Node.js + Express** — REST API server
- **OpenAI GPT-3.5 Turbo** — medical intelligence (real API call)
- **ElevenLabs API** — voice synthesis *(mocked in prototype)*
- **Twilio API** — emergency SMS dispatch *(mocked in prototype)*

### Infrastructure (GCP)
- **Google Cloud Run** — containerized Express backend (auto-scaling, pay-per-use)
- **Firebase Hosting** — React frontend (free tier, global CDN)
- **Google Cloud Build** — CI/CD pipeline triggered from GitHub push
- **Google Container Registry** — Docker image storage

### DevOps
- **GitHub** — version control + Cloud Build trigger
- **Docker** — containerize Express backend for Cloud Run
- **Google Cloud SDK (`gcloud`)** — CLI deployment

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│              BROWSER (React — Firebase Hosting)               │
│                                                               │
│  ┌───────────────┐    ┌─────────────────────────────────┐    │
│  │  Onboarding   │    │      Main Voice Interface        │    │
│  │  Emergency    │───▶│  Wake Word Listener (always-on) │    │
│  │  Contacts     │    │  Speech-to-Text (Web API)        │    │
│  │ (dummy data)  │    └──────────────┬──────────────────┘    │
│  └───────────────┘                   │                        │
│                          User speaks │                        │
│                                      ▼                        │
│                     ┌───────────────────────────┐            │
│                     │     AGENT ORCHESTRATOR     │            │
│                     │  Routes to correct agent   │            │
│                     └─────────────┬─────────────┘            │
└───────────────────────────────────┼──────────────────────────┘
                                    │ HTTPS
                                    ▼
┌──────────────────────────────────────────────────────────────┐
│             GOOGLE CLOUD RUN  (Express Backend)               │
│                                                               │
│    POST /api/chat     POST /api/speak     POST /api/alert     │
│          │                  │                   │             │
│          ▼                  ▼                   ▼             │
│   GPT-3.5 Turbo      ElevenLabs TTS       Twilio SMS         │
│   (real OpenAI)      (mocked → flag)    (mocked → log)       │
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │
│  │ Triage   │ │Diagnosis │ │Emergency │ │ Translation  │    │
│  │  Agent   │ │  Agent   │ │ Dispatch │ │    Agent     │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘    │
└──────────────────────────────────────────────────────────────┘
                                    │
           ┌────────────────────────┤
           ▼                        ▼
  🔊 Browser SpeechSynthesis    🟡 Mock SMS logged to
     speaks doctor's reply         console + red UI
   (ElevenLabs in production)      emergency banner
```

---

## 🤖 Multi-Agent Design

VitaVoice uses **4 specialized agents**, each with its own system prompt sent to GPT-3.5 Turbo via the Cloud Run Express backend.

### 1. 🔍 Triage Agent
**Role:** First responder — classifies severity.  
**Trigger:** Every new user message.  
**Output:** `{ severity: "low" | "medium" | "high" | "critical", summary: string }`

```
System Prompt:
"You are a medical triage nurse. Classify the patient's complaint into
severity levels: low, medium, high, or critical. Return only JSON.
Do not provide diagnosis. Be conservative — always escalate if unsure."
```

---

### 2. 🩺 Diagnosis Agent
**Role:** General practitioner — converses, asks follow-ups, gives advice.  
**Trigger:** After triage returns `low` or `medium`.  
**Output:** Natural language medical response in the user's detected language.

```
System Prompt:
"You are Dr. Vita, a warm, professional, and empathetic AI doctor.
Speak in the same language the patient uses. Ask follow-up questions
when needed. Never replace real medical advice — always recommend
seeing a doctor for serious concerns. Keep responses under 80 words."
```

---

### 3. 🚨 Emergency Dispatch Agent
**Role:** Handles critical situations, calms patient, triggers alert.  
**Trigger:** Triage returns `critical` OR emergency keywords detected.  
**Prototype behavior:** SMS is mocked — logged to console + UI banner shown.

```
System Prompt:
"You are an emergency coordinator. The patient may be in crisis.
Speak calmly and clearly. Tell them help is being alerted.
Ask them to stay on the line. Return JSON:
{ message_to_patient: string, sms_body: string, alert_emergency_contacts: true }"
```

---

### 4. 🌍 Translation Agent
**Role:** Detects language, translates responses for TTS.  
**Trigger:** Runs passively alongside every other agent.  
**Output:** Translated text passed to browser SpeechSynthesis (prototype) or ElevenLabs (production).

```
System Prompt:
"Detect the language of the input. If not English, translate the
provided doctor response into that language. Return only the
translated text, no explanations."
```

---

## 🧪 Prototype Dummy Data Map

Everything marked **🟡 Mocked** below uses dummy values — no real external calls.

| Component | Real (Production) | Dummy (Prototype) |
|---|---|---|
| Emergency contacts | User enters real phone numbers | Pre-seeded: Ahmed (+92-300-0000001), Sara (+92-300-0000002), Dr. Farooq (+92-300-0000003) |
| SMS alert | Twilio sends real SMS | `console.log` + red flashing UI banner |
| TTS voice | ElevenLabs API audio stream | `window.speechSynthesis.speak()` |
| ELEVENLABS_API_KEY | Real key | `"mock"` in `.env` |
| TWILIO_ACCOUNT_SID | Real Twilio SID | `"mock"` in `.env` |
| Patient name | Collected in onboarding | `"Demo User"` hardcoded |
| Geolocation in alert | `navigator.geolocation` live | `"Rawalpindi, PK (simulated)"` |
| OpenAI | GPT-3.5 Turbo | **Real API — only live call in prototype** |

---

## 📁 File Structure

```
vitavoice/
├── client/                              # React app → Firebase Hosting
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── agents/
│   │   │   ├── triageAgent.js           # POST /api/chat with triage prompt
│   │   │   ├── diagnosisAgent.js        # POST /api/chat with doctor prompt
│   │   │   ├── emergencyAgent.js        # POST /api/alert (mock-aware)
│   │   │   └── translationAgent.js      # Language detect + translate
│   │   ├── components/
│   │   │   ├── Onboarding/
│   │   │   │   ├── Onboarding.jsx       # Emergency contact setup screen
│   │   │   │   ├── ContactForm.jsx      # Add/edit contact form
│   │   │   │   └── ContactList.jsx      # Shows contacts (pre-seeded dummy)
│   │   │   ├── VoiceAgent/
│   │   │   │   ├── VoiceAgent.jsx       # Main voice interface
│   │   │   │   ├── WakeWordListener.jsx # Always-on wake word hook
│   │   │   │   ├── SpeechInput.jsx      # STT handler
│   │   │   │   ├── MockTTS.jsx          # Browser SpeechSynthesis fallback
│   │   │   │   └── StatusIndicator.jsx  # Listening/Thinking/Speaking states
│   │   │   ├── EmergencyBanner.jsx      # Red flashing alert (mock SMS visual)
│   │   │   └── LanguageBadge.jsx        # Shows detected language
│   │   ├── hooks/
│   │   │   ├── useWakeWord.js
│   │   │   ├── useSpeechRecognition.js
│   │   │   ├── useMockTTS.js            # Browser TTS hook (prototype)
│   │   │   └── useEmergencyContacts.js
│   │   ├── utils/
│   │   │   ├── emergencyKeywords.js
│   │   │   ├── languageDetect.js
│   │   │   └── dummyData.js             # Pre-seeded contacts + mock SMS log
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .firebaserc
│   ├── firebase.json
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── server/                              # Express API → Google Cloud Run
│   ├── routes/
│   │   ├── chat.js                      # GPT-3.5 Turbo agent router
│   │   ├── speak.js                     # ElevenLabs TTS (mock-aware)
│   │   └── alert.js                     # Twilio SMS dispatcher (mock-aware)
│   ├── middleware/
│   │   └── cors.js                      # Allow Firebase Hosting origin
│   ├── index.js                         # Express app entry point
│   ├── Dockerfile                       # Container config for Cloud Run
│   ├── .env.example
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml                   # GitHub Actions → Firebase Hosting
│
├── cloudbuild.yaml                      # GCP Cloud Build → Cloud Run
├── .gitignore
└── README.md
```

---

## 🔐 Environment Variables

### `server/.env` (local only — never commit)

```env
# OpenAI (real — required in prototype)
OPENAI_API_KEY=sk-...

# ElevenLabs (set to "mock" for prototype)
ELEVENLABS_API_KEY=mock
ELEVENLABS_VOICE_ID=mock

# Twilio (set to "mock" for prototype)
TWILIO_ACCOUNT_SID=mock
TWILIO_AUTH_TOKEN=mock
TWILIO_FROM_NUMBER=mock

# Server config
PORT=8080
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

### `server/.env.example` (safe to commit)

```env
OPENAI_API_KEY=your_openai_key_here
ELEVENLABS_API_KEY=mock
ELEVENLABS_VOICE_ID=mock
TWILIO_ACCOUNT_SID=mock
TWILIO_AUTH_TOKEN=mock
TWILIO_FROM_NUMBER=mock
PORT=8080
NODE_ENV=development
CLIENT_ORIGIN=https://vitavoice.web.app
```

### `client/.env` (local only)

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WAKE_WORD=vitavoice
VITE_PROTOTYPE_MODE=true
```

---

## 💻 Installation & Local Setup

### Prerequisites
- Node.js 18+
- npm
- Git
- Google Cloud SDK — [install guide](https://cloud.google.com/sdk/docs/install)
- Firebase CLI — `npm install -g firebase-tools`
- Chrome or Edge (Web Speech API support)
- One real OpenAI API key (all other keys can stay as `"mock"`)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/vitavoice.git
cd vitavoice

# 2. Set up and start the backend
cd server
npm install
cp .env.example .env
# Edit .env → paste your real OPENAI_API_KEY; leave all others as "mock"
node index.js
# ✅ Backend running at: http://localhost:8080

# 3. In a new terminal — set up and start the frontend
cd ../client
npm install
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:8080 (already set in example)
npm run dev
# ✅ Frontend running at: http://localhost:5173
```

Open `http://localhost:5173` in Chrome, grant microphone access, and say **"Hey VitaVoice"** to activate.

---

## 🆘 Emergency Contact System

### Onboarding Flow

VitaVoice blocks the voice interface until at least one emergency contact is saved.

```
[Welcome Screen — VitaVoice]
         ↓
[Add Emergency Contact]
  - Full Name        (required)
  - Phone Number     (required, with country code)
  - Relationship     (e.g. Wife, Son, Family Doctor)
  - [+ Add Another]  (up to 5 contacts)
         ↓
[Save & Launch VitaVoice]
```

In the prototype, contacts are **pre-seeded** so the demo works without manual entry:

```javascript
// client/src/utils/dummyData.js
export const DUMMY_CONTACTS = [
  { id: 1, name: "Ahmed Khan",  phone: "+92-300-0000001", relation: "Brother" },
  { id: 2, name: "Sara Malik",  phone: "+92-300-0000002", relation: "Wife"    },
  { id: 3, name: "Dr. Farooq",  phone: "+92-300-0000003", relation: "Doctor"  },
];
```

### Emergency Trigger Logic

| Trigger | Examples |
|---|---|
| Triage severity = `critical` | GPT classified input as critical |
| Emergency keywords | "chest pain", "can't breathe", "heart attack", "unconscious", "overdose", "suicidal" |
| User says "emergency" | Direct spoken request |
| 3+ consecutive `high` messages | Repeated distress pattern |

### Prototype Alert Behavior

When triggered, the backend logs mock SMS and the frontend shows a visual alert:

```
Server console:
📱 [MOCK SMS] TO: Ahmed Khan (+92-300-0000001)
MESSAGE: 🚨 VitaVoice EMERGENCY: Demo User reported chest pain at 4:15 PM. Location: Rawalpindi, PK (simulated).

📱 [MOCK SMS] TO: Sara Malik (+92-300-0000002)
MESSAGE: 🚨 VitaVoice EMERGENCY: Demo User reported chest pain at 4:15 PM. Location: Rawalpindi, PK (simulated).
```

Frontend: Red pulsing `<EmergencyBanner>` lists all "alerted" contacts + plays a warning chime.

### `server/routes/alert.js` — Mock-aware

```javascript
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { contacts, message } = req.body;

  // PROTOTYPE MODE — Twilio is mocked
  if (process.env.TWILIO_ACCOUNT_SID === 'mock') {
    contacts.forEach(c => {
      console.log(`📱 [MOCK SMS] TO: ${c.name} (${c.phone})\nMESSAGE: ${message}\n`);
    });
    return res.json({ sent: contacts.length, mode: 'mock' });
  }

  // PRODUCTION — Real Twilio
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const results = await Promise.allSettled(
    contacts.map(c =>
      client.messages.create({ body: message, from: process.env.TWILIO_FROM_NUMBER, to: c.phone })
    )
  );
  res.json({ sent: results.length, mode: 'live' });
});

module.exports = router;
```

---

## 🎙️ Wake Word & Voice Activation

VitaVoice is **always listening** once the tab is open and mic permission is granted. No button click needed.

### Wake Phrase
Default: **"Hey VitaVoice"** — configurable via `VITE_WAKE_WORD`

### Activation Flow

```
Browser tab open
       ↓
Microphone active (continuous low-power mode via Web Speech API)
       ↓
WakeWordListener checks every interim transcript fragment
       ↓
Transcript contains "vitavoice"?
       ↓ YES
Full listening mode begins → user states medical concern
       ↓
1.5s silence detected → STT ends
       ↓
Text → Agent Orchestrator → GPT response → TTS spoken reply
```

### `client/src/hooks/useWakeWord.js`

```javascript
import { useEffect, useRef } from 'react';

const WAKE_WORD = (import.meta.env.VITE_WAKE_WORD || 'vitavoice').toLowerCase();

export const useWakeWord = (onActivated) => {
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('')
        .toLowerCase()
        .replace(/\s/g, '');

      if (transcript.includes(WAKE_WORD.replace(/\s/g, ''))) {
        onActivated();
      }
    };

    // Auto-restart to stay always-on
    recognition.onend = () => recognition.start();
    recognition.start();

    return () => recognition.stop();
  }, [onActivated]);
};
```

> **Note:** Requires Chrome or Edge. Firefox has partial support. For production, consider [Picovoice Porcupine](https://picovoice.ai/) for offline wake word detection.

---

## 🔊 ElevenLabs Voice Integration

### Prototype — Browser TTS Fallback

When `ELEVENLABS_API_KEY=mock`, the server returns `{ mock: true }`. The frontend falls back to browser SpeechSynthesis (free, no key):

```javascript
// client/src/hooks/useMockTTS.js
export const useMockTTS = () => {
  const speak = (text, lang = 'en-US') => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith(lang.split('-')[0]) && v.localService === false);
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  };
  return { speak };
};
```

### Production — Real ElevenLabs

`server/routes/speak.js` proxies to ElevenLabs **Multilingual v2** (29 languages):

```javascript
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.post('/', async (req, res) => {
  const { text } = req.body;

  if (process.env.ELEVENLABS_API_KEY === 'mock') {
    return res.json({ mock: true, text });
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.6, similarity_boost: 0.8 },
      }),
    }
  );

  const audioBuffer = await response.buffer();
  res.set('Content-Type', 'audio/mpeg');
  res.send(audioBuffer);
});

module.exports = router;
```

---

## 🌍 Multilingual Support

| Language | Code | Wake Phrase |
|---|---|---|
| English | en-US | "Hey VitaVoice" |
| Urdu | ur | "ہیلو وٹا وائس" |
| Arabic | ar | "مرحبا فيتافويس" |
| Hindi | hi | "हैलो विटावॉयस" |
| French | fr | "Bonjour VitaVoice" |
| Spanish | es | "Hola VitaVoice" |
| German | de | "Hallo VitaVoice" |

Language is auto-detected by the Translation Agent (GPT-3.5 Turbo). The response is then re-translated and spoken in the user's language via browser SpeechSynthesis (prototype) or ElevenLabs (production).

---

## 🐙 Push to GitHub

```bash
cd vitavoice

git init
git add .
git commit -m "🚀 Initial commit: VitaVoice AI Doctor Prototype (GCP)"

# GitHub CLI
gh repo create vitavoice --public --source=. --remote=origin --push

# OR manually
git remote add origin https://github.com/YOUR_USERNAME/vitavoice.git
git branch -M main
git push -u origin main
```

### `.gitignore`

```
# Dependencies
node_modules/

# Build output
client/dist/
client/.firebase/

# Env files — NEVER commit
server/.env
client/.env
*.env.local

# GCP
.gcloud/
*.log
```

### Branch Strategy

```
main      ← production → auto-triggers Cloud Build + Firebase deploy
  └── dev ← active development
        └── feature/gcp-cloud-run
        └── feature/wake-word
        └── feature/emergency-contacts
        └── fix/tts-fallback
```

---

## 🚀 Deploy to Google Cloud Platform (GCP)

### GCP Services Used

| Component | GCP Service | Free Tier |
|---|---|---|
| Express Backend | **Cloud Run** | 2M requests/month |
| React Frontend | **Firebase Hosting** | 10 GB storage + 360 MB/day transfer |
| CI/CD (backend) | **Cloud Build** | 120 build-minutes/day |
| Docker images | **Container Registry** | First 0.5 GB free |

---

### Prerequisites

```bash
# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Create GCP project
gcloud projects create vitavoice-prototype --name="VitaVoice"
gcloud config set project vitavoice-prototype

# Enable APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com

# Install Firebase CLI
npm install -g firebase-tools
firebase login
firebase projects:addfirebase vitavoice-prototype
```

---

### Step 1 — Build & Deploy Backend to Cloud Run

```bash
cd server

# Build Docker image and push to GCP Container Registry
gcloud builds submit --tag gcr.io/vitavoice-prototype/vitavoice-server

# Deploy to Cloud Run
gcloud run deploy vitavoice-server \
  --image gcr.io/vitavoice-prototype/vitavoice-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "\
OPENAI_API_KEY=sk-YOUR_KEY_HERE,\
ELEVENLABS_API_KEY=mock,\
ELEVENLABS_VOICE_ID=mock,\
TWILIO_ACCOUNT_SID=mock,\
TWILIO_AUTH_TOKEN=mock,\
TWILIO_FROM_NUMBER=mock,\
NODE_ENV=production,\
CLIENT_ORIGIN=https://vitavoice.web.app"
```

GCP returns a backend URL like:
```
https://vitavoice-server-xxxxxxxx-uc.a.run.app
```
**Save this URL.** You'll use it for the frontend environment variable.

---

### `server/Dockerfile`

```dockerfile
FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
```

---

### Step 2 — Deploy Frontend to Firebase Hosting

```bash
cd client

# Set your Cloud Run URL
echo "VITE_API_BASE_URL=https://vitavoice-server-xxxxxxxx-uc.a.run.app" > .env
echo "VITE_WAKE_WORD=vitavoice" >> .env
echo "VITE_PROTOTYPE_MODE=true" >> .env

# Build React app
npm run build

# Initialize Firebase Hosting (first time only)
firebase init hosting
# → Use existing project → vitavoice-prototype
# → Public directory: dist
# → Single-page app (rewrite all to index.html): YES
# → Set up automatic builds with GitHub: NO (handled by GitHub Actions)

# Deploy
firebase deploy --only hosting
```

Live at: **`https://vitavoice.web.app`** ✅

---

### `client/firebase.json`

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
          { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
        ]
      }
    ]
  }
}
```

---

### Step 3 — CI/CD: Cloud Build (Backend Auto-Deploy)

#### `cloudbuild.yaml` — triggers on every push to `main`

```yaml
steps:
  # Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/vitavoice-server', './server']

  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/vitavoice-server']

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - run
      - deploy
      - vitavoice-server
      - --image=gcr.io/$PROJECT_ID/vitavoice-server
      - --region=us-central1
      - --platform=managed
      - --allow-unauthenticated

images:
  - 'gcr.io/$PROJECT_ID/vitavoice-server'
```

**Connect GitHub to Cloud Build:**

```bash
# GCP Console → Cloud Build → Triggers → Connect Repository
# → GitHub → Select vitavoice repo
# → Branch filter: ^main$
# → Build config: cloudbuild.yaml
```

#### `.github/workflows/deploy.yml` — Frontend Auto-Deploy to Firebase

```yaml
name: Deploy Frontend to Firebase Hosting

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install & Build
        working-directory: client
        run: |
          npm ci
          echo "VITE_API_BASE_URL=${{ secrets.CLOUD_RUN_URL }}" > .env
          echo "VITE_WAKE_WORD=vitavoice" >> .env
          echo "VITE_PROTOTYPE_MODE=true" >> .env
          npm run build

      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: vitavoice-prototype
          entryPoint: client
```

**Add GitHub Secrets** (Settings → Secrets → Actions):
- `CLOUD_RUN_URL` — your Cloud Run backend URL
- `FIREBASE_SERVICE_ACCOUNT` — JSON key from GCP Service Account

Every `git push origin main` now deploys both frontend and backend automatically. ✅

---

## 📡 API Reference

| Environment | Base URL |
|---|---|
| Local dev | `http://localhost:8080` |
| Production | `https://vitavoice-server-xxxxxxxx-uc.a.run.app` |

---

### `POST /api/chat`
Routes to the appropriate GPT agent.

**Request:**
```json
{
  "messages": [{ "role": "user", "content": "I have chest pain" }],
  "agent": "triage",
  "language": "en"
}
```

**Response:**
```json
{
  "reply": "Please describe the chest pain — is it sharp or pressure-like?",
  "severity": "high",
  "emergency": false
}
```

---

### `POST /api/speak`
TTS proxy — returns mock flag in prototype, audio in production.

**Request:**
```json
{ "text": "Please describe the chest pain.", "language": "en" }
```

**Prototype response:**
```json
{ "mock": true, "text": "Please describe the chest pain." }
```

**Production response:** `audio/mpeg` binary

---

### `POST /api/alert`
Dispatches emergency SMS (mock in prototype).

**Request:**
```json
{
  "contacts": [
    { "name": "Ahmed Khan", "phone": "+92-300-0000001" }
  ],
  "message": "🚨 VitaVoice EMERGENCY: Demo User reported chest pain at 4:15 PM. Location: Rawalpindi, PK (simulated)."
}
```

**Prototype response:**
```json
{ "sent": 1, "mode": "mock" }
```

**Production response:**
```json
{ "sent": 1, "mode": "live" }
```

---

## 🔒 Security Notes

- API keys never leave the Cloud Run backend — the React client holds no secrets.
- In the prototype, only `OPENAI_API_KEY` is real. All other credentials are `"mock"`.
- Emergency contacts are stored in `localStorage` (no server-side persistence in prototype).
- Cloud Run is `--allow-unauthenticated` for demo convenience — add Cloud Run IAM or API Gateway auth before going to production.
- For production, move all secrets from `--set-env-vars` to **Google Secret Manager** and mount them as environment variables in Cloud Run.
- No conversation data is retained server-side. Express request logging is disabled in `NODE_ENV=production`.

---

## 🗺️ Roadmap

**Prototype → Production upgrades:**

- [ ] Swap browser TTS → real ElevenLabs Multilingual v2 voice
- [ ] Swap mock SMS → real Twilio SMS + WhatsApp alerts
- [ ] Move secrets from `--set-env-vars` → Google Secret Manager
- [ ] Add Cloud Run IAM auth + Cloud Endpoints API Gateway
- [ ] Live geolocation embedded in emergency alerts
- [ ] Offline wake word via Picovoice Porcupine (no internet needed)
- [ ] Medical history profile for personalized triage
- [ ] Mobile PWA — installable on phone home screen
- [ ] Smartwatch integration — heart rate / SpO2 triggers emergency
- [ ] HIPAA-compliant backend + encryption at rest (Cloud SQL + CMEK)

---

## 🧑‍💻 Author

Built with ❤️ using OpenAI GPT-3.5 Turbo, ElevenLabs, and Twilio.  
Backend on **Google Cloud Run** · Frontend on **Firebase Hosting** · Code on **GitHub**.

---

> ⚠️ **Medical Disclaimer:** VitaVoice is an AI assistant and does **not** replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns. In a life-threatening emergency, call your local emergency services immediately (e.g. 115, 911, 999).
