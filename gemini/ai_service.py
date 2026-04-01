import os
from dotenv import load_dotenv
from google import genai
from schemas import SkinAnalysisResponse

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def first_time_scan(images, budget):
    prompt = f"""
    You are an expert dermatologist. Analyze the attached images (Front, Left, Right) of the user's face.
    
    You MUST return the output in JSON format exactly matching the schema.
    
    1. "description": A 2-3 sentence overview of their current skin condition.
    2. "skin_metrics": A dictionary with keys ("acne", "redness", "dryness", "dark_circles"). Values must be 1 to 10.
    3. "products": An array of products fitting a budget of {budget}.
    4. "product_usage_times": The exact time to use each product (e.g., "Morning", "Night").
    5. "face_home_remedies": 1-2 natural home remedies.
    6. "future_note_for_ai": A clinical note to YOURSELF for the next visit. Mention specific areas you want to check next week.
    """

    # 'images' is a list of PIL Images (Front, Left, Right)
    contents = images + [prompt]
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=contents,
        config=genai.types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=SkinAnalysisResponse, 
        ),
    )
    return response.text

def follow_up_scan(images, past_json_data, past_ai_note, budget):
    prompt = f"""
    You are an expert dermatologist conducting a follow-up consultation.
    
    --- PATIENT HISTORY ---
    Previous Analysis & Products Used: {past_json_data}
    YOUR PRIVATE CLINICAL NOTES FROM LAST WEEK: "{past_ai_note}"
    
    --- TASK ---
    Analyze the NEW attached images. Pay special attention to the things you told yourself to check in your private notes.
    
    You MUST return the output in JSON format exactly matching the schema.
    1. "description": Compare their skin today to last week. Did the specific issues in your private notes improve?
    2. "skin_metrics": NEW updated 1-10 scores.
    3. "products": Products for the next week (Budget: {budget}).
    4. "product_usage_times": Usage times for the products.
    5. "face_home_remedies": Updated home remedies.
    6. "future_note_for_ai": A NEW clinical note to yourself for next time.
    """

    contents = images + [prompt]

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=contents,
        config=genai.types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=SkinAnalysisResponse, 
        ),
    )
    return response.text