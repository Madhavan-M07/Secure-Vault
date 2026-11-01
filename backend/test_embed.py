import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

model_name = os.getenv("GEMINI_EMBEDDING_MODEL", "models/gemini-embedding-001")
print(f"Testing embedding with: {model_name}")

try:
    # Test with output_dimensionality=768
    res = genai.embed_content(
        model=model_name,
        content="Testing driver license number DL-094",
        output_dimensionality=768
    )
    vec = res["embedding"]
    print(f"[SUCCESS with output_dimensionality=768] Dimensions: {len(vec)}")
except Exception as e:
    print(f"[output_dimensionality failed]: {e}")
    # Test default
    res = genai.embed_content(
        model=model_name,
        content="Testing driver license number DL-094"
    )
    vec = res["embedding"]
    print(f"[Default Dimensions]: {len(vec)}")
