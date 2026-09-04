from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from models.trip import Trip
from models.user import User
from database import SessionLocal, init_db

from services.conversation_service import (
    create_conversation,
    list_conversations,
    get_owned_conversation,
    list_messages,
    send_message,
)

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
from services.kb_service import ask_knowledge_base
from services.auth_service import (
    register_user,
    login_user,
    get_current_user,
    get_owned_trip,
    CurrentUser,
)


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def email_looks_valid(cls, v: str) -> str:
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address")
        return v.strip().lower()


class LoginRequest(BaseModel):
    email: str
    password: str


class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    currency: str
    travel_month: str
    travel_style: str

class BudgetUpdateRequest(BaseModel):
    budget: float

class QuestionRequest(BaseModel):
    question: str

class ConversationCreateRequest(BaseModel):
    title: str | None = None

class MessageRequest(BaseModel):
    content: str

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

@app.post("/api/v1/auth/register", status_code=201)
def register(request: RegisterRequest):
    db = SessionLocal()
    try:
        user = register_user(db, request.name, request.email, request.password)
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at,
        }
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    finally:
        db.close()

@app.post("/api/v1/auth/login")
def login(request: LoginRequest):
    db = SessionLocal()
    try:
        return login_user(db, request.email, request.password)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))
    finally:
        db.close()

@app.get("/api/v1/auth/me")
def me(current_user: CurrentUser = Depends(get_current_user)):
    db = SessionLocal()
    try:
        total_trips = db.query(Trip).filter(Trip.user_id == current_user.id).count()
    finally:
        db.close()
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "total_trips": total_trips,
    }

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

@app.post("/api/v1/assistant")
@app.post("/api/v1/ask")
def ask_assistant(
    request: QuestionRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Session 9 — RAG travel assistant.

    Sends the question to the Amazon Bedrock Knowledge Base, which retrieves
    relevant passages from the synced travel documents and generates a grounded
    answer. Returns the answer plus the source document names.

    Registered at two paths (`/assistant` and `/ask`) — the session 9 slides use
    both names.
    """
    result = ask_knowledge_base(request.question)
    return {
        "question": request.question,
        "answer": result["answer"],
        "sources": result["sources"],
        "grounded": result["grounded"],
    }

@app.post("/api/v1/conversations", status_code=201)
def create_conversation_endpoint(
    request: ConversationCreateRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Session 10 — start a new conversation. Its title fills in from the first message."""
    db = SessionLocal()
    try:
        conversation = create_conversation(db, current_user.id, request.title)
        return {"conversation_id": conversation.id}
    finally:
        db.close()

@app.get("/api/v1/conversations")
def list_conversations_endpoint(current_user: CurrentUser = Depends(get_current_user)):
    """List this user's conversations, most recent first."""
    db = SessionLocal()
    try:
        return list_conversations(db, current_user.id)
    finally:
        db.close()

@app.get("/api/v1/conversations/{conversation_id}/messages")
def list_conversation_messages(
    conversation_id: int, current_user: CurrentUser = Depends(get_current_user)
):
    """Reload a conversation's history — used to resume it (PDF Part 7)."""
    db = SessionLocal()
    try:
        get_owned_conversation(conversation_id, current_user.id, db)
        return list_messages(db, conversation_id)
    finally:
        db.close()

@app.post("/api/v1/conversations/{conversation_id}/messages")
def send_conversation_message(
    conversation_id: int,
    request: MessageRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Session 10 — the send-message orchestration: save the user's turn, rebuild
    the prompt from the full stored history, call Bedrock, save + return the
    AI's context-aware reply.
    """
    db = SessionLocal()
    try:
        conversation = get_owned_conversation(conversation_id, current_user.id, db)
        return send_message(db, conversation, request.content)
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
