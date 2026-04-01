import os
from dotenv import load_dotenv
from google import genai
from schemas import SkinAnalysisResponse, IngredientReport
from pydantic import BaseModel

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def first_time_scan(images, budget):
    prompt = f"""
    You are an expert dermatologist. Analyze the attached images (Front, Left, Right) of the user's face.
    
    You MUST return the output in JSON format exactly matching the schema.
    
    1. "description": A 2-3 sentence overview of their current skin condition.
    2. "skin_metrics": A dictionary with keys ("acne", "redness", "dryness", "dark_circles"). Values must be 1 to 10.
    3. "products": An array of products fitting a budget of ₹{budget} INR. Include Indian products available on Amazon India or Nykaa. Each product must have "name" and "link_of_product". IMPORTANT: The "link_of_product" MUST be a valid search URL. Format it exactly like this: "https://www.amazon.in/s?k=" followed by the product name with spaces replaced by "+". Do NOT guess direct product URLs.
    4. "product_usage_times": The exact time to use each product (e.g., "Morning", "Night"). Must have "morning_routine", "night_routine", "weekly_routine".
    5. "face_home_remedies": 1-2 natural home remedies.
    6. "future_note_for_ai": A clinical note to YOURSELF for the next visit. Mention specific areas you want to check next week.
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
    3. "products": Products for the next week (Budget: ₹{budget} INR). Include Indian products available on Amazon India or Nykaa. Each product must have "name" and "link_of_product". IMPORTANT: The "link_of_product" MUST be a valid search URL. Format it exactly like this: "https://www.amazon.in/s?k=" followed by the product name with spaces replaced by "+". Do NOT guess direct product URLs.
    4. "product_usage_times": Usage times for the products. Must have "morning_routine", "night_routine", "weekly_routine".
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


def dermatologist_chat(user_message, past_json_data, past_ai_note):
    prompt = f"""
    You are an expert AI Dermatologist acting as an on-call virtual assistant for a patient.
    
    --- PATIENT CONTEXT ---
    Latest Metrics & Routine: {past_json_data if past_json_data else 'No scans performed yet. Advise them to take a free virtual scan.'}
    Your Private Notes: {past_ai_note if past_ai_note else 'None.'}
    
    --- USER MESSAGE ---
    {user_message}
    
    Respond in 2-4 sentences max. Be conversational, empathetic, and strictly medically safe. Warn them to see a real doctor if it sounds like an infection or emergency. Suggest utilizing the products you previously recommended in the routine context if specifically applicable.
    """

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    return response.text

def ingredient_scan(image, past_json_data):
    prompt = f"""
    You are an expert Dermatologist. Analyze the provided image of a skincare product's ingredient label.
    
    --- USER SKIN PROFILE ---
    {past_json_data if past_json_data else 'Unknown skin type.'}
    
    --- INSTRUCTIONS ---
    1. Read the ingredients from the image carefully.
    2. Cross-reference them against the User's specific skin profile (e.g., if their acne score is high, scan for comedogenic ingredients like Isopropyl Myristate. If their dryness is high, look for stripping alcohols).
    3. Determine if this product is "Safe" or "Warning" for THEM.
    
    Respond strictly in JSON matching the predefined schema without formatting blocks.
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[image, prompt],
        config=genai.types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=IngredientReport,
        )
    )
    return response.text
