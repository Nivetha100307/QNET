"""Application/use-case layer: orchestrates domain + quantum + infrastructure
to fulfill a specific use case (e.g. RunQKDSessionService).

This is the only layer allowed to coordinate across quantum, domain,
and infrastructure packages. API routers call services; services never
call routers.
"""
