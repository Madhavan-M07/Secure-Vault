from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# 1. Payload sent by Frontend when creating a new share link
class SharedLinkCreate(BaseModel):
    document_id: int
    recipient_email: EmailStr
    permission: str = "View only" # "View only" or "Download"
    expires_in_days: int = 7      # 1, 7, or 30 days

# 2. Response returned to Frontend for the table rows
class SharedLinkResponse(BaseModel):
    id: int
    document_id: int
    document_title: str
    recipient_email: str
    permission: str
    share_token: str
    expires_at: datetime
    status: str
    view_count: int
    created_at: datetime
    share_url: str

    class Config:
        from_attributes = True

# 3. Aggregated counts for the 3 top stat cards on /shared
class SharedStatsResponse(BaseModel):
    active_links: int
    total_views: int
    expiring_soon: int