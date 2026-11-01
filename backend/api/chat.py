import urllib.request
from datetime import datetime
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
            "created_at": (s.created_at.isoformat() + "Z") if s.created_at else None,
            "updated_at": (s.updated_at.isoformat() + "Z") if s.updated_at else None
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
            "created_at": (m.created_at.isoformat() + "Z") if m.created_at else None
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
    session.updated_at = datetime.utcnow()
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
    # 4. SSE Stream Generator with Multi-Model Quota Failover
    async def event_generator():
        full_content = []
        if ai_config.GEMINI_API_KEY:
            genai.configure(api_key=ai_config.GEMINI_API_KEY)

        # Multi-model cascade list (tries models in order if one hits 429 quota)
        candidate_models = [
            ai_config.GENERATIVE_MODEL,
            "models/gemini-flash-latest",
            "models/gemini-2.5-flash-lite",
            "models/gemini-flash-lite-latest",
            "models/gemini-2.5-flash"
        ]
        seen = set()
        models_to_try = [m for m in candidate_models if m and not (m in seen or seen.add(m))]

        stream_succeeded = False
        last_error = None

        for model_name in models_to_try:
            try:
                model = genai.GenerativeModel(model_name)
                gemini_stream = model.generate_content(prompt, stream=True)

                for chunk in gemini_stream:
                    token = ""
                    try:
                        token = chunk.text or ""
                    except Exception:
                        if hasattr(chunk, "candidates") and chunk.candidates:
                            first_cand = chunk.candidates[0]
                            if hasattr(first_cand, "content") and first_cand.content and first_cand.content.parts:
                                token = first_cand.content.parts[0].text or ""

                    if token:
                        full_content.append(token)
                        payload_data = {"type": "token", "token": token}
                        yield f"data: {json.dumps(payload_data)}\n\n"

                stream_succeeded = True
                break
            except Exception as e:
                print(f"[Model {model_name} failed]: {e}")
                last_error = e
                if full_content:
                    break
                continue

        # If all candidate models failed or quota was exhausted across all
        if not stream_succeeded and not full_content:
            print(f"[All Gemini Models Exhausted]: {last_error}")
            if doc_refs:
                doc_names = ", ".join([d["title"] for d in doc_refs])
                fallback_text = (
                    f"I found the following document(s) in your vault: **{doc_names}**.\n\n"
                    "*(Note: AI synthesis is temporarily operating in direct document mode.)*"
                )
            elif payload.message.lower().strip() in ["hi", "hello", "hey", "hy"]:
                fallback_text = (
                    "Hello! I am your **Vault Assistant**.\n\n"
                    "I am ready to help you locate, inspect, and manage your private documents in SecureVault. "
                    "Ask me about any document, such as *'Show my driving licence'* or *'Find my degree certificate'*."
                )
            else:
                fallback_text = (
                    "I searched your vault, but could not find any documents matching that query. "
                    "Try searching by file name or document category."
                )

            full_content.append(fallback_text)
            payload_data = {"type": "token", "token": fallback_text}
            yield f"data: {json.dumps(payload_data)}\n\n"

        # Save assistant message to DB after stream finishes
        complete_text = "".join(full_content) or "I have processed your request."
        try:
            asst_msg = ChatMessage(
                session_id=session.id,
                sender="assistant",
                content=complete_text,
                document_references=doc_refs,
                action_chips=action_chips
            )
            db.add(asst_msg)
            db.commit()
        except Exception as db_err:
            print(f"[Chat DB Save Error]: {db_err}")
            db.rollback()

        # Emit the final completion payload with Document Cards and Action Chips
        final_payload = {
            "type": "done",
            "session_id": session.id,
            "document_references": doc_refs,
            "action_chips": action_chips
        }
        yield f"data: {json.dumps(final_payload)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )