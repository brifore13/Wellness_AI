"""Wellness priorities endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from models.database import get_db
from models.priorities import WellnessPriority
from utils.auth import decode_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/api/priorities", tags=["priorities"])
security = HTTPBearer()


class PriorityItem(BaseModel):
    rank: int
    goal_id: str
    goal_name: str


class SavePrioritiesRequest(BaseModel):
    priorities: List[PriorityItem]


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract user from JWT token"""
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        return int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )


@router.post("/save")
async def save_priorities(
    request: SavePrioritiesRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save or update user's wellness priorities"""
    if len(request.priorities) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot save more than 5 priorities"
        )

    # Delete existing priorities for this user and insert new ones
    db.query(WellnessPriority).filter(WellnessPriority.user_id == user_id).delete()

    for item in request.priorities:
        priority = WellnessPriority(
            user_id=user_id,
            rank=item.rank,
            goal_id=item.goal_id,
            goal_name=item.goal_name
        )
        db.add(priority)

    db.commit()

    return {"success": True, "message": f"{len(request.priorities)} priorities saved"}


@router.get("")
async def get_priorities(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's saved wellness priorities in ranked order"""
    priorities = (
        db.query(WellnessPriority)
        .filter(WellnessPriority.user_id == user_id)
        .order_by(WellnessPriority.rank)
        .all()
    )

    return {
        "priorities": [
            {
                "rank": p.rank,
                "goal_id": p.goal_id,
                "goal_name": p.goal_name
            }
            for p in priorities
        ]
    }
