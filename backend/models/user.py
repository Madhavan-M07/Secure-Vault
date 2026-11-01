from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from core.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    # 1. Primary Key: Unique ID for every user
    id = Column(Integer, primary_key=True, index=True)

    # 2. Email: Must be unique so two people can't register with the same email
    email = Column(String, unique=True, index=True, nullable=False)

    # 3. Security: We store the bcrypt HASH, NEVER the plaintext password!
    hashed_password = Column(String, nullable=False)

    # 4. Authorization: Role-Based Access Control (RBAC) - e.g., "user" or "admin"
    role = Column(String, default="user", nullable=False)

    # 5. Account State: Soft disable compromised or banned users without deleting their data
    is_active = Column(Boolean, default=True, nullable=False)

    # 6. Audit Trail: When was this account created?
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    documents = relationship("Document", back_populates="owner", cascade="all, delete-orphan")