# Wellness AI

A full-stack AI performance coaching application. Users chat with Benny — an AI coach built for optimizers — submit daily check-ins, and receive personalized training and recovery protocols.

**Live demo:** https://wellness-ai-alpha.vercel.app

---

## What it does

- **AI chat** — protocol-level answers on training, nutrition, recovery, and sleep via OpenAI GPT-4o-mini
- **Daily check-in** — structured flow tracking nutrition, fitness, sleep, and stress; generates a personalized daily recommendation
- **Training plan generation** — week-by-week training protocols based on user goals, fitness level, and availability *(in development)*
- **Guest mode** — 10 free messages before sign-up prompt; guest traffic isolated from authenticated DB writes
- **Persistent chat history** — sequence-ordered message logs stored per user per day in PostgreSQL
- **JWT authentication** — protected routes with 24-hour token expiry and inline profile editing

---

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios |
| Backend | FastAPI, SQLAlchemy, PyJWT, bcrypt, Neon PostgreSQL |
| AI Service | FastAPI, OpenAI GPT-4o-mini |
| Database | PostgreSQL (Neon) |
| Deployment | Vercel (frontend), Render (backend + AI service) |

---

## Architecture

Three independent services communicating over HTTP:

```
Vercel (React)
    ├── Authenticated requests → Render Backend (FastAPI) → Render AI Service (FastAPI + OpenAI)
    └── Guest requests         →                            Render AI Service (FastAPI + OpenAI)

Render Backend (FastAPI, port 8000)
    ├── /api/auth      — signup, login, profile update
    ├── /api/chat      — message routing, chat history
    ├── /api/checkin   — daily check-in submit and retrieval
    └── /api/priorities — wellness goal ranking

Render AI Service (FastAPI, port 8001)
    ├── /chat      — OpenAI chat with conversation history
    ├── /recommend — check-in based recommendation generation
    └── /history   — per-user chat log retrieval
```

---

## Local development

```bash
# Backend (port 8000)
cd backend
source venv/bin/activate
uvicorn main:app --reload

# AI Service (port 8001)
cd ai-service
source benny-env/bin/activate
cd src/api && python main.py

# Frontend (port 5173)
cd frontend
npm run dev
```

**Environment variables required:**

`backend/.env`
```
DATABASE_URL=your_neon_postgres_url
SECRET_KEY=your_jwt_secret
FRONTEND_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8001
```

`ai-service/.env`
```
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
DATABASE_URL=your_neon_postgres_url
```

`frontend/.env`
```
VITE_BACKEND_URL=http://localhost:8000
VITE_AI_SERVICE_URL=http://localhost:8001
```

---

## Project structure

```
Wellness_AI/
├── frontend/          # React 18 + Vite + Tailwind
│   └── src/
│       ├── pages/     # Home, Chat, DailyCheckin, ChatHistory, WellnessPriorities, Settings
│       └── components/# Sidebar, ChatBubble, ChatInput, Auth
├── backend/           # FastAPI — auth, chat routing, check-ins, priorities
│   ├── routers/
│   ├── models/
│   └── utils/
└── ai-service/        # FastAPI — OpenAI integration, chat persistence
    └── src/
        ├── api/       # FastAPI endpoints
        └── core/      # Benny class, prompts, DB handler
```
