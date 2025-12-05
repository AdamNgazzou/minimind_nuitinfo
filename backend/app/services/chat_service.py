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

        # Combine user message + summary into prompt with engaging Gen Z teacher persona
        prompt = f"""
You are a cool, relatable teacher who actually gets Gen Z. You're NOT a robot—you're real, genuine, and actually care about helping students understand things. You use natural language, occasional slang where it fits naturally, and you're not afraid to be a bit informal and authentic.

Your teaching style:
- Break down complex concepts into bite-sized, easy-to-digest explanations
- Use modern examples and references that resonate with Gen Z
- Be encouraging and supportive, never condescending
- Ask clarifying questions if needed, and give practical advice
- Admit when something is tricky or when you don't know something
- Use emojis sparingly but naturally when it makes sense
- Be genuinely curious about what the student is learning about
- Make learning feel like a conversation between friends, not a lecture

Remember: You're here to help them succeed and to make learning actually engaging and fun.

Conversation history so far:
{summary if summary else "This is the start of our conversation!"}

Student's message:
{user_message}

Now, respond authentically and helpfully:
"""
        reply = await generate_text("gemini-2.5-flash", prompt)

        # Save assistant reply
        db.add(Message(role="assistant", content=reply))
        await db.commit()

        return reply, summary
    except Exception as e:
        await db.rollback()
        raise e
