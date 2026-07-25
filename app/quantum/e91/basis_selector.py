"""Random measurement basis selection for Alice and Bob in the E91 QKD protocol.

This module provides data structures and the `BasisSelector` class for generating
physical measurement angle configurations for Alice and Bob as specified in the
Ekert91 (E91) protocol.
"""

from dataclasses import dataclass, field
import math
import random
from typing import List, Sequence, Tuple


@dataclass(frozen=True)
class MeasurementSetting:
    """Represents a single physical measurement setting (orientation angle)."""

    label: str
    angle_degrees: float
    angle_radians: float = field(init=False)

    def __post_init__(self) -> None:
        object.__setattr__(self, "angle_radians", math.radians(self.angle_degrees))


# Standard E91 Measurement Angle Definitions
# Alice measures at 0°, 45°, 90° (A1, A2, A3)
ALICE_E91_SETTINGS: Tuple[MeasurementSetting, ...] = (
    MeasurementSetting(label="A1", angle_degrees=0.0),
    MeasurementSetting(label="A2", angle_degrees=45.0),
    MeasurementSetting(label="A3", angle_degrees=90.0),
)

# Bob measures at 45°, 90°, 135° (B1, B2, B3)
BOB_E91_SETTINGS: Tuple[MeasurementSetting, ...] = (
    MeasurementSetting(label="B1", angle_degrees=45.0),
    MeasurementSetting(label="B2", angle_degrees=90.0),
    MeasurementSetting(label="B3", angle_degrees=135.0),
)


@dataclass(frozen=True)
class MeasurementPair:
    """Represents a pair of measurement settings chosen by Alice and Bob for a single Bell pair."""

    alice_setting: MeasurementSetting
    bob_setting: MeasurementSetting


class BasisSelector:
    """Generates measurement basis configurations for Alice and Bob in the E91 protocol."""

    def __init__(
        self,
        alice_settings: Sequence[MeasurementSetting] = ALICE_E91_SETTINGS,
        bob_settings: Sequence[MeasurementSetting] = BOB_E91_SETTINGS,
        seed: int | None = None,
    ) -> None:
        """Initialize BasisSelector with allowed angle configurations.

        Args:
            alice_settings: Sequence of allowed MeasurementSetting objects for Alice.
            bob_settings: Sequence of allowed MeasurementSetting objects for Bob.
            seed: Optional pseudo-random number generator seed for reproducibility.

        Raises:
            ValueError: If alice_settings or bob_settings is empty.
        """
        if not alice_settings:
            raise ValueError("Alice settings sequence cannot be empty.")
        if not bob_settings:
            raise ValueError("Bob settings sequence cannot be empty.")

        self._alice_settings = tuple(alice_settings)
        self._bob_settings = tuple(bob_settings)
        self._rng = random.Random(seed)

    @property
    def alice_settings(self) -> Tuple[MeasurementSetting, ...]:
        """Return allowed measurement settings for Alice."""
        return self._alice_settings

    @property
    def bob_settings(self) -> Tuple[MeasurementSetting, ...]:
        """Return allowed measurement settings for Bob."""
        return self._bob_settings

    def get_alice_basis(self) -> MeasurementSetting:
        """Randomly select a measurement setting for Alice.

        Returns:
            MeasurementSetting: One setting chosen uniformly from Alice's allowed settings.
        """
        return self._rng.choice(self._alice_settings)

    def get_bob_basis(self) -> MeasurementSetting:
        """Randomly select a measurement setting for Bob.

        Returns:
            MeasurementSetting: One setting chosen uniformly from Bob's allowed settings.
        """
        return self._rng.choice(self._bob_settings)

    def generate_measurement_pair(self) -> MeasurementPair:
        """Generate a random measurement setting pair for Alice and Bob.

        Returns:
            MeasurementPair: A strongly typed pair containing Alice and Bob settings.
        """
        return MeasurementPair(
            alice_setting=self.get_alice_basis(),
            bob_setting=self.get_bob_basis(),
        )

    def generate_measurement_schedule(self, number_of_pairs: int) -> List[MeasurementPair]:
        """Generate a schedule of measurement setting pairs for N Bell pairs.

        Args:
            number_of_pairs: Total number of Bell pair measurement pairs to generate.

        Returns:
            List[MeasurementPair]: List of generated measurement pairs.

        Raises:
            ValueError: If number_of_pairs is less than 1.
        """
        if number_of_pairs < 1:
            raise ValueError(f"number_of_pairs must be at least 1, got {number_of_pairs}.")

        return [self.generate_measurement_pair() for _ in range(number_of_pairs)]


def select_random_bases(
    number_of_pairs: int = 1, seed: int | None = None
) -> List[MeasurementPair]:
    """Convenience helper function for generating measurement basis schedules.

    Args:
        number_of_pairs: Number of measurement pairs to generate.
        seed: Optional RNG seed.

    Returns:
        List[MeasurementPair]: Generated schedule of measurement setting pairs.
    """
    selector = BasisSelector(seed=seed)
    return selector.generate_measurement_schedule(number_of_pairs)
