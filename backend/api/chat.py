import urllib.request
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.database import get_db
from api.deps import get_current_user
from models.user import User
from models.document import Document
from models.chat import ChatSession, ChatMessage, DocumentChunk
from ai.agent import execute_chat_turn
from ai.parsers import extract_text_from_pdf, extract_text_from_image, chunk_document_text
from ai.vector_store import index_document
import json
from fastapi.responses import StreamingResponse
import google.generativeai as genai
from ai.config import ai_config
from ai.vector_store import search_user_vault

router = APIRouter(
    prefix="/chat",
    tags=["AI Vault Assistant"]
)


class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[int] = None


@router.post("/message")
def send_chat_message(
    payload: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Sends a question/instruction to the Vault AI Agent."""
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        response = execute_chat_turn(
            db=db,
            user=current_user,
            user_message=payload.message.strip(),
            session_id=payload.session_id
        )
        return response
    except Exception as e:
        print(f"[Chat API Error]: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions")
def get_user_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists all chat threads for the logged-in user in chronological order."""
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.updated_at.desc()).all()

    return [
        {
            "id": s.id,
            "title": s.title,
            "created_at": s.created_at.isoformat(),
            "updated_at": s.updated_at.isoformat()
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}/messages")
def get_session_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Loads all messages in a specific conversation thread."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found.")

    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session.id
    ).order_by(ChatMessage.id.asc()).all()

    return [
        {
            "id": m.id,
            "sender": m.sender,
            "content": m.content,
            "document_references": m.document_references or [],
            "action_chips": m.action_chips or [],
            "created_at": m.created_at.isoformat()
        }
        for m in messages
    ]


@router.delete("/sessions/{session_id}")
def delete_chat_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletes a specific chat session."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found.")

    db.delete(session)
    db.commit()
    return {"message": "Chat session deleted successfully"}


@router.delete("/sessions")
def clear_all_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clears all conversation threads for the 'Clear All Chats' action."""
    db.query(ChatSession).filter(ChatSession.user_id == current_user.id).delete()
    db.commit()
    return {"message": "All chat history cleared."}


@router.get("/suggestions")
def get_chat_suggestions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dynamically generates suggested prompts based on the user's uploaded documents."""
    categories = db.query(Document.category).filter(
        Document.user_id == current_user.id
    ).distinct().all()
    cat_names = [c[0] for c in categories]

    suggestions = []
    if "Academic" in cat_names:
        suggestions.append("Find my degree certificate")
    if "Identity" in cat_names:
        suggestions.append("List my identity documents")
    if "Employment" in cat_names:
        suggestions.append("Download offer letter")
    if "Financial" in cat_names:
        suggestions.append("Show my financial documents")

    # Safe defaults
    if not suggestions:
        suggestions = [
            "What documents do I have?",
            "Find my ID cards",
            "Explain how Secure Vault encrypts my files",
            "Storage and security summary"
        ]

    return {"suggestions": suggestions[:4]}


@router.post("/index-all")
def index_all_user_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Scans the user's vault documents, extracts text (with OCR for images),
    and creates vector embeddings in Neon pgvector.
    """
    user_docs = db.query(Document).filter(Document.user_id == current_user.id).all()
    indexed_count = 0
    total_chunks = 0

    for doc in user_docs:
        try:
            # Download file bytes from Cloudinary URL
            req = urllib.request.Request(doc.file_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=15) as response:
                file_bytes = response.read()

            # Parse based on file type
            if "pdf" in doc.file_type.lower() or doc.file_url.lower().endswith(".pdf"):
                pages = extract_text_from_pdf(file_bytes)
            else:
                pages = extract_text_from_image(file_bytes, mime_type=doc.file_type)

            if pages:
                chunks = chunk_document_text(pages)
                if chunks:
                    c_count = index_document(db, doc.id, current_user.id, chunks)
                    total_chunks += c_count
                    indexed_count += 1
        except Exception as e:
            print(f"[Auto-Indexing Error for Doc #{doc.id}]: {e}")

    return {
        "status": "completed",
        "total_documents": len(user_docs),
        "indexed_documents": indexed_count,
        "total_chunks_created": total_chunks
    }

@router.post("/stream")
async def stream_chat_message(
    payload: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ChatGPT-style real-time token streaming using Server-Sent Events (SSE).
    """
    # 1. Resolve Session
    session = None
    if payload.session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == payload.session_id,
            ChatSession.user_id == current_user.id
        ).first()
    if not session:
        session = ChatSession(user_id=current_user.id, title=payload.message[:40].strip())
        db.add(session)
        db.commit()
    # 2. Persist User Message
    user_msg = ChatMessage(session_id=session.id, sender="user", content=payload.message)
    db.add(user_msg)
    db.commit()
    # 3. Vector Search Context (Isolated to user)
    vector_results = search_user_vault(db=db, user_id=current_user.id, query=payload.message, top_k=4)
    
    # Context Assembly
    context_str = "\n".join([f"- {vr['document_title']}: {vr['content']}" for vr in vector_results])
    prompt = (
        "You are Vault Assistant for SecureVault. Answer concisely based on the user's documents.\n"
        f"Context:\n{context_str}\n\n"
        f"User Question: {payload.message}\nAssistant:"
    )
    # 4. SSE Stream Generator
    async def event_generator():
        model = genai.GenerativeModel(ai_config.GENERATIVE_MODEL)
        gemini_stream = model.generate_content(prompt, stream=True)
        
        full_content = []
        # Stream each token to the frontend in real time
        for chunk in gemini_stream:
            token = chunk.text or ""
            full_content.append(token)
            yield f"data: {json.dumps({'type': 'token', 'token': token})}\n\n"
        # Format Document Cards from vector matches
        doc_refs = []
        for vr in vector_results:
            doc_refs.append({
                "id": vr["document_id"],
                "title": vr["document_title"],
                "category": vr["category"],
                "file_size_bytes": vr["file_size_bytes"],
                "file_url": vr["file_url"],
                "created_at": vr.get("created_at") or "Recent"
            })
        action_chips = ["Check document details", "Share this document"] if doc_refs else ["Find my documents"]
        # Save assistant message to DB after stream finishes
        complete_text = "".join(full_content)
        asst_msg = ChatMessage(
            session_id=session.id,
            sender="assistant",
            content=complete_text,
            document_references=doc_refs,
            action_chips=action_chips
        )
        db.add(asst_msg)
        db.commit()
        # Emit the final completion payload with Document Cards and Action Chips
        final_payload = {
            "type": "done",
            "session_id": session.id,
            "document_references": doc_refs,
            "action_chips": action_chips
        }
        yield f"data: {json.dumps(final_payload)}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")