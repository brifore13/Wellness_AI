"""Wellness AI Backend - Main FastAPI Application"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from models.database import engine, Base
from routers import auth, checkin, chat, priorities

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Wellness AI Backend",
    description="Backend API for Benny Wellness AI",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(checkin.router)
app.include_router(chat.router)
app.include_router(priorities.router)

@app.get("/")
async def root():
    """API info"""
    return {
        "service": "Wellness AI Backend",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "checkin": "/api/checkin",
            "chat": "/api/chat",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)