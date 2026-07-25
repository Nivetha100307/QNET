"""Abstract interfaces (ports) that outer layers implement.

e.g. IQuantumBackend, IKeyStore, IChannel, IEavesdropDetector.
Defining these here lets `services/` depend on abstractions, not concretions
(Dependency Inversion Principle) -- so simulators/backends/persistence
can be swapped without touching business logic.
"""
