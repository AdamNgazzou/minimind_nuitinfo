from app.services.gemini_client import generate_text
from app.services.summary_service import generate_conversation_summary
from app.models.message import Message

async def process_chat(db, user_message: str):
    try:
        # Save user message
        db.add(Message(role="user", content=user_message))
        await db.commit()

        # Generate summary
        summary = await generate_conversation_summary(db)

        # Combine user message + summary into prompt
        prompt = f"""
You are a helpful chatbot.

Conversation summary:
{summary}

User message:
{user_message}
"""
        reply = await generate_text("gemini-2.5-flash", prompt)

        # Save assistant reply
        db.add(Message(role="assistant", content=reply))
        await db.commit()

        return reply, summary
    except Exception as e:
        await db.rollback()
        raise e
