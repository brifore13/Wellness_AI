"""Configuration - loads environment variables"""

import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://127.0.0.1:8001")

if not SECRET_KEY:
    raise ValueError("SECRET_KEY not found in environment variables")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in environment variables")