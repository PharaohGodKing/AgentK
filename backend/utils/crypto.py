import hashlib
import hmac
import base64
from cryptography.fernet import Fernet
from passlib.context import CryptContext
from backend.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Encryption key (in production, this should be securely stored and rotated)
# For now, we derive it from the secret key
def _get_encryption_key() -> bytes:
    """Get encryption key from secret key"""
    secret_key = settings.SECRET_KEY.encode()
    # Use SHA256 to get a 32-byte key suitable for Fernet
    return hashlib.sha256(secret_key).digest()

def encrypt_data(data: str) -> str:
    """Encrypt data using Fernet encryption"""
    fernet = Fernet(base64.urlsafe_b64encode(_get_encryption_key()))
    encrypted_data = fernet.encrypt(data.encode())
    return base64.urlsafe_b64encode(encrypted_data).decode()

def decrypt_data(encrypted_data: str) -> str:
    """Decrypt data using Fernet encryption"""
    fernet = Fernet(base64.urlsafe_b64encode(_get_encryption_key()))
    decoded_data = base64.urlsafe_b64decode(encrypted_data.encode())
    decrypted_data = fernet.decrypt(decoded_data)
    return decrypted_data.decode()

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)

def generate_hmac_signature(data: str, key: str) -> str:
    """Generate HMAC signature for data verification"""
    return hmac.new(
        key.encode(), 
        data.encode(), 
        hashlib.sha256
    ).hexdigest()