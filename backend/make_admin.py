import sys
import os

# Ensure we can import from backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, User

def make_all_admins():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            user.is_admin = True
        db.commit()
        print(f"Successfully elevated {len(users)} users to Admin status!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    make_all_admins()
