# Frontend design — BSBL-Scout dashboard app

A React + TypeScript single-page app built with Vite. It presents a landing /
upload experience, sends the CSV to the backend, and renders the returned
`PitchingReport` as a set of dashboards. **All report data lives only in the
browser** — there is no client-side database and no per-chart re-fetch.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | React 19 |
| Build tool | Vite |
| Language | TypeScript |
| Routing | React Router (`react-router-dom` v7) |
| Charts | Recharts |
| Styling | Tailwind CSS v4 (token-driven, via `@tailwindcss/vite`) |
| Path alias | `@/…` → `frontend/src/…` (see `vite.config.ts` + `tsconfig`) |

## Directory map

```
frontend/src/
├── main.tsx                 # root render; wraps App in <ThemeProvider>
├── App.tsx                  # routes: / , /sample , /dashboard
├── index.css                # the "Night Turf" design system (Tailwind v4 tokens)
│
├── pages/                   # one component per route
│   ├── upload-page.tsx      # landing + upload (/)
│   ├── sample-page.tsx      # sample-CSV download (/sample)
│   └── dashboard-page.tsx   # the dashboards (/dashboard)
│
├── layouts/                 # shared chrome
│   ├── navbar.tsx
│   └── footer.tsx
│
├── components/              # cross-feature primitives
│   ├── background.tsx       # ambient page backdrop
│   └── theme-toggle.tsx     # dark/light switch
│
├── features/                # feature-first modules (see below)
│   ├── upload/              # the drop zone + client-side CSV peek
│   ├── analysis/            # the API client + client-side report cache
│   ├── landing/             # hero, stats, feature grid, showcase cards
│   └── dashboard/           # all the chart/table panels
│
└── lib/                     # shared, framework-light modules
    ├── report.ts            # TS mirror of the backend PitchingReport
    ├── pitch-colors.ts      # pitch-type colour system + chart chrome tokens
    └── theme.tsx            # ThemeProvider / useTheme
```

### Feature-first structure

Code is organised by **feature**, not by file type. Each feature owns its
components/services/utils and (where useful) exposes a barrel `index.ts` so
pages import from the feature root:

```ts
import { UploadForm } from "@/features/upload";
import { Hero, Stats, FeatureGrid } from "@/features/landing";
```

The `@/` alias resolves to `frontend/src`, so imports never rely on long
`../../..` chains.

## Routing & pages

`App.tsx` wires three routes with `BrowserRouter`:

| Route | Page | Role |
|-------|------|------|
| `/` | `upload-page.tsx` | Landing: background, navbar, hero, **upload form**, sample stats, feature grid, footer. |
| `/sample` | `sample-page.tsx` | Hands the visitor a ready-made CSV (`/sample-pitch-data.csv` from `public/`) to edit and upload. |
| `/dashboard` | `dashboard-page.tsx` | Renders the report. Shows an empty state if no report is loaded. |

## The core flow: upload → analyze → dashboard

```
UploadForm (features/upload)
    │  user picks a .csv
    │  inspectCsv(file)  ── local peek → "N pitches · N columns" chip
    │  analyzeCsv(file)  ── POST /analyze (features/analysis)
    ▼
PitchingReport (JSON)
    │  saveReport(report)  ── sessionStorage backup
    │  navigate("/dashboard", { state: { report } })
    ▼
DashboardPage
    │  report from router state (freshest) OR loadReport() (survives refresh)
    ▼
panels render from the single in-memory report — no further network calls
```

### `features/analysis/analyze-service.ts` — the API client

`analyzeCsv(file)` POSTs the multipart file to `${VITE_API_BASE}/analyze`
(default `http://localhost:8000`) and returns a typed `PitchingReport`. Its retry
policy mirrors the backend's philosophy:

- **Transient failures** (network error, 5xx) → retried with exponential
  backoff + jitter.
- **Client errors** (4xx — e.g. a CSV that fails schema validation) → **fail
  fast**, surfacing the server's message (including `missing_columns`) via a
  typed `AnalyzeError`. Retrying a bad file is pointless.

### `features/analysis/report-storage.ts` — client-only cache

The report is stashed in `sessionStorage` under `bsbl:last-report` so a refresh
on `/dashboard` doesn't lose it. It is **cleared when the tab closes** — nothing
is persisted long-term, matching the backend's stateless promise. All access is
wrapped in try/catch (private mode / quota can make storage unavailable).

### `features/upload/utils/inspect-csv.ts` — local file peek

Before upload, the file is read *in the browser* to show a "N pitches · N
columns" chip. Files under 12 MB get a full row count; larger files just report
size. This never hits the network.

## The data contract — `lib/report.ts`

`report.ts` is a hand-kept **TypeScript mirror** of the backend's Pydantic
models (`backend/app/schemas/report.py`). Every optional/`null`-able backend
field is `T | null` here.

> ⚠️ **When the backend report shape changes, update `report.ts` in the same
> change.** There is no codegen between the two — this mirroring is a manual
> contributor responsibility. See the [backend doc](backend.md).

## Design system & theming

### Tokens — `index.css`

The visual language ("Night Turf") is defined entirely as CSS custom properties
inside Tailwind v4's `@theme` block: surfaces, ink, hairlines, the chartreuse
`lime` accent, status colours, and the display/sans/mono type stack. **Dark is
the default** (no class); adding `light` to `<html>` flips every semantic token
to its paper variant.

Components reference **tokens, never raw hues** (e.g. `bg-surface`, `text-ink`,
`border-line`), so both themes stay coherent and a token change propagates
everywhere.

### `lib/theme.tsx` — the theme runtime

A tiny two-theme system:

- The `<html>` class is set **before first paint** by an inline script in
  `index.html` (avoids a flash of the wrong theme).
- `ThemeProvider` (wrapping the app in `main.tsx`) keeps React state, the
  `<html>` class, and `localStorage` (`kineo-theme`) in sync.
- Toggling re-renders the tree so charts, which read resolved CSS variables at
  render time, pick up the new theme.

## Pitch colours & chart chrome — `lib/pitch-colors.ts`

Two separate colour concerns:

1. **Pitch-type ramp (`PITCH_COLORS`)** — a fixed, CVD-safe categorical palette.
   Each pitch type is pinned to a fixed slot in canonical order, so a pitch keeps
   **one colour everywhere** regardless of usage or how many types appear —
   colour follows the entity, never its rank. Unknown types fall back to
   `OTHER_COLOR`. Because two slots fall below the 3:1 contrast bar, **every
   chart ships a legend** (the "relief rule"). These labels match the backend's
   canonical pitch-type strings exactly.
2. **Chart chrome (`CHART`)** — axis/grid/ink/status colours referenced *by
   role*, each pointing at a semantic CSS token (`var(--color-…)`). So chrome
   follows the active theme automatically while the pitch ramp stays fixed.

## The dashboard — `features/dashboard/`

`dashboard-page.tsx` composes the panels into a fixed left rail
(`dashboard-sidebar`), a sticky top bar, a KPI overview, a two-column card grid,
and full-width movement/location scenes. It also offers a client-side **JSON
export** of the report (a `Blob` download; no server involved).

Panels (all under `features/dashboard/components/`):

| Component | Renders |
|-----------|---------|
| `kpi-row` | Headline KPIs (tracked pitches, strike %, peak/avg velo, arsenal size, spin eff). |
| `arsenal-table` | Per-pitch-type profile table. |
| `pitch-mix` | Usage breakdown across pitch types. |
| `movement-chart` | Horizontal vs vertical break (HB × VB). |
| `velocity-trend-chart` | Velocity across the session by pitch order. |
| `location-chart` | Plate location, coloured by strike/ball, over a CSS-rendered zone scene. |
| `metric-bars` | Ranked bars for a chosen metric (strike %, spin efficiency). |
| `stat-gauge` | Single-value gauge (e.g. strike rate vs a target). |

Shared building blocks: `chart-card` (consistent card shell), `chart-tooltip`
(themed Recharts tooltip), `pitch-legend` / `pitch-legend-multi` (the legend the
CVD relief rule requires).

## Extending the frontend

**To add a dashboard panel** once the backend emits the new report section
(see the [backend doc](backend.md)):

1. Add the field to `lib/report.ts` (mirror the Pydantic model).
2. Create `features/dashboard/components/<panel>.tsx`, wrapping content in
   `chart-card` and pulling colours from `pitch-colors.ts` — never hard-code
   hex.
3. Import and place it in `dashboard-page.tsx`, adding a `<section id="…">`
   anchor if it should appear in the sidebar nav.

**Config:** the frontend reads `VITE_API_BASE` (default `http://localhost:8000`)
to locate the API — set it at build/run time to point at a non-local backend.
