from fastapi import FastAPI
from app.routers.chat_router import router as chat_router
from app.core.database import engine, Base
import uvicorn

app = FastAPI(title="Gemini Chatbot with Summary")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(chat_router)

if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
