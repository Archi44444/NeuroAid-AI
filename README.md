# 🧠 NeuroAid AI  
### Early Cognitive Risk Assessment & Clinical Intelligence Platform  

NeuroAid AI is a full-stack, AI-powered early cognitive risk assessment system designed to detect early indicators of neurological conditions such as:

- Mild Cognitive Impairment (MCI)
- Alzheimer’s Disease
- Parkinson’s-related cognitive decline
- General executive dysfunction patterns

The platform combines **neuropsychological tests**, a **normalized scoring engine**, a **machine learning layer**, a **progress tracking system**, and a **clinically guarded AI assistant (NeuroBot)** to create a safe, scalable, and intelligent cognitive assessment ecosystem.

---

# 🚀 Core Objectives

- Detect early cognitive risk using structured digital neuro-tests  
- Normalize and aggregate test results into clinically meaningful scores  
- Provide longitudinal progress tracking  
- Enable doctor-patient structured workflows  
- Integrate safe AI chat (RAG-based) for medical explanation  
- Maintain clinical guardrails and non-diagnostic positioning  

---

# 🏗️ System Architecture

```
Frontend (React + Vite + Tailwind)
        │
        ▼
FastAPI Backend (Python)
        │
        ├── ML Engine
        ├── Scoring Engine
        ├── Progress Tracker
        ├── RAG Service (NeuroBot)
        └── Knowledge Guardrails
```

---

# 🖥️ Frontend (React + Vite + Tailwind)

Located in:  
```
frontend/
```

### 🔹 Tech Stack

- React (Vite)
- Tailwind CSS
- Firebase Authentication
- Context API for state management
- Modular test components

---

## 🧪 Cognitive Test Modules

Each test simulates validated neuropsychological patterns:

| Test | Cognitive Domain |
|------|------------------|
| Memory Test | Episodic memory |
| Digit Span | Working memory |
| Stroop Test | Executive control |
| Reaction Test | Processing speed |
| Speech Test | Language patterns |
| Fluency Test | Verbal fluency |
| Tap Test | Motor coordination |

Each component:
- Collects structured metrics
- Sends normalized data to backend
- Contributes to aggregate cognitive score

---

## 👤 User Flow

1. User registers/login (Firebase Auth)
2. Profile setup
3. Takes cognitive tests
4. Backend processes and normalizes scores
5. Risk Dashboard shows:
   - Cognitive risk level
   - Domain-wise breakdown
   - Trend graph
6. User can:
   - View progress
   - Select doctor (1 doctor → max 10 patients)
   - Message doctor
   - Chat with NeuroBot

---

## 👩‍⚕️ Doctor Workflow

- Doctor registration
- Dashboard view of assigned patients
- Neural pattern anomaly visualization
- Patient-specific score history
- Messaging system

---

# ⚙️ Backend (FastAPI)

Located in:
```
backend/
```

---

## 🔹 Core Components

### 1️⃣ ML Engine (`core/ml_engine.py`)

Responsible for:
- Risk probability modeling
- Feature aggregation
- Weight assignment
- Score interpretation

Uses:
- Structured test features
- Weighted domain scores
- Risk categorization logic

---

### 2️⃣ Clinical Config (`core/clinical_config.py`)

Defines:
- Domain weightings
- Risk thresholds
- Safe interpretation ranges
- Clinical guard parameters

Ensures:
- Non-diagnostic positioning
- Safe output framing

---

### 3️⃣ Scoring & Normalization Logic

Each test score is:

```
Raw Score → Normalized Score → Domain Score → Weighted Aggregate Score
```

Normalization:
- Age-adjusted (if configured)
- Time-adjusted for reaction tasks
- Error-weighted for executive tasks

Final Output:
- Low Risk
- Moderate Risk
- Elevated Risk

---

### 4️⃣ Progress Tracker (`core/progress_tracker.py`)

Tracks:
- Historical test attempts
- Trend analysis
- Domain-wise progression
- Cognitive stability patterns

Enables:
- Longitudinal monitoring
- Doctor comparison dashboard
- Mini-chart visualizations

---

### 5️⃣ RAG Service (`rag_service.py`)

NeuroBot uses:
- Retrieval-Augmented Generation
- Knowledge base indexing
- Guardrail filtering

Workflow:
```
User Query
   ↓
Guardrail Filtering
   ↓
Knowledge Retrieval
   ↓
LLM Explanation
   ↓
Safe Response Formatting
```

NeuroBot:
- Explains difficult medical terms
- Clarifies score meanings
- Avoids diagnosis claims
- Redirects emergency cases safely

---

### 6️⃣ Guardrails (`knowledge_base/guardrails.py`)

Prevents:
- Diagnostic statements
- Medication recommendations
- Emergency mismanagement
- High-risk advice

Ensures:
- Medical safety compliance
- Ethical AI usage

---

# 🔐 Authentication

Handled via Firebase:

- Secure login
- Token-based session validation
- Role-based UI (Patient / Doctor)

---

# 📁 Project Structure

```
NeuroAid-Clean/
│
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── rag_service.py
│   ├── core/
│   │   ├── ml_engine.py
│   │   ├── clinical_config.py
│   │   └── progress_tracker.py
│   ├── routers/
│   │   ├── analyze.py
│   │   ├── auth.py
│   │   ├── chat.py
│   │   ├── content.py
│   │   └── messages.py
│   ├── models/
│   │   └── schemas.py
│   ├── knowledge_base/
│   ├── services/
│   └── data/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── utils/
│
└── README.md
```

---

# 🧠 Risk Dashboard Logic

The dashboard displays:

- Overall Cognitive Score
- Domain-wise breakdown
- Neural anomaly indicators
- Risk category badge
- Trend chart

Behind the scenes:

```
Domain Score_i × Clinical Weight_i
                ↓
        Aggregated Risk Index
                ↓
     Categorized Risk Output
```

---

# 💬 Messaging System

- Patient ↔ Doctor communication
- Secure routing via backend
- Role-based message access

---

# 📊 Example Risk Interpretation

| Risk Score | Category |
|------------|----------|
| 0–30 | Low Risk |
| 31–60 | Moderate Risk |
| 61–100 | Elevated Risk |

*(Thresholds configurable in clinical_config.py)*

---

# 🛠️ Installation Guide

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

### Backend `.env`

```
OPENAI_API_KEY=
DATABASE_URL=
FIREBASE_SECRET=
```

### Frontend `.env`

```
VITE_FIREBASE_API_KEY=
VITE_BACKEND_URL=
```

---

# 🛡️ Safety & Compliance

NeuroAid AI:

- Does NOT provide diagnosis
- Does NOT prescribe treatment
- Redirects emergency language
- Encourages professional consultation
- Uses guarded medical explanations

---

# 🧩 Hackathon-Winning Elements

- Real cognitive science integration
- Multi-test digital neuro-battery
- Risk normalization logic
- ML scoring engine
- Longitudinal tracking
- Doctor-patient workflow
- Guarded RAG chatbot
- Clean UI/UX with domain separation

---

# 📈 Future Improvements

- Real ML model training with dataset
- Speech-to-text cognitive biomarkers
- EEG integration simulation
- Time-series anomaly detection
- Graph-based patient risk clustering
- Federated learning integration
- Explainable AI (SHAP / LIME)
- Deployment on cloud with CI/CD

---

# 🎯 Vision

NeuroAid AI aims to become:

> A scalable, ethical, AI-assisted early cognitive screening system  
> bridging digital neuropsychology and modern machine intelligence.

---

# 👩‍💻 Author

Built as a full-stack AI + ML cognitive intelligence platform integrating:

- Core CS architecture
- Applied ML
- Clinical reasoning logic
- Ethical AI constraints
- Modern frontend engineering

---

# 📜 License

See `frontend/LICENSE`

---

# ⚠️ Disclaimer

NeuroAid AI is an **educational and assistive tool only**.  
It is not a medical device and does not provide medical diagnosis.

Users are strongly encouraged to consult licensed healthcare professionals for clinical decisions.

---

# 🌟 Final Thought

NeuroAid AI is not just a project.  
It is a demonstration of:

- Core CS engineering
- Applied ML reasoning
- Ethical AI design
- Healthcare-tech system architecture

A powerful portfolio piece at the intersection of AI, medicine, and scalable software systems.his tool requires real clinical validation before any medical use.**
