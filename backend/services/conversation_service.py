"""
conversation_service.py — Session 10 conversation memory.

The application (not the model) owns conversation state: every turn is
persisted, and each new call to Bedrock is built from the full stored
history so the model can answer context-aware follow-up questions.
"""

from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.conversation import Conversation, Message
from services.bedrock_service import ask_conversation

TITLE_MAX_LEN = 60


def create_conversation(db: Session, user_id: int, title: str | None = None) -> Conversation:
    conversation = Conversation(user_id=user_id, title=title)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def list_conversations(db: Session, user_id: int) -> list[Conversation]:
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id)
        .order_by(Conversation.created_at.desc())
        .all()
    )


def get_owned_conversation(conversation_id: int, user_id: int, db: Session) -> Conversation:
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conversation is None:
        raise HTTPException(status_code=404, detail=f"Conversation with id {conversation_id} not found")
    if conversation.user_id != user_id:
        raise HTTPException(status_code=403, detail="You don't have access to this conversation")
    return conversation


def list_messages(db: Session, conversation_id: int) -> list[Message]:
    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )


def send_message(db: Session, conversation: Conversation, content: str) -> Message:
    """
    Send-message orchestration (PDF Part 4): save the user's turn, reload the
    full history (Part 7 "continue conversation" reuses this same reload),
    rebuild the prompt from it, call Bedrock, save + return the AI reply.
    """
    user_message = Message(conversation_id=conversation.id, role="user", content=content)
    db.add(user_message)
    if conversation.title is None:
        conversation.title = content[:TITLE_MAX_LEN]
    db.commit()

    history = list_messages(db, conversation.id)
    answer = ask_conversation([{"role": m.role, "content": m.content} for m in history])

    ai_message = Message(conversation_id=conversation.id, role="assistant", content=answer)
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)
    return ai_message
