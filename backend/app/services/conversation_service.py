from sqlalchemy import select
from app.models.message import Message
from app.services.summary_service import generate_conversation_summary

# In-memory storage for the last generated summary
_stored_summary = None

async def get_all_conversations(db):
    """
    Fetches all messages from the database and organizes them 
    into a conversation list with metadata.
    """
    q = select(Message).order_by(Message.id.asc())
    rows = (await db.execute(q)).scalars().all()
    
    conversations = []
    for message in rows:
        conversations.append({
            "id": message.id,
            "role": message.role,
            "content": message.content,
            "created_at": message.created_at.isoformat() if message.created_at else None
        })
    
    return conversations

async def get_conversation_with_summary(db):
    """
    Fetches all conversations and includes the current conversation summary
    in the response for prompt engineering purposes.
    """
    conversations = await get_all_conversations(db)
    summary = await generate_conversation_summary(db)
    
    return {
        "conversations": conversations,
        "summary": summary
    }

async def generate_and_store_summary(db):
    """
    Generates a conversation summary using Gemini and stores it in memory.
    Returns the generated summary.
    """
    global _stored_summary
    summary = await generate_conversation_summary(db)
    _stored_summary = summary
    return summary

async def get_stored_summary():
    """
    Retrieves the previously generated and stored summary.
    Returns None if no summary has been generated yet.
    """
    return _stored_summary

