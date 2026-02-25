# Benny Wellness AI

A full-stack AI-powered wellness coaching application. Users chat with Benny, an AI coach specializing in nutrition, fitness, and stress management, and submit daily check-ins to receive personalized recommendations.

**Live demo:** https://wellness-ai-alpha.vercel.app

## Features

- AI chat with Benny powered by Azure OpenAI (GPT-3.5)
- Guest mode with 10 free messages before sign-up prompt
- Daily check-in flow with personalized AI recommendations
- JWT authentication with protected routes
- Persistent chat history stored in PostgreSQL

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios |
| Backend | FastAPI, SQLAlchemy, PyJWT, bcrypt |
| AI Service | FastAPI, Azure OpenAI (GPT-3.5-Turbo) |
| Database | PostgreSQL (Neon) |
| Deployment | Vercel (frontend), Render (backend + AI service) |

## Architecture

Three separate services communicate over HTTP:

```
Vercel (React)
    ├── /api/chat/message  →  Render Backend (FastAPI)  →  Render AI Service (FastAPI + Azure OpenAI)
    └── /chat (guest mode) →  Render AI Service (FastAPI + Azure OpenAI)
```

## Local Development

```bash
# Start PostgreSQL
docker-compose up -d

# Backend (port 8000)
cd backend && source venv/bin/activate && uvicorn main:app --reload

# AI Service (port 8001)
cd ai-service && source benny-env/bin/activate && cd src/api && python main.py

# Frontend (port 5173)
cd frontend && npm run dev
```
