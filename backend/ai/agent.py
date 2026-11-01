import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
import google.generativeai as genai

from ai.config import ai_config
from ai.vector_store import search_user_vault
from models.user import User
from models.document import Document
from models.shared_link import SharedLink, generate_share_token
from models.chat import ChatSession, ChatMessage
from models.activity_log import ActivityLog

if ai_config.GEMINI_API_KEY:
    genai.configure(api_key=ai_config.GEMINI_API_KEY)


def execute_chat_turn(
    db: Session,
    user: User,
    user_message: str,
    session_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Main Agent execution loop:
    1. Manages or creates the ChatSession.
    2. Performs vector retrieval and metadata matching on authorized user documents.
    3. Handles automated actions (e.g. creating share links).
    4. Generates synthesized response with Gemini 1.5 Flash.
    5. Returns message text, interactive document cards, and follow-up action chips.
    """
    now = datetime.datetime.utcnow()

    # 1. Resolve or Create Chat Session
    if session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user.id
        ).first()
        if not session:
            session = ChatSession(user_id=user.id, title=user_message[:40].strip())
            db.add(session)
            db.flush()
    else:
        title = user_message[:40].strip() or "New Conversation"
        session = ChatSession(user_id=user.id, title=title)
        db.add(session)
        db.flush()

    # 2. Persist the User's Message
    user_msg_record = ChatMessage(
        session_id=session.id,
        sender="user",
        content=user_message,
        document_references=[],
        action_chips=[]
    )
    db.add(user_msg_record)
    db.commit()

    # 3. Retrieve Context from Vault (Vector Search + Title/Category Match)
    vector_results = search_user_vault(db=db, user_id=user.id, query=user_message, top_k=4)

    # Keyword/Title match fallback for direct searches (e.g. "Find my degree", "PAN card")
    direct_doc_matches = []
    tokens = [t.lower() for t in user_message.split() if len(t) > 3]
    if tokens:
        filters = [Document.title.ilike(f"%{tok}%") for tok in tokens]
        direct_doc_matches = db.query(Document).filter(
            Document.user_id == user.id,
            or_(*filters)
        ).limit(3).all()

    # Collect matched documents (deduplicated)
    matched_docs_dict = {}
    for d in direct_doc_matches:
        matched_docs_dict[d.id] = d
    for vr in vector_results:
        doc_id = vr["document_id"]
        if doc_id not in matched_docs_dict:
            doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == user.id).first()
            if doc:
                matched_docs_dict[doc_id] = doc

    # 4. Check for Automated Direct Actions (e.g. "Create share link for...")
    msg_lower = user_message.lower()
    created_share_link = None
    if "share" in msg_lower and any(kw in msg_lower for kw in ["link", "create", "generate"]):
        target_doc = next(iter(matched_docs_dict.values()), None)
        if target_doc:
            token = generate_share_token()
            expiry = now + datetime.timedelta(days=7)
            share_record = SharedLink(
                user_id=user.id,
                document_id=target_doc.id,
                recipient_email="anyone_with_link@securevault.io",
                permission="View only",
                share_token=token,
                expires_at=expiry,
                status="Active",
                view_count=0
            )
            db.add(share_record)
            db.commit()
            created_share_link = f"/shared/access/{token}"

    # 5. Build Context Payload for Gemini
    context_chunks = []
    for vr in vector_results:
        context_chunks.append(
            f'<vault_chunk doc="{vr["document_title"]}" page="{vr["page_number"]}">\n'
            f'{vr["content"]}\n'
            f'</vault_chunk>'
        )

    context_str = "\n\n".join(context_chunks) if context_chunks else "No specific text chunks found."
    known_docs_str = ", ".join([f"'{d.title}' ({d.category})" for d in matched_docs_dict.values()]) or "None"

    # 6. Generate Response via Gemini 1.5 Flash
    system_instruction = (
        "You are Vault Assistant, the intelligent, secure document AI helper for SecureVault. "
        "Your mission is to help the user find, inspect, summarize, and manage their private encrypted documents. "
        "\nRULES:\n"
        "1. Strictly answer based on the user's provided vault documents below. Do not fabricate information.\n"
        "2. If the user asks to find or locate a document (e.g., 'Find my degree certificate', 'Where is my resume?'), "
        "confirm clearly that you found it and reference its exact name.\n"
        "3. When answering questions about IDs, dates, numbers, or specific terms, state them accurately and cite the source file.\n"
        "4. If no relevant documents are found, politely state that you could not locate that file or information in their vault.\n"
        "5. Keep responses concise, professional, and friendly."
    )

    prompt = (
        f"{system_instruction}\n\n"
        f"USER DOCUMENTS MATCHED: {known_docs_str}\n\n"
        f"DOCUMENT VAULT CONTEXT:\n{context_str}\n\n"
        f"USER QUESTION: {user_message}\n\n"
        f"ASSISTANT RESPONSE:"
    )

    candidate_models = [
        ai_config.GENERATIVE_MODEL,
        "models/gemini-flash-latest",
        "models/gemini-2.5-flash-lite",
        "models/gemini-flash-lite-latest",
        "models/gemini-2.5-flash"
    ]
    seen = set()
    models_to_try = [m for m in candidate_models if m and not (m in seen or seen.add(m))]

    assistant_text = ""
    for model_name in models_to_try:
        try:
            model = genai.GenerativeModel(model_name)
            gemini_resp = model.generate_content(prompt)
            assistant_text = gemini_resp.text.strip()
            if assistant_text:
                break
        except Exception as e:
            print(f"[Agent Model {model_name} Error]: {e}")
            continue

    if not assistant_text:
        if matched_docs_dict:
            first_doc = next(iter(matched_docs_dict.values()))
            assistant_text = f"I found your document: **{first_doc.title}** in your {first_doc.category} vault."
        elif user_message.lower().strip() in ["hi", "hello", "hey", "hy"]:
            assistant_text = "Hello! I am your **Vault Assistant**. How can I help you with your documents today?"
        else:
            assistant_text = "I searched your vault but could not find any matching documents or details for that query."

    if created_share_link:
        assistant_text += f"\n\n🔗 **Secure Share Link Created:** `{created_share_link}` (Valid for 7 days)"

    # 7. Format Interactive Document Cards & Action Chips
    doc_references = []
    for doc in matched_docs_dict.values():
        doc_references.append({
            "id": doc.id,
            "title": doc.title,
            "category": doc.category,
            "file_size_bytes": doc.file_size_bytes,
            "file_url": doc.file_url,
            "created_at": doc.created_at.strftime("%b %d, %Y") if doc.created_at else "Recent"
        })

    # Dynamic follow-up action chips
    action_chips = []
    if doc_references:
        primary_cat = doc_references[0]["category"]
        action_chips.append(f"View all {primary_cat.lower()} documents")
        action_chips.append("Check document details")
        action_chips.append("Share this document")
    else:
        action_chips.append("List my identity documents")
        action_chips.append("Show all my documents")

    # 8. Persist Assistant Message
    assistant_msg_record = ChatMessage(
        session_id=session.id,
        sender="assistant",
        content=assistant_text,
        document_references=doc_references,
        action_chips=action_chips
    )
    db.add(assistant_msg_record)

    # Update session timestamp
    session.updated_at = now
    db.commit()

    # Log to audit trail
    activity = ActivityLog(
        user_id=user.id,
        action_type="ai_assistant",
        category="Security",
        title="AI Assistant Query",
        detail=f"Asked: {user_message[:50]}..."
    )
    db.add(activity)
    db.commit()

    return {
        "session_id": session.id,
        "session_title": session.title,
        "message": {
            "id": assistant_msg_record.id,
            "sender": "assistant",
            "content": assistant_text,
            "document_references": doc_references,
            "action_chips": action_chips,
            "created_at": assistant_msg_record.created_at.isoformat()
        }
    }