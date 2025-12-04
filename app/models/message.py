from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    role = Column(String(10))  # "user" / "assistant"
    content = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
