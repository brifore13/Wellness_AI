# Benny Wellness AI - Project Context

## Project Overview
Benny Wellness AI is a full-stack wellness application that uses AI (Azure OpenAI) to provide personalized wellness coaching for nutrition, fitness, and stress management. The project consists of three main services: a React frontend, a FastAPI backend, and an AI service.

## Project Structure
```
Wellness_AI/
├── frontend/              # React + Vite + Tailwind CSS (Port 5173)
│   ├── src/
│   │   ├── assets/       # Images (benny_icon.png, site_icon.png)
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts (SessionContext)
│   │   ├── hooks/        # Custom hooks (useTypingEffect)
│   │   ├── pages/        # Page components (Home, Chat, etc.)
│   │   ├── App.jsx       # Main routing
│   │   ├── main.jsx      # Entry point
│   │   └── index.css     # Global styles with Tailwind
│   ├── .env              # Environment variables
│   └── package.json
│
├── backend/              # FastAPI + PostgreSQL (Port 8000)
│   ├── models/          # SQLAlchemy models
│   │   ├── database.py  # DB connection setup
│   │   ├── user.py      # User model
│   │   └── checkin.py   # DailyCheckIn model
│   ├── routers/         # API route handlers
│   │   ├── auth.py      # JWT authentication (signup/login)
│   │   ├── checkin.py   # Daily check-in endpoints
│   │   └── chat.py      # Chat proxy to AI service
│   ├── utils/
│   │   └── auth.py      # JWT & bcrypt utilities
│   ├── database/
│   │   └── init_tables.sql  # SQL schema
│   ├── main.py          # FastAPI app entry point
│   ├── config.py        # Environment config
│   ├── .env             # Environment variables
│   └── requirements.txt
│
├── ai-service/          # AI Service (Port 8001)
│   ├── src/
│   │   ├── core/
│   │   │   ├── benny.py        # Main AI logic
│   │   │   ├── config.py       # Mode configurations
│   │   │   ├── prompts.py      # All AI prompts
│   │   │   └── db_handler.py   # PostgreSQL chat storage
│   │   └── api/
│   │       └── main.py         # FastAPI endpoints (/chat, /recommend)
│   ├── database/
│   │   └── init.sql            # Chat tables schema
│   ├── .env                    # Azure OpenAI credentials
│   └── requirements.txt
│
├── docker-compose.yml   # PostgreSQL container
└── Claude.md           # This file
```

## Technology Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios
- **Icons:** React Icons
- **State Management:** React Context API (SessionContext)

### Backend
- **Framework:** FastAPI
- **Database:** PostgreSQL 16 (Docker)
- **ORM:** SQLAlchemy 2.0
- **Authentication:** JWT (PyJWT) + bcrypt
- **Password Hashing:** bcrypt (direct, no passlib)

### AI Service
- **AI Provider:** Azure OpenAI (GPT-3.5-Turbo)
- **Framework:** FastAPI
- **Database:** PostgreSQL (shared with backend)

### Infrastructure
- **Database:** PostgreSQL 16 in Docker
- **Dev Ports:** Frontend (5173), Backend (8000), AI Service (8001), PostgreSQL (5432)

## Current State

## Current State

### ✅ Completed
- **Backend:** Fully functional JWT auth, check-in endpoints, chat proxy
- **AI Service:** Clean refactored code with modular prompts, PostgreSQL integration
- **Database:** PostgreSQL running in Docker with all tables created
- **Frontend:** Fresh Vite project with all custom components migrated
  - ✅ All components migrated: Auth, Header, Sidebar, ChatBubble, ChatInput
  - ✅ SessionContext migrated with JWT management
  - ✅ All pages migrated: Home, Chat, DailyCheckin, Dashboard
  - ✅ Custom hooks migrated: useTypingEffect
  - ✅ App.jsx updated with proper routing
  - ✅ Assets copied (benny_icon.png, site_icon.png)
  - ✅ Tailwind configured
  - ✅ Environment variables configured

### 🚧 In Progress
- **Testing & Integration:** Need to test full user flow end-to-end
  - Test signup/login flow
  - Test chat functionality (requires Azure OpenAI)
  - Test daily check-in flow
  - Test dashboard and logout

### ❌ Not Started
- **Azure OpenAI Integration:** Need to add Azure credentials to `ai-service/.env`
- **Production Deployment:** Deploy to Vercel (frontend) + Railway/Render (backend/AI)
- **Additional Features:** Goal tracking, progress visualization, chat history viewing

## Key Files & Their Purpose

### Backend (`backend/`)
- `main.py` - FastAPI app, CORS, route registration
- `models/database.py` - SQLAlchemy engine, Base, session management
- `models/user.py` - User model (id, email, hashed_password, name)
- `models/checkin.py` - DailyCheckIn model (nutrition, sleep, fitness, stress)
- `routers/auth.py` - POST /api/auth/signup, POST /api/auth/login
- `routers/checkin.py` - POST /api/checkin/submit, GET /api/checkin/today
- `routers/chat.py` - POST /api/chat/message (proxies to AI service)
- `utils/auth.py` - hash_password(), verify_password(), create/decode JWT

### AI Service (`ai-service/`)
- `src/core/benny.py` - BennyWellnessAI class (chat, recommend methods)
- `src/core/config.py` - BennyMode enum, MODE_CONFIG
- `src/core/prompts.py` - All personality and mode prompts
- `src/core/db_handler.py` - ChatDBHandler for PostgreSQL storage
- `src/api/main.py` - POST /chat, POST /recommend endpoints

### Frontend (`frontend/`)
- `src/main.jsx` - App entry point, wraps with SessionProvider + BrowserRouter
- `src/App.jsx` - Route definitions with ProtectedRoute wrapper
- `src/contexts/SessionContext.jsx` - JWT management, login/logout, token storage
- `src/components/Auth.jsx` - Login/signup modal with JWT
- `src/components/Header.jsx` - Navigation header with auth status
- `src/components/Sidebar.jsx` - Navigation sidebar (collapsible)
- `src/components/ChatBubble.jsx` - AI message display with typing effect
- `src/components/ChatInput.jsx` - User input textarea
- `src/hooks/useTypingEffect.js` - Character-by-character typing animation
- `src/pages/Home.jsx` - Landing page for non-authenticated users
- `src/pages/Chat.jsx` - Main chat interface with Benny
- `src/pages/DailyCheckin.jsx` - Guided check-in flow with 4 questions
- `src/pages/Dashboard.jsx` - User profile and settings

## Environment Variables

### Backend (`.env`)
```bash
SECRET_KEY=your-jwt-secret-key
DATABASE_URL=postgresql://benny:benny_dev_pass@127.0.0.1:5432/wellness_ai
AI_SERVICE_URL=http://127.0.0.1:8001
```

### AI Service (`.env`)
```bash
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo
DATABASE_URL=postgresql://benny:benny_dev_pass@127.0.0.1:5432/wellness_ai
```

### Frontend (`.env`)
```bash
VITE_BACKEND_URL=http://127.0.0.1:8000
VITE_AI_SERVICE_URL=http://127.0.0.1:8001
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Daily Check-ins Table
```sql
CREATE TABLE daily_checkins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    nutrition VARCHAR(255),
    sleep VARCHAR(255),
    fitness VARCHAR(255),
    stress VARCHAR(255),
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);
```

### Chat History Tables
```sql
CREATE TABLE chat_history_main (
    date DATE PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_logs (
    id SERIAL PRIMARY KEY,
    date DATE REFERENCES chat_history_main(date) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    is_ai BOOLEAN NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, sequence_number)
);
```

## Code Conventions

### General
- **Clean, DRY, maintainable code** - avoid duplication
- **Descriptive variable names** - no abbreviations unless obvious
- **Comments only when necessary** - code should be self-documenting
- **Error handling** - always use try/catch with meaningful messages

### Python (Backend/AI Service)
- **Style:** PEP 8
- **Imports:** Group stdlib, third-party, local (separated by blank lines)
- **Type hints:** Use when it improves clarity
- **Docstrings:** For public functions/classes
- **Async/await:** Use for I/O operations

### JavaScript/React (Frontend)
- **Style:** Modern ES6+ syntax
- **Components:** Functional components with hooks
- **File naming:** PascalCase for components (Auth.jsx), camelCase for utilities
- **Props:** Destructure in function parameters
- **State:** Use useState, useContext, custom hooks
- **Styling:** Tailwind utility classes (avoid custom CSS unless necessary)

### Database
- **Naming:** snake_case for tables/columns
- **Keys:** Always use primary keys and foreign keys with ON DELETE CASCADE
- **Indexes:** Add indexes for frequently queried columns

## API Endpoints

### Backend (Port 8000)
```
POST   /api/auth/signup          - Create account (email, password, name)
POST   /api/auth/login           - Login (email, password) → returns JWT
POST   /api/checkin/submit       - Submit daily check-in (requires JWT)
GET    /api/checkin/today        - Get today's check-in (requires JWT)
POST   /api/chat/message         - Send message to Benny (requires JWT)
GET    /health                   - Health check
```

### AI Service (Port 8001)
```
POST   /chat                     - Chat with Benny (message: str)
POST   /recommend                - Get recommendation (daily_checkin: object)
GET    /health                   - Health check
```

## Common Tasks

### Start Development Environment
```bash
# Terminal 1: PostgreSQL (if not running)
cd ai-service
docker-compose up -d

# Terminal 2: Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 3: AI Service (when Azure configured)
cd ai-service
source benny-env/bin/activate
cd src/api
python main.py

# Terminal 4: Frontend
cd frontend
npm run dev
```

### Database Operations
```bash
# Connect to PostgreSQL
docker exec -it benny-postgres psql -U benny -d wellness_ai

# View tables
\dt

# View table structure
\d users
\d daily_checkins
\d chat_logs

# Run SQL file
docker exec -i benny-postgres psql -U benny -d wellness_ai < database/init_tables.sql
```

### Testing Auth Flow
```bash
# Signup
curl -X POST http://127.0.0.1:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Next Steps

### Immediate Tasks (Testing & Azure Setup)
1. **Test Frontend Without AI Service:**
   - Start backend: `cd backend && source venv/bin/activate && uvicorn main:app --reload`
   - Start frontend: `cd frontend && npm run dev`
   - Test signup/login flow at http://localhost:5173
   - Verify JWT authentication works
   - Test protected routes (should redirect if not logged in)

2. **Add Azure OpenAI Credentials:**
   - Get credentials from Azure Portal
   - Add to `ai-service/.env`:
```
     AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
     AZURE_OPENAI_API_KEY=your-api-key
     AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo
```
   - Start AI service: `cd ai-service && source benny-env/bin/activate && cd src/api && python main.py`
   - Test chat functionality

3. **End-to-End Testing:**
   - Test complete user journey:
     - Signup → Login → Chat → Daily Check-in → Dashboard → Logout
   - Verify AI responses work
   - Verify check-in recommendations appear
   - Check database entries (users, daily_checkins, chat_logs)

### Future Enhancements
- Add user profile editing capability
- Add chat history viewing page
- Add goal progress tracking dashboard
- Add data visualization for check-in trends
- Implement password reset functionality
- Add profile picture upload
- Deploy to production (Vercel + Railway/Render)

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:8001 | xargs kill -9  # AI Service
lsof -ti:5432 | xargs kill -9  # PostgreSQL
```

### Database Connection Issues
- Ensure Docker is running: `docker ps`
- Check PostgreSQL container: `docker-compose logs postgres`
- Verify connection string in `.env` files

### Frontend Build Issues
- Clear cache: `rm -rf node_modules/.vite`
- Reinstall: `rm -rf node_modules package-lock.json && npm install`

## Important Notes

- **DO NOT commit `.env` files** - they contain secrets
- **DO NOT commit `node_modules/`** - use .gitignore
- **Backend and AI service share the same PostgreSQL database**
- **JWT tokens expire after 24 hours**
- **Local PostgreSQL (via Homebrew) was stopped to avoid port conflicts with Docker**
- **The old `frontend-files/` folder contains all completed component code ready to migrate**

## Team Context
- Solo developer: BriAnna Foreman
- Background: Doctor of Physical Therapy transitioning to software engineering
- Recent BS in Computer Science from Oregon State University
- Project purpose: Portfolio piece for job applications, particularly healthcare tech companies
- Focus: Clean, professional, deployable code that showcases full-stack + AI/ML skills