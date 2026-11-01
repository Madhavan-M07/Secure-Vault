import os
import sys
import urllib.request

# Ensure backend root is on path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy import text, inspect
from core.database import engine, SessionLocal, Base
import models.user
import models.document
import models.shared_link
import models.activity_log
import models.user_settings
import models.chat  # Registers document_chunks, chat_sessions, and chat_messages

from models.document import Document
from models.user import User
from models.chat import DocumentChunk
from ai.parsers import extract_text_from_pdf, extract_text_from_image, chunk_document_text
from ai.vector_store import index_document

def init_neon_tables_and_index():
    print("==================================================")
    print("1. ENABLING PGVECTOR & CREATING NEON TABLES")
    print("==================================================")
    
    with engine.connect() as conn:
        print("  -> Enabling vector extension...")
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        conn.commit()
    
    print("  -> Running Base.metadata.create_all()...")
    Base.metadata.create_all(bind=engine)
    
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"\n[SUCCESS] Neon Tables Verified:\n{tables}\n")
    
    print("  + Table 'document_chunks' is ready.")
    print("  + Table 'chat_sessions' is ready.")
    print("  + Table 'chat_messages' is ready.")

    print("\n==================================================")
    print("2. VECTORIZING & INDEXING EXISTING VAULT DOCUMENTS")
    print("==================================================")
    
    db = SessionLocal()
    try:
        docs = db.query(Document).all()
        print(f"Found {len(docs)} existing documents in Neon DB to vectorize:")
        
        total_indexed_docs = 0
        total_chunks_created = 0
        
        for d in docs:
            print(f"\n  Processing Document #{d.id}: '{d.title}' (User #{d.user_id}, {d.category})...")
            try:
                # 1. Download raw file from Cloudinary CDN
                req = urllib.request.Request(d.file_url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=15) as resp:
                    file_bytes = resp.read()
                
                # 2. Extract text (PDF vs Image)
                if "pdf" in d.file_type.lower() or d.file_url.lower().endswith(".pdf"):
                    pages = extract_text_from_pdf(file_bytes)
                else:
                    pages = extract_text_from_image(file_bytes, mime_type=d.file_type)
                
                # 3. Chunk and Vectorize
                if pages:
                    chunks = chunk_document_text(pages)
                    if chunks:
                        created = index_document(db, d.id, d.user_id, chunks)
                        total_chunks_created += created
                        total_indexed_docs += 1
                        print(f"    -> [DONE] Created {created} vector chunks in Neon!")
                    else:
                        print("    -> [WARN] No text chunks generated.")
                else:
                    print("    -> [WARN] No text could be extracted.")
            except Exception as e:
                db.rollback()
                print(f"    -> [ERROR] Failed to index doc #{d.id}: {e}")
        
        total_chunks_in_db = db.query(DocumentChunk).count()
        print("\n==================================================")
        print("3. FINAL VECTOR DB STATUS IN NEON")
        print("==================================================")
        print(f"  Total Indexed Documents: {total_indexed_docs}")
        print(f"  Total Vector Chunks in Neon DB: {total_chunks_in_db}")
        print("==================================================\n")
        
    finally:
        db.close()

if __name__ == "__main__":
    init_neon_tables_and_index()
