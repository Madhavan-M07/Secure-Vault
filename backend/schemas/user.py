from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# 1. Base Schema: Shared properties
class UserBase(BaseModel):
    email: EmailStr

# 2. Registration Request: What the client sends when registering
# Notice: Includes the raw password from the user
class UserCreate(UserBase):
    password: str

# 3. Login Request: What the client sends when logging in
class UserLogin(UserBase):
    password: str

# 4. API Response: What the API sends back to the frontend
# CRITICAL SECURITY RULE: Notice "password" and "hashed_password" are NOT here!
class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"

    class Config:
        from_attributes = True  # Allows Pydantic to read SQLAlchemy model objects

# 5. Token Response: Returned when a user logs in successfully
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# 6. Token Payload: The internal claims decoded from inside the JWT
class TokenPayload(BaseModel):
    sub: Optional[str] = None  # Subject (holds user's email)
    role: Optional[str] = None # User's permission role