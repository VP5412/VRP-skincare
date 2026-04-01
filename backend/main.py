from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
from PIL import Image
import io
import json
import os
import uuid
from datetime import datetime, timedelta

from database import Base, engine, get_db, User, ScanHistory
from schemas import (
    UserResponse, TokenResponse,
    ScanHistoryItem, SkinMetrics, ScanDetailResponse
)
from auth import get_current_user
from ai_service import first_time_scan, follow_up_scan

app = FastAPI(title="VRP Skincare API", version="1.0.0")

# Setup persistent image storage
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


from pydantic import BaseModel

class BudgetUpdate(BaseModel):
    budget: str

@app.put("/api/user/budget")
def update_budget(budget_data: BudgetUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.budget = budget_data.budget
    db.commit()
    return {"message": "Budget updated successfully", "budget": current_user.budget}

@app.put("/api/user/routine")
def check_routine(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from database import Notification
    today = datetime.utcnow().date()
    last_routine = current_user.last_routine_date.date() if current_user.last_routine_date else None
    
    if last_routine == today:
        return {"message": "Routine already logged today!", "streak": current_user.streak_count}
    
    if last_routine == today - timedelta(days=1):
        current_user.streak_count += 1
    else:
        current_user.streak_count = 1
        
    current_user.last_routine_date = datetime.utcnow()
    
    if current_user.streak_count == 7:
        badge = Notification(user_id=current_user.id, message="🔥 7-Day Flame Streak unlocked! You're glowing!", type="badge")
        db.add(badge)
        
    db.commit()
    return {"message": "Routine tracked!", "streak": current_user.streak_count}

# ══════════════════════════════════════════════════════
#  DASHBOARD ENDPOINTS
# ══════════════════════════════════════════════════════

@app.get("/api/dashboard")
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scans = (
        db.query(ScanHistory)
        .filter(ScanHistory.user_id == current_user.id)
        .order_by(ScanHistory.scan_date.desc())
        .all()
    )

    history = []
    for scan in scans:
        item = {
            "id": scan.id,
            "scan_date": scan.scan_date.isoformat() if scan.scan_date else None,
            "description": None,
            "skin_metrics": None,
            "front_image_url": scan.front_image_url,
            "left_image_url": scan.left_image_url,
            "right_image_url": scan.right_image_url,
        }
        if scan.full_json_data:
            try:
                data = json.loads(scan.full_json_data)
                item["description"] = data.get("description")
                item["skin_metrics"] = data.get("skin_metrics")
            except json.JSONDecodeError:
                pass
        history.append(item)

    return {
        "user": UserResponse.model_validate(current_user).model_dump(),
        "scan_count": len(scans),
        "history": history,
    }


@app.get("/api/scan/{scan_id}")
def get_scan_detail(scan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scan = (
        db.query(ScanHistory)
        .filter(ScanHistory.id == scan_id, ScanHistory.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    result = {
        "id": scan.id,
        "scan_date": scan.scan_date.isoformat() if scan.scan_date else None,
        "full_json_data": scan.full_json_data,
        "front_image_url": scan.front_image_url,
        "left_image_url": scan.left_image_url,
        "right_image_url": scan.right_image_url,
    }
    return result


# ══════════════════════════════════════════════════════
#  SCAN ENDPOINT (AI Analysis)
# ══════════════════════════════════════════════════════

@app.post("/api/scan")
async def analyze_face(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # 1. Process uploaded images into PIL format and save to disk
        pil_images = []
        saved_urls = []
        for file in files:
            image_data = await file.read()
            
            # Save physically for API retrieval
            filename = getattr(file, "filename", "") or ""
            ext = filename.split('.')[-1] if '.' in filename else 'jpg'
            unique_name = f"{uuid.uuid4().hex}.{ext}"
            filepath = os.path.join("uploads", unique_name)
            with open(filepath, "wb") as f:
                f.write(image_data)
            saved_urls.append(f"/uploads/{unique_name}")
            
            # Process to PIL for immediate Gemini AI inference
            pil_images.append(Image.open(io.BytesIO(image_data)))

        # 2. Check if user has a past scan history
        last_scan = (
            db.query(ScanHistory)
            .filter(ScanHistory.user_id == current_user.id)
            .order_by(ScanHistory.scan_date.desc())
            .first()
        )

        if not last_scan:
            # --- FIRST TIME SCAN ---
            print(f"[VRP Skincare] First-time scan for user {current_user.username}")
            result_json_str = first_time_scan(pil_images, current_user.budget)
        else:
            # --- FOLLOW UP SCAN ---
            print(f"[VRP Skincare] Follow-up scan for user {current_user.username}")
            result_json_str = follow_up_scan(
                pil_images, last_scan.full_json_data, last_scan.ai_private_note, current_user.budget
            )

        # 3. Clean and Parse the JSON 
        # (Fixes 500 error if AI randomly wrapped output in markdown)
        result_json_str = result_json_str.strip()
        if result_json_str.startswith("```json"):
            result_json_str = result_json_str[7:]
        if result_json_str.endswith("```"):
            result_json_str = result_json_str[:-3]
        result_json_str = result_json_str.strip()

        result_data = json.loads(result_json_str)
        private_note = result_data.get("future_note_for_ai", "No notes recorded.")

        # 4. Save this scan to the database mapping the local images
        new_scan = ScanHistory(
            user_id=current_user.id,
            full_json_data=result_json_str,
            ai_private_note=private_note,
            front_image_url=saved_urls[0] if len(saved_urls) > 0 else None,
            left_image_url=saved_urls[1] if len(saved_urls) > 1 else None,
            right_image_url=saved_urls[2] if len(saved_urls) > 2 else None
        )
        
        routine_dict = result_data.get("product_usage_times")
        if routine_dict:
            current_user.daily_routine_json = json.dumps(routine_dict)
            
        db.add(new_scan)
        db.commit()
        db.refresh(new_scan)

        # 5. Return the JSON to the frontend
        response_data = {k: v for k, v in result_data.items() if k != "future_note_for_ai"}
        response_data["scan_id"] = new_scan.id
        return response_data

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI Engine Error: {str(e)}")

class ChatMessage(BaseModel):
    message: str

@app.post("/api/chat")
def handle_chat(msg: ChatMessage, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from ai_service import dermatologist_chat
    last_scan = db.query(ScanHistory).filter(ScanHistory.user_id == current_user.id).order_by(ScanHistory.scan_date.desc()).first()
    
    past_json = last_scan.full_json_data if last_scan else None
    past_note = last_scan.ai_private_note if last_scan else None
    
    try:
        reply = dermatologist_chat(msg.message, past_json, past_note)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Error: {str(e)}")


@app.post("/api/scan/ingredient")
async def analyze_ingredient(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from ai_service import ingredient_scan
    from database import IngredientScan
    
    last_scan = db.query(ScanHistory).filter(ScanHistory.user_id == current_user.id).order_by(ScanHistory.scan_date.desc()).first()
    past_json = last_scan.full_json_data if last_scan else None

    try:
        image_data = await file.read()
        
        # Save image physically
        filename = getattr(file, "filename", "") or ""
        ext = filename.split('.')[-1] if '.' in filename else 'jpg'
        unique_name = f"label_{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join("uploads", unique_name)
        with open(filepath, "wb") as f:
            f.write(image_data)
        saved_url = f"/uploads/{unique_name}"

        # Run AI
        pil_image = Image.open(io.BytesIO(image_data))
        reply_json = ingredient_scan(pil_image, past_json)
        
        reply_json = reply_json.strip()
        if reply_json.startswith("```json"): reply_json = reply_json[7:]
        if reply_json.endswith("```"): reply_json = reply_json[:-3]
        
        parsed_report = json.loads(reply_json.strip())
        
        # Log to Database
        new_label_scan = IngredientScan(
            user_id=current_user.id,
            image_url=saved_url,
            status=parsed_report.get("status", "Unknown"),
            explanation=parsed_report.get("explanation", ""),
            flagged_ingredients_json=json.dumps(parsed_report.get("flagged_ingredients", []))
        )
        db.add(new_label_scan)
        db.commit()
        db.refresh(new_label_scan)
        
        return {"id": new_label_scan.id, "report": parsed_report, "image": saved_url}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Vision API Error: {str(e)}")

# ══════════════════════════════════════════════════════
#  NOTIFICATIONS & ADMIN SYSTEM
# ══════════════════════════════════════════════════════

class GlobalNotificationAction(BaseModel):
    message: str

@app.get("/api/admin/dashboard")
def get_admin_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    total_users = db.query(User).count()
    total_scans = db.query(ScanHistory).count()
    
    users = db.query(User).order_by(User.created_at.desc()).limit(15).all()
    user_list = [{"id": u.id, "email": u.email, "username": u.username, "streak": u.streak_count, "joined": str(u.created_at)} for u in users]
    
    return {"total_users": total_users, "total_scans": total_scans, "recent_users": user_list}

@app.post("/api/admin/notify")
def send_global_notification(payload: GlobalNotificationAction, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin: raise HTTPException(status_code=403, detail="Not authorized")
    from database import Notification
    users = db.query(User).all()
    for u in users:
        db.add(Notification(user_id=u.id, message=payload.message, type="alert"))
    db.commit()
    return {"message": f"Broadcast fired to {len(users)} users."}

@app.get("/api/admin/user/{target_user_id}")
def get_admin_user_detail(target_user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin: raise HTTPException(status_code=403, detail="Not authorized")
    
    target_user = db.query(User).filter(User.id == target_user_id).first()
    if not target_user: raise HTTPException(status_code=404, detail="User not found")
    
    scans = db.query(ScanHistory).filter(ScanHistory.user_id == target_user_id).order_by(ScanHistory.scan_date.desc()).all()
    
    history_list = []
    for s in scans:
        hist_item = {
            "id": s.id, "scan_date": str(s.scan_date), 
            "ai_private_note": s.ai_private_note,
            "front_image_url": s.front_image_url,
            "left_image_url": s.left_image_url,
            "right_image_url": s.right_image_url
        }
        if s.full_json_data:
            try:
               data = json.loads(s.full_json_data)
               hist_item["description"] = data.get("description")
               hist_item["metrics"] = data.get("skin_metrics")
               hist_item["products"] = data.get("products")
            except: pass
        history_list.append(hist_item)

    return {
        "user": {"id": target_user.id, "email": target_user.email, "username": target_user.username, "budget": target_user.budget, "streak": target_user.streak_count, "joined": str(target_user.created_at)},
        "scans": history_list
    }

@app.get("/api/notifications")
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from database import Notification
    nots = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(15).all()
    return [{"id": n.id, "message": n.message, "is_read": n.is_read, "type": n.type, "date": str(n.created_at)} for n in nots]

@app.put("/api/notifications/read")
def mark_notifications_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from database import Notification
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "Success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
