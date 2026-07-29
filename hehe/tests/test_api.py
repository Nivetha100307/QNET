import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.database import init_db

@pytest_asyncio.fixture(autouse=True)
async def initialize_test_database():
    await init_db()

@pytest.mark.asyncio
async def test_api_issue_command():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/commands", json={
            "command_type": "READ_VOLTAGE",
            "device_id": "BRK_12",
            "substation_id": "SUB_NORTH",
            "user_role": "OPERATOR"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "SUCCESS"
        assert "packet" in data

@pytest.mark.asyncio
async def test_api_sessions():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/sessions", json={
            "sender": "SUB_NORTH",
            "receiver": "SUB_SOUTH"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "CREATED"
        assert "session_id" in data

@pytest.mark.asyncio
async def test_api_simulate_attack_replay():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/simulate-attack", json={
            "attack_type": "REPLAY_ATTACK",
            "target_device": "BRK_12"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["outcome"] == "PREVENTED"
        assert "Layer 5 — Replay Protection Engine" in data["defense_layer"]

@pytest.mark.asyncio
async def test_api_metrics():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "communication" in data
        assert "security" in data
        assert "scada" in data
