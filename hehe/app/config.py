import os

try:
    from pydantic_settings import BaseSettings
except ImportError:
    BaseSettings = object

class Settings:

    PROJECT_NAME: str = "Secure SCADA Communication Engine (Module 5)"
    VERSION: str = "1.0.0"
    
    # Cryptographic Configuration
    AES_KEY_BYTES: int = 32          # 256 bits
    GCM_NONCE_BYTES: int = 12        # 96 bits
    GCM_TAG_BYTES: int = 16          # 128 bits
    HKDF_SALT: bytes = b"E91_SCADA_QUANTUM_SALT_2026"
    HKDF_INFO_PREFIX: str = "SCADA_SESSION_KEY_V"
    
    # Replay & Freshness Windows
    TIMESTAMP_MAX_SKEW_SECONDS: float = 5.0
    NONCE_CACHE_TTL_SECONDS: int = 300
    
    # Session Management
    DEFAULT_SESSION_TTL_SECONDS: int = 3600  # 1 hour
    KEY_ROTATION_INTERVAL_SECONDS: int = 600  # 10 minutes
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./scada_secure.db")
    
    # Telemetry
    TELEMETRY_INTERVAL_SECONDS: float = 1.0
    
    # Supported SCADA Command Types
    SUPPORTED_COMMANDS = [
        "OPEN_BREAKER",
        "CLOSE_BREAKER",
        "TRIP_RELAY",
        "RESET_RELAY",
        "READ_SENSOR",
        "READ_VOLTAGE",
        "READ_CURRENT",
        "READ_FREQUENCY",
        "START_GENERATOR",
        "STOP_GENERATOR",
        "ISOLATE_FEEDER",
        "RESTORE_FEEDER",
        "SET_TRANSFORMER_TAP",
        "EMERGENCY_SHUTDOWN",
        "LOAD_STATUS",
        "HEALTH_CHECK"
    ]

settings = Settings()
