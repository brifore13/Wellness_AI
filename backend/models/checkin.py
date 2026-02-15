"""Daily check-in model"""

from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from datetime import datetime
from .database import Base

class DailyCheckIn(Base):
    """Daily wellness check-in"""
    __tablename__ = 'daily_checkins'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    date = Column(Date, nullable=False, index=True)

    # Check-in reponses
    nutrition = Column(String, nullable=True)
    sleep = Column(String, nullable=True)
    fitness = Column(String, nullable=True)
    stress = Column(String, nullable=True)

    # AI recommendation
    recommendation = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.now)

    __table_args__ = (
        # one check-in per user per day
        {'sqlite_autoincrement': True},
    )