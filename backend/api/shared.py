from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import List

from core.database import get_db
from core.config import settings
from models.user import User
from models.document import Document
from models.shared_link import SharedLink
from schemas.shared_link import SharedLinkCreate, SharedLinkResponse, SharedStatsResponse
from api.deps import get_current_user
from core.activity import log_activity

router = APIRouter(prefix="/shared", tags=["Shared Links"])

def format_link_response(link: SharedLink, doc_title: str) -> dict:
    """Helper to build frontend-ready response object with dynamic status."""
    now = datetime.now(timezone.utc)
    # Ensure expires_at has UTC timezone for accurate comparison
    expires_at = link.expires_at.replace(tzinfo=timezone.utc) if link.expires_at.tzinfo is None else link.expires_at

    if now > expires_at:
        dynamic_status = "Expired"
    elif (expires_at - now).total_seconds() < 48 * 3600:
        dynamic_status = "Expiring"
    else:
        dynamic_status = "Active"

    return {
        "id": link.id,
        "document_id": link.document_id,
        "document_title": doc_title,
        "recipient_email": link.recipient_email,
        "permission": link.permission,
        "share_token": link.share_token,
        "expires_at": link.expires_at,
        "status": dynamic_status,
        "view_count": link.view_count,
        "created_at": link.created_at,
        "share_url": f"{settings.FRONTEND_URL}/shared/access/{link.share_token}"
    }

# 1. CREATE A NEW SHARE LINK
@router.post("/", response_model=SharedLinkResponse, status_code=status.HTTP_201_CREATED)
def create_share_link(
    payload: SharedLinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify the document belongs to this user
    doc = db.query(Document)\
        .filter(Document.id == payload.document_id, Document.user_id == current_user.id)\
        .first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or access denied")

    # Calculate expiration timestamp
    expires_at = datetime.now(timezone.utc) + timedelta(days=payload.expires_in_days)

    new_link = SharedLink(
        user_id=current_user.id,
        document_id=doc.id,
        recipient_email=payload.recipient_email,
        permission=payload.permission,
        expires_at=expires_at,
        status="Active"
    )

    db.add(new_link)
    db.commit()
    db.refresh(new_link)

    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="Share",
        category="Sharing",
        title=f"Shared {doc.title}",
        detail=f"Shared with {payload.recipient_email} • Expires in {payload.expires_in_days} days"
    )

    return format_link_response(new_link, doc.title)

# 2. LIST ALL SHARED LINKS FOR CURRENT USER
@router.get("/", response_model=List[SharedLinkResponse])
def list_shared_links(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    links = db.query(SharedLink, Document.title)\
        .join(Document, SharedLink.document_id == Document.id)\
        .filter(SharedLink.user_id == current_user.id)\
        .order_by(SharedLink.created_at.desc())\
        .all()

    return [format_link_response(link, title) for link, title in links]

# 3. GET STATS FOR THE 3 TOP CARDS
@router.get("/stats", response_model=SharedStatsResponse)
def get_shared_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    links = db.query(SharedLink).filter(SharedLink.user_id == current_user.id).all()

    active_count = 0
    expiring_soon_count = 0
    total_views = 0

    for link in links:
        total_views += link.view_count
        expires_at = link.expires_at.replace(tzinfo=timezone.utc) if link.expires_at.tzinfo is None else link.expires_at
        
        if now <= expires_at:
            active_count += 1
            if (expires_at - now).total_seconds() < 48 * 3600:
                expiring_soon_count += 1

    return {
        "active_links": active_count,
        "total_views": total_views,
        "expiring_soon": expiring_soon_count
    }

# 4. REVOKE / DELETE A SHARE LINK
@router.delete("/{link_id}")
def delete_share_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    link = db.query(SharedLink)\
        .filter(SharedLink.id == link_id, SharedLink.user_id == current_user.id)\
        .first()

    if not link:
        raise HTTPException(status_code=404, detail="Shared link not found")

    db.delete(link)
    db.commit()
    return {"message": "Shared link revoked successfully"}

# 5. PUBLIC ACCESS ENDPOINT (Recipient opens the link)
@router.get("/access/{share_token}")
def access_shared_document(
    share_token: str,
    db: Session = Depends(get_db)
):
    link = db.query(SharedLink).filter(SharedLink.share_token == share_token).first()
    if not link:
        raise HTTPException(status_code=404, detail="Invalid or expired share link")

    now = datetime.now(timezone.utc)
    expires_at = link.expires_at.replace(tzinfo=timezone.utc) if link.expires_at.tzinfo is None else link.expires_at
    if now > expires_at:
        raise HTTPException(status_code=410, detail="This share link has expired")

    # Increment view counter
    link.view_count += 1
    db.commit()

    log_activity(
        db=db,
        user_id=link.user_id,
        action_type="View",
        category="Sharing",
        title=f"Shared document viewed: {doc.title}",
        detail=f"Recipient viewed via secure link (Total views: {link.view_count})"
    )

    doc = db.query(Document).filter(Document.id == link.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Underlying document not found")

    return {
        "document_title": doc.title,
        "file_url": doc.file_url,
        "file_type": doc.file_type,
        "permission": link.permission,
        "expires_at": link.expires_at,
        "sha256_hash": doc.sha256_hash,
    }