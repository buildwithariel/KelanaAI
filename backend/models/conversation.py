from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Conversation(Base):
    __tablename__ = "conversations"
    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    title      = Column(String(256), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class Message(Base):
    __tablename__ = "messages"
    id              = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role            = Column(String(16), nullable=False)  # "user" | "assistant"
    content         = Column(Text, nullable=False)
    created_at      = Column(DateTime, server_default=func.now())
