"""
Aggregates all v1 endpoint routers into a single APIRouter.

As new resources are added (e.g. network.py, qkd_session.py, keys.py,
websocket.py) register them here. app/main.py only ever imports this
one router, keeping main.py stable as the API surface grows.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import health, qkd_session, websocket

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(qkd_session.router)
api_router.include_router(websocket.router)


