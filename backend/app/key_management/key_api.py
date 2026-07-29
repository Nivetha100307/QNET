from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.schemas.key import (
    KeyGenerationRequest,
    KeyGenerationResponse,
    KeyStatusResponse,
    SharedKeyResponse
)
from app.key_management.key_service import KeyService, KeyNotFoundError
from app.key_management.key_validator import KeyValidationException
from app.services.session_service import SessionNotFoundError

router = APIRouter(prefix="/key", tags=["Quantum Key Management (Module 3)"])


@router.post("/generate", response_model=KeyGenerationResponse, status_code=status.HTTP_200_OK)
async def generate_quantum_key(
    request: KeyGenerationRequest,
    db: AsyncSession = Depends(get_db)
) -> KeyGenerationResponse:
    """Executes basis reconciliation, sifting, and raw shared key generation for an active session.

    Args:
        request (KeyGenerationRequest): Request body containing active session_uuid.
        db (AsyncSession): Database session dependency.

    Returns:
        KeyGenerationResponse: Generated key details, sifted keys, matching indices, and status.
    """
    service = KeyService(db)
    try:
        quantum_key = await service.generate_key(request.session_uuid)
        return KeyGenerationResponse(
            session_uuid=quantum_key.session_uuid,
            generation_status=quantum_key.generation_status,
            matching_indexes=quantum_key.matching_indexes,
            alice_key=quantum_key.alice_key,
            bob_key=quantum_key.bob_key,
            shared_key=quantum_key.shared_key,
            key_length=quantum_key.key_length,
            created_at=quantum_key.created_at
        )
    except SessionNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except KeyValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Key generation execution error: {str(e)}"
        )


@router.get("/status/{session_uuid}", response_model=KeyStatusResponse)
async def get_key_status(
    session_uuid: str,
    db: AsyncSession = Depends(get_db)
) -> KeyStatusResponse:
    """Retrieves lightweight key generation status for a session.

    Args:
        session_uuid (str): Session UUID string.
        db (AsyncSession): Database session.

    Returns:
        KeyStatusResponse: Session UUID, generation status, and key length.
    """
    service = KeyService(db)
    try:
        quantum_key = await service.get_key(session_uuid)
        return KeyStatusResponse(
            session_uuid=quantum_key.session_uuid,
            generation_status=quantum_key.generation_status,
            key_length=quantum_key.key_length
        )
    except KeyNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/shared/{session_uuid}", response_model=SharedKeyResponse)
async def get_shared_key(
    session_uuid: str,
    db: AsyncSession = Depends(get_db)
) -> SharedKeyResponse:
    """Retrieves raw shared secret key string for a session.

    Args:
        session_uuid (str): Session UUID string.
        db (AsyncSession): Database session.

    Returns:
        SharedKeyResponse: Raw shared key string and length.
    """
    service = KeyService(db)
    try:
        quantum_key = await service.get_key(session_uuid)
        return SharedKeyResponse(
            session_uuid=quantum_key.session_uuid,
            shared_key=quantum_key.shared_key,
            key_length=quantum_key.key_length
        )
    except KeyNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{session_uuid}", response_model=KeyGenerationResponse)
async def get_quantum_key(
    session_uuid: str,
    db: AsyncSession = Depends(get_db)
) -> KeyGenerationResponse:
    """Retrieves full quantum key details for a session.

    Args:
        session_uuid (str): Session UUID string.
        db (AsyncSession): Database session.

    Returns:
        KeyGenerationResponse: Complete generated key data and indices.
    """
    service = KeyService(db)
    try:
        quantum_key = await service.get_key(session_uuid)
        return KeyGenerationResponse(
            session_uuid=quantum_key.session_uuid,
            generation_status=quantum_key.generation_status,
            matching_indexes=quantum_key.matching_indexes,
            alice_key=quantum_key.alice_key,
            bob_key=quantum_key.bob_key,
            shared_key=quantum_key.shared_key,
            key_length=quantum_key.key_length,
            created_at=quantum_key.created_at
        )
    except KeyNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
