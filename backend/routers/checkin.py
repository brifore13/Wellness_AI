"""Daily check-in endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import httpx
import os

from models.database import get_db
from models.checkin import DailyCheckIn
from utils.auth import decode_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/api/checkin", tags=["checkin"])
security = HTTPBearer()

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://127.0.0.1:8001")

# Request/Response Models
class CheckInRequest(BaseModel):
    nutrition: Optional[str] = None
    sleep: Optional[str] = None
    fitness: Optional[str] = None
    stress: Optional[str] = None

class CheckInResponse(BaseModel):
    success: bool
    message: str
    recommendation: Optional[str] = None

# Dependency to get current user from JWT
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

@router.post("/submit", response_model=CheckInResponse)
async def submit_checkin(
    request: CheckInRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit daily check-in and get AI recommendation"""
    
    today = datetime.now().date()
    
    # Check if check-in already exists today
    existing = db.query(DailyCheckIn).filter(
        DailyCheckIn.user_id == user_id,
        DailyCheckIn.date == today
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in already submitted today"
        )
    
    # Get AI recommendation
    recommendation = None
    try:
        async with httpx.AsyncClient() as client:
            ai_response = await client.post(
                f"{AI_SERVICE_URL}/recommend",
                json={
                    "daily_checkin": {
                        "nutrition": request.nutrition or "not specified",
                        "sleep": request.sleep or "not specified",
                        "fitness": request.fitness or "not specified",
                        "stress": request.stress or "not specified"
                    }
                },
                timeout=30.0
            )
            
            if ai_response.status_code == 200:
                ai_data = ai_response.json()
                if ai_data.get("success"):
                    recommendation = ai_data.get("response")
    except Exception as e:
        print(f"AI service error: {e}")
        # Continue without recommendation
    
    # Save check-in to database
    checkin = DailyCheckIn(
        user_id=user_id,
        date=today,
        nutrition=request.nutrition,
        sleep=request.sleep,
        fitness=request.fitness,
        stress=request.stress,
        recommendation=recommendation
    )
    
    db.add(checkin)
    db.commit()
    
    return {
        "success": True,
        "message": "Check-in saved successfully!",
        "recommendation": recommendation
    }

@router.get("/today")
async def get_today_checkin(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get today's check-in if it exists"""
    
    today = datetime.now().date()
    
    checkin = db.query(DailyCheckIn).filter(
        DailyCheckIn.user_id == user_id,
        DailyCheckIn.date == today
    ).first()
    
    if not checkin:
        return {"exists": False}
    
    return {
        "exists": True,
        "checkin": {
            "date": checkin.date.isoformat(),
            "nutrition": checkin.nutrition,
            "sleep": checkin.sleep,
            "fitness": checkin.fitness,
            "stress": checkin.stress,
            "recommendation": checkin.recommendation
        }
    }