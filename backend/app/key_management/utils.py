from typing import List


def bits_to_string(bits: List[int]) -> str:
    """Converts a list of integer bits (0/1) into a single contiguous bit string.

    Args:
        bits (List[int]): List of bit integers.

    Returns:
        str: Concatenated bit string (e.g. [1, 0, 1] -> "101").
    """
    return "".join(str(b) for b in bits)


def string_to_bits(bit_str: str) -> List[int]:
    """Converts a bit string into a list of integer bits.

    Args:
        bit_str (str): String containing '0' and '1' characters.

    Returns:
        List[int]: Parsed bit integer list.
    """
    return [int(char) for char in bit_str if char in ("0", "1")]


def format_hex_preview(bit_str: str) -> str:
    """Formats a bit string into an uppercase hex representation preview.

    Args:
        bit_str (str): Bit string.

    Returns:
        str: Hex representation string or '0x0'.
    """
    if not bit_str:
        return "0x0"
    try:
        val = int(bit_str, 2)
        hex_len = (len(bit_str) + 3) // 4
        return f"0x{val:0{hex_len}X}"
    except ValueError:
        return "0x0"
