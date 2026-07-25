"""Port: IQuantumBackend.

Re-exports `IQuantumBackend` from `app.quantum.backends.iquantum_backend`
for domain interface compatibility.
"""

from app.quantum.backends.iquantum_backend import IQuantumBackend

__all__ = ["IQuantumBackend"]
