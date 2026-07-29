import time
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from app.scada.command_generator import SCADACommandGenerator
from app.scada.command_validator import CommandValidationEngine, CommandValidationError
from app.scada.command_executor import command_executor
from app.scada.packet_builder import PacketBuilder
from app.scada.packet_verifier import ReceiverGateway, PacketVerificationError
from app.scada.telemetry_generator import telemetry_generator
from app.session.session_manager import session_manager, SessionExpiredError
from app.session.transport_layer import transport_layer
from app.crypto.device_auth import DeviceAuthEngine, REGISTERED_DEVICES, AuthenticationError
from app.crypto.aes_gcm_engine import AESGCMEngine, CryptographicIntegrityError
from app.crypto.replay_protection import replay_protection_engine, ReplayAttackError
from app.monitoring.metrics_engine import metrics_engine
from app.monitoring.notification_engine import notification_engine
from app.db.audit_logger import AuditLogger
from app.api.websockets import ws_manager

router = APIRouter()

# Processed Packets Log Cache
processed_packets_cache = []

# Pydantic Request Models
class CommandRequest(BaseModel):
    command_type: str = Field(..., json_schema_extra={"example": "OPEN_BREAKER"})
    device_id: str = Field(..., json_schema_extra={"example": "BRK_12"})
    substation_id: str = Field(default="SUB_NORTH")
    priority: str = Field(default="HIGH")
    issuer: str = Field(default="OPERATOR_1")
    user_role: str = Field(default="OPERATOR")
    session_id: Optional[str] = None
    payload: Dict[str, Any] = Field(default_factory=dict)

class SessionRequest(BaseModel):
    sender: str = Field(default="SUB_NORTH")
    receiver: str = Field(default="SUB_SOUTH")
    ttl_seconds: int = Field(default=3600)

class AuthRequest(BaseModel):
    device_id: str = Field(..., json_schema_extra={"example": "BRK_12"})
    substation_id: str = Field(default="SUB_NORTH")
    operator_role: str = Field(default="OPERATOR")

class EncryptRequest(BaseModel):
    session_id: str
    payload: dict

class DecryptRequest(BaseModel):
    session_id: str
    packet: dict

class AttackSimulationRequest(BaseModel):
    attack_type: str = Field(..., json_schema_extra={"example": "REPLAY_ATTACK"}) # REPLAY_ATTACK, PAYLOAD_TAMPERING, UNAUTHORIZED_DEVICE, EXPIRED_SESSION
    target_device: str = Field(default="BRK_12")

@router.post("/commands")
async def issue_command(req: CommandRequest):
    """
    POST /commands
    Executes full 20-component secure pipeline:
    Command Gen -> Validation -> Session Key Retrieval -> HKDF -> AES-GCM Encrypt -> Packet Build -> Transport -> Receiver Gateway -> Decrypt -> Execute -> Audit Log.
    """
    start_time = time.time()
    try:
        # 1. Get or Create Session
        session_id = req.session_id
        if not session_id or session_id not in session_manager.active_sessions:
            sess_obj = session_manager.create_session(sender=req.substation_id, receiver="SUB_SOUTH")
            session_id = sess_obj["session_id"]
        
        session = session_manager.get_valid_session(session_id)
        derived_key_bytes = session["derived_key_data"]["derived_key_bytes"]

        # 2. Generate SCADA Command Object (Component 1)
        scada_cmd = SCADACommandGenerator.generate_command(
            command_type=req.command_type,
            device_id=req.device_id,
            substation_id=req.substation_id,
            priority=req.priority,
            issuer=req.issuer,
            payload=req.payload
        ).model_dump()

        # 3. Pre-Flight Command Validation (Component 2)
        CommandValidationEngine.validate_command(
            command=scada_cmd,
            virtual_device_states=command_executor.device_states,
            user_role=req.user_role
        )

        # 4. Encrypt Payload using AES-256-GCM (Component 7 & 8)
        enc_result = AESGCMEngine.encrypt_payload(
            payload=scada_cmd,
            derived_key_bytes=derived_key_bytes
        )

        # 5. Construct Packet Envelope (Component 9)
        seq_num = session_manager.get_next_sequence_number(session_id)
        packet = PacketBuilder.build_packet(
            session_id=session_id,
            sequence_number=seq_num,
            sender=session["sender"],
            receiver=session["receiver"],
            encrypted_payload_hex=enc_result["ciphertext_hex"],
            nonce_hex=enc_result["nonce_hex"],
            authentication_tag_hex=enc_result["authentication_tag_hex"],
            key_version=session["key_version"],
            priority=req.priority
        )

        # 6. Secure Transport Transmission (Component 11)
        transport_res = await transport_layer.transmit_packet(
            packet=packet,
            receiver_callback=ReceiverGateway.process_incoming_packet,
            session_id=session_id,
            derived_key_bytes=derived_key_bytes,
            user_role=req.user_role
        )

        latency_ms = round((time.time() - start_time) * 1000, 2)
        metrics_engine.record_command_success(latency_ms)

        # 7. Audit Trail & Real-Time Broadcast
        processed_packets_cache.insert(0, packet)
        if len(processed_packets_cache) > 50:
            processed_packets_cache.pop()

        await AuditLogger.log_event(
            who=req.issuer,
            what=f"COMMAND_EXECUTE: {req.command_type} on {req.device_id}",
            where_loc=req.substation_id,
            result="SUCCESS",
            details={"packet_id": packet["header"]["packet_id"], "latency_ms": latency_ms}
        )

        await ws_manager.broadcast("COMMAND_STATUS", {
            "command_id": scada_cmd["command_id"],
            "command_type": req.command_type,
            "device_id": req.device_id,
            "status": "EXECUTED",
            "latency_ms": latency_ms,
            "packet_id": packet["header"]["packet_id"]
        })
        
        await ws_manager.broadcast("PACKET_LOG", packet)

        return {
            "status": "SUCCESS",
            "command_id": scada_cmd["command_id"],
            "session_id": session_id,
            "packet": packet,
            "execution_result": transport_res["receiver_response"]["execution_result"],
            "latency_ms": latency_ms
        }

    except (CommandValidationError, AuthenticationError, CryptographicIntegrityError, ReplayAttackError, SessionExpiredError) as err:
        metrics_engine.record_command_failure()
        await AuditLogger.log_event(
            who=req.issuer,
            what=f"COMMAND_REJECTED: {req.command_type} on {req.device_id}",
            where_loc=req.substation_id,
            result="REJECTED",
            why=str(err)
        )
        raise HTTPException(status_code=400, detail=str(err))
    except Exception as exc:
        metrics_engine.record_command_failure()
        raise HTTPException(status_code=500, detail=f"Internal SCADA Processing Error: {str(exc)}")

@router.post("/sessions")
async def create_or_rotate_session(req: SessionRequest):
    """POST /sessions: Create a new session or rotate quantum keys."""
    sess = session_manager.create_session(sender=req.sender, receiver=req.receiver, ttl_seconds=req.ttl_seconds)
    metrics_engine.record_key_rotation()
    
    q_metrics = sess["quantum_metadata"].copy()
    q_metrics.pop("raw_key_bytes", None)

    await AuditLogger.log_event(
        who="SESSION_SERVICE",
        what=f"SESSION_CREATED: {sess['session_id']}",
        where_loc=req.sender,
        result="SUCCESS",
        details={"key_version": sess["key_version"], "bell_score": q_metrics["bell_score"]}
    )

    await ws_manager.broadcast("SECURITY_ALERT", {
        "event": "KEY_ROTATION",
        "session_id": sess["session_id"],
        "key_version": sess["key_version"],
        "bell_score": q_metrics["bell_score"]
    })

    return {
        "status": "CREATED",
        "session_id": sess["session_id"],
        "key_version": sess["key_version"],
        "expiry_time": sess["expiry_time"],
        "quantum_metrics": q_metrics
    }

@router.post("/authenticate")
async def authenticate_device(req: AuthRequest):
    """POST /authenticate: Device & operator authentication endpoint."""
    try:
        dev_auth = DeviceAuthEngine.verify_device_identity(req.device_id, req.substation_id)
        jwt_token = DeviceAuthEngine.create_jwt_token({
            "sub": req.device_id,
            "substation": req.substation_id,
            "role": req.operator_role
        })
        return {
            "status": "AUTHENTICATED",
            "device_identity": dev_auth,
            "access_token": jwt_token,
            "token_type": "bearer"
        }
    except AuthenticationError as e:
        metrics_engine.record_failed_auth()
        await notification_engine.raise_alert(
            alert_type="Authentication Failed",
            severity="HIGH",
            source=req.device_id,
            description=str(e)
        )
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/encrypt")
async def encrypt_scada_payload(req: EncryptRequest):
    """POST /encrypt: Encrypts raw payload dictionary with session key."""
    try:
        session = session_manager.get_valid_session(req.session_id)
        derived_key = session["derived_key_data"]["derived_key_bytes"]
        enc_res = AESGCMEngine.encrypt_payload(req.payload, derived_key)
        return enc_res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/decrypt")
async def decrypt_scada_packet(req: DecryptRequest):
    """POST /decrypt: Decrypts packet envelope with session key."""
    try:
        session = session_manager.get_valid_session(req.session_id)
        derived_key = session["derived_key_data"]["derived_key_bytes"]
        payload_hex = req.packet["payload"]
        nonce_hex = req.packet["security"]["nonce"]
        tag_hex = req.packet["security"]["authentication_tag"]
        decrypted = AESGCMEngine.decrypt_payload(payload_hex, nonce_hex, tag_hex, derived_key)
        return {"status": "DECRYPTED", "decrypted_command": decrypted}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/telemetry")
async def submit_telemetry():
    """POST /telemetry: Generates real-time telemetry snapshot."""
    data = telemetry_generator.generate_live_telemetry()
    return {"status": "OK", "telemetry": data}

@router.post("/simulate-attack")
async def simulate_attack(req: AttackSimulationRequest):
    """
    POST /simulate-attack
    Interactive threat simulator endpoint for SCADA security testing.
    Simulates Replay Attack, Payload Tampering, Unauthorized Device, or Expired Session attacks.
    Demonstrates defense-in-depth prevention in real time!
    """
    attack_type = req.attack_type.upper()
    sess_obj = session_manager.create_session(sender="SUB_NORTH", receiver="SUB_SOUTH")
    session_id = sess_obj["session_id"]
    derived_key = sess_obj["derived_key_data"]["derived_key_bytes"]

    if attack_type == "REPLAY_ATTACK":
        # Create valid packet
        cmd = SCADACommandGenerator.generate_command("OPEN_BREAKER", req.target_device).model_dump()
        enc = AESGCMEngine.encrypt_payload(cmd, derived_key)
        packet = PacketBuilder.build_packet(
            session_id=session_id,
            sequence_number=1,
            sender="SUB_NORTH",
            receiver="SUB_SOUTH",
            encrypted_payload_hex=enc["ciphertext_hex"],
            nonce_hex=enc["nonce_hex"],
            authentication_tag_hex=enc["authentication_tag_hex"]
        )
        
        # Process first time (success)
        ReceiverGateway.process_incoming_packet(packet, session_id, derived_key)
        
        # Process second time (REPLAY ATTACK!)
        try:
            ReceiverGateway.process_incoming_packet(packet, session_id, derived_key)
        except ReplayAttackError as err:
            metrics_engine.record_replay_attempt()
            await notification_engine.raise_alert(
                alert_type="Replay Attack Detected",
                severity="CRITICAL",
                source=f"Packet {packet['header']['packet_id']}",
                description=str(err)
            )
            return {
                "attack_type": attack_type,
                "outcome": "PREVENTED",
                "defense_layer": "Layer 5 — Replay Protection Engine",
                "error_message": str(err)
            }

    elif attack_type == "PAYLOAD_TAMPERING":
        cmd = SCADACommandGenerator.generate_command("OPEN_BREAKER", req.target_device).model_dump()
        enc = AESGCMEngine.encrypt_payload(cmd, derived_key)
        
        # Tamper 1 byte of ciphertext hex
        tampered_ciphertext = enc["ciphertext_hex"][:-2] + ("00" if enc["ciphertext_hex"][-2:] != "00" else "FF")
        
        packet = PacketBuilder.build_packet(
            session_id=session_id,
            sequence_number=1,
            sender="SUB_NORTH",
            receiver="SUB_SOUTH",
            encrypted_payload_hex=tampered_ciphertext,
            nonce_hex=enc["nonce_hex"],
            authentication_tag_hex=enc["authentication_tag_hex"]
        )

        try:
            ReceiverGateway.process_incoming_packet(packet, session_id, derived_key)
        except CryptographicIntegrityError as err:
            metrics_engine.record_integrity_failure()
            await notification_engine.raise_alert(
                alert_type="Packet Modified / Tampered",
                severity="CRITICAL",
                source=f"Packet {packet['header']['packet_id']}",
                description=str(err)
            )
            return {
                "attack_type": attack_type,
                "outcome": "PREVENTED",
                "defense_layer": "Layer 4 — AES-256-GCM Integrity Engine",
                "error_message": str(err)
            }

    elif attack_type == "UNAUTHORIZED_DEVICE":
        unauth_cmd = {
            "command_type": "EMERGENCY_SHUTDOWN",
            "device_id": "ROGUE_HACKER_RTU",
            "substation_id": "SUB_NORTH",
            "issuer": "ATTACKER_X"
        }
        try:
            CommandValidationEngine.validate_command(unauth_cmd, command_executor.device_states)
        except AuthenticationError as err:
            metrics_engine.record_failed_auth()
            await notification_engine.raise_alert(
                alert_type="Device Spoofing Attempt",
                severity="HIGH",
                source="ROGUE_HACKER_RTU",
                description=str(err)
            )
            return {
                "attack_type": attack_type,
                "outcome": "PREVENTED",
                "defense_layer": "Layer 1 — Identity & Authentication Whitelist",
                "error_message": str(err)
            }

    elif attack_type == "EXPIRED_SESSION":
        session_manager.terminate_session(session_id)
        try:
            session_manager.get_valid_session(session_id)
        except SessionExpiredError as err:
            await notification_engine.raise_alert(
                alert_type="Session Expired Access Attempt",
                severity="WARNING",
                source=session_id,
                description=str(err)
            )
            return {
                "attack_type": attack_type,
                "outcome": "PREVENTED",
                "defense_layer": "Layer 2 — Session Lifecycle Management",
                "error_message": str(err)
            }

    raise HTTPException(status_code=400, detail="Invalid attack type specified.")

# GET Query Endpoints
@router.get("/devices")
async def get_devices():
    return {"devices": REGISTERED_DEVICES, "virtual_states": command_executor.device_states}

@router.get("/alerts")
async def get_alerts():
    return {"alerts": notification_engine.alert_history}

@router.get("/sessions")
async def get_sessions():
    return {"active_sessions": list(session_manager.active_sessions.values())}

@router.get("/metrics")
async def get_metrics():
    return metrics_engine.get_snapshot()

@router.get("/packets")
async def get_packets():
    return {"packets": processed_packets_cache}

@router.get("/logs")
async def get_logs():
    return {"status": "OK", "alerts_count": len(notification_engine.alert_history)}
