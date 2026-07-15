# BSBL-Scout — Design Documentation

This folder documents *how* BSBL-Scout is built, for contributors. For how to
**run** it, see the top-level [README](../README.md).

- **[backend.md](backend.md)** — the FastAPI analysis service (stateless, no DB).
- **[frontend.md](frontend.md)** — the React/Vite dashboard app.

## System at a glance

BSBL-Scout turns a single Rapsodo pitching CSV into a set of development
dashboards. It is deliberately **stateless**: there is no database, no user
accounts, and nothing is written to disk on the server. One upload produces one
self-contained report, which the browser renders and keeps in memory.

```
┌────────────┐   multipart CSV    ┌─────────────────────────────┐
│  Browser   │ ─────────────────▶ │  FastAPI backend            │
│  (React)   │                    │                             │
│            │                    │  validate schema            │
│  upload    │                    │      │                      │
│  form      │                    │      ▼                      │
│            │ ◀───────────────── │  pandas analysis → report   │
│  dashboards│   one JSON report  │  (all in-memory, discarded) │
└────────────┘                    └─────────────────────────────┘
        │
        ▼
  sessionStorage (client-only cache, cleared when the tab closes)
```

### The contract between the two halves

The single integration point is the **`PitchingReport`** JSON object:

- The backend produces it — the Pydantic models in
  [`backend/app/schemas/report.py`](../backend/app/schemas/report.py) are the
  source of truth.
- The frontend consumes it — the TypeScript interfaces in
  [`frontend/src/lib/report.ts`](../frontend/src/lib/report.ts) are a hand-kept
  mirror of those models.

**If you change one, change the other.** A field added on the backend must be
added to `report.ts`, and vice-versa. There is no code generation between them
(kept deliberately simple), so this mirroring is a manual contributor
responsibility.

### Tech stack

| | Backend | Frontend |
|---|---|---|
| Language | Python 3.12 | TypeScript |
| Framework | FastAPI + Uvicorn | React 19 |
| Core libs | pandas, Pydantic v2 | Vite, React Router, Recharts, Tailwind CSS v4 |
| State | none (stateless) | in-memory + `sessionStorage` |

See the per-side docs for the module-by-module breakdown.
