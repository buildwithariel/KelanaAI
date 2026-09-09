"""
conversation_service.py — Session 10/11 conversation memory + grounding.

The application (not the model) owns conversation state: every turn is
persisted, and each new call to Bedrock is built from the full stored
history so the model can answer context-aware follow-up questions.

Session 11 adds retrieval: before each Bedrock call we pull the most relevant
passages from the Knowledge Base and pass them — together with the assistant's
instructions — as the Converse `system` prompt. One call, both memory and
grounding. The instructions also tell the model to close a concrete plan with a
```trip block the frontend turns into a one-click "save as trip".
"""

import logging

from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.conversation import Conversation, Message
from services.bedrock_service import ask_conversation
from services.kb_service import retrieve_passages

logger = logging.getLogger(__name__)

TITLE_MAX_LEN = 60

CONVERSATION_SYSTEM = (
    "You are KelanaAI's travel assistant. You help travellers plan trips and "
    "answer travel questions.\n\n"
    "Use the CONTEXT passages below when they are relevant to the question. If "
    "the context does not cover it, answer from general knowledge and say the "
    "answer isn't from KelanaAI's documents.\n\n"
    "When the traveller has given you enough to plan a concrete trip — a "
    "destination, a trip length in days, a total budget in USD, and a travel "
    "style (Solo, Couple, or Family) — end your reply with a fenced code block "
    "and nothing after it:\n\n"
    "```trip\n"
    '{"destination": "<city or country>", "days": <int>, "budget": <number>, '
    '"travel_style": "<Solo|Couple|Family>"}\n'
    "```\n\n"
    "Only add the block when all four fields are known. Never describe the block "
    "or show its contents as prose."
)


def _safe_retrieve(question: str) -> list[dict]:
    """retrieve_passages, but a Knowledge Base outage must not break the chat."""
    try:
        return retrieve_passages(question)
    except Exception:  # missing KNOWLEDGE_BASE_ID, KB down, throttling, ...
        logger.warning("KB retrieval failed; answering ungrounded", exc_info=True)
        return []


def _build_context(passages: list[dict]) -> str:
    if not passages:
        return CONVERSATION_SYSTEM
    blocks = "\n\n---\n\n".join(
        f"[{p['source']}]\n{p['text']}" for p in passages if p.get("text")
    )
    return f"{CONVERSATION_SYSTEM}\n\nCONTEXT:\n{blocks}"


def _distinct_sources(passages: list[dict]) -> list[str]:
    seen: list[str] = []
    for p in passages:
        s = p.get("source")
        if s and s not in seen:
            seen.append(s)
    return seen


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
    Send-message orchestration: save the user's turn, retrieve grounding
    passages, rebuild the prompt from the full history, call Bedrock, save +
    return the AI reply (with the source documents it was grounded in).
    """
    user_message = Message(conversation_id=conversation.id, role="user", content=content)
    db.add(user_message)
    if conversation.title is None:
        conversation.title = content[:TITLE_MAX_LEN]
    db.commit()

    passages = _safe_retrieve(content)
    history = list_messages(db, conversation.id)
    answer = ask_conversation(
        [{"role": m.role, "content": m.content} for m in history],
        context=_build_context(passages),
    )

    ai_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=answer,
        sources=_distinct_sources(passages),
    )
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)
    return ai_message


if __name__ == "__main__":
    for marker in ("```trip", "destination", "days", "budget", "travel_style", "CONTEXT"):
        assert marker in CONVERSATION_SYSTEM, f"system prompt missing: {marker}"
    assert _build_context([]) == CONVERSATION_SYSTEM
    assert "CONTEXT:" in _build_context([{"text": "hi", "source": "a.md"}])
    assert _distinct_sources([{"source": "a"}, {"source": "a"}, {"source": "b"}]) == ["a", "b"]
    print("conversation_service self-check passed")
