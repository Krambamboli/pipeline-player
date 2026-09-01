"""Status / health-check router."""

from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api", tags=["status"])


@router.get("/health")
async def health() -> JSONResponse:
    """Simple health check — returns 200 OK when the server is running."""
    return JSONResponse({"status": "ok", "service": "pipeline-player-backend"})
