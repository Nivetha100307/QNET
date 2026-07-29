import pytest
from app.scada.command_generator import SCADACommandGenerator
from app.scada.command_validator import CommandValidationEngine, CommandValidationError
from app.scada.command_executor import CommandExecutor
from app.scada.packet_builder import PacketBuilder
from app.crypto.hkdf_service import KeyDerivationService
from app.crypto.aes_gcm_engine import AESGCMEngine

def test_scada_command_generation_and_execution():
    executor = CommandExecutor()
    cmd = SCADACommandGenerator.generate_command("OPEN_BREAKER", "BRK_12").model_dump()
    
    # Pre-state check
    assert executor.device_states["BRK_12"]["breaker_state"] == "CLOSED"
    
    # Execute command
    res = executor.execute_command(cmd)
    assert res["status"] == "SUCCESS"
    assert executor.device_states["BRK_12"]["breaker_state"] == "OPEN"

def test_command_validation_safety_limits():
    executor = CommandExecutor()
    executor.device_states["BRK_12"]["breaker_state"] = "OPEN"
    
    cmd = SCADACommandGenerator.generate_command("OPEN_BREAKER", "BRK_12").model_dump()
    
    # Validating OPEN on ALREADY OPEN breaker must raise CommandValidationError
    with pytest.raises(CommandValidationError, match="ALREADY OPEN"):
        CommandValidationEngine.validate_command(cmd, executor.device_states)

def test_packet_construction_envelope():
    packet = PacketBuilder.build_packet(
        session_id="SESS_123",
        sequence_number=1,
        sender="SUB_NORTH",
        receiver="SUB_SOUTH",
        encrypted_payload_hex="AABBCCDD",
        nonce_hex="112233445566778899001122",
        authentication_tag_hex="99887766554433221100AABBCCDDEEFF"
    )
    
    assert "header" in packet
    assert "payload" in packet
    assert "metadata" in packet
    assert "security" in packet
    assert packet["header"]["session_id"] == "SESS_123"
