"""Unit tests for E91 basis selection and measurement angle management."""

import math
import pytest

from app.quantum.e91.basis_selector import (
    ALICE_E91_SETTINGS,
    BOB_E91_SETTINGS,
    BasisSelector,
    MeasurementPair,
    MeasurementSetting,
    select_random_bases,
)


def test_measurement_setting_radians_conversion():
    setting = MeasurementSetting(label="Test", angle_degrees=180.0)
    assert setting.label == "Test"
    assert setting.angle_degrees == 180.0
    assert math.isclose(setting.angle_radians, math.pi, rel_tol=1e-9)


def test_default_e91_angle_definitions():
    alice_degrees = [s.angle_degrees for s in ALICE_E91_SETTINGS]
    bob_degrees = [s.angle_degrees for s in BOB_E91_SETTINGS]

    assert alice_degrees == [0.0, 45.0, 90.0]
    assert bob_degrees == [45.0, 90.0, 135.0]

    alice_labels = [s.label for s in ALICE_E91_SETTINGS]
    bob_labels = [s.label for s in BOB_E91_SETTINGS]

    assert alice_labels == ["A1", "A2", "A3"]
    assert bob_labels == ["B1", "B2", "B3"]


def test_alice_and_bob_settings_always_valid():
    selector = BasisSelector(seed=42)
    allowed_alice = set(ALICE_E91_SETTINGS)
    allowed_bob = set(BOB_E91_SETTINGS)

    for _ in range(100):
        alice_basis = selector.get_alice_basis()
        bob_basis = selector.get_bob_basis()

        assert alice_basis in allowed_alice
        assert bob_basis in allowed_bob


def test_generate_measurement_pair():
    selector = BasisSelector(seed=123)
    pair = selector.generate_measurement_pair()

    assert isinstance(pair, MeasurementPair)
    assert pair.alice_setting in ALICE_E91_SETTINGS
    assert pair.bob_setting in BOB_E91_SETTINGS


def test_generate_measurement_schedule_1000_pairs():
    selector = BasisSelector(seed=999)
    schedule = selector.generate_measurement_schedule(number_of_pairs=1000)

    assert len(schedule) == 1000
    allowed_alice = set(ALICE_E91_SETTINGS)
    allowed_bob = set(BOB_E91_SETTINGS)

    alice_counts = {setting.label: 0 for setting in ALICE_E91_SETTINGS}
    bob_counts = {setting.label: 0 for setting in BOB_E91_SETTINGS}

    for pair in schedule:
        assert isinstance(pair, MeasurementPair)
        assert pair.alice_setting in allowed_alice
        assert pair.bob_setting in allowed_bob

        alice_counts[pair.alice_setting.label] += 1
        bob_counts[pair.bob_setting.label] += 1

    # Verify every allowed setting was selected with reasonable uniform frequency
    for label, count in alice_counts.items():
        assert count > 250, f"Alice setting {label} count {count} is unexpectedly low"

    for label, count in bob_counts.items():
        assert count > 250, f"Bob setting {label} count {count} is unexpectedly low"


def test_reproducibility_with_seed():
    selector1 = BasisSelector(seed=2026)
    selector2 = BasisSelector(seed=2026)

    schedule1 = selector1.generate_measurement_schedule(50)
    schedule2 = selector2.generate_measurement_schedule(50)

    assert schedule1 == schedule2


def test_invalid_arguments_raise_exceptions():
    # Empty settings list
    with pytest.raises(ValueError, match="Alice settings sequence cannot be empty"):
        BasisSelector(alice_settings=[])

    with pytest.raises(ValueError, match="Bob settings sequence cannot be empty"):
        BasisSelector(bob_settings=[])

    # Non-positive number of pairs
    selector = BasisSelector()
    with pytest.raises(ValueError, match="number_of_pairs must be at least 1"):
        selector.generate_measurement_schedule(0)

    with pytest.raises(ValueError, match="number_of_pairs must be at least 1"):
        selector.generate_measurement_schedule(-10)


def test_select_random_bases_helper():
    schedule = select_random_bases(number_of_pairs=10, seed=777)
    assert len(schedule) == 10
    for pair in schedule:
        assert pair.alice_setting in ALICE_E91_SETTINGS
        assert pair.bob_setting in BOB_E91_SETTINGS
