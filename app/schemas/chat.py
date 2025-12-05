from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    summary: str | None = None

class ConversationItem(BaseModel):
    id: int
    role: str
    content: str
    created_at: str

class ConversationListResponse(BaseModel):
    conversations: list[ConversationItem]

class SummaryResponse(BaseModel):
    summary: str
