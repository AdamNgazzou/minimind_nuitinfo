from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy import pool
from app.core.config import settings

class Base(DeclarativeBase):
    pass

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    poolclass=pool.NullPool,
    connect_args={
        "ssl": "prefer",
        "timeout": 10,
        "command_timeout": 10,
        "server_settings": {"application_name": "chatbot"}
    }
)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)
