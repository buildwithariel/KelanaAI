import os

import boto3
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

AWS_BEARER_TOKEN_BEDROCK: str | None = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
AWS_REGION: str = os.getenv("AWS_REGION", "ap-southeast-2")
MODEL_ID: str = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

TRAVEL_PLANNER_PROMPT = (
    "You are an experienced travel planner.\n"
    "Plan a {days}-day itinerary for {destination}.\n"
    "Budget: USD {budget}\n"
    "Travel Style: {travel_style}.\n\n"
    "For EACH day, produce a structured daily plan with exactly these three sections:\n"
    "- Morning: 2-3 specific activities (named places, not generic descriptions).\n"
    "- Afternoon: recommendations for cultural sites (museums, temples, landmarks) and a local "
    "experience (a class, market, or tradition unique to the area).\n"
    "- Evening: a specific dinner spot recommendation and a nightlife/entertainment suggestion.\n\n"
    "Give the answer with markdown format."
)

def get_bedrock_client():
    """
    Build and return a boto3 Bedrock Runtime client.
    """
    client = boto3.client(
        service_name="bedrock-runtime",
        region_name=AWS_REGION,
    )
    return client

def get_ai_recommendation(
    destination: str,
    days: int,
    budget: float,
    travel_style: str,
) -> str:
    """
    Call Amazon Bedrock with the travel-planner prompt and return the
    AI-generated itinerary as a plain string.

    Args:
        destination:  City / country the traveller is visiting.
        days:         Length of the trip in days.
        budget:       Total trip budget in USD.
        travel_style: Trip category, e.g. Backpacker / Standard / Luxury.

    Returns:
        The model's text response.

    Raises:
        ValueError: If required environment variables are missing.
        botocore.exceptions.ClientError: Propagated from boto3 / Bedrock on API errors.
    """
    if not AWS_BEARER_TOKEN_BEDROCK:
        raise ValueError("AWS_BEARER_TOKEN_BEDROCK environment variable is missing")
    if not MODEL_ID:
        raise ValueError("MODEL_ID environment variable is missing")

    prompt: str = TRAVEL_PLANNER_PROMPT.format(
        days=days,
        destination=destination,
        budget=budget,
        travel_style=travel_style,
    )

    client = get_bedrock_client()

    # Use the Converse API — works across all Nova / Titan / Claude models
    response = client.converse(
        modelId=MODEL_ID,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    )

    return response["output"]["message"]["content"][0]["text"]


def ask_base_model(question: str) -> str:
    """
    Ask the foundation model a free-form question with NO retrieval / knowledge base.

    Used side-by-side with kb_service.ask_knowledge_base() to show the difference
    between a plain base-model answer and a document-grounded (RAG) answer.
    """
    if not AWS_BEARER_TOKEN_BEDROCK:
        raise ValueError("AWS_BEARER_TOKEN_BEDROCK environment variable is missing")

    client = get_bedrock_client()
    response = client.converse(
        modelId=MODEL_ID,
        messages=[
            {
                "role": "user",
                "content": [{"text": question}],
            }
        ],
    )
    return response["output"]["message"]["content"][0]["text"]


if __name__ == "__main__":
    prompt = TRAVEL_PLANNER_PROMPT.format(
        days=2, destination="Tokyo", budget=200.0, travel_style="Standard"
    )
    for section in ("Morning", "Afternoon", "Evening", "Tokyo", "cultural sites", "dinner", "nightlife"):
        assert section in prompt, f"prompt missing required section: {section}"
    print("bedrock_service prompt self-check passed")
