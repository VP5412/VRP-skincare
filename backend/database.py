import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import ForeignKey
from datetime import datetime

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root@127.0.0.1:3306/skincare_db")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String(191), unique=True, index=True, nullable=False)
    email = Column(String(191), nullable=True)
    username = Column(String(100), nullable=True)
    budget = Column(String(50), default="1000")
    is_admin = Column(Boolean, default=False)
    streak_count = Column(Integer, default=0)
    last_routine_date = Column(DateTime, nullable=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    daily_routine_json = Column(Text, nullable=True)


class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scan_date = Column(DateTime, default=datetime.utcnow)
    front_image_url = Column(String(255), nullable=True)
    left_image_url = Column(String(255), nullable=True)
    right_image_url = Column(String(255), nullable=True)
    full_json_data = Column(Text)
    ai_private_note = Column(Text)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    type = Column(String(50), default="system")
    created_at = Column(DateTime, default=datetime.utcnow)

class IngredientScan(Base):
    __tablename__ = "ingredient_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_url = Column(String(255), nullable=True)
    status = Column(String(50))
    explanation = Column(Text)
    flagged_ingredients_json = Column(Text)
    scan_date = Column(DateTime, default=datetime.utcnow)

# Create tables if they do not exist (Safe for production)
Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
