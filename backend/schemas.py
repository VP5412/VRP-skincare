from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


# ──────────────────── Auth Schemas ────────────────────

class UserCreate(BaseModel):
    email: str = Field(description="User's email address")
    password: str = Field(description="User's password", min_length=6)
    username: str = Field(description="Display name")
    budget: str = Field(default="1000", description="Monthly skincare budget in INR")


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    budget: str
    is_verified: bool
    is_admin: bool
    streak_count: int
    daily_routine_json: Optional[str] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ──────────────────── AI / Scan Schemas ────────────────────

class Product(BaseModel):
    name: str = Field(description="The name of the recommended product")
    link_of_product: str = Field(description="A search link or URL to buy the product")


class SkinMetrics(BaseModel):
    acne: int = Field(description="Severity score from 1-10 for acne")
    redness: int = Field(description="Severity score from 1-10 for redness")
    dryness: int = Field(description="Severity score from 1-10 for dryness")
    dark_circles: int = Field(description="Severity score from 1-10 for dark circles")


class ProductUsage(BaseModel):
    morning_routine: list[str] = Field(description="List of exact product names to use in the morning")
    night_routine: list[str] = Field(description="List of exact product names to use at night")
    weekly_routine: list[str] = Field(description="List of exact product names to use occasionally")


class SkinAnalysisResponse(BaseModel):
    description: str = Field(description="Overview of their skin condition")
    skin_metrics: SkinMetrics = Field(description="Scores for various skin conditions")
    products: list[Product] = Field(description="List of recommended products")
    product_usage_times: ProductUsage = Field(description="When to use the recommended products")
    face_home_remedies: list[str] = Field(description="List of natural home remedies suitable for their skin")
    future_note_for_ai: str = Field(description="Internal medical notes to be saved in DB and given to the AI during the next scan")


# ──────────────────── Dashboard / History Schemas ────────────────────

class ScanHistoryItem(BaseModel):
    id: int
    scan_date: datetime
    skin_metrics: Optional[SkinMetrics] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True


class ScanDetailResponse(BaseModel):
    id: int
    scan_date: datetime
    full_json_data: str

    class Config:
        from_attributes = True

class IngredientReport(BaseModel):
    status: str = Field(description="Must be strictly 'Safe', 'Warning', or 'Error'.")
    flagged_ingredients: list[str] = Field(description="List of exact strings matching comedogenic or irritating ingredients found.")
    explanation: str = Field(description="2-3 sentence explanation about why the product is safe or unsafe based on the user's explicit skin profile.")
