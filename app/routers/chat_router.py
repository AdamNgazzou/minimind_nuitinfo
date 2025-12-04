from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import async_session
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import process_chat

router = APIRouter(prefix="/chat", tags=["Chatbot"])

async def get_db():
    async with async_session() as session:
        yield session

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    reply, summary = await process_chat(db, request.message)
    return ChatResponse(reply=reply, summary=summary)
