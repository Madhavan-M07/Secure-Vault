from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import datetime

from core.database import get_db
from models.user import User
from models.activity_log import ActivityLog
from schemas.activity_log import ActivityLogResponse, ActivityStatsResponse
from api.deps import get_current_user

router = APIRouter(prefix="/activity", tags=["Activity & Audit Logs"])

@router.get("/stats", response_model=ActivityStatsResponse)
def get_activity_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.datetime.utcnow()
    start_of_today = datetime.datetime(now.year, now.month, now.day)

    # 1. Events today
    events_today = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.created_at >= start_of_today
    ).count()

    # 2. Total uploads
    uploads = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.action_type == "Upload"
    ).count()

    # 3. Total shares
    shares = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.action_type == "Share"
    ).count()

    # 4. Security events
    security_events = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.category == "Security"
    ).count()

    return {
        "events_today": events_today,
        "uploads": uploads,
        "shares": shares,
        "security_events": security_events
    }

@router.get("/", response_model=List[ActivityLogResponse])
def get_activities(
    category: Optional[str] = Query(None, description="Filter by category: Documents, Sharing, Security"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ActivityLog).filter(ActivityLog.user_id == current_user.id)
    if category and category != "All Activity":
        query = query.filter(ActivityLog.category == category)
    
    return query.order_by(ActivityLog.created_at.desc()).limit(100).all()

