from fastapi import APIRouter
from app.api.v1.endpoints import (
    habits,
    logs,
    analytics,
)

api_router = APIRouter()

# Register all routes (v1)
api_router.include_router(habits.router, prefix="/habits", tags=["habits"])
api_router.include_router(logs.router, prefix="/logs", tags=["logs"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
