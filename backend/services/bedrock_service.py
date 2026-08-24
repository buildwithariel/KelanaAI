import os
import boto3

MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")
_client = None

def _get_client():
    global _client
    if _client is None:
        _client = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_REGION", "us-east-1"))
    return _client

def build_prompt(trip) -> str:
    return (
        f"You are a professional travel planner. Create a detailed {trip.days}-day itinerary "
        f"for a trip to {trip.destination}.\n\n"
        f"Trip context:\n"
        f"- Budget category: {trip.category} (~{trip.daily_budget:.2f} per day)\n"
        f"- Travel season: {trip.travel_season}\n"
        f"- Main transportation: {trip.reccomendation_transport}\n\n"
        f"For EACH day, produce a structured daily plan with exactly these three sections:\n"
        f"- Morning: 2-3 specific activities (named places, not generic descriptions).\n"
        f"- Afternoon: recommendations for cultural sites (museums, temples, landmarks) and a local "
        f"experience (a class, market, or tradition unique to the area).\n"
        f"- Evening: a specific dinner spot recommendation and a nightlife/entertainment suggestion.\n\n"
        f"Format each day as:\n"
        f"Day N: <short theme>\n\n"
        f"Morning:\n- ...\n\nAfternoon:\n- ...\n\nEvening:\n- ...\n\n"
        f"Keep recommendations realistic for the destination and budget. Do not add commentary outside "
        f"the itinerary."
    )

def generate_itinerary(trip) -> str:
    response = _get_client().converse(
        modelId=MODEL_ID,
        messages=[{"role": "user", "content": [{"text": build_prompt(trip)}]}],
        inferenceConfig={"maxTokens": 2000, "temperature": 0.7},
    )
    return response["output"]["message"]["content"][0]["text"]

if __name__ == "__main__":
    class _FakeTrip:
        destination = "Tokyo"
        days = 2
        category = "Standard"
        daily_budget = 200.0
        travel_season = "Peak Season"
        reccomendation_transport = "Train"

    prompt = build_prompt(_FakeTrip())
    for section in ("Morning", "Afternoon", "Evening", "Tokyo", "cultural sites", "dinner", "nightlife"):
        assert section in prompt, f"prompt missing required section: {section}"
    print("bedrock_service prompt self-check passed")
