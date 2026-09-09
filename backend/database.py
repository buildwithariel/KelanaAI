from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# load .env so os.getenv() can read and load environment variable
load_dotenv()

# connection string from .env
DATABASE_URL = os.getenv("DATABASE_URL")

# engine = the connection pool.
# pool_pre_ping + pool_recycle keep it healthy when a managed Postgres (Neon,
# RDS, ...) closes idle connections between requests.
engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)

# SessionLocal = a factory for DB sessions
SessionLocal = sessionmaker(bind=engine, autoflush=False)

# Base = All ORM models inherit from this
Base = declarative_base()

# Create all tables

def init_db() -> None:
    """Create all SQLAlchemy tables for the configured database."""
    Base.metadata.create_all(bind=engine)