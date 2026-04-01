import os
import requests
from dotenv import load_dotenv
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db, User

load_dotenv()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")

# Using HTTPBearer instead of OAuth2PasswordBearer since Clerk handles login
security = HTTPBearer()

# Simple in-memory cache for JWKS to avoid rate-limiting
_JWKS_CACHE = None

def get_jwks():
    global _JWKS_CACHE
    if _JWKS_CACHE is not None:
        return _JWKS_CACHE

    res = requests.get(
        "https://api.clerk.com/v1/jwks",
        headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"}
    )
    if res.status_code != 200:
        raise Exception("Could not fetch Clerk JWKS")
    
    _JWKS_CACHE = res.json()
    return _JWKS_CACHE

def get_current_user(auth: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = auth.credentials
    if not token or not CLERK_SECRET_KEY:
        raise credentials_exception

    try:
        jwks = get_jwks()
        unverified_header = jwt.get_unverified_header(token)
        
        rsa_key = {}
        for key in jwks.get("keys", []):
            if key["kid"] == unverified_header.get("kid"):
                rsa_key = key
                break
                
        if not rsa_key:
            # If the key isn't found, it might have rotated; clear cache and try once
            global _JWKS_CACHE
            _JWKS_CACHE = None
            raise credentials_exception
            
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        clerk_id: str = payload.get("sub")
        if not clerk_id:
            raise credentials_exception
            
    except Exception as e:
        print(f"Token verification failed: {e}")
        raise credentials_exception

    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    
    # Self-healing: Delete corrupted dummy accounts created from earlier buggy JIT
    if user and user.email == user.clerk_id:
        db.delete(user)
        db.commit()
        user = None
    
    if not user:
        # Just-in-Time Provisioning & Legacy Account Migration
        try:
            res = requests.get(
                f"https://api.clerk.com/v1/users/{clerk_id}",
                headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"}
            )
            if res.status_code == 200:
                user_data = res.json()
                email_addresses = user_data.get("email_addresses", [])
                
                if email_addresses:
                    primary_email = email_addresses[0].get("email_address")
                    
                    # Search for a legacy account via email
                    legacy_user = db.query(User).filter(User.email == primary_email).first()
                    
                    if legacy_user:
                        # Migrate: Link their existing account to their new Clerk ID!
                        legacy_user.clerk_id = clerk_id
                        db.commit()
                        db.refresh(legacy_user)
                        return legacy_user
                    else:
                        # Completely new user
                        user = User(clerk_id=clerk_id, email=primary_email, username=f"User_{clerk_id[-5:]}")
                        db.add(user)
                        db.commit()
                        db.refresh(user)
                        return user
        except Exception as api_err:
            print(f"Clerk API sync failed: {api_err}")
            
        # Fallback if API fails
        user = User(clerk_id=clerk_id, email=clerk_id, username=f"User_{clerk_id[-5:]}")
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return user
