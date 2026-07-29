from typing import Dict, Any
from pydantic import BaseModel, Field, ValidationError

class ZeroTrustHeaderModel(BaseModel):
    session_id: str
    packet_id: str
    sequence_number: int = Field(ge=1)
    timestamp: float
    sender: str
    receiver: str

class ZeroTrustMetadataModel(BaseModel):
    algorithm: str = "AES-256-GCM"
    version: str = "1.0"
    priority: str = "HIGH"
    ttl: int = 30
    protocol: str = "QKD-SCADA-v1"

class ZeroTrustSecurityModel(BaseModel):
    nonce: str
    authentication_tag: str
    key_version: str = "v1.0"
    signature: str

class ZeroTrustPacketEnvelope(BaseModel):
    header: ZeroTrustHeaderModel
    payload: str  # Ciphertext hex or encrypted string
    metadata: ZeroTrustMetadataModel
    security: ZeroTrustSecurityModel

class SchemaValidationError(Exception):
    """Raised when packet schema or datatype validation fails."""
    pass

class PacketSchemaValidator:
    """
    Component 11: Packet Validation Engine
    Validates packet structure, datatypes, required fields, and protocol version before processing.
    Rejects malformed packets before they reach core business logic.
    """

    @staticmethod
    def validate_packet_schema(packet: dict) -> ZeroTrustPacketEnvelope:
        """Strict Pydantic v2 schema validation."""
        try:
            validated_envelope = ZeroTrustPacketEnvelope(**packet)
            
            # Check protocol version
            if validated_envelope.metadata.protocol != "QKD-SCADA-v1":
                raise SchemaValidationError(f"Unsupported Protocol Version: '{validated_envelope.metadata.protocol}'. Expected 'QKD-SCADA-v1'.")

            return validated_envelope
        except ValidationError as ve:
            raise SchemaValidationError(f"Packet Schema Validation Failed: Malformed Structure! Details: {ve.errors()}")
        except Exception as e:
            raise SchemaValidationError(f"Packet Schema Validation Failed: {str(e)}")
