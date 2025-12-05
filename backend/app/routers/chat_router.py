from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import async_session
from app.schemas.chat import ChatRequest, ChatResponse, ConversationListResponse, SummaryResponse
from app.services.chat_service import process_chat
from app.services.conversation_service import (
    get_all_conversations,
    get_conversation_with_summary,
    generate_and_store_summary,
    get_stored_summary
)
from app.models.braintumor.loader import load_model
from app.models.braintumor.predictor import predict
from app.utils.image import preprocess_image

router = APIRouter(prefix="/chat", tags=["Chatbot"])

# Load the brain tumor model once at startupa
model = load_model("app/models/braintumor/brain_tumor_model.pth")

async def get_db():
    async with async_session() as session:
        yield session

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    reply, summary = await process_chat(db, request.message)
    return ChatResponse(reply=reply, summary=summary)

@router.get("/conversations/list", response_model=ConversationListResponse)
async def list_conversations(db: AsyncSession = Depends(get_db)):
    conversations = await get_all_conversations(db)
    return ConversationListResponse(conversations=conversations)

@router.get("/conversations/with-summary")
async def list_conversations_with_summary(db: AsyncSession = Depends(get_db)):
    """
    Returns all conversations linked with the conversation summary.
    This endpoint is designed for prompt engineering - it provides both
    the full conversation history and a generated summary for context.
    """
    result = await get_conversation_with_summary(db)
    return result

@router.post("/summary/generate", response_model=SummaryResponse)
async def generate_summary_endpoint(db: AsyncSession = Depends(get_db)):
    """
    Generates a conversation summary using Gemini and stores it.
    This endpoint makes Gemini create a summary of the conversation history.
    The summary is stored and can be retrieved via the GET /summary/retrieve endpoint.
    """
    summary = await generate_and_store_summary(db)
    return SummaryResponse(summary=summary)

@router.get("/summary/retrieve", response_model=SummaryResponse)
async def retrieve_summary_endpoint():
    """
    Retrieves the previously generated and stored conversation summary.
    Returns the last summary that was generated via POST /summary/generate.
    Returns an empty string if no summary has been generated yet.
    """
    summary = await get_stored_summary()
    return SummaryResponse(summary=summary or "")

@router.post("/braintumor/detect")
async def detect(file: UploadFile = File(...)):
    try:
        # Read image bytes from uploaded file
        image_bytes = await file.read()
        # Pass bytes to preprocess_image (you may need to update preprocess_image to accept bytes)
        image_tensor = preprocess_image(image_bytes)
        prediction_class, confidence_score = predict(model, image_tensor)
        # Map class index to class name (0 = no tumor, 1 = tumor)
        class_name = "tumor" if prediction_class == 1 else "no_tumor"
        return JSONResponse(content={
            "predicted_class": class_name,
            "confidence_score": round(confidence_score, 4)
        })
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
