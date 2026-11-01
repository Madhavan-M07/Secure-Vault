import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from core.config import settings

# 1. Secure Password Hashing
def hash_password(password: str) -> str:
    """
    Hashes a raw password using bcrypt with an automatically generated salt.
    Never store plaintext passwords in the database!
    """
    # bcrypt requires raw bytes, so we encode to utf-8
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")

# 2. Password Verification
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies that a plain text password matches the stored bcrypt hash.
    Constant-time comparison protects against timing attacks.
    """
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )

# 3. Create Signed JWT Access Token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a cryptographically signed JWT token with an expiration time.
    """
    to_encode = data.copy()

    # Calculate expiration time (UTC)
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # "exp" is the standard JWT expiration claim
    to_encode.update({"exp": expire})

    # Sign the token using our SECRET_KEY from .env
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

# 4. Decode & Verify Token
def decode_access_token(token: str) -> Optional[dict]:
    """
    Decodes the JWT token and verifies its cryptographic signature and expiration.
    Returns None if the token has been tampered with or has expired.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None