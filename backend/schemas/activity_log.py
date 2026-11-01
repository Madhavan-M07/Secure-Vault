from pydantic import BaseModel
from typing import List, Optional
import datetime

class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    action_type: str
    category: str
    title: str
    detail: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ActivityGroupedResponse(BaseModel):
    time: str
    title: str
    detail: Optional[str] = None
    type: str
    category: str
    timestamp: datetime.datetime

class ActivityStatsResponse(BaseModel):
    events_today: int
    uploads: int
    shares: int
    security_events: int

