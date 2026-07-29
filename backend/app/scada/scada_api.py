from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.scada.scada_service import SCADAService, SCADAExecutionError

router = APIRouter(prefix="/scada", tags=["Secure SCADA Communication (Module 5)"])


class SCADAPacketRequest(BaseModel):
    session_uuid: str
    source_node: str
    destination_node: str
    command: str
    parameters: Dict[str, Any] = {}


class SCADAPacketResponse(BaseModel):
    packet_id: str
    session_uuid: str
    source_node: str
    destination_node: str
    command: str
    ciphertext_b64: str
    nonce_b64: str
    tag_b64: str
    hmac_signature: str
    sequence_number: int
    execution_status: str
    timestamp: str

    model_config = ConfigDict(from_attributes=True)


@router.post("/send", response_model=SCADAPacketResponse)
async def send_scada_command(
    request: SCADAPacketRequest,
    db: AsyncSession = Depends(get_db)
) -> SCADAPacketResponse:
    """Encrypts and dispatches an authenticated AES-256-GCM SCADA command."""
    service = SCADAService(db)
    try:
        packet = await service.send_command(
            session_uuid=request.session_uuid,
            source_node=request.source_node,
            destination_node=request.destination_node,
            command=request.command,
            parameters=request.parameters
        )
        return SCADAPacketResponse(
            packet_id=packet.packet_id,
            session_uuid=packet.session_uuid,
            source_node=packet.source_node,
            destination_node=packet.destination_node,
            command=packet.command,
            ciphertext_b64=packet.ciphertext_b64,
            nonce_b64=packet.nonce_b64,
            tag_b64=packet.tag_b64,
            hmac_signature=packet.hmac_signature,
            sequence_number=packet.sequence_number,
            execution_status=packet.execution_status,
            timestamp=packet.timestamp.isoformat()
        )
    except SCADAExecutionError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/history/{session_uuid}", response_model=List[SCADAPacketResponse])
async def get_scada_history(
    session_uuid: str,
    db: AsyncSession = Depends(get_db)
) -> List[SCADAPacketResponse]:
    """Retrieves SCADA command packet execution history."""
    service = SCADAService(db)
    packets = await service.get_history(session_uuid)
    return [
        SCADAPacketResponse(
            packet_id=p.packet_id,
            session_uuid=p.session_uuid,
            source_node=p.source_node,
            destination_node=p.destination_node,
            command=p.command,
            ciphertext_b64=p.ciphertext_b64,
            nonce_b64=p.nonce_b64,
            tag_b64=p.tag_b64,
            hmac_signature=p.hmac_signature,
            sequence_number=p.sequence_number,
            execution_status=p.execution_status,
            timestamp=p.timestamp.isoformat()
        )
        for p in packets
    ]
