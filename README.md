# 🧠 NeuroAid

## AI-Powered Early Cognitive Risk Screening System

---

## ⚠️ Disclaimer
NeuroAid is a non-diagnostic awareness tool.  
It does NOT diagnose dementia, Alzheimer’s disease, or any medical condition.  
It generates an AI-based cognitive risk score to encourage early consultation with qualified healthcare professionals.

---

## 🌍 Description

NeuroAid is a full-stack AI system that analyzes behavioral cognitive indicators including:

- Speech patterns
- Memory recall performance
- Reaction time consistency

The system extracts structured behavioral signals and computes a weighted Cognitive Risk Score (0–100) to provide early awareness insights.

---

## 🚀 Features

### 🗣 Speech Analysis
- Speech-to-text conversion
- Words per minute calculation
- Pause frequency detection
- Repetition pattern analysis
- Filler word density
- Coherence estimation

Output: Speech Score (0–100)

### 🧠 Memory Micro-Tests
- 5-word delayed recall
- Pattern matching
- Sequence repetition
- Accuracy tracking
- Response latency measurement

Output: Memory Score (0–100)

### ⚡ Reaction Time Test
- Tap-on-color-change test
- Average delay calculation
- Variability measurement
- False trigger detection

Output: Reaction Score (0–100)

### 📊 Risk Score Engine

Risk Score =
(0.4 × Speech Score) +
(0.4 × Memory Score) +
(0.2 × Reaction Score)

Risk Levels:
- 0–40 → Low Risk
- 41–70 → Moderate Risk
- 71–100 → High Risk

---

## 🏗 System Architecture

User  
↓  
Frontend (React / Next.js)  
↓  
Backend API (Node.js + Express)  
↓  
AI Microservice (Python + FastAPI)  
↓  
Feature Extraction & Risk Engine  
↓  
Firebase Firestore  
↓  
Risk Report + Dashboard  

---

## 🛠 Tech Stack

### Frontend
- React / Next.js
- Tailwind CSS
- Chart.js
- Web Speech API

### Backend
- Node.js
- Express.js

### AI Service
- Python
- FastAPI
- HuggingFace Transformers
- Whisper (Speech-to-Text)

### Database
- Firebase Firestore

### Deployment
- Vercel (Frontend)
- Render (Backend + AI Service)

---

# 📂 Project Structure

```
neuroaid/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── ai-service/
│   ├── app.py
│   ├── feature_extractor.py
│   ├── scoring_engine.py
│   ├── models/
│   ├── utils/
│   ├── config.py
│   └── requirements.txt
│
├── docs/
│   ├── architecture.md
│   ├── api-spec.md
│   ├── research-notes.md
│   └── future-roadmap.md
│
├── docker-compose.yml
├── .env.example
├── README.md
└── LICENSE
```


## ⚙️ Installation

### 1️⃣ Clone Repository

git clone https://github.com/unnkarm/NeuroAid-AI.git  
cd neuroaid  

---

### 2️⃣ Setup Frontend

cd frontend  
npm install  
npm run dev  

---

### 3️⃣ Setup Backend

cd backend  
npm install  
npm start  

---

### 4️⃣ Setup AI Service

cd ai-service  
pip install -r requirements.txt  
uvicorn app:app --reload  

---


## 🔒 Ethics & Responsibility

- No medical diagnosis
- Transparent scoring logic
- Secure data handling
- Clear disclaimers
- Built for awareness, not replacement of doctors

---

## 🌟 Future Enhancements

- Longitudinal cognitive tracking
- Emotion & tone analysis
- Doctor dashboard
- PDF medical-style report export
- Multilingual speech support
- Clinical validation partnerships

---


## 📜 License

MIT License

