from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.quantum_measurement import QuantumMeasurement
from app.models.session import QuantumSession, utc_now
from app.repositories.quantum_repository import QuantumMeasurementRepository
from app.repositories.session_repository import SessionRepository
from app.quantum.context import E91SessionContext
from app.quantum.engine import QuantumEngine
from app.common.enums import SessionStatus
from app.common.event_types import WSEventType
from app.core.logging_config import logger, log_session_event
from app.core.websocket_manager import ws_manager


class QuantumMeasurementNotFoundError(ValueError):
    """Raised when a quantum measurement record is not found."""
    pass


class InvalidQuantumExecutionStateError(ValueError):
    """Raised when trying to execute quantum measurement on an invalid or terminated session."""
    pass


class QuantumService:
    """Service layer orchestrating Module 2 E91 quantum simulation & measurement execution."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.session_repo = SessionRepository(db)
        self.measurement_repo = QuantumMeasurementRepository(db)
        self.engine = QuantumEngine(use_aer=True)

    def _create_timeline_event(self, event_name: str, status: str, details: str = "") -> Dict[str, Any]:
        """Creates a timestamped event dictionary for timeline log."""
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": event_name,
            "status": status,
            "details": details
        }

    async def execute_measurement(self, session_uuid: str, shots: int = 1024) -> QuantumMeasurement:
        """Executes E91 quantum measurement simulation for a session and persists results.

        Args:
            session_uuid (str): Target session UUID string.
            shots (int): Number of Bell pairs / shots to simulate (1 to 10000).

        Returns:
            QuantumMeasurement: Persisted measurement model instance.
        """
        session = await self.session_repo.find_by_session_id(session_uuid)
        if not session:
            from app.services.session_service import SessionNotFoundError
            raise SessionNotFoundError(f"Session '{session_uuid}' not found.")

        if session.status == SessionStatus.TERMINATED.value:
            raise InvalidQuantumExecutionStateError(
                f"Cannot execute quantum measurement on terminated session '{session_uuid}'."
            )

        # Build context and run simulation
        context = E91SessionContext(session_uuid=session_uuid, shots=shots)
        executed_context = self.engine.execute_e91_measurement(context)

        # Check existing measurement record
        existing_measurement = await self.measurement_repo.find_by_session_id(session_uuid)

        if existing_measurement:
            existing_measurement.shots = executed_context.shots
            existing_measurement.bell_pair_count = executed_context.bell_pair_count
            existing_measurement.alice_basis = executed_context.alice_basis
            existing_measurement.bob_basis = executed_context.bob_basis
            existing_measurement.alice_bits = executed_context.alice_bits
            existing_measurement.bob_bits = executed_context.bob_bits
            existing_measurement.measurement_status = executed_context.status
            existing_measurement.execution_backend = executed_context.execution_backend
            existing_measurement.simulation_time_ms = executed_context.simulation_time_ms
            existing_measurement.circuit_qasm = executed_context.circuit_qasm
            existing_measurement.circuit_diagram = executed_context.circuit_diagram
            saved_measurement = await self.measurement_repo.update(existing_measurement)
        else:
            new_measurement = QuantumMeasurement(
                session_uuid=session_uuid,
                protocol_version=executed_context.protocol_version,
                shots=executed_context.shots,
                bell_pair_count=executed_context.bell_pair_count,
                alice_basis=executed_context.alice_basis,
                bob_basis=executed_context.bob_basis,
                alice_bits=executed_context.alice_bits,
                bob_bits=executed_context.bob_bits,
                measurement_status=executed_context.status,
                execution_backend=executed_context.execution_backend,
                simulation_time_ms=executed_context.simulation_time_ms,
                circuit_qasm=executed_context.circuit_qasm,
                circuit_diagram=executed_context.circuit_diagram
            )
            saved_measurement = await self.measurement_repo.create(new_measurement)

        # Update Session timeline & channel metrics
        timeline_list = list(session.timeline)
        timeline_list.append(self._create_timeline_event(
            "QUANTUM_MEASUREMENT_EXECUTED",
            session.status,
            f"Executed E91 measurement ({executed_context.shots} shots, {executed_context.simulation_time_ms} ms)"
        ))
        session.timeline = timeline_list

        # Update quantum channel metrics preview
        qc_channel = dict(session.quantum_channel or {})
        qc_channel["bell_score"] = 2.82  # Theoretical max CHSH score for |Phi+>
        session.quantum_channel = qc_channel
        session.updated_at = utc_now()

        await self.session_repo.update(session)

        log_session_event(
            session_id=session.session_id,
            source=session.source_node,
            destination=session.destination_node,
            state=session.status,
            message=f"Quantum measurement stored ({executed_context.shots} shots executed)"
        )

        # Broadcast WS event
        await ws_manager.broadcast("QUANTUM_MEASUREMENT_COMPLETED", {
            "session_id": session_uuid,
            "shots": executed_context.shots,
            "simulation_time_ms": executed_context.simulation_time_ms,
            "backend": executed_context.execution_backend
        })

        return saved_measurement

    async def get_measurement(self, session_uuid: str) -> QuantumMeasurement:
        """Retrieves stored quantum measurement result by session UUID.

        Args:
            session_uuid (str): Session UUID string.

        Returns:
            QuantumMeasurement: Measurement instance.
        """
        measurement = await self.measurement_repo.find_by_session_id(session_uuid)
        if not measurement:
            raise QuantumMeasurementNotFoundError(f"Quantum measurement for session '{session_uuid}' not found.")
        return measurement
