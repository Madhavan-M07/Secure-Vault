from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from core.config import settings

# Read cleanly from our environment settings
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Connect args (needed for SQLite concurrency)
connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

# Production-grade resilient connection pool
engine_kwargs = {
    "connect_args": connect_args,
    "pool_pre_ping": True,  # Automatically tests connection health before executing; auto-reconnects if dropped!
}

# Apply connection pool recycling for PostgreSQL (Neon/Supabase/Cloud)
if "sqlite" not in SQLALCHEMY_DATABASE_URL:
    engine_kwargs.update({
        "pool_recycle": 300,  # Recycles connections every 5 min before cloud providers drop them
        "pool_size": 10,
        "max_overflow": 20,
    })

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()