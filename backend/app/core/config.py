"""
Runtime configuration for the BSBL-Scout backend.

The service is intentionally stateless and database-free: a CSV is uploaded,
analysed in-memory, and the full report is returned in one response. Everything
here is driven by environment variables so the open-source deployment can be
tuned without code changes, but every value has a sensible default so the app
runs with zero configuration.
"""
from __future__ import annotations

import os


def _get_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


def _get_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


def _get_list(name: str, default: list[str]) -> list[str]:
    raw = os.getenv(name)
    if not raw:
        return default
    return [item.strip() for item in raw.split(",") if item.strip()]


def _get_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


class Settings:
    """Container for all tunable settings, resolved once at import time."""

    # Browser origins allowed to call the API (comma-separated env override).
    # In production, set this to your deployed frontend origin(s).
    CORS_ORIGINS: list[str] = _get_list(
        "CORS_ORIGINS",
        ["http://localhost:5173", "http://127.0.0.1:5173"],
    )

    # Optional regex of additional allowed origins. Left unset by default so the
    # deployment is closed to exactly CORS_ORIGINS above. For local dev where the
    # Vite server is reached over the LAN (0.0.0.0 / a machine IP) rather than
    # localhost, opt in by exporting, e.g.:
    #   CORS_ORIGIN_REGEX='https?://(localhost|127\.0\.0\.1|0\.0\.0\.0|\d{1,3}(\.\d{1,3}){3})(:\d+)?'
    # Never point this at a broad pattern on a public deployment.
    CORS_ORIGIN_REGEX: str | None = os.getenv("CORS_ORIGIN_REGEX") or None

    # The API uses no cookies or auth tokens, so credentialed CORS is off by
    # default. Only enable it if you add cookie/session auth AND pin
    # CORS_ORIGINS to explicit origins (never a wildcard) — the two together are
    # what the CORS spec requires.
    CORS_ALLOW_CREDENTIALS: bool = _get_bool("CORS_ALLOW_CREDENTIALS", False)

    # Serve the interactive API docs (/docs, /redoc, /openapi.json). On by
    # default (this is an open-source API); set false to hide them in a locked
    # deployment.
    SHOW_API_DOCS: bool = _get_bool("SHOW_API_DOCS", True)

    # Reject uploads larger than this (defends the in-memory pipeline).
    MAX_UPLOAD_BYTES: int = _get_int("MAX_UPLOAD_BYTES", 25 * 1024 * 1024)  # 25 MB

    # Async retry policy for the analysis pipeline (transient failures only).
    RETRY_ATTEMPTS: int = _get_int("RETRY_ATTEMPTS", 3)
    RETRY_BASE_DELAY: float = _get_float("RETRY_BASE_DELAY", 0.2)  # seconds
    RETRY_MAX_DELAY: float = _get_float("RETRY_MAX_DELAY", 2.0)  # seconds


settings = Settings()
