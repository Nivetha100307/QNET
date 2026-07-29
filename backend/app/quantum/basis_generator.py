import random
from typing import Tuple, List


def generate_random_bases(count: int = 1024) -> Tuple[List[str], List[str]]:
    """Generates random measurement bases ('Z' or 'X') for Alice and Bob.
    
    Args:
        count: Number of pairs/shots.
        
    Returns:
        Tuple containing (alice_bases, bob_bases).
    """
    bases = ["Z", "X"]
    alice_bases = [random.choice(bases) for _ in range(count)]
    bob_bases = [random.choice(bases) for _ in range(count)]
    
    return alice_bases, bob_bases
