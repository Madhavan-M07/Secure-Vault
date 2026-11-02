from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import hash_password, verify_password, create_access_token
from models.user import User
from schemas.user import UserCreate, UserResponse, Token
from api.deps import get_current_user, require_role
from core.activity import log_activity

# Create the router with prefix and tags for automatic documentation
router = APIRouter(prefix="/auth", tags=["Authentication"])

# 1. REGISTER ENDPOINT
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user:
    - Validates email format
    - Ensures email is not already taken
    - Hashes password with bcrypt
    - Stores the user in the database
    """
    print("**********Inside the register function:******",user_in)
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )

    # Hash the password before saving
    hashed_pwd = hash_password(user_in.password)

    # Create new user record
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        role="user",       # Default role
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    log_activity(db, new_user.id, "Security", "Account Created", "Lifetime Document Vault initialized", "Security")

    # Issue access token immediately so the user doesn't need a redundant login round-trip
    token_data = {"sub": new_user.email, "role": new_user.role}
    access_token = create_access_token(data=token_data)
    new_user.access_token = access_token
    new_user.token_type = "bearer"

    return new_user

# 2. LOGIN ENDPOINT (Supports standard OAuth2 Form Login)
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Authenticates user and returns a signed JWT access token.
    FastAPI's OAuth2PasswordRequestForm expects:
    - username (which we use as email)
    - password
    """
    # Find user by email
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password against stored bcrypt hash
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check if account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    # Create the JWT token carrying user identity and role
    token_data = {"sub": user.email, "role": user.role}
    access_token = create_access_token(data=token_data)
    log_activity(db, user.id, "Security", "Account Login", "Successful web session authentication", "Security")

    return {"access_token": access_token, "token_type": "bearer"}

# 3. GET CURRENT LOGGED-IN USER (Protected Route)
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the profile of the currently logged-in user.
    Requires a valid JWT token in Authorization header.
    """
    return current_user

# 4. ADMIN-ONLY TEST ROUTE (RBAC Demonstration)
@router.get("/admin-only", dependencies=[Depends(require_role("admin"))])
def admin_only_dashboard(current_user: User = Depends(get_current_user)):
    """
    This endpoint can ONLY be accessed by users with role='admin'.
    Standard users will receive a 403 Forbidden.
    """
    return {
        "message": f"Welcome to the secret admin portal, {current_user.email}!",
        "system_status": "All systems operational"
    }