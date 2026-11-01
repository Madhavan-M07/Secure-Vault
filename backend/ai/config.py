import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

class AIConfig:
    # 1. Google Gemini API Key
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    
    # 2. Dynamic Models from Environment (with verified defaults for project key)
    GENERATIVE_MODEL = os.getenv("GEMINI_GENERATIVE_MODEL", "models/gemini-2.5-flash")
    EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "models/gemini-embedding-001")
    EMBEDDING_DIM = int(os.getenv("GEMINI_EMBEDDING_DIM", "768"))
    
    # 3. Semantic Chunking Parameters
    CHUNK_SIZE_CHARS = 500       # Dense chunking for identity cards & documents
    CHUNK_OVERLAP_CHARS = 100    # Preserves sentence continuity across chunks
    
    # 4. RAG Retrieval Parameters
    TOP_K_CHUNKS = 4             # Retrieve top 4 most relevant chunks
    SIMILARITY_THRESHOLD = 0.55  # Minimum cosine similarity score to qualify as match

ai_config = AIConfig()
