from dotenv import load_dotenv
import boto3
import os

# Load environment variables from .env
load_dotenv()

# Create the Bedrock Runtime client
# boto3 automatically authenticates using AWS_BEARER_TOKEN_BEDROCK
client = boto3.client(
    service_name="bedrock-runtime",
    region_name=os.getenv("AWS_REGION")
)

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
    # Send the prompt using the Converse API
    response = client.converse(
        modelId=os.getenv("MODEL_ID"),
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "text": build_prompt(trip)
                    }
                ]
            }
        ]
    )
    # Extract the AI response
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
