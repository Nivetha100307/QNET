import time
import secrets
import pytest
from app.crypto.replay_protection import ReplayProtectionEngine, ReplayAttackError

def test_replay_protection_success():
    engine = ReplayProtectionEngine()
    session_id = "SESS_TEST_01"
    nonce = secrets.token_hex(12)
    now = time.time()
    
    # Process sequence 1 (Valid)
    res = engine.validate_packet_freshness(session_id, nonce, sequence_number=1, timestamp=now)
    assert res is True

def test_replay_protection_duplicate_nonce_rejection():
    engine = ReplayProtectionEngine()
    session_id = "SESS_TEST_02"
    nonce = secrets.token_hex(12)
    now = time.time()
    
    engine.validate_packet_freshness(session_id, nonce, sequence_number=1, timestamp=now)
    
    # Replay same nonce (Should fail)
    with pytest.raises(ReplayAttackError, match="Duplicate Nonce Detected"):
        engine.validate_packet_freshness(session_id, nonce, sequence_number=2, timestamp=now)

def test_replay_protection_sequence_number_rejection():
    engine = ReplayProtectionEngine()
    session_id = "SESS_TEST_03"
    now = time.time()
    
    engine.validate_packet_freshness(session_id, secrets.token_hex(12), sequence_number=5, timestamp=now)
    
    # Send sequence 4 <= 5 (Should fail)
    with pytest.raises(ReplayAttackError, match="Sequence Number Replay"):
        engine.validate_packet_freshness(session_id, secrets.token_hex(12), sequence_number=4, timestamp=now)

def test_replay_protection_expired_timestamp():
    engine = ReplayProtectionEngine()
    session_id = "SESS_TEST_04"
    old_time = time.time() - 100.0 # 100s old packet
    
    with pytest.raises(ReplayAttackError, match="Expired Timestamp"):
        engine.validate_packet_freshness(session_id, secrets.token_hex(12), sequence_number=1, timestamp=old_time)
