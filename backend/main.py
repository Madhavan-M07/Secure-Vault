from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.database import engine, Base
import models.user  # Ensures User model is registered with Base.metadata
from api.v1.auth import router as auth_router
import models.document
from api.documents import router as documents_router
import models.shared_link
from api.shared import router as shared_router
import models.activity_log
from api.activity import router as activity_router
import models.user_settings
from api.settings import router as settings_router
from api.admin import router as admin_router
from sqlalchemy import text
from core.database import engine, Base
import models.user
import models.document
import models.shared_link
import models.activity_log
import models.user_settings
import models.chat  # Registers document_chunks, chat_sessions, and chat_messages
from api.chat import router as chat_router

# 1. Enable pgvector extension and create all tables
with engine.connect() as conn:
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
    conn.commit()

# 1. Create the database tables on startup (if they don't exist yet)
Base.metadata.create_all(bind=engine)

# 2. Initialize FastAPI App
app = FastAPI(
    title="Security & Auth API",
    version="1.0.0",
    description="Production-grade Authentication and Authorization backend"
)

# 3. CORS Configuration
# Allows our future React frontend (e.g. Vite on port 5173 or React on port 3000)
# to safely make API requests to this backend without browser CORS errors.
from core.config import settings

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    settings.FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*(\.vercel\.app|\.onrender\.com)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Mount our Version 1 API routes
app.include_router(auth_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(shared_router, prefix="/api/v1")
app.include_router(activity_router, prefix="/api/v1")
app.include_router(settings_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")

# 5. Root Health Check Endpoint
@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Security & Auth API",
        "docs_url": "/docs"
    }