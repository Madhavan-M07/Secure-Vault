from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
import google.generativeai as genai

from ai.config import ai_config
from models.chat import DocumentChunk
from models.document import Document

# Configure Gemini Client
if ai_config.GEMINI_API_KEY:
    genai.configure(api_key=ai_config.GEMINI_API_KEY)


def get_embedding(text_content: str, task_type: str = "retrieval_document") -> List[float]:
    """
    Generates a 768-dimensional vector embedding for a given text snippet.
    task_type: 'retrieval_document' (for vault chunks) or 'retrieval_query' (for user questions).
    """
    if not ai_config.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured in backend/.env")

    try:
        kwargs = {
            "model": ai_config.EMBEDDING_MODEL,
            "content": text_content,
            "task_type": task_type,
        }
        try:
            response = genai.embed_content(**kwargs, output_dimensionality=ai_config.EMBEDDING_DIM)
        except Exception:
            response = genai.embed_content(**kwargs)

        vec = response['embedding']
        # Ensure exactly EMBEDDING_DIM (768) dimensions
        return vec[:ai_config.EMBEDDING_DIM]
    except Exception as e:
        print(f"[Embedding Error]: {e}")
        raise e


def index_document(
    db: Session,
    document_id: int,
    user_id: int,
    chunks: List[Dict[str, Any]]
) -> int:
    """
    Generates embeddings and inserts all chunks for a document into Neon PostgreSQL.
    Re-indexing a document first cleans up old chunks to prevent stale vectors.
    """
    if not chunks:
        return 0

    # 1. Clean up any existing chunks for this document
    db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document_id,
        DocumentChunk.user_id == user_id
    ).delete()
    db.commit()

    # 2. Embed each chunk and insert into database
    created_count = 0
    for c in chunks:
        content = c["content"]
        vec = get_embedding(content, task_type="retrieval_document")

        chunk_record = DocumentChunk(
            document_id=document_id,
            user_id=user_id,
            chunk_index=c["chunk_index"],
            page_number=c.get("page_number", 1),
            content=content,
            embedding=vec
        )
        db.add(chunk_record)
        created_count += 1

    db.commit()
    return created_count


def search_user_vault(
    db: Session,
    user_id: int,
    query: str,
    top_k: int = ai_config.TOP_K_CHUNKS,
    category_filter: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    STRICT MULTI-TENANT RETRIEVAL:
    Computes cosine distance using pgvector: DocumentChunk.embedding.cosine_distance(query_vector)
    Guarantees that user_id == current_user_id to prevent any cross-tenant leakage.
    """
    if not query.strip():
        return []

    # 1. Vectorize the search query (exactly 768 dimensions)
    query_vector = get_embedding(query, task_type="retrieval_query")

    # 2. Build the query with strict user_id filtering
    q = db.query(DocumentChunk, Document).join(
        Document, DocumentChunk.document_id == Document.id
    ).filter(
        DocumentChunk.user_id == user_id  # HARD TENANT SECURITY BOUNDARY
    )

    if category_filter and category_filter != "All Categories":
        q = q.filter(Document.category == category_filter)

    # 3. Order by pgvector cosine distance ascending (closest match first)
    cosine_distance = DocumentChunk.embedding.cosine_distance(query_vector)
    results = q.order_by(cosine_distance.asc()).limit(top_k).all()

    # 4. Format matching snippets with metadata for the Agent and Document Cards
    matches = []
    for chunk, doc in results:
        matches.append({
            "chunk_id": chunk.id,
            "document_id": doc.id,
            "document_title": doc.title,
            "category": doc.category,
            "page_number": chunk.page_number,
            "content": chunk.content,
            "file_url": doc.file_url,
            "file_type": doc.file_type,
            "file_size_bytes": doc.file_size_bytes,
            "created_at": doc.created_at.isoformat() if doc.created_at else None
        })

    return matches
