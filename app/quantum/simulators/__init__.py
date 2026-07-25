"""Backend adapters over Qiskit Aer (and later real hardware providers).

Each simulator implements domain.interfaces.IQuantumBackend so the rest
of the app never imports qiskit directly outside this package.
"""
