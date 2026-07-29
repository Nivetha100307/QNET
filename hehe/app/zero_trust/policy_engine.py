from typing import Dict, Any

class SecurityPolicyError(Exception):
    """Raised when security policy validation fails."""
    pass

class SecurityPolicyEngine:
    """
    Component 17: Security Policy Engine
    Centralized policy engine evaluating enterprise security rules, maximum payload sizes, protocol whitelists, and blacklisted nodes.
    """

    MAX_PACKET_BYTES = 65536 # 64 KB
    ALLOWED_PROTOCOLS = ["QKD-SCADA-v1"]
    BLACKLISTED_DEVICES = set(["ROGUE_HACKER_RTU", "MALICIOUS_NODE_99"])

    @staticmethod
    def validate_security_policy(packet: dict, device_id: str) -> bool:
        """
        Executes centralized policy checks.
        """
        if device_id in SecurityPolicyEngine.BLACKLISTED_DEVICES:
            raise SecurityPolicyError(f"Security Policy Rejected: Device '{device_id}' is BLACKLISTED!")

        metadata = packet.get("metadata", {})
        protocol = metadata.get("protocol")
        if protocol not in SecurityPolicyEngine.ALLOWED_PROTOCOLS:
            raise SecurityPolicyError(f"Security Policy Rejected: Protocol '{protocol}' is NOT ALLOWED.")

        payload_str = str(packet.get("payload", ""))
        if len(payload_str) > SecurityPolicyEngine.MAX_PACKET_BYTES:
            raise SecurityPolicyError("Security Policy Rejected: Packet size exceeds maximum 64KB policy limit!")

        return True
