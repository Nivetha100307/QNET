import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_get_repeater_mesh():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/repeater/mesh?distance_km=120.0&noise_enabled=false")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "quantum_repeaters" in data
    assert "optimal_route" in data
    assert len(data["quantum_repeaters"]) == 3


@pytest.mark.asyncio
async def test_execute_swapping():
    payload = {
        "session_uuid": "test-session-123",
        "repeater_node": "R1_Control_SubA",
        "source_node": "Control_Center",
        "destination_node": "Substation_A"
    }
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/v1/swapping/execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "swapping_id" in data
    assert data["bsm_result"] in ["|Phi+>", "|Phi->", "|Psi+>", "|Psi->"]
    assert data["swapped_fidelity"] > 0.0


@pytest.mark.asyncio
async def test_get_repeater_memory():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/repeater/memory?noise_enabled=false")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["repeater_id"] == "Repeater_R1"


@pytest.mark.asyncio
async def test_get_repeater_metrics():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/repeater/metrics?distance_km=200.0&noise_enabled=true")
    assert response.status_code == 200
    data = response.json()
    assert data["total_distance_km"] == 200.0
    assert "direct_fidelity_without_repeaters" in data
    assert "repeater_fidelity" in data
