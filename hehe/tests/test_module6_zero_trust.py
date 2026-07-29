import time
import secrets
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.db.database import init_db
from app.zero_trust.identity_service import identity_service, ZERO_TRUST_IDENTITY_REGISTRY, IdentityVerificationError
from app.zero_trust.crypto_hash import CryptoHashService
from app.zero_trust.auth_engine import ZeroTrustAuthEngine, ZeroTrustAuthError
from app.zero_trust.trust_engine import trust_engine
from app.zero_trust.decision_engine import decision_engine

@pytest_asyncio.fixture(autouse=True)
async def initialize_database():
    await init_db()

def test_identity_verification():
    record = identity_service.verify_identity("BRK_12")
    assert record["device_id"] == "BRK_12"
    assert record["status"] == "ACTIVE"

    with pytest.raises(IdentityVerificationError, match="UNREGISTERED"):
        identity_service.verify_identity("ROGUE_DEVICE_99")

def test_crypto_hash_and_hmac():
    secret = "SECRET_KEY_BRK_12_SECURE_2026"
    payload = {"command": "OPEN_BREAKER", "device": "BRK_12"}

    fingerprint = CryptoHashService.generate_sha256_fingerprint(payload)
    assert len(fingerprint) == 64  # SHA-256 hex length

    hmac_sig = CryptoHashService.generate_hmac_sha256(secret, payload)
    assert len(hmac_sig) == 64

    # Verify signature
    assert CryptoHashService.verify_hmac_sha256(secret, payload, hmac_sig) is True
    # Verify tampered message fails
    tampered_payload = {"command": "OPEN_BREAKER", "device": "BRK_12", "tampered": True}
    assert CryptoHashService.verify_hmac_sha256(secret, tampered_payload, hmac_sig) is False

def test_zero_trust_rbac_matrix():
    # CONTROL_OPERATOR allowed OPEN_BREAKER
    assert ZeroTrustAuthEngine.authorize_command("CONTROL_OPERATOR", "OPEN_BREAKER") is True

    # VIEWER denied OPEN_BREAKER
    with pytest.raises(ZeroTrustAuthError, match="NOT PERMITTED"):
        ZeroTrustAuthEngine.authorize_command("VIEWER", "OPEN_BREAKER")

    # VIEWER allowed READ_VOLTAGE
    assert ZeroTrustAuthEngine.authorize_command("VIEWER", "READ_VOLTAGE") is True

def test_adaptive_trust_penalties_and_isolation():
    dev_id = "RELAY_04"
    ZERO_TRUST_IDENTITY_REGISTRY[dev_id]["trust_score"] = 100.0
    ZERO_TRUST_IDENTITY_REGISTRY[dev_id]["status"] = "ACTIVE"

    # Penalize 35 points (tampering)
    s1 = trust_engine.penalize_trust_score(dev_id, "Packet Tampering", 35.0, "Tampered ciphertext")
    assert s1 == 65.0
    assert ZERO_TRUST_IDENTITY_REGISTRY[dev_id]["status"] == "ACTIVE"

    # Penalize 20 more points -> 45.0 (below 50 threshold -> ISOLATED)
    s2 = trust_engine.penalize_trust_score(dev_id, "Replay Attack", 20.0, "Duplicate nonce")
    assert s2 == 45.0
    assert ZERO_TRUST_IDENTITY_REGISTRY[dev_id]["status"] == "ISOLATED"

    # Reset trust for future tests
    ZERO_TRUST_IDENTITY_REGISTRY[dev_id]["trust_score"] = 98.0
    ZERO_TRUST_IDENTITY_REGISTRY[dev_id]["status"] = "ACTIVE"

@pytest.mark.asyncio
async def test_20_stage_security_decision_engine():
    from app.session.session_manager import session_manager
    sess = session_manager.create_session(sender="BRK_12", receiver="SUB_SOUTH")
    session_id = sess["session_id"]

    # Valid sample packet
    packet = {
        "header": {
            "session_id": session_id,
            "packet_id": "PKT_ZT_1001",
            "sequence_number": 1,
            "timestamp": time.time(),
            "sender": "BRK_12",
            "receiver": "SUB_SOUTH"
        },
        "payload": "414243444546",
        "metadata": {
            "algorithm": "AES-256-GCM",
            "version": "1.0",
            "priority": "HIGH",
            "ttl": 30,
            "protocol": "QKD-SCADA-v1"
        },
        "security": {
            "nonce": "112233445566778899001122",
            "authentication_tag": "99887766554433221100AABBCCDDEEFF",
            "key_version": sess["key_version"],
            "signature": "SIG_SAMPLE"
        }
    }

    decision_res = await decision_engine.evaluate_packet_zero_trust(
        packet=packet,
        user_role="CONTROL_OPERATOR",
        command_type="READ_VOLTAGE"
    )

    assert decision_res["decision"] == "ALLOW"
    assert decision_res["overall_risk"] == "LOW"
    assert decision_res["checks_passed"] == 20
    assert decision_res["checks_failed"] == 0
    assert len(decision_res["step_breakdown"]) == 20

@pytest.mark.asyncio
async def test_zero_trust_api_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Authorize API
        res1 = await ac.post("/api/zero-trust/authorize", json={"role": "GRID_ADMIN", "command_type": "EMERGENCY_SHUTDOWN"})
        assert res1.status_code == 200
        assert res1.json()["status"] == "AUTHORIZED"

        # 2. Get Trust Score API
        res2 = await ac.get("/api/zero-trust/trust-score/BRK_12")
        assert res2.status_code == 200
        assert res2.json()["trust_score"] == 100.0

        # 3. Update Trust API
        res3 = await ac.post("/api/zero-trust/update-trust", json={"device_id": "BRK_12", "action": "PENALIZE", "points": 10.0, "reason": "Test penalty"})
        assert res3.status_code == 200
        assert res3.json()["trust_score"] == 90.0

        # Reset trust
        await ac.post("/api/zero-trust/update-trust", json={"device_id": "BRK_12", "action": "RESET"})
