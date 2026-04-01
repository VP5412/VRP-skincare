from pydantic import BaseModel, Field

class Product(BaseModel):
    name: str = Field(description="The name of the recommended product")
    link_of_product: str = Field(description="A search link or URL to buy the product")

# --- We define explicit classes instead of using dict[str, int] ---
class SkinMetrics(BaseModel):
    acne: int = Field(description="Severity score from 1-10 for acne")
    redness: int = Field(description="Severity score from 1-10 for redness")
    dryness: int = Field(description="Severity score from 1-10 for dryness")
    dark_circles: int = Field(description="Severity score from 1-10 for dark circles")

class ProductUsage(BaseModel):
    morning_routine: str = Field(description="Products to use in the morning")
    night_routine: str = Field(description="Products to use at night")
    weekly_routine: str = Field(description="Products to use occasionally (e.g. masks)")

class SkinAnalysisResponse(BaseModel):
    description: str = Field(description="Overview of their skin condition")
    
    # Use the new explicit classes here!
    skin_metrics: SkinMetrics = Field(description="Scores for various skin conditions")
    products: list[Product] = Field(description="List of recommended products")
    product_usage_times: ProductUsage = Field(description="When to use the recommended products")
    
    face_home_remedies: list[str] = Field(description="List of natural home remedies suitable for their skin")
    future_note_for_ai: str = Field(description="Internal medical notes to be saved in DB and given to the AI during the next scan")