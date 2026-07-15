"""
Canonical Rapsodo pitching-export schema + strict validation.

Every accepted upload has the exact shape of the sample export:

    "Player ID:",111111
    "Player Name:",Anderson Park
    <blank line>
    "No","Date","Pitch ID","Pitch Type", ... ,"Release Extension (ft)"
    <Data Values>
    ...

This module is the single source of truth for "does this file fit the schema".
It refuses anything that is not a Rapsodo pitching export so the analysis
pipeline never has to defend against arbitrary CSVs.
"""
from __future__ import annotations

import csv
import io
from dataclasses import dataclass, field


class CsvValidationError(ValueError):
    """
    Raised when an upload does not fit the Rapsodo pitching schema.

    Carries a human-readable ``message`` and optional structured ``details``
    (e.g. the list of missing columns) that the API surfaces as a 422 so the
    uploader knows exactly what is wrong. This is a client error and is never
    retried.
    """

    def __init__(self, message: str, *, details: dict | None = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


# The full column header row of a Rapsodo pitching export, in order. Extra
# columns beyond these are tolerated; the required subset below must all exist.
CANONICAL_COLUMNS: tuple[str, ...] = (
    "No", "Date", "Pitch ID", "Pitch Type", "Is Strike",
    "Strike Zone Side", "Strike Zone Height", "Velocity", "Total Spin",
    "True Spin (release)", "Spin Efficiency (release)", "Spin Direction",
    "Spin Confidence", "VB (trajectory)", "HB (trajectory)", "SSW VB",
    "SSW HB", "VB (spin)", "HB (spin)", "Horizontal Angle", "Release Angle",
    "Release Height", "Release Side", "Gyro Degree (deg)", "Unique ID",
    "Device Serial Number", "SO - latLongConfidence", "SO - latitude",
    "SO - longitude", "SO - rotMatConfidence", "SO - timestamp", "SO - Xx",
    "SO - Xy", "SO - Xz", "SO - Yx", "SO - Yy", "SO - Yz", "SO - Zx",
    "SO - Zy", "SO - Zz", "Horizontal Approach Angle",
    "Vertical Approach Angle", "Session Name", "Intent Type",
    "Release Extension (ft)",
)

# Columns that MUST be present for the file to be a usable pitching export.
# (Kept to the identity + core measurement fields so a slightly trimmed export
# — e.g. without the SO-* rotation-matrix columns — is still accepted.)
REQUIRED_COLUMNS: tuple[str, ...] = (
    "No", "Date", "Pitch Type", "Is Strike", "Velocity", "Total Spin",
    "Spin Efficiency (release)", "VB (trajectory)", "HB (trajectory)",
    "Release Height", "Release Side",
)

# The two metadata lines that precede the header row.
PLAYER_ID_PREFIX = "Player ID:"
PLAYER_NAME_PREFIX = "Player Name:"


@dataclass
class ParsedCsv:
    """The validated, structured result of reading a Rapsodo export."""

    player_id: str | None
    player_name: str | None
    columns: list[str]
    rows: list[dict[str, str]] = field(default_factory=list)


def _decode(raw: bytes) -> str:
    """Decode upload bytes, tolerating the odd non-UTF-8 export."""
    for encoding in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            return raw.decode(encoding)
        except UnicodeDecodeError:
            continue
    raise CsvValidationError("File is not valid text (could not decode).")


def parse_and_validate(raw: bytes) -> ParsedCsv:
    """
    Parse raw upload bytes into a validated :class:`ParsedCsv`.

    Raises :class:`CsvValidationError` (→ HTTP 422) if the file does not fit the
    Rapsodo pitching schema. All error paths are deterministic client errors and
    must not be retried.
    """
    if not raw or not raw.strip():
        raise CsvValidationError("File is empty.")

    text = _decode(raw)
    all_lines = text.splitlines()

    # Locate the metadata lines and the header row. The two metadata lines are
    # expected first, but we scan defensively so a stray leading blank line does
    # not break an otherwise-valid export.
    player_id: str | None = None
    player_name: str | None = None
    header_index: int | None = None

    for idx, line in enumerate(all_lines):
        stripped = line.strip().strip('"')
        if stripped.startswith(PLAYER_ID_PREFIX):
            player_id = _extract_meta_value(line)
        elif stripped.startswith(PLAYER_NAME_PREFIX):
            player_name = _extract_meta_value(line)
        elif line.lstrip().startswith('"No"') or line.lstrip().startswith("No,"):
            header_index = idx
            break

    if player_id is None and player_name is None:
        raise CsvValidationError(
            "Missing player metadata. A Rapsodo export must begin with "
            f'"{PLAYER_ID_PREFIX}" and "{PLAYER_NAME_PREFIX}" lines.'
        )
    if header_index is None:
        raise CsvValidationError(
            'Could not find the pitch header row (a line starting with "No").'
        )

    csv_body = "\n".join(all_lines[header_index:])
    reader = csv.DictReader(io.StringIO(csv_body))
    columns = list(reader.fieldnames or [])

    missing = [c for c in REQUIRED_COLUMNS if c not in columns]
    if missing:
        raise CsvValidationError(
            "This CSV does not match the required pitching schema.",
            details={
                "missing_columns": missing,
                "required_columns": list(REQUIRED_COLUMNS),
            },
        )

    rows = [row for row in reader]
    if not rows:
        raise CsvValidationError("No pitch rows found below the header.")

    return ParsedCsv(
        player_id=player_id,
        player_name=player_name,
        columns=columns,
        rows=rows,
    )


def _extract_meta_value(line: str) -> str | None:
    """Pull the value from a metadata line like ``"Player Name:",Anderson Park``."""
    try:
        parts = next(csv.reader(io.StringIO(line)))
    except StopIteration:
        return None
    if len(parts) >= 2:
        value = parts[1].strip()
        return value or None
    return None
