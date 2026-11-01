from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import datetime

from core.database import get_db
from models.user import User
from models.user_settings import UserSettings
from schemas.user_settings import UserSettingsResponse, UserSettingsUpdate
from api.deps import get_current_user
from core.activity import log_activity

router = APIRouter(prefix="/settings", tags=["User Settings & Preferences"])

def get_or_create_settings(db: Session, user_id: int) -> UserSettings:
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        settings = UserSettings(
            user_id=user_id,
            two_factor_enabled=True,
            email_notifications=True,
            security_alerts=True,
            language="English",
            phone=None
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.get("/", response_model=UserSettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch current user preferences and security settings."""
    return get_or_create_settings(db, current_user.id)

@router.put("/", response_model=UserSettingsResponse)
def update_settings(
    payload: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update settings and log changes in the audit ledger."""
    settings = get_or_create_settings(db, current_user.id)

    changed_fields = []
    if payload.two_factor_enabled is not None and payload.two_factor_enabled != settings.two_factor_enabled:
        settings.two_factor_enabled = payload.two_factor_enabled
        changed_fields.append(f"2FA {'Enabled' if payload.two_factor_enabled else 'Disabled'}")

    if payload.email_notifications is not None and payload.email_notifications != settings.email_notifications:
        settings.email_notifications = payload.email_notifications
        changed_fields.append(f"Email notifications {'enabled' if payload.email_notifications else 'disabled'}")

    if payload.security_alerts is not None and payload.security_alerts != settings.security_alerts:
        settings.security_alerts = payload.security_alerts
        changed_fields.append(f"Security alerts {'enabled' if payload.security_alerts else 'disabled'}")

    if payload.language is not None and payload.language != settings.language:
        settings.language = payload.language
        changed_fields.append(f"Language set to {payload.language}")

    if payload.phone is not None and payload.phone != settings.phone:
        settings.phone = payload.phone
        changed_fields.append("Phone number updated")

    settings.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(settings)

    if changed_fields:
        log_activity(
            db=db,
            user_id=current_user.id,
            action_type="Update",
            category="Security",
            title="Updated Account Preferences",
            detail=", ".join(changed_fields)
        )

    return settings

