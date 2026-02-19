"""Database handler for Benny chat storage"""

import os
from datetime import datetime
from typing import Optional, List, Dict
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Date, DateTime, Index, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

load_dotenv()

Base = declarative_base()

class ChatHistoryMain(Base):
    """Main chat history table - one entry per user per day"""
    __tablename__ = 'chat_history_main'

    user_id = Column(Integer, primary_key=True)
    date = Column(Date, primary_key=True)
    created_at = Column(DateTime, default=datetime.now)


class ChatLog(Base):
    """Individual chat messages"""
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
    sequence_number = Column(Integer, nullable=False)
    is_ai = Column(Boolean, nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    __table_args__ = (
        UniqueConstraint('user_id', 'date', 'sequence_number'),
        Index('idx_chat_logs_user_date', 'user_id', 'date'),
        Index('idx_chat_logs_sequence', 'user_id', 'date', 'sequence_number'),
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

    async def save_chat(self, user_id: int, user_message: str, benny_response: str):
        """Save user and Benny messages to database"""
        session = self.Session()

        try:
            today = datetime.now().date()

            # Check chat history exists for this user and today
            history = session.query(ChatHistoryMain).filter_by(user_id=user_id, date=today).first()
            if not history:
                history = ChatHistoryMain(user_id=user_id, date=today)
                session.add(history)
                session.commit()

            # Get next sequence number for this user today
            existing_logs = session.query(ChatLog).filter_by(user_id=user_id, date=today).all()
            next_seq = len(existing_logs) + 1

            # Add user message
            user_log = ChatLog(
                user_id=user_id,
                date=today,
                sequence_number=next_seq,
                is_ai=False,
                message=user_message
            )
            session.add(user_log)

            # Add benny response
            benny_log = ChatLog(
                user_id=user_id,
                date=today,
                sequence_number=next_seq + 1,
                is_ai=True,
                message=benny_response
            )
            session.add(benny_log)

            session.commit()
            print(f"Chat saved for user {user_id} (seq: {next_seq}, {next_seq + 1})")

        except SQLAlchemyError as e:
            session.rollback()
            print(f"Error saving chat to database: {e}")
            raise
        finally:
            session.close()

    def get_chat_history(self, user_id: int, date: Optional[datetime] = None) -> List[Dict]:
        """Retrieve chat history for a specific user and date"""
        session = self.Session()

        try:
            if date is None:
                date = datetime.now().date()

            logs = (
                session.query(ChatLog)
                .filter_by(user_id=user_id, date=date)
                .order_by(ChatLog.sequence_number)
                .all()
            )

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
