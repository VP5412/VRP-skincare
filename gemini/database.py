from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

# --- CHANGED: MySQL Connection String ---
# Format: mysql+pymysql://<username>:<password>@<host>:<port>/<database_name>
# Update "root" and "password" to match your local MySQL credentials!
# If your MySQL has no password, use: "mysql+pymysql://root@127.0.0.1:3306/skincare_db"


SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root@127.0.0.1:3306/skincare_db"

# We removed 'connect_args={"check_same_thread": False}' because MySQL doesn't need it.
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)  # Added length 255
    budget = Column(String(50)) # Added length 50

class ScanHistory(Base):
    __tablename__ = "scan_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    scan_date = Column(DateTime, default=datetime.utcnow)
    
    # We store the full JSON analysis here for the UI to use
    full_json_data = Column(Text) 
    
    # We store the AI's private note here, hidden from the user
    ai_private_note = Column(Text)

# Create tables in MySQL automatically
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()