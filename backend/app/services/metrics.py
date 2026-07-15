"""
Pure, framework-free analytics over a pitching DataFrame.

Every function here takes the cleaned DataFrame produced by
:func:`prepare_dataframe` and returns plain Python data structures. Keeping the
math free of FastAPI/Pydantic makes it trivial to unit-test and to reuse from a
notebook or script.

The DataFrame uses these normalised internal column names:
    pitch_no, date, pitch_type, is_strike, velocity, total_spin, spin_eff,
    vb, hb, release_height, release_side, extension, zone_side, zone_height
"""
from __future__ import annotations

import math

import pandas as pd

# ---------------------------------------------------------------------------
# Pitch-type canonicalisation
# ---------------------------------------------------------------------------
# Maps the many spellings a device might emit to a single display label. The
# frontend colour map keys on exactly these labels, so a pitch keeps one colour
# regardless of how the export spelled it.
_CANON = {
    "fastball": "Fastball",
    "four-seam": "Fastball",
    "fourseam": "Fastball",
    "4-seam": "Fastball",
    "sinker": "Sinker",
    "two-seam": "Sinker",
    "twoseam": "Sinker",
    "2-seam": "Sinker",
    "cutter": "Cutter",
    "cut": "Cutter",
    "slider": "Slider",
    "sweeper": "Slider",
    "curveball": "Curveball",
    "curve": "Curveball",
    "changeup": "Changeup",
    "change up": "Changeup",
    "change-up": "Changeup",
    "splitter": "Splitter",
    "split": "Splitter",
    "knuckleball": "Knuckleball",
    "knuckle": "Knuckleball",
}

# Canonical ordering → drives legend order and colour-slot assignment.
CANON_ORDER = [
    "Fastball", "Sinker", "Cutter", "Slider",
    "Curveball", "Changeup", "Splitter", "Knuckleball",
]


def canonical_pitch_type(raw: str | None) -> str | None:
    if raw is None:
        return None
    key = str(raw).strip().lower()
    if not key or key == "-":
        return None
    return _CANON.get(key, str(raw).strip())


def _round(value, ndigits: int):
    """Round, converting NaN/inf to ``None`` so the JSON stays clean."""
    if value is None:
        return None
    try:
        f = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(f) or math.isinf(f):
        return None
    return round(f, ndigits)


def order_pitch_types(types: list[str]) -> list[str]:
    """Canonical types first (fixed order), then any unknown types alphabetically."""
    known = [t for t in CANON_ORDER if t in types]
    unknown = sorted(t for t in types if t not in CANON_ORDER)
    return known + unknown


def prepare_dataframe(rows: list[dict[str, str]]) -> pd.DataFrame:
    """Turn raw CSV row dicts into a typed, cleaned DataFrame."""
    df = pd.DataFrame(rows)

    def num(col: str) -> pd.Series:
        if col not in df.columns:
            return pd.Series([pd.NA] * len(df), dtype="float64")
        # "-" and blanks become NaN.
        return pd.to_numeric(
            df[col].replace({"-": None, "": None}), errors="coerce"
        )

    out = pd.DataFrame()
    out["pitch_no"] = pd.to_numeric(df.get("No"), errors="coerce")
    out["date"] = df.get("Date")
    out["pitch_type"] = (
        df.get("Pitch Type").map(canonical_pitch_type)
        if "Pitch Type" in df.columns
        else None
    )
    out["is_strike"] = (
        df.get("Is Strike").map(_parse_strike)
        if "Is Strike" in df.columns
        else None
    )
    out["velocity"] = num("Velocity")
    out["total_spin"] = num("Total Spin")
    out["spin_eff"] = num("Spin Efficiency (release)")
    out["vb"] = num("VB (trajectory)")
    out["hb"] = num("HB (trajectory)")
    out["release_height"] = num("Release Height")
    out["release_side"] = num("Release Side")
    out["extension"] = num("Release Extension (ft)")
    out["zone_side"] = num("Strike Zone Side")
    out["zone_height"] = num("Strike Zone Height")
    return out


def _parse_strike(value) -> bool | None:
    if value is None:
        return None
    v = str(value).strip().upper()
    if v == "Y":
        return True
    if v == "N":
        return False
    return None


def tracked(df: pd.DataFrame) -> pd.DataFrame:
    """Rows representing an actually-tracked pitch (has a velocity reading)."""
    return df[df["velocity"].notna()]


def typed(df: pd.DataFrame) -> pd.DataFrame:
    """Tracked pitches that also carry a recognised pitch type."""
    t = tracked(df)
    return t[t["pitch_type"].notna()]


# ---------------------------------------------------------------------------
# Aggregations
# ---------------------------------------------------------------------------
def strike_pct(df: pd.DataFrame) -> float | None:
    called = df["is_strike"].dropna()
    if called.empty:
        return None
    return _round(called.mean() * 100, 1)


def build_summary(df: pd.DataFrame, pitch_types: list[str]) -> dict:
    t = tracked(df)
    peak_velocity = None
    peak_pitch = None
    if not t.empty and t["velocity"].notna().any():
        idx = t["velocity"].idxmax()
        peak_velocity = _round(t.loc[idx, "velocity"], 1)
        peak_pitch = t.loc[idx, "pitch_type"]

    return {
        "tracked_pitches": int(len(t)),
        "strike_pct": strike_pct(df),
        "peak_velocity": peak_velocity,
        "peak_velocity_pitch": peak_pitch if isinstance(peak_pitch, str) else None,
        "avg_velocity": _round(t["velocity"].mean(), 1) if not t.empty else None,
        "pitch_type_count": len(pitch_types),
        "avg_spin_efficiency": _round(t["spin_eff"].mean(), 1) if not t.empty else None,
        "avg_extension": _round(t["extension"].mean(), 2) if not t.empty else None,
    }


def build_arsenal(df: pd.DataFrame) -> list[dict]:
    t = typed(df)
    total = len(t)
    rows: list[dict] = []
    if total == 0:
        return rows

    for pitch_type, grp in t.groupby("pitch_type"):
        count = int(len(grp))
        rows.append({
            "pitch_type": pitch_type,
            "count": count,
            "usage_pct": _round(count / total * 100, 1),
            "avg_velocity": _round(grp["velocity"].mean(), 1),
            "max_velocity": _round(grp["velocity"].max(), 1),
            "avg_spin": _round(grp["total_spin"].mean(), 0),
            "avg_spin_efficiency": _round(grp["spin_eff"].mean(), 1),
            "avg_vb": _round(grp["vb"].mean(), 1),
            "avg_hb": _round(grp["hb"].mean(), 1),
            "strike_pct": strike_pct(grp),
            "avg_release_height": _round(grp["release_height"].mean(), 2),
            "avg_release_side": _round(grp["release_side"].mean(), 2),
            "avg_extension": _round(grp["extension"].mean(), 2),
        })

    rows.sort(key=lambda r: r["count"], reverse=True)
    return rows


def build_movement(df: pd.DataFrame) -> list[dict]:
    t = typed(df).dropna(subset=["vb", "hb"])
    return [
        {
            "pitch_type": r.pitch_type,
            "hb": _round(r.hb, 1),
            "vb": _round(r.vb, 1),
            "velocity": _round(r.velocity, 1),
        }
        for r in t.itertuples()
    ]


def build_velocity_series(df: pd.DataFrame) -> list[dict]:
    t = typed(df).dropna(subset=["velocity", "pitch_no"]).sort_values("pitch_no")
    series: list[dict] = []
    for pitch_type, grp in t.groupby("pitch_type"):
        series.append({
            "pitch_type": pitch_type,
            "data": [
                {"pitch_number": int(r.pitch_no), "velocity": _round(r.velocity, 1)}
                for r in grp.itertuples()
            ],
        })
    return series


def build_release(df: pd.DataFrame) -> list[dict]:
    t = typed(df).dropna(subset=["release_side", "release_height"])
    return [
        {
            "pitch_type": r.pitch_type,
            "side": _round(r.release_side, 2),
            "height": _round(r.release_height, 2),
        }
        for r in t.itertuples()
    ]


def build_location(df: pd.DataFrame) -> list[dict]:
    t = typed(df).dropna(subset=["zone_side", "zone_height"])
    points: list[dict] = []
    for r in t.itertuples():
        strike = r.is_strike
        points.append({
            "pitch_type": r.pitch_type,
            "side": _round(r.zone_side, 1),
            "height": _round(r.zone_height, 1),
            "is_strike": bool(strike) if strike is not None and not pd.isna(strike) else None,
        })
    return points
