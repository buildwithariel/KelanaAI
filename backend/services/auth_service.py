import os
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from database import SessionLocal
from models.trip import Trip
from models.user import User

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# auto_error=False so a missing header raises our own 401, not a bare 403 —
# 401 (not authenticated) and 403 (authenticated but not allowed) mean
# different things and callers rely on that distinction.
security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_access_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

@dataclass(frozen=True)
class CurrentUser:
    id: int
    email: str
    name: str | None

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> CurrentUser:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    db = SessionLocal()
    try:
        row = db.query(User.id, User.email, User.name).filter(User.id == user_id).first()
    finally:
        db.close()

    if row is None:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return CurrentUser(id=row.id, email=row.email, name=row.name)

def get_owned_trip(trip_id: int, current_user_id: int, db: Session) -> Trip:
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    if trip.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="You don't have access to this trip")
    return trip


# ── Auth operations ───────────────────────────────────────────────────────────
# Keep the register/login logic here in the service layer; main.py just wires
# the HTTP endpoints to these. The caller owns the DB session lifecycle.

def register_user(db: Session, name: str, email: str, password: str) -> User:
    """Create and persist a new user. Raises ValueError if the email is taken."""
    if db.query(User).filter(User.email == email).first() is not None:
        raise ValueError("Email already registered")

    user = User(
        name=name,
        email=email,
        hashed_password=hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, email: str, password: str) -> dict:
    """Validate credentials and return a bearer-token response.

    Returns {"access_token": "...", "token_type": "bearer"}.
    Raises ValueError on a bad email or wrong password.
    """
    user = db.query(User).filter(User.email == email).first()
    if user is None or not verify_password(password, user.hashed_password):
        raise ValueError("Invalid email or password")

    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
    }
