from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models.trip import Trip
from models.user import User
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
from services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_owned_trip,
    CurrentUser,
)
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserOut

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

# The Next.js frontend runs on its own origin, so the browser needs permission
# to call this API from there.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/api/v1/auth/register", response_model=UserOut)
def register(request: RegisterRequest):
    if "@" not in request.email:
        raise HTTPException(status_code=400, detail="Invalid email")

    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == request.email).first() is not None:
            raise HTTPException(status_code=400, detail="Email already registered")
        user = User(
            name=request.name,
            email=request.email,
            hashed_password=hash_password(request.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()

@app.post("/api/v1/auth/login", response_model=TokenResponse)
def login(request: LoginRequest):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == request.email).first()
        if user is None or not verify_password(request.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        return TokenResponse(access_token=create_access_token(user.id))
    finally:
        db.close()

@app.get("/api/v1/auth/me", response_model=UserOut)
def me(current_user: CurrentUser = Depends(get_current_user)):
    return UserOut(id=current_user.id, name=current_user.name, email=current_user.email)

@app.post("/api/v1/trips")
def create_trips(request: TripRequest, current_user: CurrentUser = Depends(get_current_user)):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    trip_category = get_trip_category(request.budget)
    travel_season = get_travel_season(request.travel_month)
    reccomendation_transport = get_recommended_transportation(trip_category)

    trip = Trip(
        user_id                 =current_user.id,
        destination             =request.destination,
        days                    =request.days,
        budget                  =request.budget,
        category                =trip_category,
        daily_budget            =daily_budget,
        travel_season           =travel_season,
        reccomendation_transport=reccomendation_transport,
        travel_style            =request.travel_style
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
def list_trips(current_user: CurrentUser = Depends(get_current_user)):
    db = SessionLocal()
    try:
        trips = db.query(Trip).filter(Trip.user_id == current_user.id).all()
        return trips
    finally:
        db.close()

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int, current_user: CurrentUser = Depends(get_current_user)):
    db = SessionLocal()
    try:
        return get_owned_trip(trip_id, current_user.id, db)
    finally:
        db.close()

@app.put("/api/v1/trips/{trip_id}")
def update_trip_budget(
    trip_id: int,
    request: BudgetUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    db = SessionLocal()
    try:
        trip = get_owned_trip(trip_id, current_user.id, db)
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
def generate_trip_recommendation(
    trip_id: int, current_user: CurrentUser = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        trip = get_owned_trip(trip_id, current_user.id, db)
        trip.ai_recommendation = get_ai_recommendation(
            destination=trip.destination,
            days=trip.days,
            budget=trip.budget,
            travel_style=trip.travel_style or trip.category,
        )
        db.commit()
        db.refresh(trip)
        return trip
    finally:
        db.close()

@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int, current_user: CurrentUser = Depends(get_current_user)):
    db = SessionLocal()
    try:
        trip = get_owned_trip(trip_id, current_user.id, db)
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
