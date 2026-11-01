import hashlib
import cloudinary
import cloudinary.uploader
from core.config import settings

# 1. Initialize Cloudinary with our .env settings
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

# 2. Cryptographic Tamper-Proof Checksum (SHA-256)
def compute_sha256(file_bytes: bytes) -> str:
    """
    Computes an immutable SHA-256 hash of the uploaded document bytes.
    Even if 1 pixel or character in the PDF changes, the hash changes completely.
    """
    return hashlib.sha256(file_bytes).hexdigest()

# 3. Upload File to Cloudinary
def upload_file_to_cloud(file_bytes: bytes, filename: str, user_id: int) -> dict:
    """
    Uploads raw file bytes to Cloudinary in an isolated folder for the user.
    Supports PDFs, PNGs, and JPEGs (resource_type='auto').
    """
    response = cloudinary.uploader.upload(
        file_bytes,
        folder=f"vault/user_{user_id}",
        public_id=filename.rsplit(".", 1)[0],
        resource_type="auto",
        overwrite=True
    )

    return {
        "file_url": response.get("secure_url"),
        "public_id": response.get("public_id"),
        "file_size_bytes": response.get("bytes", len(file_bytes)),
    }

# 4. Delete File from Cloudinary
def delete_file_from_cloud(public_id: str, resource_type: str = "image") -> bool:
    """
    Deletes the asset from Cloudinary storage if the user deletes the document.
    """
    try:
        cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        return True
    except Exception:
        return False