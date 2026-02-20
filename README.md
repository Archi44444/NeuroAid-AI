# 🧠 NeuroAid
### AI-Powered Early Cognitive Risk Screening System

> ⚠️ **Disclaimer:** NeuroAid is a non-diagnostic awareness tool. It does NOT diagnose dementia, Alzheimer’s, or any medical condition. It provides an AI-generated cognitive risk score to encourage early consultation with healthcare professionals.

---

## 🌍 Problem Statement

Early signs of cognitive decline (e.g., memory impairment, slowed reaction time, speech irregularities) often go unnoticed because:

- Symptoms are subtle  
- People avoid clinical testing  
- Rural areas lack specialists  
- Screening tools are expensive or inaccessible  

Traditional tools like the [Mini-Mental State Examination](https://en.wikipedia.org/wiki/Mini%E2%80%93Mental_State_Examination) and [Montreal Cognitive Assessment](https://en.wikipedia.org/wiki/Montreal_Cognitive_Assessment) require trained professionals.  

**NeuroAid bridges this gap** by offering a non-invasive, AI-powered early risk screening system accessible via web.

---

## 🚀 What NeuroAid Does

NeuroAid analyzes three key cognitive indicators:

1. 🗣 **Speech Patterns**  
2. 🧠 **Memory Recall Performance**  
3. ⚡ **Reaction Time Consistency**

It converts behavioral signals into structured metrics and computes a weighted **Cognitive Risk Score (0–100)**.

---

## 🧩 Core Features (Hackathon MVP)

### 1️⃣ Speech Analysis Module
User reads a paragraph aloud.  

AI extracts:
- Words per minute (speech rate)  
- Pause frequency  
- Repetition patterns  
- Filler word frequency  
- Sentence coherence  

Output: `Speech Score (0–100)`

---

### 2️⃣ Memory Micro-Tests
- 5-word delayed recall  
- Pattern matching  
- Sequence repetition  

Measured:
- Accuracy  
- Recall latency  

Output: `Memory Score (0–100)`

---

### 3️⃣ Reaction Time Test
User taps when the screen color changes.  

Measured:
- Average delay  
- Variability  
- False triggers  

Output: `Reaction Score (0–100)`

---

### 4️⃣ Risk Score Engine

Weighted scoring model:

Risk Score = (0.4 × Speech Score) + (0.4 × Memory Score) + (0.2 × Reaction Score)
Risk Categories:

0–40   → Low Risk
41–70  → Moderate Risk
71–100 → High Risk


### 5️⃣ Recommendation Engine

Based on risk level:

Low Risk      → Maintain mental activity & preventive exercises
Moderate Risk → Suggest consultation with a physician
High Risk     → Strong recommendation to consult a neurologist


### 🏗 System Architecture

User
  ↓
Frontend (React / Next.js)
  ↓
Backend API (Node.js + Express)
  ↓
AI Microservice (Python + FastAPI)
  ↓
Feature Extraction + Risk Engine
  ↓
Database (Firebase Firestore)
  ↓
Return Risk Report + Visualization


### 🛠 Tech Stack

Frontend

React / Next.js

Tailwind CSS

Chart.js

Web Speech API

Backend

Node.js

Express.js

AI Microservice

Python

FastAPI

HuggingFace Transformers

Whisper (Speech-to-Text)

Database

Firebase Firestore

Deployment

Vercel (Frontend)

Render (Backend + AI Service)

🧠 AI & Feature Engineering
Speech → text using Whisper

Extract behavioral features

Normalize features

Weighted risk computation

Generates interpretable risk report

Example API Payload:

POST /api/analyze
{
  "speech_audio": "base64-encoded-audio",
  "memory_results": {
    "word_recall_accuracy": 80,
    "pattern_accuracy": 70
  },
  "reaction_times": [300, 280, 350, 310]
}
Example Response:

{
  "speech_score": 72,
  "memory_score": 65,
  "reaction_score": 81,
  "risk_score": 71.2,
  "risk_level": "Moderate"
}

---
```
📁 GitHub Folder Structure
neuroaid/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
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
│   └── research-notes.md
│
├── .env.example
├── docker-compose.yml
├── README.md
└── LICENSE
```
---
### 🌟 Future Enhancements
Longitudinal cognitive tracking

Emotional tone analysis

Doctor dashboard

PDF medical-style report export

Low-bandwidth rural mode
---

### 📌 Why NeuroAid Matters
Accessible AI-assisted cognitive screening can significantly improve early awareness, preventive action, and quality of life, especially in areas lacking specialist neurologists.

---

### 📜 License
MIT License


---
