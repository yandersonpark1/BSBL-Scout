# BSBL-Scout

BSBL-Scout is an open-source pitching-analytics app for players of all ages,
sizes, and styles. Drop in a Rapsodo pitching CSV and it builds a full set of
development dashboards — movement, velocity, release, command, and spin — so
players can see strengths and weaknesses instead of guessing.

## How it works

BSBL-Scout is **stateless — there is no database**. You upload a CSV, the API
validates it, analyses it entirely in memory, and returns one complete report
that the frontend renders. Nothing is stored on the server. Close the tab and
the data is gone.

```
CSV upload ──▶ POST /analyze ──▶ validate schema ──▶ pandas analysis ──▶ JSON report ──▶ dashboards
```

## The dashboards

| Panel | What it shows |
|-------|---------------|
| **KPI row** | Tracked pitches, strike %, peak & average velocity, arsenal size, spin efficiency |
| **Arsenal table** | Per-pitch-type profile: usage, velo, spin, spin-eff, break, strike % |
| **Movement profile** | Horizontal vs vertical break, with each pitch's average shape |
| **Velocity trend** | Velocity across the session by pitch order — consistency & fatigue |
| **Release point** | Release side vs height — delivery repeatability & tunneling |
| **Plate location** | Where pitches crossed the plate, coloured by strike/ball — command |
| **Command / Spin bars** | Strike rate and spin efficiency ranked by pitch type |

Chart colours come from a colorblind-safe categorical palette; each pitch type
is pinned to a fixed colour so it reads the same across every panel.

## The input schema

Uploads must be a Rapsodo pitching export: two metadata lines
(`"Player ID:"`, `"Player Name:"`), a blank line, then the pitch header row and
rows. Files that don't match are rejected with a clear error. The exact required
columns are served live at `GET /analyze/schema`, and a working example lives at
[frontend/public/sample-pitch-data.csv](frontend/public/sample-pitch-data.csv).

## Run with Docker (recommended)

No `.env` and no database are needed.

```bash
git clone https://github.com/yandersonpark1/BSBL-Scout
cd BSBL-Scout
docker compose up --build
```

- Frontend: http://localhost:5173
- API + interactive docs: http://localhost:8000/docs

## Run locally (without Docker)

**Backend** (Python 3.12+):

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend** (Node 20+):

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173 and upload a CSV.

## Configuration

Everything runs with zero config; these environment variables override defaults
on the backend:

| Variable | Default | Purpose |
|----------|---------|---------|
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Browser origins allowed to call the API (comma-separated) |
| `CORS_ORIGIN_REGEX` | *(unset)* | Optional regex of extra allowed origins. Opt-in only — used for LAN dev; never a broad pattern in production |
| `CORS_ALLOW_CREDENTIALS` | `false` | Credentialed CORS. Leave off unless you add cookie/session auth |
| `MAX_UPLOAD_BYTES` | `26214400` (25 MB) | Reject uploads larger than this |
| `SHOW_API_DOCS` | `true` | Serve `/docs`, `/redoc`, `/openapi.json`. Set `false` to hide them |
| `RETRY_ATTEMPTS` | `3` | Analysis-pipeline retry attempts (transient failures only) |

The frontend reads `VITE_API_BASE` (default `http://localhost:8000`) to locate
the API.

### Deploying to production

The defaults are tuned for local development. For a public deployment:

- Set `CORS_ORIGINS` to your real frontend origin(s) and leave
  `CORS_ORIGIN_REGEX` unset — the API is then closed to everything else.
- Put a reverse proxy (nginx, Caddy, or your platform) in front of the API and
  cap the request body size (e.g. nginx `client_max_body_size 25m;`) and add
  basic rate limiting. The API is stateless and unauthenticated by design, so
  abuse protection belongs at this layer, not in per-process app state.
- Optionally set `SHOW_API_DOCS=false` to hide the interactive docs.

## Documentation

Design docs for contributors live in [`docs/`](docs/):

- [docs/backend.md](docs/backend.md) — the stateless FastAPI analysis service.
- [docs/frontend.md](docs/frontend.md) — the React/Vite dashboard app.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, code
conventions, and the one rule that keeps the two halves in sync (the report
contract).

## License

MIT — see [LICENSE](LICENSE).
