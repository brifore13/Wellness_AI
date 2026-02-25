"""User model"""

from sqlalchemy import Column, Integer, String, DateTime, Date
from datetime import datetime
from .database import Base

class User(Base):
    """User account"""
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    dob = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.now)