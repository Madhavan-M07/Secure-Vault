import io
import re
from typing import List, Dict, Any, Tuple
import pypdf
import google.generativeai as genai
from ai.config import ai_config

# Configure Gemini API client
if ai_config.GEMINI_API_KEY:
    genai.configure(api_key=ai_config.GEMINI_API_KEY)


def extract_text_from_pdf(file_bytes: bytes) -> List[Tuple[int, str]]:
    """
    Extracts text page-by-page from a PDF file.
    Returns: List of tuples: [(page_number, text_content), ...]
    """
    pages = []
    try:
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        for page_idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            clean_text = clean_extracted_text(text)
            if clean_text:
                pages.append((page_idx + 1, clean_text))
    except Exception as e:
        print(f"[PDF Extraction Error]: {e}")
    return pages


def extract_text_from_image(file_bytes: bytes, mime_type: str = "image/jpeg") -> List[Tuple[int, str]]:
    """
    Uses Gemini 1.5 Flash Multimodal Vision to extract text from photos/scans (e.g. License, Passport, ID).
    Returns: Single-page tuple [(1, text_content)]
    """
    try:
        model = genai.GenerativeModel(ai_config.GENERATIVE_MODEL)
        prompt = (
            "You are an expert Document OCR assistant. "
            "Extract all text, labels, numbers, dates, IDs, and key-value fields from this document image. "
            "Preserve spelling and layout as accurately as possible. Return only the extracted text."
        )
        response = model.generate_content([
            prompt,
            {"mime_type": mime_type, "data": file_bytes}
        ])
        clean_text = clean_extracted_text(response.text or "")
        return [(1, clean_text)] if clean_text else []
    except Exception as e:
        print(f"[Image OCR Error]: {e}")
        return []


def clean_extracted_text(text: str) -> str:
    """Removes excessive whitespace and linebreaks."""
    if not text:
        return ""
    # Replace multiple newlines with single newline
    text = re.sub(r'\n\s*\n', '\n', text)
    # Replace multiple spaces with single space
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()


def chunk_document_text(
    pages_content: List[Tuple[int, str]],
    chunk_size: int = ai_config.CHUNK_SIZE_CHARS,
    overlap: int = ai_config.CHUNK_OVERLAP_CHARS
) -> List[Dict[str, Any]]:
    """
    Slices extracted document pages into semantic chunks with overlap.
    Returns: List of dicts ready for embedding:
      [{ "chunk_index": 0, "page_number": 1, "content": "..." }, ...]
    """
    chunks = []
    global_chunk_idx = 0

    for page_num, page_text in pages_content:
        if not page_text:
            continue

        # If page is small enough, store it as a single chunk
        if len(page_text) <= chunk_size:
            chunks.append({
                "chunk_index": global_chunk_idx,
                "page_number": page_num,
                "content": page_text
            })
            global_chunk_idx += 1
            continue

        # Sliding window recursive chunker
        start = 0
        while start < len(page_text):
            end = start + chunk_size
            
            # If not at the end of the text, look for a sentence or newline boundary
            if end < len(page_text):
                # Try finding a period, exclamation, or newline within the last 80 chars of the window
                boundary = -1
                for punct in ["\n", ". ", "? ", "! "]:
                    found = page_text.rfind(punct, start + chunk_size - 80, end)
                    if found != -1 and found > boundary:
                        boundary = found + len(punct)
                
                if boundary != -1:
                    end = boundary

            chunk_text = page_text[start:end].strip()
            if len(chunk_text) > 30:  # Ignore tiny stray noise
                chunks.append({
                    "chunk_index": global_chunk_idx,
                    "page_number": page_num,
                    "content": chunk_text
                })
                global_chunk_idx += 1

            # Move forward by chunk_size - overlap
            step = max(end - start - overlap, 50)
            start += step

    return chunks