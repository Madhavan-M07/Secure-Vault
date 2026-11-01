from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from core.database import get_db
from core.storage import compute_sha256, upload_file_to_cloud, delete_file_from_cloud
from models.user import User
from models.document import Document
from models.shared_link import SharedLink
from schemas.document import DocumentResponse, DashboardStatsResponse, CategoriesSummaryResponse
from api.deps import get_current_user
from core.activity import log_activity

router = APIRouter(prefix="/documents", tags=["Documents & Vault"])

STORAGE_LIMIT_BYTES = 10 * 1024 * 1024 * 1024  # 10 GB in bytes

def format_bytes(size_bytes: int) -> str:
    """Helper to format raw bytes into human-readable strings (KB, MB, GB)"""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.2f} GB"

# 1. LIVE DASHBOARD STATS
@router.get("/dashboard-stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total count of documents for this user
    total_docs = db.query(Document).filter(Document.user_id == current_user.id).count()

    # Sum of bytes used by this user
    total_bytes = db.query(func.sum(Document.file_size_bytes))\
        .filter(Document.user_id == current_user.id)\
        .scalar() or 0

    percentage = round((total_bytes / STORAGE_LIMIT_BYTES) * 100, 2)

    return {
        "total_documents": total_docs,
        "storage_used_bytes": total_bytes,
        "storage_limit_bytes": STORAGE_LIMIT_BYTES,
        "storage_used_formatted": format_bytes(total_bytes),
        "storage_percentage": percentage,
        "shared_links_count": db.query(SharedLink).filter(SharedLink.user_id == current_user.id).count(),
        "encryption_status": "AES-256 & SHA-256 Active"
    }

# 2. LIVE CATEGORIES SUMMARY
@router.get("/categories-summary", response_model=CategoriesSummaryResponse)
def get_categories_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Standard 8 categories matching our UI
    all_categories = [
        "Academic", "Identity", "Financial", "Employment",
        "Personal", "Healthcare", "Property", "Others"
    ]

    # Query counts grouped by category
    results = db.query(Document.category, func.count(Document.id))\
        .filter(Document.user_id == current_user.id)\
        .group_by(Document.category)\
        .all()

    counts_dict = {cat: 0 for cat in all_categories}
    for cat_name, count in results:
        if cat_name in counts_dict:
            counts_dict[cat_name] = count
        else:
            counts_dict["Others"] += count

    return {"categories": counts_dict}

# 3. RECENT DOCUMENTS TABLE
@router.get("/recent", response_model=List[DocumentResponse])
def get_recent_documents(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    docs = db.query(Document)\
        .filter(Document.user_id == current_user.id)\
        .order_by(Document.created_at.desc())\
        .limit(limit)\
        .all()
    return docs

# 4. FULL DOCUMENTS LIST (With optional search & category filter)
@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Document).filter(Document.user_id == current_user.id)

    if category and category.upper() != "ALL":
        query = query.filter(Document.category.ilike(category))

    if search:
        query = query.filter(Document.title.ilike(f"%{search}%"))

    return query.order_by(Document.created_at.desc()).all()

# 5. UPLOAD DOCUMENT ENDPOINT
@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form("Academic"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Read raw file bytes into memory
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file cannot be empty")

    # 1. Calculate the SHA-256 digital fingerprint
    sha256_hash = compute_sha256(file_bytes)

    # 2. Upload directly to Cloudinary
    try:
        cloud_data = upload_file_to_cloud(
            file_bytes=file_bytes,
            filename=file.filename,
            user_id=current_user.id
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Cloud storage upload failed: {str(e)}"
        )

    # 3. Save metadata into Database
    new_doc = Document(
        user_id=current_user.id,
        title=title,
        category=category,
        file_url=cloud_data["file_url"],
        public_id=cloud_data["public_id"],
        file_type=file.content_type or "application/octet-stream",
        file_size_bytes=cloud_data["file_size_bytes"],
        sha256_hash=sha256_hash,
        is_verified=True
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="Upload",
        category="Documents",
        title=f"Uploaded {new_doc.title}",
        detail=f"{format_bytes(new_doc.file_size_bytes)} • {new_doc.category}"
    )

    return new_doc

# 6. DELETE DOCUMENT ENDPOINT
@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document)\
        .filter(Document.id == document_id, Document.user_id == current_user.id)\
        .first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete from Cloudinary
    delete_file_from_cloud(doc.public_id)

    # Delete from Database
    doc_title = doc.title
    doc_category = doc.category
    db.delete(doc)
    db.commit()

    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="Delete",
        category="Documents",
        title=f"Deleted {doc_title}",
        detail=f"Permanent deletion from vault • {doc_category}"
    )

    return {"message": "Document deleted successfully"}