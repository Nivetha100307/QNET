"""Unit tests for the E91 SharedSecretKeyGenerator and cryptographic key representations."""

import pytest

from app.quantum.e91.key_sifting import SiftedKey
from app.quantum.e91.qber_calculator import QBERResult
from app.quantum.e91.shared_secret_key import (
    SharedSecretKey,
    SharedSecretKeyGenerator,
    generate_shared_key,
)


def test_valid_key_generation_and_conversions():
    bits = [1, 0, 1, 1, 0, 0, 1, 0]  # Binary 10110010 = 0xB2 = 178
    sifted = SiftedKey(
        alice_key_bits=bits,
        bob_key_bits=bits,
        key_length=8,
        retained_measurements=8,
        discarded_measurements=0,
        retention_ratio=1.0,
    )

    qber = QBERResult(
        compared_bits=8,
        matching_bits=8,
        mismatching_bits=0,
        qber_ratio=0.0,
        qber_percentage=0.0,
        secure_channel=True,
        threshold_used=0.11,
        status_message="Excellent Channel",
    )

    generator = SharedSecretKeyGenerator()
    key = generator.generate(sifted, qber_result=qber)

    assert isinstance(key, SharedSecretKey)
    assert key.raw_bit_string == "10110010"
    assert key.key_bits == bits
    assert key.key_length_bits == 8
    assert key.key_length_bytes == 1
    assert key.binary_representation == "10110010"
    assert key.hexadecimal_representation == "b2"
    assert key.byte_array == b"\xb2"
    assert pytest.approx(key.entropy_information) == 1.0  # Equal count of 0s and 1s -> H = 1.0


test_cases_length = [
    ([1] * 7, 7, 1),
    ([1] * 8, 8, 1),
    ([1] * 9, 9, 2),
    ([1] * 16, 16, 2),
]


@pytest.mark.parametrize("bits,expected_bits_len,expected_bytes_len", test_cases_length)
def test_key_length_calculations(bits, expected_bits_len, expected_bytes_len):
    generator = SharedSecretKeyGenerator()
    key = generator.generate_from_bits(bits)

    assert key.key_length_bits == expected_bits_len
    assert key.key_length_bytes == expected_bytes_len


def test_invalid_qber_rejection():
    bits = [0, 1, 1, 0]
    sifted = SiftedKey(alice_key_bits=bits, bob_key_bits=bits, key_length=4)
    insecure_qber = QBERResult(
        compared_bits=4,
        matching_bits=2,
        mismatching_bits=2,
        qber_ratio=0.50,
        qber_percentage=50.0,
        secure_channel=False,
        threshold_used=0.11,
        status_message="Insecure Channel",
    )

    generator = SharedSecretKeyGenerator()
    with pytest.raises(ValueError, match="Cannot generate shared secret key: channel marked insecure"):
        generator.generate(sifted, qber_result=insecure_qber)


def test_empty_keys_rejection():
    sifted_empty = SiftedKey()
    generator = SharedSecretKeyGenerator()

    with pytest.raises(ValueError, match="Cannot generate shared secret key from an empty sifted key"):
        generator.generate(sifted_empty)

    with pytest.raises(ValueError, match="Cannot generate shared secret key from an empty sifted key"):
        generator.generate_from_bits([])


def test_mismatched_alice_bob_keys_rejection():
    sifted_mismatched = SiftedKey(
        alice_key_bits=[1, 0, 1, 0],
        bob_key_bits=[1, 0, 1, 1],  # Bit 3 mismatches
        key_length=4,
    )
    generator = SharedSecretKeyGenerator()

    with pytest.raises(ValueError, match="Alice and Bob sifted keys do not match"):
        generator.generate(sifted_mismatched)


def test_invalid_bits_rejection():
    generator = SharedSecretKeyGenerator()
    with pytest.raises(ValueError, match="Invalid bit value at index"):
        generator.generate_from_bits([0, 1, 2])


def test_null_inputs_raise_type_error():
    generator = SharedSecretKeyGenerator()
    with pytest.raises(TypeError, match="Input bits sequence cannot be None"):
        generator.generate_from_bits(None)

    with pytest.raises(TypeError, match="sifted_key cannot be None"):
        generator.generate(None)


def test_deterministic_output_and_helper_function():
    bits = [1, 1, 0, 0, 1, 0, 0, 1]
    sifted = SiftedKey(alice_key_bits=bits, bob_key_bits=bits, key_length=8)

    key1 = generate_shared_key(sifted)
    key2 = generate_shared_key(sifted)

    assert key1.raw_bit_string == key2.raw_bit_string
    assert key1.hexadecimal_representation == key2.hexadecimal_representation
    assert key1.byte_array == key2.byte_array
    assert key1.hexadecimal_representation == "c9"
