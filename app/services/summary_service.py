from sqlalchemy import select
from app.models.message import Message
from app.services.gemini_client import generate_text

async def get_last_messages(db, limit=10):
    q = select(Message).order_by(Message.id.desc()).limit(limit)
    rows = (await db.execute(q)).scalars().all()
    return list(reversed(rows))

async def generate_conversation_summary(db):
    messages = await get_last_messages(db)

    if not messages:
        return ""

    summary_prompt = open("app/prompts/summary_prompt.txt").read()

    conversation_text = "\n".join(
        [f"{m.role.upper()}: {m.content}" for m in messages]
    )

    full_prompt = summary_prompt.replace("{{conversation}}", conversation_text)

    summary = await generate_text("gemini-2.5-flash", full_prompt)

    return summary
