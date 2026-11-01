from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
                        
from core.database import get_db
from core.security import decode_access_token
from models.user import User

# 1. OAuth2 scheme: Tells FastAPI to look for "Authorization: Bearer <token>" in the header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Decodes the JWT token from the Authorization header,
    looks up the user in the database, and returns the User model.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode and verify the token signature and expiration
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception

    # Query the user from the database
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    # Security check: Ensure the account is not deactivated or banned
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )

    return user

def require_role(required_role: str):
    """
    Role-Based Access Control (RBAC) guard.
    Usage in routes: dependencies=[Depends(require_role("admin"))]
    """
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have enough permissions to perform this action"
            )
        return current_user
    return role_checker