"""Chat endpoints - interact with Benny AI"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import httpx
import os

from utils.auth import decode_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/api/chat", tags=["chat"])
security = HTTPBearer()

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://127.0.0.1:8001")

# Request/Response Models
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    success: bool
    response: str
    error: Optional[str] = None

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract user from JWT token"""
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        user_id = int(payload.get("sub"))
        return user_id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    user_id: int = Depends(get_current_user)
):
    """Send message to Benny AI"""
    
    try:
        async with httpx.AsyncClient() as client:
            ai_response = await client.post(
                f"{AI_SERVICE_URL}/chat",
                json={"message": request.message, "user_id": user_id},
                timeout=30.0
            )
            
            if ai_response.status_code == 200:
                data = ai_response.json()
                return {
                    "success": data.get("success", False),
                    "response": data.get("response", ""),
                    "error": data.get("error")
                }
            else:
                return {
                    "success": False,
                    "response": "Benny is taking a break. Try again later.",
                    "error": "AI service unavailable"
                }
    
    except Exception as e:
        print(f"Chat error: {e}")
        return {
            "success": False,
            "response": "Sorry, I'm having trouble connecting. Try again later.",
            "error": str(e)
        }