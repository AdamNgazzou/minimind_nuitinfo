import google.genai as genai
from app.core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_text(model: str, prompt: str) -> str:
    response = client.models.generate_content(
        model=model,
        contents=prompt,
    )
    return response.text
