from datetime import datetime, timezone
from typing import List, Tuple, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.quantum_key import QuantumKey
from app.models.session import utc_now
from app.repositories.session_repository import SessionRepository
from app.repositories.quantum_repository import QuantumMeasurementRepository
from app.key_management.key_repository import KeyRepository
from app.key_management.reconciliation import reconcile_bases
from app.key_management.key_sifting import perform_key_sifting
from app.key_management.key_generator import generate_shared_secret
from app.key_management.key_validator import (
    validate_session_for_key_generation,
    validate_measurement_exists,
    validate_sifted_keys,
    KeyValidationException
)
from app.core.logging_config import logger, log_session_event
from app.core.websocket_manager import ws_manager


class KeyNotFoundError(ValueError):
    """Raised when a requested quantum key is not found."""
    pass


class KeyService:
    """Service layer orchestrating Module 3 E91 Basis Reconciliation, Sifting, and Key Generation."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.session_repo = SessionRepository(db)
        self.measurement_repo = QuantumMeasurementRepository(db)
        self.key_repo = KeyRepository(db)

    def _create_timeline_event(self, event_name: str, status: str, details: str = "") -> Dict[str, Any]:
        """Creates a timestamped event dictionary for session timeline."""
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": event_name,
            "status": status,
            "details": details
        }

    def reconcile_bases(self, alice_basis: List[str], bob_basis: List[str]) -> List[int]:
        """Performs basis reconciliation comparing Alice's and Bob's basis choices.

        Args:
            alice_basis (List[str]): Alice's basis choices.
            bob_basis (List[str]): Bob's basis choices.

        Returns:
            List[int]: List of matching basis indices.
        """
        return reconcile_bases(alice_basis, bob_basis)

    def sift_measurements(
        self,
        alice_bits: List[int],
        bob_bits: List[int],
        matching_indexes: List[int]
    ) -> Tuple[str, str]:
        """Sifts Alice's and Bob's raw bit outcomes at matching basis indices.

        Args:
            alice_bits (List[int]): Alice's raw bits.
            bob_bits (List[int]): Bob's raw bits.
            matching_indexes (List[int]): Matching basis indices.

        Returns:
            Tuple[str, str]: Tuple of (alice_sifted_key, bob_sifted_key).
        """
        return perform_key_sifting(alice_bits, bob_bits, matching_indexes)

    def generate_shared_key(self, alice_key: str, bob_key: str) -> str:
        """Generates raw shared secret key from sifted keys.

        Args:
            alice_key (str): Alice's sifted key.
            bob_key (str): Bob's sifted key.

        Returns:
            str: Raw shared secret key bit string.
        """
        validate_sifted_keys(alice_key, bob_key)
        return generate_shared_secret(alice_key, bob_key)

    async def store_key(
        self,
        session_uuid: str,
        matching_indexes: List[int],
        alice_key: str,
        bob_key: str,
        shared_key: str,
        generation_status: str = "GENERATED"
    ) -> QuantumKey:
        """Persists or updates QuantumKey record in database.

        Args:
            session_uuid (str): Session UUID string.
            matching_indexes (List[int]): Matching basis indices.
            alice_key (str): Alice sifted key.
            bob_key (str): Bob sifted key.
            shared_key (str): Shared secret key.
            generation_status (str): Generation status string.

        Returns:
            QuantumKey: Saved QuantumKey instance.
        """
        existing = await self.key_repo.find_by_session(session_uuid)
        key_length = len(shared_key)

        if existing:
            existing.matching_indexes = matching_indexes
            existing.alice_key = alice_key
            existing.bob_key = bob_key
            existing.shared_key = shared_key
            existing.key_length = key_length
            existing.generation_status = generation_status
            saved = await self.key_repo.update(existing)
        else:
            new_key = QuantumKey(
                session_uuid=session_uuid,
                matching_indexes=matching_indexes,
                alice_key=alice_key,
                bob_key=bob_key,
                shared_key=shared_key,
                key_length=key_length,
                generation_status=generation_status
            )
            saved = await self.key_repo.create(new_key)

        return saved

    async def generate_key(self, session_uuid: str) -> QuantumKey:
        """Executes complete E91 Key Management workflow for a session.

        Workflow:
        1. Validate active session & measurement existence.
        2. Emit KEY_GENERATION_STARTED WS event.
        3. Perform basis reconciliation.
        4. Emit BASES_RECONCILED WS event.
        5. Perform key sifting.
        6. Emit KEY_SIFTED WS event.
        7. Generate raw shared secret key.
        8. Persist QuantumKey to database.
        9. Append event to Session timeline & update classical channel readiness.
        10. Emit KEY_GENERATED WS event.

        Args:
            session_uuid (str): Target session UUID string.

        Returns:
            QuantumKey: Persisted QuantumKey model instance.
        """
        session = await self.session_repo.find_by_session_id(session_uuid)
        validate_session_for_key_generation(session)

        measurement = await self.measurement_repo.find_by_session_id(session_uuid)
        validate_measurement_exists(measurement)

        # 1. WS Event: Started
        await ws_manager.broadcast("KEY_GENERATION_STARTED", {
            "session_id": session_uuid,
            "status": "STARTED"
        })

        # 2. Basis Reconciliation
        matching_indexes = self.reconcile_bases(measurement.alice_basis, measurement.bob_basis)
        await ws_manager.broadcast("BASES_RECONCILED", {
            "session_id": session_uuid,
            "match_count": len(matching_indexes)
        })

        # 3. Key Sifting
        alice_sifted, bob_sifted = self.sift_measurements(
            measurement.alice_bits,
            measurement.bob_bits,
            matching_indexes
        )
        await ws_manager.broadcast("KEY_SIFTED", {
            "session_id": session_uuid,
            "sifted_length": len(alice_sifted)
        })

        # 4. Generate Shared Secret Key
        shared_key = self.generate_shared_key(alice_sifted, bob_sifted)

        # 5. Store Key in Database
        quantum_key = await self.store_key(
            session_uuid=session_uuid,
            matching_indexes=matching_indexes,
            alice_key=alice_sifted,
            bob_key=bob_sifted,
            shared_key=shared_key,
            generation_status="GENERATED"
        )

        # 6. Update Session Timeline & Classical Channel Status
        timeline_list = list(session.timeline)
        timeline_list.append(self._create_timeline_event(
            "KEY_GENERATED",
            session.status,
            f"Generated {len(shared_key)}-bit quantum shared key ({len(matching_indexes)} matching bases)"
        ))
        session.timeline = timeline_list

        classical_channel = dict(session.classical_channel or {})
        classical_channel["encryption_ready"] = True
        session.classical_channel = classical_channel
        session.updated_at = utc_now()

        await self.session_repo.update(session)

        log_session_event(
            session_id=session.session_id,
            source=session.source_node,
            destination=session.destination_node,
            state=session.status,
            message=f"Quantum shared key generated ({len(shared_key)} bits)"
        )

        # 7. WS Event: Generated
        await ws_manager.broadcast("KEY_GENERATED", {
            "session_id": session_uuid,
            "key_length": len(shared_key),
            "generation_status": "GENERATED"
        })

        return quantum_key

    async def get_key(self, session_uuid: str) -> QuantumKey:
        """Retrieves stored QuantumKey record by session UUID.

        Args:
            session_uuid (str): Session UUID string.

        Returns:
            QuantumKey: Persisted key instance.

        Raises:
            KeyNotFoundError: If key does not exist for session.
        """
        key = await self.key_repo.find_by_session(session_uuid)
        if not key:
            raise KeyNotFoundError(f"Quantum key for session '{session_uuid}' not found.")
        return key
