"""
Pydantic response models for the analysis report.

The report is *fitted to the input*: pitch-type breakdowns are driven by whatever
pitch types appear in the uploaded file, and every derived metric is Optional so
a column that is absent or all-blank in a given export simply comes back as
``null`` instead of failing validation. One upload → one fully-typed report.
"""
from __future__ import annotations

from pydantic import BaseModel, Field


class ReportMeta(BaseModel):
    """Provenance + shape of the analysed file."""

    player_id: str | None = None
    player_name: str | None = None
    filename: str
    session_name: str | None = None
    device_serial: str | None = None
    first_pitch_at: str | None = None
    last_pitch_at: str | None = None
    total_rows: int
    tracked_pitches: int
    columns_present: list[str]


class SummaryKpis(BaseModel):
    """Headline numbers for the KPI row."""

    tracked_pitches: int
    strike_pct: float | None = None
    peak_velocity: float | None = None
    peak_velocity_pitch: str | None = None
    avg_velocity: float | None = None
    pitch_type_count: int
    avg_spin_efficiency: float | None = None
    avg_extension: float | None = None


class ArsenalRow(BaseModel):
    """One row of the per-pitch-type arsenal table."""

    pitch_type: str
    count: int
    usage_pct: float
    avg_velocity: float | None = None
    max_velocity: float | None = None
    avg_spin: float | None = None
    avg_spin_efficiency: float | None = None
    avg_vb: float | None = None
    avg_hb: float | None = None
    strike_pct: float | None = None
    avg_release_height: float | None = None
    avg_release_side: float | None = None
    avg_extension: float | None = None


class MovementPoint(BaseModel):
    """A single pitch's break for the movement (HB × VB) plot."""

    pitch_type: str
    hb: float = Field(..., description="Horizontal break, inches")
    vb: float = Field(..., description="Vertical break, inches")
    velocity: float | None = None


class VelocityPoint(BaseModel):
    pitch_number: int
    velocity: float


class VelocitySeries(BaseModel):
    """Chronological velocity for one pitch type (velocity-trend line)."""

    pitch_type: str
    data: list[VelocityPoint]


class ReleasePoint(BaseModel):
    """Release-point coordinates for one pitch."""

    pitch_type: str
    side: float = Field(..., description="Release side, feet")
    height: float = Field(..., description="Release height, feet")


class LocationPoint(BaseModel):
    """Where one pitch crossed the plate."""

    pitch_type: str
    side: float
    height: float
    is_strike: bool | None = None


class PitchingReport(BaseModel):
    """The complete analysis returned by ``POST /analyze``."""

    meta: ReportMeta
    summary: SummaryKpis
    pitch_types: list[str]
    arsenal: list[ArsenalRow]
    movement: list[MovementPoint]
    velocity_series: list[VelocitySeries]
    release: list[ReleasePoint]
    location: list[LocationPoint]


class SchemaInfo(BaseModel):
    """Advertised schema for the ``GET /analyze/schema`` discovery endpoint."""

    required_columns: list[str]
    canonical_columns: list[str]
    player_id_prefix: str
    player_name_prefix: str
    max_upload_bytes: int
