from pydantic import BaseModel
from typing import Optional
import datetime

class UserSettingsResponse(BaseModel):
    two_factor_enabled: bool
    email_notifications: bool
    security_alerts: bool
    language: str
    phone: Optional[str] = None
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class UserSettingsUpdate(BaseModel):
    two_factor_enabled: Optional[bool] = None
    email_notifications: Optional[bool] = None
    security_alerts: Optional[bool] = None
    language: Optional[str] = None
    phone: Optional[str] = None

