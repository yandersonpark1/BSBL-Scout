"""
BSBL-Scout API — stateless pitching analytics.

Open-source and database-free by design: upload a Rapsodo pitching CSV, get the
full dashboard report back in one response. Nothing is stored server-side.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import routes_analyze
from app.core.config import settings

app = FastAPI(
    title="BSBL-Scout API",
    description="Stateless pitching analytics for Rapsodo CSV exports.",
    version="1.0.0",
    # Docs can be hidden in a locked deployment (defaults on for open source).
    docs_url="/docs" if settings.SHOW_API_DOCS else None,
    redoc_url="/redoc" if settings.SHOW_API_DOCS else None,
    openapi_url="/openapi.json" if settings.SHOW_API_DOCS else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    # The API only serves GET (health/schema) and POST (analyze); OPTIONS is the
    # CORS preflight. No need to advertise the full method set.
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

app.include_router(routes_analyze.router, prefix="/analyze", tags=["Analysis"])


@app.get("/health", tags=["Health"])
async def health() -> dict:
    """Liveness probe."""
    return {"status": "ok"}
