import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import engine
from sqlalchemy import text

def add_column():
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN daily_routine_json TEXT NULL;"))
            print("Successfully injected `daily_routine_json` into `users` table.")
    except Exception as e:
        print(f"Migration Skipped/Failed: {e}")

if __name__ == "__main__":
    add_column()
