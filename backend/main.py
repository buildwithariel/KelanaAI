from fastapi import FastAPI
from pydantic import BaseModel

from services.trip_service import (
    get_trip_category,
    get_travel_season,
    get_recommended_places,
    get_recommended_transportation,
    calculate_daily_budget,
    get_list_of_category,
    get_list_of_transportation
)

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    currency: str
    travel_month: str
    travel_style: str

app = FastAPI()

@app.get("/")
def home():
    return {
        "messages": "Welcome to KelanaAI"
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }

@app.post("/api/v1/trips")
def create_trips(request: TripRequest):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    trip_category = get_trip_category(request.budget)
    travel_season = get_travel_season(request.travel_month)
    reccomendation_transport = get_recommended_transportation(trip_category)

    return {
        "destination": request.destination,
        "days": request.days,
        "budget": request.budget,
        "category": trip_category,
        "travel_month": request.travel_month,
        "daily_budget": daily_budget,
        "travel_season": travel_season,
        "reccomendation_transport": reccomendation_transport
    }

@app.get("/api/v1/recommendations")
def get_recommendations(destination: str):
    recommendation_places = get_recommended_places(destination)
    return recommendation_places

@app.get("/api/v1/transportations")
def get_all_transportations():
    transportations = get_list_of_transportation()
    return transportations

@app.get("/api/v1/trip-categories")
def get_all_trip_categories():
    trip_categories = get_list_of_category()
    return {
        "trip_categories": trip_categories
    }
