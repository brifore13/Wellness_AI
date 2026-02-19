"""Wellness priorities model"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from datetime import datetime
from .database import Base


class WellnessPriority(Base):
    """User's ranked wellness goals"""
    __tablename__ = 'wellness_priorities'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    rank = Column(Integer, nullable=False)
    goal_id = Column(String(50), nullable=False)
    goal_name = Column(String(100), nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    __table_args__ = (
        UniqueConstraint('user_id', 'rank'),
        UniqueConstraint('user_id', 'goal_id'),
    )
