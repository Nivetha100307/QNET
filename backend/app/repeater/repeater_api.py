from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.repeater.repeater_service import RepeaterService
from app.repeater.swapping_service import SwappingService

router = APIRouter(tags=["Quantum Repeater & Entanglement Swapping (Module 7)"])


class SwappingRequest(BaseModel):
    session_uuid: str
    repeater_node: str
    source_node: str
    destination_node: str


class SwappingResponse(BaseModel):
    swapping_id: str
    session_uuid: str
    bsm_result: str
    swapped_fidelity: float
    entanglement_status: str
    timestamp: str


@router.get("/repeater/mesh")
async def get_repeater_mesh(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """Retrieves quantum repeater mesh topology and optimal Dijkstra routing path."""
    service = RepeaterService(db)
    return await service.get_mesh_topology()


@router.post("/swapping/execute", response_model=SwappingResponse)
async def execute_swapping(
    request: SwappingRequest,
    db: AsyncSession = Depends(get_db)
) -> SwappingResponse:
    """Executes Bell State Measurement (BSM) entanglement swapping at intermediate repeater."""
    service = SwappingService(db)
    res = await service.execute_swapping(
        session_uuid=request.session_uuid,
        repeater_node=request.repeater_node,
        source_node=request.source_node,
        destination_node=request.destination_node
    )
    return SwappingResponse(**res)
