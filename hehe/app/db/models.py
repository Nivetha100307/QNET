import time
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    role = Column(String(30), default="OPERATOR") # OPERATOR, ENGINEER, ADMIN, MONITORING
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(Float, default=time.time)

class Substation(Base):
    __tablename__ = "substations"
    
    id = Column(Integer, primary_key=True, index=True)
    substation_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    ip_address = Column(String(50), nullable=False)
    status = Column(String(20), default="ONLINE")

class Device(Base):
    __tablename__ = "devices"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), unique=True, index=True, nullable=False)
    substation_id = Column(String(50), ForeignKey("substations.substation_id"), nullable=False)
    device_type = Column(String(30), nullable=False) # BREAKER, RELAY, TRANSFORMER, GENERATOR, SENSOR
    status = Column(String(20), default="ONLINE") # ONLINE, OFFLINE, MAINTENANCE, ALARM
    last_heartbeat = Column(Float, default=time.time)
    firmware_version = Column(String(20), default="v2.4.1")
    trust_score = Column(Float, default=1.0) # 0.0 to 1.0
    certificate_pem = Column(Text, nullable=True)

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), unique=True, index=True, nullable=False)
    sender = Column(String(50), nullable=False)
    receiver = Column(String(50), nullable=False)
    creation_time = Column(Float, default=time.time)
    expiry_time = Column(Float, nullable=False)
    sequence_number = Column(Integer, default=0)
    status = Column(String(20), default="ACTIVE") # ACTIVE, EXPIRED, TERMINATED, ROTATED

class Key(Base):
    __tablename__ = "keys"
    
    id = Column(Integer, primary_key=True, index=True)
    key_id = Column(String(64), unique=True, index=True, nullable=False)
    session_id = Column(String(64), ForeignKey("sessions.session_id"), nullable=False)
    raw_quantum_key_hex = Column(Text, nullable=False)
    derived_aes_key_hex = Column(Text, nullable=False)
    key_version = Column(String(20), default="v1.0")
    bell_score = Column(Float, default=2.82)
    qber = Column(Float, default=0.012)
    created_at = Column(Float, default=time.time)
    status = Column(String(20), default="ACTIVE") # ACTIVE, EXPIRED, REVOKED

class Packet(Base):
    __tablename__ = "packets"
    
    id = Column(Integer, primary_key=True, index=True)
    packet_id = Column(String(64), unique=True, index=True, nullable=False)
    session_id = Column(String(64), nullable=False)
    sequence_number = Column(Integer, nullable=False)
    sender = Column(String(50), nullable=False)
    receiver = Column(String(50), nullable=False)
    nonce_hex = Column(String(64), nullable=False)
    authentication_tag_hex = Column(String(64), nullable=False)
    status = Column(String(20), default="VALID") # VALID, TAMPERED, REPLAYED, EXPIRED, INVALID_AUTH
    created_at = Column(Float, default=time.time)

class Command(Base):
    __tablename__ = "commands"
    
    id = Column(Integer, primary_key=True, index=True)
    command_id = Column(String(50), unique=True, index=True, nullable=False)
    command_type = Column(String(50), nullable=False)
    priority = Column(String(20), default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    device_id = Column(String(50), nullable=False)
    substation_id = Column(String(50), nullable=False)
    issuer = Column(String(50), default="OPERATOR_1")
    payload_json = Column(Text, nullable=False)
    status = Column(String(20), default="EXECUTED") # QUEUED, EXECUTED, REJECTED, FAILED
    created_at = Column(Float, default=time.time)

class Telemetry(Base):
    __tablename__ = "telemetry"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), index=True, nullable=False)
    substation_id = Column(String(50), index=True, nullable=False)
    voltage = Column(Float, default=230.0)
    current = Column(Float, default=15.0)
    power = Column(Float, default=3.45)
    frequency = Column(Float, default=50.0)
    power_factor = Column(Float, default=0.98)
    temperature = Column(Float, default=45.0)
    breaker_state = Column(String(20), default="CLOSED")
    timestamp = Column(Float, default=time.time)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    who = Column(String(50), nullable=False)
    what = Column(String(100), nullable=False)
    when_ts = Column(Float, default=time.time)
    where_loc = Column(String(100), nullable=False)
    why = Column(String(255), nullable=True)
    result = Column(String(20), nullable=False) # SUCCESS, FAILURE, REJECTED, DENIED
    details_json = Column(Text, nullable=True)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(50), nullable=False)
    severity = Column(String(20), default="WARNING") # INFO, WARNING, HIGH, CRITICAL
    source = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    timestamp = Column(Float, default=time.time)
    resolved = Column(Boolean, default=False)

class Metric(Base):
    __tablename__ = "metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(50), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    category = Column(String(30), nullable=False) # COMMUNICATION, SECURITY, SCADA
    timestamp = Column(Float, default=time.time)

class DeviceHealth(Base):
    __tablename__ = "device_health"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), nullable=False)
    cpu_usage = Column(Float, default=12.5)
    memory_usage = Column(Float, default=34.0)
    temperature = Column(Float, default=42.0)
    error_count = Column(Integer, default=0)
    timestamp = Column(Float, default=time.time)

# ==========================================
# MODULE 6: ZERO-TRUST DATABASE TABLES
# ==========================================

class DeviceRole(Base):
    __tablename__ = "device_roles"
    
    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), unique=True, index=True, nullable=False) # GRID_ADMIN, SUBSTATION_ENGINEER, CONTROL_OPERATOR, FIELD_ENGINEER, VIEWER, AI_AGENT
    description = Column(String(255), nullable=True)
    security_level = Column(Integer, default=1)
    emergency_override = Column(Boolean, default=False)

class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), ForeignKey("device_roles.role_name"), nullable=False)
    allowed_command = Column(String(50), nullable=False)
    restricted_device = Column(String(50), nullable=True)

class TrustScoreHistory(Base):
    __tablename__ = "trust_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), index=True, nullable=False)
    trust_score = Column(Float, default=100.0) # 0 to 100
    risk_score = Column(Float, default=0.0)
    device_reputation = Column(String(30), default="EXCELLENT")
    last_incident = Column(String(255), nullable=True)
    threat_level = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    timestamp = Column(Float, default=time.time)

class SecurityPolicy(Base):
    __tablename__ = "security_policies"
    
    id = Column(Integer, primary_key=True, index=True)
    policy_name = Column(String(100), unique=True, nullable=False)
    rule_name = Column(String(100), nullable=False)
    rule_value = Column(String(255), nullable=False)
    enabled = Column(Boolean, default=True)
    priority = Column(Integer, default=1)

class SecurityEvent(Base):
    __tablename__ = "security_events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False) # Authentication Failed, Replay Attack, Packet Modified, Trust Score Reduced, Unauthorized Command
    severity = Column(String(20), default="WARNING")
    device_id = Column(String(50), nullable=False)
    details_json = Column(Text, nullable=True)
    timestamp = Column(Float, default=time.time)

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    packet_id = Column(String(64), index=True, nullable=False)
    device_id = Column(String(50), nullable=False)
    overall_risk = Column(String(20), nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    decision = Column(String(20), nullable=False) # ALLOW, BLOCK
    checks_passed = Column(Integer, default=0)
    checks_failed = Column(Integer, default=0)
    rationale = Column(Text, nullable=False)
    timestamp = Column(Float, default=time.time)

