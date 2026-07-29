import pytest
from unittest.mock import AsyncMock
from app.zero_trust.zero_trust_service import ZeroTrustService


@pytest.mark.asyncio
async def test_zero_trust_verification():
    db_mock = AsyncMock()
    service = ZeroTrustService(db_mock)

    log = await service.verify_packet(
        session_uuid="active-zt-100",
        packet_id="pkt_12345",
        source_node="Substation_A",
        command="CLOSE_BREAKER",
        hmac_signature="valid_signature_hash",
        nonce="random_nonce",
        sequence_number=10
    )

    assert log.decision == "ALLOW"
    assert log.trust_score >= 80.0
    assert log.checks_passed == 20


@pytest.mark.asyncio
async def test_attack_simulation():
    db_mock = AsyncMock()
    service = ZeroTrustService(db_mock)

    res = await service.simulate_attack(
        session_uuid="active-zt-100",
        attack_type="EAVESDROPPING",
        intensity=1.0
    )

    assert res["detected"] is True
    assert res["attack_type"] == "EAVESDROPPING"
    assert "intercept-resend" in res["details"]
