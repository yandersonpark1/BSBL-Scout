# Contributing to BSBL-Scout

Thanks for your interest in contributing! BSBL-Scout is an open-source pitching
analytics app. This guide covers how to get set up and the conventions that keep
the codebase coherent.

## Getting started

1. **Fork** the repo and clone your fork.
2. Create a branch: `git checkout -b my-feature`.
3. Get it running — see below.
4. Make your change, verify it, and open a pull request against `main`.

## Running the app

The fastest path is Docker (see the [README](README.md#run-with-docker-recommended)):

```bash
docker compose up --build
# frontend → http://localhost:5173   API/docs → http://localhost:8000/docs
```

Or run each side directly:

```bash
# backend (Python 3.12+)
cd backend && python -m venv .venv
# Windows: .venv\Scripts\activate  |  macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# frontend (Node 20+)
cd frontend && npm install && npm run dev
```

A ready-made input file lives at
[`frontend/public/sample-pitch-data.csv`](frontend/public/sample-pitch-data.csv).

## Understand the design first

Please skim the design docs before a non-trivial change:

- [`docs/backend.md`](docs/backend.md) — the stateless FastAPI service.
- [`docs/frontend.md`](docs/frontend.md) — the React dashboard app.

## The one rule you must not break: the report contract

The frontend and backend agree on a single JSON shape, the `PitchingReport`:

- Backend source of truth: [`backend/app/schemas/report.py`](backend/app/schemas/report.py)
- Frontend mirror: [`frontend/src/lib/report.ts`](frontend/src/lib/report.ts)

There is no code generation between them. **If you change one, change the other
in the same PR.** New backend fields that can be absent must be optional
(`| None` in Pydantic, `| null` in TS).

## Conventions

**Backend (Python)**

- Keep analytics **pure and framework-free** in `services/metrics.py` (functions
  over a pandas DataFrame — no FastAPI/Pydantic imports).
- Validate uploads only in `core/csv_schema.py`; downstream code assumes a valid
  shape.
- Every new setting goes through `core/config.py` with a sensible default.
- Use `NaN`/`inf` → `None` (`_round`) so emitted JSON stays clean.

**Frontend (TypeScript/React)**

- Organise by **feature** under `src/features/<name>/`; export a barrel
  `index.ts` for the public surface. Import via the `@/` alias, not `../../..`.
- **Never hard-code colours.** Pitch-type colours come from
  `lib/pitch-colors.ts`; UI colours are Tailwind tokens (`bg-surface`,
  `text-ink`, …) so both light and dark themes stay correct.
- Wrap dashboard panels in `chart-card` for a consistent shell.

## Before you open a PR

- **Frontend:** `npm run lint` and `npm run build` both pass.
- **Backend:** the API starts (`uvicorn app.main:app`) and `POST /analyze` with
  the sample CSV returns a report.
- Keep changes focused; describe what and why in the PR.

## Good first issues

- Add an automated **test suite** (there is none yet). The pure functions in
  `services/metrics.py` and the validator in `core/csv_schema.py` are the
  natural starting points, with the sample CSV as a fixture.
- Add a new dashboard panel end-to-end (backend metric → contract → React panel;
  the recipe is in both design docs).

## Reporting bugs & requesting features

Open a GitHub issue with clear steps to reproduce (for bugs) or the problem
you're trying to solve (for features). Since uploads may contain real player
data, **never attach a CSV with private information** — reproduce with the
sample file where possible.
