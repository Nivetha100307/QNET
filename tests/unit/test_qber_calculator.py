"""Unit tests for the E91 QBERCalculator and error rate analysis."""

import pytest

from app.quantum.e91.key_sifting import SiftedKey
from app.quantum.e91.qber_calculator import QBERCalculator, QBERResult, calculate_qber


def test_perfect_keys_zero_qber():
    alice = [0, 1, 1, 0, 1, 0, 1, 1]
    bob = [0, 1, 1, 0, 1, 0, 1, 1]

    calculator = QBERCalculator()
    res = calculator.calculate_from_bits(alice, bob)

    assert isinstance(res, QBERResult)
    assert res.compared_bits == 8
    assert res.matching_bits == 8
    assert res.mismatching_bits == 0
    assert res.qber_ratio == 0.0
    assert res.qber_percentage == 0.0
    assert res.secure_channel is True
    assert "Excellent Channel" in res.status_message


def test_small_number_of_bit_errors_excellent_and_acceptable():
    # 2 errors in 50 bits -> QBER = 4.0% (< 5.0% -> Excellent)
    alice = [0] * 48 + [1, 0]
    bob = [0] * 48 + [0, 1]

    calculator = QBERCalculator()
    res_exc = calculator.calculate_from_bits(alice, bob)

    assert res_exc.compared_bits == 50
    assert res_exc.mismatching_bits == 2
    assert pytest.approx(res_exc.qber_ratio) == 0.04
    assert pytest.approx(res_exc.qber_percentage) == 4.0
    assert res_exc.secure_channel is True
    assert "Excellent Channel" in res_exc.status_message

    # 4 errors in 50 bits -> QBER = 8.0% (5.0% <= QBER < 11.0% -> Acceptable)
    alice_acc = [0] * 46 + [1, 1, 0, 0]
    bob_acc = [0] * 46 + [0, 0, 1, 1]

    res_acc = calculator.calculate_from_bits(alice_acc, bob_acc)
    assert res_acc.compared_bits == 50
    assert res_acc.mismatching_bits == 4
    assert pytest.approx(res_acc.qber_ratio) == 0.08
    assert res_acc.secure_channel is True
    assert "Acceptable Channel" in res_acc.status_message


def test_large_number_of_bit_errors_insecure():
    # 15 errors in 100 bits -> QBER = 15.0% (>= 11.0% -> Insecure / Eavesdropping)
    alice = [0] * 85 + [1] * 15
    bob = [0] * 85 + [0] * 15

    calculator = QBERCalculator()
    res = calculator.calculate_from_bits(alice, bob)

    assert res.compared_bits == 100
    assert res.mismatching_bits == 15
    assert pytest.approx(res.qber_ratio) == 0.15
    assert res.secure_channel is False
    assert "Possible Eavesdropping or Excessive Noise" in res.status_message


def test_empty_keys_handling():
    calculator = QBERCalculator()
    res = calculator.calculate_from_bits([], [])

    assert res.compared_bits == 0
    assert res.matching_bits == 0
    assert res.mismatching_bits == 0
    assert res.qber_ratio == 0.0
    assert res.secure_channel is True
    assert "Empty key" in res.status_message

    # SiftedKey object integration test
    sifted_empty = SiftedKey()
    res_sifted = calculator.calculate(sifted_empty)
    assert res_sifted.compared_bits == 0


def test_sifted_key_object_integration():
    sifted = SiftedKey(
        alice_key_bits=[1, 0, 1, 0],
        bob_key_bits=[1, 0, 1, 1],  # 1 mismatch out of 4 -> 25% QBER
        key_length=4,
        retained_measurements=4,
        discarded_measurements=0,
        retention_ratio=1.0,
    )

    res = calculate_qber(sifted)
    assert res.compared_bits == 4
    assert res.matching_bits == 3
    assert res.mismatching_bits == 1
    assert res.qber_ratio == 0.25
    assert res.secure_channel is False


def test_mismatched_key_lengths_raises_value_error():
    calculator = QBERCalculator()
    with pytest.raises(ValueError, match="Alice and Bob key lengths must be equal"):
        calculator.calculate_from_bits([0, 1, 1], [0, 1])


def test_invalid_bit_values_raises_value_error():
    calculator = QBERCalculator()
    with pytest.raises(ValueError, match="Invalid bit value at index"):
        calculator.calculate_from_bits([0, 1, 2], [0, 1, 0])

    with pytest.raises(ValueError, match="Invalid bit value at index"):
        calculator.calculate_from_bits([0, -1, 1], [0, 1, 1])


def test_null_inputs_raise_type_error():
    calculator = QBERCalculator()
    with pytest.raises(TypeError, match="Input bit sequences cannot be None"):
        calculator.calculate_from_bits(None, [0, 1])

    with pytest.raises(TypeError, match="sifted_key cannot be None"):
        calculator.calculate(None)


def test_configurable_thresholds():
    # Strict thresholds: max=3.0%, excellent=1.0%
    strict_calc = QBERCalculator(max_threshold=0.03, excellent_threshold=0.01)

    alice = [0] * 96 + [1] * 4  # 4% QBER
    bob = [0] * 96 + [0] * 4

    res = strict_calc.calculate_from_bits(alice, bob)
    assert res.qber_ratio == 0.04
    assert res.secure_channel is False
    assert res.threshold_used == 0.03

    # Invalid threshold setup
    with pytest.raises(ValueError, match="max_threshold must be between 0.0 and 1.0"):
        QBERCalculator(max_threshold=1.5)

    with pytest.raises(ValueError, match="excellent_threshold must be between 0.0 and max_threshold"):
        QBERCalculator(max_threshold=0.10, excellent_threshold=0.15)
