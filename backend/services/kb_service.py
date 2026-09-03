"""
kb_service.py — Retrieval-Augmented Generation over an Amazon Bedrock Knowledge Base.

Session 9: instead of relying only on the model's built-in knowledge, we first
RETRIEVE the most relevant passages from the travel documents synced to S3, then
GENERATE an answer grounded in those passages — and return the source file names.

The Knowledge Base here is a *managed* one, so `retrieve_and_generate` is not
available; we call `retrieve` and do the generation step ourselves with Bedrock.
"""

import os
import re

import boto3
from dotenv import load_dotenv

from services.bedrock_service import AWS_REGION, MODEL_ID, get_bedrock_client

load_dotenv()

KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")
NUM_RESULTS = int(os.getenv("KNOWLEDGE_BASE_NUM_RESULTS", "5"))

_GROUNDED_PROMPT = (
    "You are KelanaAI's travel assistant. Answer the traveller's question using ONLY the "
    "context passages below, which come from trusted travel documents. If the context does "
    "not contain the answer, say you don't have that information in your documents — do not "
    "guess. Be concise and specific.\n\n"
    "CONTEXT:\n{context}\n\n"
    "QUESTION: {question}\n\n"
    "ANSWER:"
)


def get_agent_client():
    """boto3 client for the Bedrock Agent Runtime (Retrieve lives here)."""
    return boto3.client("bedrock-agent-runtime", region_name=AWS_REGION)


def _source_name(location: dict) -> str:
    """Human-readable document name from a retrieval-result location block."""
    location = location or {}
    for key in ("s3Location", "webLocation", "confluenceLocation", "salesforceLocation", "sharePointLocation"):
        loc = location.get(key) or {}
        uri = loc.get("uri") or loc.get("url")
        if uri:
            return uri.rsplit("/", 1)[-1] or uri
    return "unknown source"


def retrieve_passages(question: str) -> list[dict]:
    """Return the top matching passages: [{'text': str, 'source': str, 'score': float}]."""
    if not KNOWLEDGE_BASE_ID:
        raise ValueError("KNOWLEDGE_BASE_ID is not set. Check your .env file.")

    client = get_agent_client()
    response = client.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": question},
        retrievalConfiguration={
            "managedSearchConfiguration": {"numberOfResults": NUM_RESULTS}
        },
    )
    passages = []
    for item in response.get("retrievalResults", []):
        passages.append(
            {
                "text": (item.get("content", {}) or {}).get("text", "") or "",
                "source": _source_name(item.get("location", {})),
                "score": item.get("score"),
            }
        )
    return passages


def ask_knowledge_base(question: str) -> dict:
    """
    Answer a question with RAG.

    Returns {"answer": str, "sources": [str], "grounded": bool}:
      - answer:   the generated answer, grounded in retrieved passages
      - sources:  distinct source document names the passages came from
      - grounded: True if any passage was retrieved from the Knowledge Base
    """
    passages = retrieve_passages(question)

    if not passages:
        return {
            "answer": "I don't have information about that in my travel documents.",
            "sources": [],
            "grounded": False,
        }

    context = "\n\n---\n\n".join(
        f"[{p['source']}]\n{p['text']}" for p in passages if p["text"]
    )
    prompt = _GROUNDED_PROMPT.format(context=context, question=question)

    client = get_bedrock_client()
    response = client.converse(
        modelId=MODEL_ID,
        messages=[{"role": "user", "content": [{"text": prompt}]}],
    )
    answer = response["output"]["message"]["content"][0]["text"]

    sources: list[str] = []
    for p in passages:
        if p["source"] not in sources:
            sources.append(p["source"])

    return {"answer": answer, "sources": sources, "grounded": True}


if __name__ == "__main__":
    result = ask_knowledge_base("What documents are required for a single-entry short-term visa to Japan?")
    print("ANSWER:\n", result["answer"])
    print("\nSOURCES:", result["sources"])
    print("GROUNDED:", result["grounded"])
