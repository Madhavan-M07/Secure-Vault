import os
from pathlib import Path
from dotenv import load_dotenv

# 1. Base backend directory
BASE_DIR = Path(__file__).resolve().parent.parent

# 2. Load .env specifically from backend directory
load_dotenv(dotenv_path=BASE_DIR / ".env")

class Settings:
    # Database: Supports SQLite and Cloud PostgreSQL (Neon / Supabase)
    _raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./auth.db")
    if _raw_db_url.startswith("sqlite:///./"):
        _relative_file = _raw_db_url.replace("sqlite:///./", "")
        DATABASE_URL = f"sqlite:///{(BASE_DIR / _relative_file).as_posix()}"
    else:
        # SQLAlchemy 1.4+ / 2.0+ requires 'postgresql://' instead of legacy 'postgres://'
        if _raw_db_url.startswith("postgres://"):
            _raw_db_url = _raw_db_url.replace("postgres://", "postgresql://", 1)
        DATABASE_URL = _raw_db_url

    # App & Frontend URL
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # JWT Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default_secret_key_please_change")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # Cloudinary Cloud Storage
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")

settings = Settings()
