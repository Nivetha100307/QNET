from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.repeater.repeater_service import RepeaterService
from app.repeater.swapping_service import SwappingService
from app.repeater.memory_service import MemoryService
from app.repeater.schemas import (
    SwappingRequest,
    SwappingResponse,
    SequenceRequest,
    ConfigRequest,
    MetricsResponse,
    TopologyResponse
)

router = APIRouter(tags=["Quantum Repeater & Entanglement Swapping (Module 7)"])


@router.get("/repeater/mesh", response_model=TopologyResponse)
async def get_repeater_mesh(
    distance_km: float = 120.0,
    noise_enabled: bool = False,
    db: AsyncSession = Depends(get_db)
) -> TopologyResponse:
    """Retrieves quantum repeater mesh topology, memory status, and optimal Dijkstra routing path."""
    service = RepeaterService(db)
    res = await service.get_mesh_topology(distance_km=distance_km, noise_enabled=noise_enabled)
    return TopologyResponse(**res)


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


@router.get("/repeater/memory")
async def get_repeater_memory(
    noise_enabled: bool = False,
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Returns quantum memory capacity, fidelity degradation, and inventory for repeaters."""
    memory_service = MemoryService()
    return memory_service.get_memory_statuses(noise_enabled=noise_enabled)


@router.get("/repeater/metrics", response_model=MetricsResponse)
async def get_repeater_metrics(
    distance_km: float = 120.0,
    noise_enabled: bool = False,
    db: AsyncSession = Depends(get_db)
) -> MetricsResponse:
    """Returns aggregated repeater network performance metrics and comparison to direct link."""
    service = RepeaterService(db)
    res = await service.get_aggregated_metrics(distance_km=distance_km, noise_enabled=noise_enabled)
    return MetricsResponse(**res)
