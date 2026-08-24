from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from models.trip import Trip
from database import SessionLocal, init_db

from services.trip_service import (
    get_trip_category,
    get_travel_season,
    get_recommended_places,
    get_recommended_transportation,
    calculate_daily_budget,
    get_list_of_category,
    get_list_of_transportation
)
from services.bedrock_service import get_ai_recommendation

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    currency: str
    travel_month: str
    travel_style: str

class BudgetUpdateRequest(BaseModel):
    budget: float

app = FastAPI()
init_db()

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

    trip = Trip(
        destination             =request.destination,
        days                    =request.days,
        budget                  =request.budget,
        category                =trip_category,
        daily_budget            =daily_budget,
        travel_season           =travel_season,
        reccomendation_transport=reccomendation_transport
    )

    db = SessionLocal()
    try:
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip
    finally:
        db.close()

@app.get("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    try:
        trips = db.query(Trip).all()
        return trips
    finally:
        db.close()

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
        return trip
    finally:
        db.close()

@app.put("/api/v1/trips/{trip_id}")
def update_trip_budget(trip_id: int, request: BudgetUpdateRequest):
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
        # recalculate based on new budget
        trip.budget       = request.budget
        trip.category     = get_trip_category(request.budget)
        trip.daily_budget = calculate_daily_budget(request.budget, trip.days)
        db.commit()
        db.refresh(trip)
        return trip
    finally:
        db.close()

@app.post("/api/v1/trips/{trip_id}/generate")
def generate_trip_recommendation(trip_id: int):
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
        trip.ai_recommendation = get_ai_recommendation(
            destination=trip.destination,
            days=trip.days,
            budget=trip.budget,
            travel_style=trip.category,
        )
        db.commit()
        db.refresh(trip)
        return trip
    finally:
        db.close()

@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int):
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
        db.delete(trip)
        db.commit()
        return {"message": f"Trip with id {trip_id} has been deleted"}
    finally:
        db.close()

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
