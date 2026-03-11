"""API Server for Benny Wellness AI Endpoints"""

import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Dict, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import asyncio

sys.path.append(str(Path(__file__).parent.parent))
from core.benny import BennyWellnessAI

# initialize benny
benny = None

# Start Benny
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize when API starts"""
    global benny
    benny = BennyWellnessAI()
    print("Benny API ready!")
    yield

app = FastAPI(title="Wellness AI", lifespan=lifespan)

# Add CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"]
)

# REQUEST / RESPONSE MODELS
class ChatRequest(BaseModel):
    message: str
    user_id: int

class ChatResponse(BaseModel):
    success: bool
    response: str
    tokens_used: int
    error: Optional[str] = None

class DailyCheckInData(BaseModel):
    nutrition: str
    sleep: str
    fitness: str
    stress: str

class RecommendationRequest(BaseModel):
    daily_checkin: DailyCheckInData

# API ENDPOINTS
@app.get("/")
async def root():
    """Basic info endpoint"""
    return {
        "service": "Benny Wellness AI",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/chat",
            "recommend": "/recommend",
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health():
    """health check"""
    return {"status": "healthy", "benny_ready": benny is not None}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with Benny"""
    if not benny:
        return ChatResponse(
            success=False,
            response="Benny is taking a break. Try again in a moment.",
            tokens_used=0
        )

    try:
        result = await asyncio.wait_for(
            benny.chat(request.message, request.user_id), timeout=30.0)

        return ChatResponse(
            success=result["success"],
            response=result.get("response", ""),
            tokens_used=result.get("tokens_used", 0),
            error=result.get("error")
        )
    except asyncio.TimeoutError:
        return ChatResponse(
            success=False,
            response="Benny: I'm thinking extra hard, could you ask me again?",
            tokens_used=0,
            error="timeout"
        )
    except Exception as e:
        print(f"Chat error: {e}")
        return ChatResponse(
            success=False,
            response="Benny: Having technical difficulties. Let's try again.",
            tokens_used=0,
            error=str(e)
        )
    
@app.post("/recommend", response_model=ChatResponse)
async def recommend(request: RecommendationRequest):
    """Get wellness rec based on daily check-in"""
    if not benny:
        return ChatResponse(
            success=False,
            response="Benny is taking a break. Try again later",
            tokens_used=0
        )
    try:
        result = await asyncio.wait_for(
            benny.recommend(request.daily_checkin.model_dump(exclude_unset=True)), timeout=30.0)
        
        return ChatResponse(
            success=result["success"],
            response=result.get("response", ""),
            tokens_used=result.get("tokens_used", 0),
            error=result.get("error")
        )
    except asyncio.TimeoutError:
        return ChatResponse(
            success=False,
            response="Benny is thinking extra hard. Try again later",
            tokens_used=0,
            error="timeout"
        )
    except Exception as e:
        print(f"Recommendation error: {e}")
        return ChatResponse(
            success=False,
            response="Benny is having technical difficulties. Try again later",
            tokens_used=0,
            error=str(e)
        )

@app.get("/history")
async def get_history(user_id: int):
    """Get today's chat history"""
    if not benny:
        return {"success": False, "messages": []}
    try:
        messages = benny.db_handler.get_chat_history(user_id)
        return {"success": True, "messages": messages}
    except Exception as e:
        print(f"History error: {e}")
        return {"success": False, "messages": []}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)