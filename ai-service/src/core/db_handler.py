"""Database handler for Benny chat storage"""

import os
from datetime import datetime
from typing import Optional, List, Dict
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Date, DateTime, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

load_dotenv()

Base = declarative_base()

class ChatHistoryMain(Base):
    """Main chat history table - one entry per day"""
    __tablename__ = 'chat_history_main'

    date = Column(Date, primary_key=True)
    created_at = Column(DateTime, default=datetime.now)

    chat_logs = relationship("ChatLog", back_populates="history", cascade="all, delete-orphan")


class ChatLog(Base):
    """Individual chat messages"""
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, autoincremenet=True)
    date = Column(Date, ForeignKey('chat_history_main.date', ondelete='CASCADE'), nullable=False)
    sequence_number = Column(Integer, nullable=False)
    is_ai = Column(Boolean, nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    history = relationship("ChatHistoryMain", back_populates="chat_logs")

    __table_args__ = (
        Index('idx_chat_logs_date', 'date'),
        Index('idx_chat_logs_sequence', 'date', 'sequence_number')
    )


class ChatDBHandler:
    """Handles all database operations for Benny chat"""

    def __init__(self):
        """Initialize database connection"""
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise ValueError("DATABASE_URL not found in environment variables")
        
        self.engine = create_engine(database_url, echo=False)
        self.Session = sessionmaker(bind=self.engine)

        print("Database connection established")

    async def save_chat(self, user_message: str, benny_response: str):
        """Save user and Benny messages to database"""
        session = self.Session()

        try:
            today = datetime.now().date()

            # check chat history exists for today
            history = session.query(ChatHistoryMain).filter_by(date=today).first()
            if not history:
                history = ChatHistoryMain(date=today)
                session.add(history)
                session.commit()

            # get next sequence number
            existing_logs = session.query(ChatLog).filter_by(date=today).all()
            next_seq = len(existing_logs) + 1

            # Add user message
            user_log = ChatLog(
                date=today,
                sequence_number=next_seq,
                is_ai=False,
                message=user_message
            )
            session.add(user_log)

            # Add benny response
            benny_log = ChatLog(
                date=today,
                sequence_number=next_seq + 1,
                is_ai=True,
                message=benny_response
            )
            session.add(benny_log)

            session.commit()
            print(f"Chat saved to database (seq: {next_seq}, {next_seq + 1})")

        except SQLAlchemyError as e:
            session.rollback()
            print(f"Error saving chat to database: {e}")
            raise
        finally:
            session.close()

    def get_chat_history(self, date: Optional[datetime] = None) -> List[Dict]:
        """Retrieve chat history for a specific date"""
        session = self.Session()

        try:
            if date is None:
                date = datetime.now().date()

            logs = session.query(ChatLog).filter_by(date=date).order_by(ChatLog.sequence_number).all()

            return [
                {
                    "sequence": log.sequence_number,
                    "is_ai": log.is_ai,
                    "message": log.message,
                    "timestamp": log.created_at.isoformat()
                }
                for log in logs
            ]
        
        except SQLAlchemyError as e:
            print(f"Error retrieving chat history: {e}")
            return []
        finally:
            session.close()