import pytest
from unittest.mock import AsyncMock
from app.repeater.repeater_service import RepeaterService
from app.repeater.swapping_service import SwappingService
from app.cascade.cascade_service import CascadeService


@pytest.mark.asyncio
async def test_repeater_mesh_topology():
    db_mock = AsyncMock()
    service = RepeaterService(db_mock)

    mesh = await service.get_mesh_topology()
    assert len(mesh["nodes"]) >= 5
    assert len(mesh["quantum_repeaters"]) >= 3
    assert len(mesh["optimal_route"]) >= 2


@pytest.mark.asyncio
async def test_entanglement_swapping():
    db_mock = AsyncMock()
    service = SwappingService(db_mock)

    res = await service.execute_swapping(
        session_uuid="swap-uuid-100",
        repeater_node="R1_Control_SubA",
        source_node="Substation_A",
        destination_node="Control_Center"
    )

    assert res["swapping_id"].startswith("swap_")
    assert res["swapped_fidelity"] >= 0.90


@pytest.mark.asyncio
async def test_cascade_reconciliation():
    db_mock = AsyncMock()
    service = CascadeService(db_mock)

    session = await service.reconcile_key(
        session_uuid="casc-uuid-100",
        alice_key="11010101",
        bob_key="11010100",
        block_size=4
    )

    assert session.bit_errors_corrected == 1
    assert session.privacy_amplification_status == "COMPLETED"
