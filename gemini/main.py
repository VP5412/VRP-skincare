from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from PIL import Image
import io
import json

from database import Base, engine, get_db, User, ScanHistory
from ai_service import first_time_scan, follow_up_scan

app = FastAPI(title="AI Skincare API")

# Allow your HTML file to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/users")
def create_user(username: str = Form(...), budget: str = Form(...), db: Session = Depends(get_db)):
    user = User(username=username, budget=budget)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"user_id": user.id, "message": "User created successfully!"}

@app.post("/api/scan")
async def analyze_face(
    user_id: int = Form(...),
    files: List[UploadFile] = File(...), # Receives Front, Left, Right images
    db: Session = Depends(get_db)
):
    # 1. Verify User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Process uploaded images into PIL format
    pil_images = []
    for file in files:
        image_data = await file.read()
        pil_images.append(Image.open(io.BytesIO(image_data)))

    # 3. Check if user has a past scan history
    last_scan = db.query(ScanHistory).filter(ScanHistory.user_id == user.id).order_by(ScanHistory.scan_date.desc()).first()

    if not last_scan:
        # --- FIRST TIME SCAN ---
        print("Executing First Time Scan...")
        result_json_str = first_time_scan(pil_images, user.budget)
    else:
        # --- FOLLOW UP SCAN ---
        print("Executing Follow Up Scan...")
        result_json_str = follow_up_scan(pil_images, last_scan.full_json_data, last_scan.ai_private_note, user.budget)

    # 4. Parse the JSON so we can extract the private note
    result_data = json.loads(result_json_str)
    private_note = result_data.get("future_note_for_ai", "No notes recorded.")

    # 5. Save this scan to the database
    new_scan = ScanHistory(
        user_id=user.id,
        full_json_data=result_json_str,
        ai_private_note=private_note
    )
    db.add(new_scan)
    db.commit()

    # 6. Return the JSON to the frontend (The frontend will hide the private note)
    return result_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)