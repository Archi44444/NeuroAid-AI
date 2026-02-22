# 🧠 NeuroAid — Early Cognitive Risk Awareness Tool

> A browser-based cognitive screening platform with 7 scientifically-inspired tests, AI-powered risk analysis, and longitudinal tracking.

⚠️ **Not a medical diagnostic device.** Always consult a qualified neurologist.

---

## ✨ Features

| Feature | Status |
|---|---|
| 🔐 Firebase Auth (Email + Guest) | ✅ |
| ⚕️ Medical Disclaimer Gate | ✅ NEW |
| 📋 User Profile (age, sleep, family history) | ✅ Enhanced |
| 🎙️ Speech Analysis | ✅ |
| 🧠 Memory Recall Test | ✅ |
| ⚡ Reaction Time Test | ✅ |
| 🎨 Stroop Test (Executive Function) | ✅ |
| 🥁 Motor Tap Test (Parkinson's Signal) | ✅ |
| 🦁 Word Fluency Test (NEW) | ✅ NEW |
| 🔢 Digit Span / Working Memory (NEW) | ✅ NEW |
| 📊 18-Feature AI Risk Analysis | ✅ |
| 📌 Personalised Recommendations Engine | ✅ NEW |
| 🤖 AI Score Explanation Bot | ✅ NEW |
| 📥 Downloadable Report | ✅ NEW |
| 📈 Longitudinal Progress Tracking | ✅ |
| 🔥 Firestore Assessment History | ✅ |
| 👨‍⚕️ Doctor Dashboard | ✅ |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Firebase project

### 1. Clone & Setup

```bash
# Frontend
cd frontend
cp .env.example .env
# Fill in Firebase credentials and set VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database**
4. Add Firestore rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /assessments/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null;
    }
  }
}
```

5. Create a Firestore **composite index** for assessment history:
   - Collection: `assessments`
   - Fields: `uid` (Ascending), `createdAt` (Descending)

### 3. Environment Variables

```env
# frontend/.env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_URL=http://localhost:8000
```

---

## 🧪 Assessment Suite

| Test | Duration | What It Measures |
|---|---|---|
| Speech Analysis | ~2 min | WPM, pause ratio, rhythm variability |
| Memory Recall | ~3 min | Immediate/delayed recall, intrusions |
| Reaction Time | ~2 min | Processing speed, attention variability |
| Stroop Test | ~2 min | Executive function, inhibitory control |
| Motor Tap | ~1 min | Rhythmic motor control (Parkinson's signal) |
| Word Fluency *(new)* | ~1 min | Semantic memory, verbal fluency |
| Digit Span *(new)* | ~2 min | Working memory capacity |

**Total: ~12 minutes**

---

## 🏗️ Architecture

```
Frontend (React + Vite)
  ├── Firebase Auth (login/register/guest)
  ├── 7 cognitive test components
  ├── AssessmentContext (global state)
  ├── API service → FastAPI backend
  └── Firestore (save results, history)

Backend (FastAPI + Python)
  ├── /api/analyze — 18-feature ML scoring
  ├── Disease risk models (Alzheimer's, Dementia, Parkinson's)
  └── Age-normalized composite risk score
```

---

## ⚕️ Medical Disclaimer

NeuroAid is a **behavioral screening tool only**. It:
- ✅ Measures cognitive performance patterns
- ✅ Identifies behavioral risk indicators  
- ❌ Does NOT diagnose medical conditions
- ❌ Does NOT replace clinical evaluation

Always consult a qualified neurologist for medical assessment.
