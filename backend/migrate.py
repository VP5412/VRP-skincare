import os
import sys
from sqlalchemy import text
from dotenv import load_dotenv

# Add current directory appropriately so we can import 'database'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import engine
except Exception as err:
    print(f"Failed to pull engine: {err}")
    sys.exit(1)

def run_migration():
    print("-- Starting raw SQL Migration --")
    
    with engine.begin() as con:
        # Users Table Appends
        try:
            con.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0;"))
            print("Attached is_admin to users")
        except Exception as e:
            print("Skipped (probably exists) - is_admin")

        try:
            con.execute(text("ALTER TABLE users ADD COLUMN streak_count INTEGER DEFAULT 0;"))
            print("Attached streak_count to users")
        except Exception as e:
            print("Skipped (probably exists) - streak_count")

        try:
            con.execute(text("ALTER TABLE users ADD COLUMN last_routine_date DATETIME;"))
            print("Attached last_routine_date to users")
        except Exception as e:
            print("Skipped (probably exists) - last_routine_date")

        # ScanHistory Appends
        try:
            con.execute(text("ALTER TABLE scan_history ADD COLUMN front_image_url VARCHAR(255);"))
            print("Attached front_image_url to scan_history")
        except Exception as e:
            print("Skipped (probably exists) - front_image_url")

        try:
            con.execute(text("ALTER TABLE scan_history ADD COLUMN left_image_url VARCHAR(255);"))
            print("Attached left_image_url to scan_history")
        except Exception as e:
            print("Skipped (probably exists) - left_image_url")

        try:
            con.execute(text("ALTER TABLE scan_history ADD COLUMN right_image_url VARCHAR(255);"))
            print("Attached right_image_url to scan_history")
        except Exception as e:
            print("Skipped (probably exists) - right_image_url")

    print("-- SQL Migration Completed Successfully! --")

if __name__ == "__main__":
    run_migration()
