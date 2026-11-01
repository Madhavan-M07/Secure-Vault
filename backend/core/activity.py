from sqlalchemy.orm import Session
from models.activity_log import ActivityLog

def log_activity(
    db: Session,
    user_id: int,
    action_type: str,
    title: str,
    detail: str = None,
    category: str = "Documents"
) -> ActivityLog:
    """
    Helper function to record user activity and audit events into SQLite.
    action_type: 'Upload', 'Share', 'Security', 'Delete', 'View', 'Update'
    category: 'Documents', 'Sharing', 'Security'
    """
    activity = ActivityLog(
        user_id=user_id,
        action_type=action_type,
        category=category,
        title=title,
        detail=detail
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

