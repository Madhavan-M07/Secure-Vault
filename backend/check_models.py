import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("\n--- ALL EMBEDDING MODELS FOR YOUR KEY ---")
for m in genai.list_models():
    if "embedContent" in m.supported_generation_methods:
        print(f"  + Embedding: {m.name}")

print("\n--- RECOMMENDED FLASH MODELS ---")
for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods and "flash" in m.name:
        print(f"  + Chat/OCR: {m.name}")
