"""Unit tests for the AES-GCM AESService and authenticated encryption."""

from Crypto.Random import get_random_bytes
import pytest

from app.infrastructure.crypto.aes_service import AESService, EncryptedMessage
from app.quantum.e91.shared_secret_key import SharedSecretKeyGenerator


def test_encryption_and_decryption_success():
    key_bytes = get_random_bytes(32)  # 256-bit key
    service = AESService(key_bytes)

    plaintext = "Quantum Entanglement Secret Payload 2026!"
    encrypted = service.encrypt(plaintext)

    assert isinstance(encrypted, EncryptedMessage)
    assert encrypted.algorithm == "AES-256-GCM"
    assert encrypted.key_size == 256
    assert len(encrypted.nonce) == 12
    assert len(encrypted.authentication_tag) == 16
    assert encrypted.ciphertext != plaintext.encode("utf-8")

    decrypted_str = service.decrypt_to_string(encrypted)
    assert decrypted_str == plaintext


@pytest.mark.parametrize("key_size_bytes", [16, 24, 32])
def test_aes_key_sizes_support(key_size_bytes):
    key = get_random_bytes(key_size_bytes)
    service = AESService(key)

    expected_bits = key_size_bytes * 8
    assert service.key_size == expected_bits
    assert service.algorithm == f"AES-{expected_bits}-GCM"

    msg = service.encrypt("Test payload for multi-key-size")
    decrypted = service.decrypt_to_string(msg)
    assert decrypted == "Test payload for multi-key-size"


def test_shared_secret_key_integration():
    bits = [1, 0, 1, 1, 0, 0, 1, 0] * 2  # 16 bits = 2 bytes (16-byte key if repeated 16 times)
    bits_128 = [1, 0] * 64  # 128 bits = 16 bytes

    generator = SharedSecretKeyGenerator()
    shared_key = generator.generate_from_bits(bits_128)

    service = AESService(shared_key)
    assert service.key_size == 128
    assert service.algorithm == "AES-128-GCM"

    encrypted = service.encrypt("Quantum Key Encrypted Payload")
    decrypted = service.decrypt_to_string(encrypted)
    assert decrypted == "Quantum Key Encrypted Payload"


def test_authentication_failure_on_tampered_ciphertext():
    key = get_random_bytes(32)
    service = AESService(key)

    encrypted = service.encrypt("Top Secret Message")

    # Tamper with ciphertext
    tampered_bytes = bytearray(encrypted.ciphertext)
    tampered_bytes[0] ^= 0xFF  # Flip bits of first byte

    tampered_msg = EncryptedMessage(
        ciphertext=bytes(tampered_bytes),
        nonce=encrypted.nonce,
        authentication_tag=encrypted.authentication_tag,
        algorithm=encrypted.algorithm,
        key_size=encrypted.key_size,
    )

    with pytest.raises(ValueError, match="authentication tag verification failed"):
        service.decrypt(tampered_msg)


def test_authentication_failure_on_tampered_tag():
    key = get_random_bytes(32)
    service = AESService(key)

    encrypted = service.encrypt("Top Secret Message")

    # Tamper with tag
    tampered_tag = bytearray(encrypted.authentication_tag)
    tampered_tag[0] ^= 0xFF

    tampered_msg = EncryptedMessage(
        ciphertext=encrypted.ciphertext,
        nonce=encrypted.nonce,
        authentication_tag=bytes(tampered_tag),
        algorithm=encrypted.algorithm,
        key_size=encrypted.key_size,
    )

    with pytest.raises(ValueError, match="authentication tag verification failed"):
        service.decrypt(tampered_msg)


def test_wrong_key_decryption_failure():
    key1 = get_random_bytes(32)
    key2 = get_random_bytes(32)

    service1 = AESService(key1)
    service2 = AESService(key2)

    encrypted = service1.encrypt("Encrypted with Key 1")

    with pytest.raises(ValueError, match="authentication tag verification failed"):
        service2.decrypt(encrypted)


def test_empty_plaintext_rejection():
    key = get_random_bytes(32)
    service = AESService(key)

    with pytest.raises(ValueError, match="Plaintext string cannot be empty"):
        service.encrypt("")

    with pytest.raises(ValueError, match="Plaintext bytes cannot be empty"):
        service.encrypt(b"")

    with pytest.raises(TypeError, match="Plaintext cannot be None"):
        service.encrypt(None)


def test_multiple_encryptions_generate_different_nonces():
    key = get_random_bytes(32)
    service = AESService(key)

    msg1 = service.encrypt("Same Plaintext")
    msg2 = service.encrypt("Same Plaintext")

    assert msg1.nonce != msg2.nonce
    assert msg1.ciphertext != msg2.ciphertext
    assert msg1.authentication_tag != msg2.authentication_tag


def test_invalid_key_length_rejection():
    with pytest.raises(ValueError, match="Invalid AES key length"):
        AESService(b"12345")  # 5 bytes
