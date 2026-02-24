"""
NeuroAid Backend — main.py
===========================
FastAPI entry point. Mounts /api/analyze and /api/chat routers.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import analyze, chat
from config import ALLOWED_ORIGINS
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="NeuroAid API",
    description=(
        "Early Cognitive Risk Indicator backend. "
        "This tool does NOT provide medical diagnosis — it provides early risk signals for further evaluation."
    ),
    version="3.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "service": "NeuroAid Backend",
        "version": "3.2.0",
        "note": "This tool identifies early cognitive risk indicators — not a clinical diagnosis.",
    }
