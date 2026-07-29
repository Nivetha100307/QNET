from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.schemas.quantum import QuantumStartRequest, QuantumMeasurementResponse
from app.services.quantum_service import (
    QuantumService,
    QuantumMeasurementNotFoundError,
    InvalidQuantumExecutionStateError
)
from app.services.session_service import SessionNotFoundError

router = APIRouter(prefix="/quantum", tags=["Quantum Engine (Module 2)"])


@router.post("/start", response_model=QuantumMeasurementResponse, status_code=status.HTTP_200_OK)
async def start_quantum_measurement(
    request: QuantumStartRequest,
    db: AsyncSession = Depends(get_db)
) -> QuantumMeasurementResponse:
    """Triggers E91 Quantum Communication Engine to simulate Bell pairs and execute measurement.

    Args:
        request (QuantumStartRequest): Request containing session_uuid and shots count.
        db (AsyncSession): Database session dependency.

    Returns:
        QuantumMeasurementResponse: Measured quantum state outcomes and simulation metadata.
    """
    service = QuantumService(db)
    try:
        measurement = await service.execute_measurement(
            session_uuid=request.session_uuid,
            shots=request.shots
        )
        return QuantumMeasurementResponse(
            session_uuid=measurement.session_uuid,
            status=measurement.measurement_status,
            protocol_version=measurement.protocol_version,
            bell_pair_count=measurement.bell_pair_count,
            shots=measurement.shots,
            alice_basis=measurement.alice_basis,
            bob_basis=measurement.bob_basis,
            alice_bits=measurement.alice_bits,
            bob_bits=measurement.bob_bits,
            execution_backend=measurement.execution_backend,
            simulation_time_ms=measurement.simulation_time_ms,
            circuit_qasm=measurement.circuit_qasm,
            circuit_diagram=measurement.circuit_diagram
        )
    except SessionNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except InvalidQuantumExecutionStateError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Quantum execution error: {str(e)}")


@router.get("/measurement/{session_uuid}", response_model=QuantumMeasurementResponse)
async def get_quantum_measurement(
    session_uuid: str,
    db: AsyncSession = Depends(get_db)
) -> QuantumMeasurementResponse:
    """Retrieves quantum measurement results for a session.

    Args:
        session_uuid (str): Session UUID string.
        db (AsyncSession): Database session.

    Returns:
        QuantumMeasurementResponse: Measured bit outcomes, bases, and metadata.
    """
    service = QuantumService(db)
    try:
        measurement = await service.get_measurement(session_uuid)
        return QuantumMeasurementResponse(
            session_uuid=measurement.session_uuid,
            status=measurement.measurement_status,
            protocol_version=measurement.protocol_version,
            bell_pair_count=measurement.bell_pair_count,
            shots=measurement.shots,
            alice_basis=measurement.alice_basis,
            bob_basis=measurement.bob_basis,
            alice_bits=measurement.alice_bits,
            bob_bits=measurement.bob_bits,
            execution_backend=measurement.execution_backend,
            simulation_time_ms=measurement.simulation_time_ms,
            circuit_qasm=measurement.circuit_qasm,
            circuit_diagram=measurement.circuit_diagram
        )
    except QuantumMeasurementNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/circuit/{session_uuid}")
async def get_quantum_circuit(
    session_uuid: str,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Retrieves OpenQASM 2.0 code and text circuit diagram for a measured session.

    Args:
        session_uuid (str): Session UUID string.
        db (AsyncSession): Database session.

    Returns:
        dict: OpenQASM string and text diagram.
    """
    service = QuantumService(db)
    try:
        measurement = await service.get_measurement(session_uuid)
        return {
            "session_uuid": measurement.session_uuid,
            "circuit_qasm": measurement.circuit_qasm,
            "circuit_diagram": measurement.circuit_diagram,
            "backend": measurement.execution_backend
        }
    except QuantumMeasurementNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
