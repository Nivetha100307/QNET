import secrets
from typing import Dict, Any
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from app.config import settings

class KeyDerivationService:
    """
    Component 6: Key Derivation Service
    Derives cryptographically secure AES-256 keys from raw quantum keys using HKDF-SHA256.
    Ensures raw quantum key entropy is properly extracted and expanded for SCADA symmetric encryption.
    """
    
    @staticmethod
    def derive_aes_key(
        raw_key_bytes: bytes,
        salt: bytes = None,
        context: str = "SCADA_SESSION_KEY_V1",
        length: int = 32
    ) -> Dict[str, Any]:
        """
        Derives an AES-256 session key from raw quantum key material using HKDF-SHA256.
        """
        if salt is None:
            salt = settings.HKDF_SALT
            
        hkdf = HKDF(
            algorithm=hashes.SHA256(),
            length=length,
            salt=salt,
            info=context.encode("utf-8")
        )
        
        derived_key_bytes = hkdf.derive(raw_key_bytes)
        
        return {
            "salt_hex": salt.hex(),
            "context": context,
            "key_length": length * 8, # in bits (256)
            "derived_key_bytes": derived_key_bytes,
            "derived_key_hex": derived_key_bytes.hex(),
            "version": "1.0"
        }
