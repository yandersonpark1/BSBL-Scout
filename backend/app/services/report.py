"""
Assemble a complete :class:`PitchingReport` from a validated upload.

This is the one CPU-bound step in the request. It is deliberately synchronous
(pandas) and is invoked from the API via a threadpool so the event loop stays
free — see :mod:`app.api.routes_analyze`.
"""
from __future__ import annotations

import pandas as pd

from app.core.csv_schema import ParsedCsv
from app.services import metrics


def _session_bounds(rows: list[dict[str, str]]) -> tuple[str | None, str | None]:
    """Earliest / latest pitch timestamp as the original human-readable strings."""
    raw_dates = [r.get("Date") for r in rows if r.get("Date") and r.get("Date") != "-"]
    if not raw_dates:
        return None, None
    parsed = pd.to_datetime(
        pd.Series(raw_dates), format="%a %b %d %Y %I:%M:%S %p", errors="coerce"
    )
    valid = parsed.dropna()
    if valid.empty:
        return raw_dates[-1], raw_dates[0]
    first_idx = valid.idxmin()
    last_idx = valid.idxmax()
    return raw_dates[first_idx], raw_dates[last_idx]


def _first_value(rows: list[dict[str, str]], column: str) -> str | None:
    for r in rows:
        value = r.get(column)
        if value and value != "-":
            return value
    return None


def build_report(parsed: ParsedCsv, filename: str) -> dict:
    """Build the full report payload (plain dict, ready for Pydantic)."""
    df = metrics.prepare_dataframe(parsed.rows)

    present_types = [
        t for t in df["pitch_type"].dropna().unique().tolist() if isinstance(t, str)
    ]
    pitch_types = metrics.order_pitch_types(present_types)

    first_at, last_at = _session_bounds(parsed.rows)
    tracked = metrics.tracked(df)

    meta = {
        "player_id": parsed.player_id,
        "player_name": parsed.player_name,
        "filename": filename,
        "session_name": _first_value(parsed.rows, "Session Name"),
        "device_serial": _first_value(parsed.rows, "Device Serial Number"),
        "first_pitch_at": first_at,
        "last_pitch_at": last_at,
        "total_rows": int(len(df)),
        "tracked_pitches": int(len(tracked)),
        "columns_present": parsed.columns,
    }

    return {
        "meta": meta,
        "summary": metrics.build_summary(df, pitch_types),
        "pitch_types": pitch_types,
        "arsenal": metrics.build_arsenal(df),
        "movement": metrics.build_movement(df),
        "velocity_series": metrics.build_velocity_series(df),
        "release": metrics.build_release(df),
        "location": metrics.build_location(df),
    }
