from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class Document(Base):
    __tablename__ = "documents"

    # 1. Primary Key: Unique ID for this document record
    id = Column(Integer, primary_key=True, index=True)

    # 2. Strict User Isolation (Foreign Key):
    # Guarantees that every document belongs to ONE specific user.
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # 3. Document Details
    title = Column(String, nullable=False) # e.g. "10th Marksheet"
    category = Column(String, nullable=False, index=True) # e.g. "Academic", "Identity"

    # 4. Storage Metadata (Cloudinary)
    file_url = Column(String, nullable=False) # Secure HTTPS CDN URL
    public_id = Column(String, nullable=False) # Asset ID used if the user ever deletes it
    file_type = Column(String, nullable=False) # "application/pdf", "image/png"
    file_size_bytes = Column(BigInteger, nullable=False) # Exact bytes for the storage bar

    # 5. Security & Tamper-Proofing (SHA-256)
    # The cryptographic fingerprint calculated from the raw file bytes
    sha256_hash = Column(String, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)

    # 6. Audit Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship back to User
    owner = relationship("User", back_populates="documents")