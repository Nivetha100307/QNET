import json
import secrets
from typing import Dict, Any, Tuple
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.config import settings

class CryptographicIntegrityError(Exception):
    """Raised when AES-GCM tag verification or tampering check fails."""
    pass

class AESGCMEngine:
    """
    Components 7, 8 & 14: Encryption, Integrity & Decryption Engine
    Implements AES-256-GCM authenticated encryption and decryption for SCADA payloads.
    Guarantees confidentiality, integrity, and authenticity.
    """

    @staticmethod
    def encrypt_payload(
        payload: dict,
        derived_key_bytes: bytes,
        aad_header: bytes = None
    ) -> Dict[str, Any]:
        """
        Encrypts SCADA payload dictionary using AES-256-GCM.
        Generates unique 96-bit random nonce and 128-bit authentication tag.
        """
        if len(derived_key_bytes) != 32:
            raise ValueError("AES-256 key must be exactly 32 bytes (256 bits).")

        aesgcm = AESGCM(derived_key_bytes)
        nonce = secrets.token_bytes(settings.GCM_NONCE_BYTES) # 12 bytes = 96 bits
        
        plaintext_bytes = json.dumps(payload).encode("utf-8")
        
        # AESGCM.encrypt appends 16-byte tag to the ciphertext
        ciphertext_and_tag = aesgcm.encrypt(nonce, plaintext_bytes, aad_header)
        
        # Separate ciphertext and 16-byte authentication tag
        ciphertext = ciphertext_and_tag[:-16]
        auth_tag = ciphertext_and_tag[-16:]
        
        return {
            "algorithm": "AES-256-GCM",
            "nonce_hex": nonce.hex(),
            "authentication_tag_hex": auth_tag.hex(),
            "ciphertext_hex": ciphertext.hex(),
            "key_length_bits": 256,
            "nonce_bytes": nonce,
            "tag_bytes": auth_tag,
            "ciphertext_bytes": ciphertext
        }

    @staticmethod
    def decrypt_payload(
        ciphertext_hex: str,
        nonce_hex: str,
        auth_tag_hex: str,
        derived_key_bytes: bytes,
        aad_header: bytes = None
    ) -> dict:
        """
        Decrypts ciphertext using AES-256-GCM and verifies authentication tag integrity.
        Raises CryptographicIntegrityError if tag fails or payload was modified/tampered.
        """
        if len(derived_key_bytes) != 32:
            raise ValueError("AES-256 key must be exactly 32 bytes (256 bits).")

        try:
            ciphertext = bytes.fromhex(ciphertext_hex)
            nonce = bytes.fromhex(nonce_hex)
            auth_tag = bytes.fromhex(auth_tag_hex)
            
            # Combine ciphertext and tag for PyCA AESGCM API
            ciphertext_and_tag = ciphertext + auth_tag
            
            aesgcm = AESGCM(derived_key_bytes)
            decrypted_bytes = aesgcm.decrypt(nonce, ciphertext_and_tag, aad_header)
            
            payload = json.loads(decrypted_bytes.decode("utf-8"))
            return payload
        except Exception as e:
            raise CryptographicIntegrityError(f"AES-GCM Authenticated Decryption Failed: Tampering or Tag Mismatch! Details: {str(e)}")
