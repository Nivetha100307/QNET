"""Unit tests for the E91 CHSH Bell inequality verification engine."""

import pytest

from app.quantum.e91.basis_selector import (
    ALICE_E91_SETTINGS,
    BOB_E91_SETTINGS,
    MeasurementPair,
    MeasurementSetting,
)
from app.quantum.e91.chsh_verifier import CHSHVerifier, compute_chsh_value
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


def test_compute_correlation_perfect_cases():
    # Perfect correlation (all 00 or 11) -> E = +1.0
    results_pos = [
        make_dummy_result("A1", "B1", 0, 0),
        make_dummy_result("A1", "B1", 1, 1),
    ]
    assert CHSHVerifier.compute_correlation(results_pos) == 1.0

    # Perfect anti-correlation (all 01 or 10) -> E = -1.0
    results_neg = [
        make_dummy_result("A1", "B1", 0, 1),
        make_dummy_result("A1", "B1", 1, 0),
    ]
    assert CHSHVerifier.compute_correlation(results_neg) == -1.0

    # Equal mixture -> E = 0.0
    results_mix = results_pos + results_neg
    assert CHSHVerifier.compute_correlation(results_mix) == 0.0


def test_quantum_dataset_chsh_violation():
    """Verify quantum state |Φ+⟩ violates CHSH inequality (S > 2.0)."""
    bell_circuit = create_bell_pair_circuit()
    backend = AerBackend(seed_simulator=42)
    engine = MeasurementEngine(backend=backend)

    # Collect measurements for the 4 CHSH pairs
    chsh_pairs = [
        MeasurementPair(ALICE_E91_SETTINGS[0], BOB_E91_SETTINGS[0]),  # (A1, B1) = (0°, 45°)
        MeasurementPair(ALICE_E91_SETTINGS[0], BOB_E91_SETTINGS[2]),  # (A1, B3) = (0°, 135°)
        MeasurementPair(ALICE_E91_SETTINGS[2], BOB_E91_SETTINGS[0]),  # (A3, B1) = (90°, 45°)
        MeasurementPair(ALICE_E91_SETTINGS[2], BOB_E91_SETTINGS[2]),  # (A3, B3) = (90°, 135°)
    ]

    all_results = []
    for pair in chsh_pairs:
        # Run 2000 shots per pair for precise statistical convergence
        results = engine.execute_measurement(bell_circuit, pair, shots=2000)
        all_results.extend(results)

    verifier = CHSHVerifier()
    chsh_res = verifier.verify(all_results)

    # Quantum mechanics predicts S = 2 * √2 ≈ 2.8284
    assert chsh_res.chsh_value > 2.0
    assert chsh_res.is_violated is True
    assert chsh_res.is_quantum_entangled is True
    assert chsh_res.eavesdropping_detected is False
    assert pytest.approx(chsh_res.chsh_value, abs=0.15) == 2.828


def test_classical_dataset_chsh_bounded():
    """Verify local classical hidden variable data obeys S <= 2.0."""
    # Construct synthetic classical dataset (S = 1.0)
    all_results = []

    # E(A1, B1) = +0.5, E(A1, B3) = +0.5, E(A3, B1) = +0.5, E(A3, B3) = +0.5
    # S = |0.5 - 0.5 + 0.5 + 0.5| = 1.0 <= 2.0
    for a_label, b_label in [("A1", "B1"), ("A1", "B3"), ("A3", "B1"), ("A3", "B3")]:
        for _ in range(75):
            all_results.append(make_dummy_result(a_label, b_label, 0, 0))  # +1
        for _ in range(25):
            all_results.append(make_dummy_result(a_label, b_label, 0, 1))  # -1

    chsh_res = compute_chsh_value(all_results)

    assert chsh_res.chsh_value <= 2.0
    assert chsh_res.is_violated is False
    assert chsh_res.is_quantum_entangled is False
    assert chsh_res.eavesdropping_detected is True


def test_invalid_inputs():
    verifier = CHSHVerifier()

    # Empty list
    with pytest.raises(ValueError, match="Cannot verify CHSH parameter with empty"):
        verifier.verify([])

    # Missing required pairs
    incomplete_results = [
        make_dummy_result("A1", "B1", 0, 0),
        make_dummy_result("A1", "B3", 0, 0),
    ]
    with pytest.raises(ValueError, match="Missing required CHSH measurement pairs"):
        verifier.verify(incomplete_results)
