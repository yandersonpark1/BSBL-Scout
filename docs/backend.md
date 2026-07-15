# Backend design — BSBL-Scout API

A single-purpose, **stateless** FastAPI service: it accepts one Rapsodo pitching
CSV, validates it, analyses it in memory with pandas, and returns one complete
`PitchingReport`. There is no database, no persistence, no per-chart round-trip,
and no server-side state between requests.

## Design principles

1. **Stateless by design.** A file comes in, a report goes out, and nothing is
   kept. This removes an entire class of concerns (storage, migrations, auth,
   PII-at-rest) and makes the service trivial to deploy and scale horizontally.
2. **Strict at the door, forgiving inside.** Uploads are validated hard against
   the Rapsodo schema *before* any analysis runs. Once a file is accepted, the
   analytics layer treats missing/blank cells gracefully (`null` in the report)
   rather than failing.
3. **Keep the math framework-free.** All analytics live in
   [`services/metrics.py`](../backend/app/services/metrics.py) as pure functions
   over a pandas DataFrame — no FastAPI, no Pydantic. That makes them testable
   and reusable from a notebook or script.
4. **Zero-config, env-overridable.** Every tunable has a sensible default so the
   app runs with no setup, but each can be overridden by an environment variable
   for deployment.

## Directory map

```
backend/
├── Dockerfile
├── requirements.txt          # fully pinned
└── app/
    ├── main.py               # FastAPI app: CORS, router wiring, /health
    ├── api/
    │   └── routes_analyze.py # POST /analyze, GET /analyze/schema
    ├── core/
    │   ├── config.py         # Settings, resolved from env at import time
    │   ├── csv_schema.py     # the Rapsodo schema + strict validation
    │   └── retry.py          # async exponential-backoff retry helper
    ├── schemas/
    │   └── report.py         # Pydantic response models (the API contract)
    ├── services/
    │   ├── metrics.py        # pure pandas analytics (framework-free)
    │   └── report.py         # orchestrates metrics → full report dict
    └── utils/                # (reserved; currently empty)
```

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Liveness probe → `{"status": "ok"}`. |
| `GET` | `/analyze/schema` | Advertises the schema an upload must satisfy (required + canonical columns, metadata prefixes, max upload size). Useful for tooling and docs. |
| `POST` | `/analyze` | The one real endpoint. Multipart CSV in, full `PitchingReport` JSON out. |

Interactive docs are served by FastAPI at `/docs` (Swagger) and `/redoc`.

## Request lifecycle (`POST /analyze`)

Defined in [`routes_analyze.py`](../backend/app/api/routes_analyze.py):

```
1. Guard filename      → must end in .csv           (else 400)
2. await file.read()   → non-blocking body read
3. Guard size          → > MAX_UPLOAD_BYTES?         (else 413)
4. pipeline() under retry_async:
      parse_and_validate(raw)   ── threadpool ──▶ ParsedCsv   (422 on bad schema)
      build_report(parsed, ...) ── threadpool ──▶ report dict
5. PitchingReport(**report)     → validated JSON response
```

### Concurrency model

FastAPI's event loop must stay responsive, but pandas is synchronous CPU work.
So the handler:

- `await`s the request-body read (non-blocking I/O), then
- runs the CPU-bound `parse_and_validate` **and** `build_report` steps inside
  `starlette.concurrency.run_in_threadpool`, keeping the event loop free to
  serve other requests.

### Error handling & retry

The pipeline is wrapped in [`retry_async`](../backend/app/core/retry.py)
(exponential backoff + jitter). The key rule:

- **`CsvValidationError` is never retried.** It is a deterministic client error
  (a malformed file) — retrying would waste time and return the same failure. It
  is surfaced as **HTTP 422** with a structured detail body (`message` plus,
  e.g., `missing_columns`) so the uploader knows exactly what to fix.
- **Any other exception is treated as transient** and retried up to
  `RETRY_ATTEMPTS` times. If it still fails, the handler returns **HTTP 500**
  with a generic message (internals are not leaked).

| Outcome | Status | Body |
|---------|--------|------|
| Success | 200 | `PitchingReport` |
| Not a `.csv` | 400 | `detail: "Invalid file type…"` |
| Schema mismatch / empty / no rows | 422 | `detail: {message, missing_columns?, …}` |
| Too large | 413 | `detail: "File too large…"` |
| Repeated transient failure | 500 | `detail: "Failed to analyse…"` |

## The schema contract — [`core/csv_schema.py`](../backend/app/core/csv_schema.py)

This module is the **single source of truth** for "does this file fit the
Rapsodo pitching schema". Everything downstream can assume a valid shape.

A valid export is:

```
"Player ID:",111111
"Player Name:",Anderson Park
<blank line>
"No","Date","Pitch ID","Pitch Type", … ,"Release Extension (ft)"
<Data Values>…
…
```

`parse_and_validate(raw: bytes) -> ParsedCsv`:

1. Decodes bytes tolerantly (`utf-8-sig` → `utf-8` → `latin-1`).
2. Scans for the two metadata lines (`Player ID:`, `Player Name:`) and the
   header row (a line starting with `"No"`). Scanning defensively means a stray
   leading blank line doesn't break an otherwise-valid file.
3. Requires the **`REQUIRED_COLUMNS`** subset to be present (identity + core
   measurements). Extra columns are tolerated; a slightly trimmed export (e.g.
   missing the `SO-*` rotation-matrix columns) is still accepted.
4. Requires at least one data row.

`CANONICAL_COLUMNS` is the full ordered header of a complete export;
`REQUIRED_COLUMNS` is the must-have subset. Both, plus the metadata prefixes and
`MAX_UPLOAD_BYTES`, are advertised at `GET /analyze/schema`.

## The analytics layer — [`services/metrics.py`](../backend/app/services/metrics.py)

Pure functions over a cleaned DataFrame. The entry point is
`prepare_dataframe(rows)`, which normalises raw CSV strings into typed internal
columns:

```
pitch_no, date, pitch_type, is_strike, velocity, total_spin, spin_eff,
vb, hb, release_height, release_side, extension, zone_side, zone_height
```

Key ideas:

- **Pitch-type canonicalisation.** `canonical_pitch_type` maps the many
  spellings a device might emit (`four-seam`, `4-seam`, `fastball` → `Fastball`)
  to a single display label. This matters because the frontend colour map keys
  on exactly these labels, so a pitch keeps one colour regardless of spelling.
  `CANON_ORDER` fixes the legend order and colour-slot assignment.
- **`_round`** converts `NaN`/`inf` to `None` so the emitted JSON is always
  clean and every derived metric can be `null`.
- **Two filters** define what counts:
  - `tracked(df)` — rows with a velocity reading (an actually-tracked pitch).
  - `typed(df)` — tracked pitches that also carry a recognised pitch type.

Each `build_*` function produces one section of the report:
`build_summary` (KPI row), `build_arsenal` (per-pitch-type table),
`build_movement`, `build_velocity_series`, `build_release`, `build_location`.

## Report assembly — [`services/report.py`](../backend/app/services/report.py)

`build_report(parsed, filename)` is the one CPU-bound orchestration step. It
prepares the DataFrame once, derives the present/ordered pitch types, computes
session bounds and metadata, then calls each `build_*` metric and returns a
plain dict shaped exactly like `PitchingReport`. The route then hands that dict
to Pydantic for final validation.

## The API contract — [`schemas/report.py`](../backend/app/schemas/report.py)

Pydantic v2 models describe the response. The report is **fitted to the input**:
pitch-type breakdowns are driven by whatever types appear in the file, and every
derived metric is `Optional`, so a column that is absent or all-blank comes back
as `null` instead of failing validation.

> ⚠️ **Contract mirroring:** these models are mirrored by hand in
> [`frontend/src/lib/report.ts`](../frontend/src/lib/report.ts). Change both
> together.

## Configuration — [`core/config.py`](../backend/app/core/config.py)

Resolved once at import time from environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Allowed browser origins (comma-separated). |
| `CORS_ORIGIN_REGEX` | *(unset)* | Optional regex of extra allowed origins; opt-in for LAN dev only. |
| `CORS_ALLOW_CREDENTIALS` | `false` | Credentialed CORS (off — the API uses no cookies/tokens). |
| `MAX_UPLOAD_BYTES` | `26214400` (25 MB) | Reject larger uploads (defends the in-memory pipeline). |
| `SHOW_API_DOCS` | `true` | Serve `/docs`, `/redoc`, `/openapi.json`. |
| `RETRY_ATTEMPTS` | `3` | Pipeline retry attempts (transient failures only). |
| `RETRY_BASE_DELAY` | `0.2` | Initial backoff, seconds (doubles each retry). |
| `RETRY_MAX_DELAY` | `2.0` | Upper bound on any single backoff, seconds. |

## Security posture

The stateless design removes whole vulnerability classes (no DB/SQL, no file
writes, no `eval`/`exec`/`subprocess`/`pickle`, nothing persisted). The
deliberate choices that remain:

- **Upload size is bounded during the read.** `POST /analyze` reads the body in
  1 MB chunks and rejects (413) as soon as `MAX_UPLOAD_BYTES` is exceeded, so an
  oversized upload is never fully buffered in memory.
- **CORS is closed by default.** Only `CORS_ORIGINS` is allowed;
  `CORS_ORIGIN_REGEX` is opt-in and credentialed CORS is off. Lock
  `CORS_ORIGINS` to your real origin in production.
- **Errors don't leak internals.** The 500 path returns a generic message (no
  stack traces); validation errors return only the intended `missing_columns`.
- **Reflected upload fields** (`player_name`, etc.) are returned as JSON and
  rendered by React, which auto-escapes — never render them with
  `dangerouslySetInnerHTML`.
- **Not in scope for the app:** rate limiting and a hard body-size cap belong at
  a reverse proxy / gateway, because the service is intentionally unauthenticated
  and horizontally scalable (per-process limits wouldn't hold across workers).

## Extending the backend

**To add a new metric / dashboard panel:**

1. Add a `build_<thing>` function in `services/metrics.py` (pure, over the
   DataFrame).
2. Call it in `services/report.py`'s `build_report` and add the key to the
   returned dict.
3. Add the Pydantic model + field in `schemas/report.py`.
4. Mirror the type in `frontend/src/lib/report.ts` and build the UI (see the
   [frontend doc](frontend.md)).

**To relax/tighten accepted files:** edit `REQUIRED_COLUMNS` in
`core/csv_schema.py`. Everything downstream reads the normalised columns from
`prepare_dataframe`, so adding a tolerated-optional column only requires wiring
it there.

## Testing

There is currently **no automated test suite** — a good first contribution. The
seams are already test-friendly: `services/metrics.py` and
`core/csv_schema.py` are pure and import-light, and
[`frontend/public/sample-pitch-data.csv`](../frontend/public/sample-pitch-data.csv)
is a ready-made fixture. See [CONTRIBUTING.md](../CONTRIBUTING.md).
