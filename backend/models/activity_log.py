import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from core.database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Action type: 'Upload', 'Share', 'Security', 'Delete', 'View', 'Update'
    action_type = Column(String(50), nullable=False)
    
    # Category matches the UI filter pills: 'Documents', 'Sharing', 'Security'
    category = Column(String(50), nullable=False, default="Documents")
    
    # Event title: e.g. "Uploaded Passport.pdf"
    title = Column(String(255), nullable=False)
    
    # Additional context: e.g. "1.2 MB • Identity" or "Share link created • Expires in 48h"
    detail = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)

    # Relationship back to User
    user = relationship("User", backref="activities")

