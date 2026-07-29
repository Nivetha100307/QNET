import secrets
import pytest
from app.crypto.e91_retrieval import KeyRetrievalService
from app.crypto.hkdf_service import KeyDerivationService
from app.crypto.aes_gcm_engine import AESGCMEngine, CryptographicIntegrityError

def test_e91_quantum_key_retrieval():
    key_info = KeyRetrievalService.retrieve_raw_quantum_key("SUB_NORTH", "SUB_SOUTH")
    assert len(key_info["raw_key_bytes"]) == 32
    assert key_info["bell_score"] > 2.0  # CHSH Quantum Entanglement threshold
    assert key_info["channel_status"] == "ENTANGLED_SECURE"

def test_hkdf_key_derivation():
    raw_key = secrets.token_bytes(32)
    derived = KeyDerivationService.derive_aes_key(raw_key, context="SCADA_TEST_V1")
    assert len(derived["derived_key_bytes"]) == 32
    assert derived["key_length"] == 256

def test_aes_gcm_encryption_decryption():
    raw_key = secrets.token_bytes(32)
    derived = KeyDerivationService.derive_aes_key(raw_key)["derived_key_bytes"]
    
    payload = {"command_id": "CMD_99", "type": "OPEN_BREAKER", "device": "BRK_12"}
    enc = AESGCMEngine.encrypt_payload(payload, derived)
    
    assert "ciphertext_hex" in enc
    assert "nonce_hex" in enc
    assert "authentication_tag_hex" in enc

    decrypted = AESGCMEngine.decrypt_payload(
        ciphertext_hex=enc["ciphertext_hex"],
        nonce_hex=enc["nonce_hex"],
        auth_tag_hex=enc["authentication_tag_hex"],
        derived_key_bytes=derived
    )
    assert decrypted["command_id"] == "CMD_99"

def test_aes_gcm_tamper_rejection():
    raw_key = secrets.token_bytes(32)
    derived = KeyDerivationService.derive_aes_key(raw_key)["derived_key_bytes"]
    
    payload = {"command_id": "CMD_99", "type": "OPEN_BREAKER"}
    enc = AESGCMEngine.encrypt_payload(payload, derived)
    
    # Tamper with 1 byte of ciphertext
    ciphertext_tampered = enc["ciphertext_hex"][:-2] + ("00" if enc["ciphertext_hex"][-2:] != "00" else "FF")

    with pytest.raises(CryptographicIntegrityError):
        AESGCMEngine.decrypt_payload(
            ciphertext_hex=ciphertext_tampered,
            nonce_hex=enc["nonce_hex"],
            auth_tag_hex=enc["authentication_tag_hex"],
            derived_key_bytes=derived
        )
