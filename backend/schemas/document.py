from pydantic import BaseModel
from datetime import datetime
from typing import Dict

# 1. Base Document Properties
class DocumentBase(BaseModel):
    title: str
    category: str

# 2. Document Response: What the API sends back to the frontend
class DocumentResponse(DocumentBase):
    id: int
    user_id: int
    file_url: str
    file_type: str
    file_size_bytes: int
    sha256_hash: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

# 3. Live Dashboard Stats: Powers the 4 stat cards & sidebar storage meter
class DashboardStatsResponse(BaseModel):
    total_documents: int
    storage_used_bytes: int
    storage_limit_bytes: int # 10 GB = 10,737,418,240 bytes
    storage_used_formatted: str # e.g. "2.4 GB" or "450 KB"
    storage_percentage: float # e.g. 24.0 %
    shared_links_count: int
    encryption_status: str

# 4. Live Categories Summary: Powers the 8 category cards
class CategoriesSummaryResponse(BaseModel):
    categories: Dict[str, int] # e.g. {"Academic": 3, "Identity": 1, ...}