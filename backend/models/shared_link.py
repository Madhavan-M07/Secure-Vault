from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import secrets
from core.database import Base

def generate_share_token():
    """Generates a secure, URL-safe 16-character random token for public access."""
    return secrets.token_urlsafe(16)

class SharedLink(Base):
    __tablename__ = "shared_links"

    # 1. Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # 2. Strict Tenant & Document isolation
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)

    # 3. Recipient Email & Permission Level
    recipient_email = Column(String, nullable=False, index=True)
    permission = Column(String, default="View only", nullable=False)  # "View only" or "Download"

    # 4. Cryptographic Public Token & Expiry
    share_token = Column(String, unique=True, default=generate_share_token, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    status = Column(String, default="Active", nullable=False)  # "Active", "Expiring", "Expired"

    # 5. Access Analytics
    view_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships back to Document and User
    document = relationship("Document")
    creator = relationship("User")