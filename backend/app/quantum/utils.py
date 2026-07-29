from typing import List


def format_bit_array(bits: List[int]) -> str:
    """Formats an integer bit list as a compact string (e.g. [1,0,1] -> '101')."""
    return "".join(str(b) for b in bits)


def sanitize_basis_list(bases: List[str]) -> List[str]:
    """Validates and sanitizes basis values to uppercase 'X' or 'Z'."""
    return [b.upper() if b.upper() in ("X", "Z") else "Z" for b in bases]
