"""Unit tests for the E91 KeySiftingEngine and raw secret key extraction."""

import pytest

from app.quantum.e91.basis_selector import (
    ALICE_E91_SETTINGS,
    BOB_E91_SETTINGS,
    BasisSelector,
    MeasurementSetting,
)
from app.quantum.e91.key_sifting import KeySiftingEngine, KeySiftingReport, SiftedKey, sift_key
from app.quantum.e91.measurement import MeasurementEngine, MeasurementResult
from app.quantum.e91.pair_generator import create_bell_pair_circuit
from app.quantum.simulators.aer_backend import AerBackend


def make_dummy_result(a_label: str, b_label: str, a_bit: int, b_bit: int) -> MeasurementResult:
    alice_setting = next(s for s in ALICE_E91_SETTINGS if s.label == a_label)
    bob_setting = next(s for s in BOB_E91_SETTINGS if s.label == b_label)
    return MeasurementResult(
        alice_basis=alice_setting,
        bob_basis=bob_setting,
        alice_bit=a_bit,
        bob_bit=b_bit,
        raw_bitstring=f"{b_bit}{a_bit}",
        shots=1,
    )


def test_empty_input_handling():
    engine = KeySiftingEngine()
    sifted = engine.sift([])

    assert isinstance(sifted, SiftedKey)
    assert sifted.alice_key_bits == []
    assert sifted.bob_key_bits == []
    assert sifted.key_length == 0
    assert sifted.retained_measurements == 0
    assert sifted.discarded_measurements == 0
    assert sifted.retention_ratio == 0.0


def test_correct_basis_filtering_and_key_extraction():
    results = [
        make_dummy_result("A2", "B1", 0, 0),  # KEEP (Matching 45°)
        make_dummy_result("A1", "B1", 1, 0),  # DISCARD (CHSH 0°/45°)
        make_dummy_result("A3", "B2", 1, 1),  # KEEP (Matching 90°)
        make_dummy_result("A1", "B3", 0, 1),  # DISCARD (CHSH 0°/135°)
        make_dummy_result("A2", "B1", 1, 1),  # KEEP (Matching 45°)
        make_dummy_result("A3", "B3", 0, 0),  # DISCARD (CHSH 90°/135°)
    ]

    engine = KeySiftingEngine()
    sifted = engine.sift(results)

    assert sifted.key_length == 3
    assert sifted.retained_measurements == 3
    assert sifted.discarded_measurements == 3
    assert pytest.approx(sifted.retention_ratio) == 0.5

    assert sifted.alice_key_bits == [0, 1, 1]
    assert sifted.bob_key_bits == [0, 1, 1]


def test_ordering_preservation_and_determinism():
    results = [
        make_dummy_result("A2", "B1", 1, 1),
        make_dummy_result("A3", "B2", 0, 0),
        make_dummy_result("A2", "B1", 0, 0),
        make_dummy_result("A3", "B2", 1, 1),
    ]

    engine = KeySiftingEngine()
    sifted1 = engine.sift(results)
    sifted2 = engine.sift(results)

    assert sifted1 == sifted2
    assert sifted1.alice_key_bits == [1, 0, 0, 1]
    assert sifted1.bob_key_bits == [1, 0, 0, 1]


def test_sifting_report_generation():
    results = [
        make_dummy_result("A2", "B1", 0, 0),
        make_dummy_result("A1", "B1", 1, 0),
        make_dummy_result("A3", "B2", 1, 1),
    ]

    engine = KeySiftingEngine()
    report = engine.generate_report(results)

    assert isinstance(report, KeySiftingReport)
    assert report.total_measurements == 3
    assert report.retained_measurements == 2
    assert report.discarded_measurements == 1
    assert pytest.approx(report.basis_match_rate) == 2 / 3
    assert report.raw_key_length == 2


def test_end_to_end_sifting_quantum_simulator():
    """Verify that quantum simulation of matching bases yields 100% key bit agreement."""
    bell_circuit = create_bell_pair_circuit()
    selector = BasisSelector(seed=42)
    engine = MeasurementEngine(backend=AerBackend(seed_simulator=42))

    schedule = selector.generate_measurement_schedule(150)
    meas_results = engine.measure_multiple_pairs(bell_circuit, schedule)

    sifter = KeySiftingEngine()
    sifted = sifter.sift(meas_results)

    # In E91 with 3 choices per party, probability of matching basis is 2/9 (~22.2%)
    assert sifted.key_length > 20
    assert len(sifted.alice_key_bits) == len(sifted.bob_key_bits)

    # On an ideal simulator, matching basis results MUST be 100% identical between Alice & Bob
    assert sifted.alice_key_bits == sifted.bob_key_bits


def test_helper_function():
    results = [make_dummy_result("A2", "B1", 0, 0)]
    sifted = sift_key(results)
    assert sifted.key_length == 1
    assert sifted.alice_key_bits == [0]
