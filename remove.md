# Candidate files to remove before open-sourcing

A review of files that appear **unused by the running application** or that
**should not be in a public repo**. Nothing here has been deleted — this is for
you to review and decide. Grouped from "safe / clearly junk" to "your call".

Verification method: import/reference searches across `frontend/src`,
`index.html`, and the backend `app/` package. The backend app imports only from
`app.*`; the frontend imports were traced from `main.tsx`/`App.tsx` outward.

---

## 1. Committed build artifacts & OS junk — remove and git-ignore

These should never be tracked. They're already added to `.gitignore` in this
change; you still need to untrack the ones already committed.

| File | Why |
|------|-----|
| `.DS_Store` | macOS Finder metadata. |
| `data_visual.cpython-312.pyc` | Compiled Python bytecode (stray, at repo root). |
| `__pycache__/data_visual.cpython-312.pyc` | Compiled Python bytecode. |
| `__pycache__/pitch_category.cpython-312.pyc` | Compiled Python bytecode. |

```bash
git rm --cached .DS_Store data_visual.cpython-312.pyc \
  __pycache__/data_visual.cpython-312.pyc __pycache__/pitch_category.cpython-312.pyc
# then delete the files locally; the updated .gitignore keeps them out going forward
```

---

## 2. Legacy prototype code (pre-refactor) — not part of the running app

The app is now the FastAPI service in `backend/app/` + the React app in
`frontend/`. These root-level scripts are the **earlier pandas/plotly prototype**
and are **not imported by `backend/app/`** anywhere. Keep them only if you want
them as historical reference (they'd be better in a separate branch/archive).

| Path | What it is |
|------|------------|
| `Player_profile.py` | Old `PlayerProfile` class; imports `data_visual`/`pitch_category`. |
| `data_visual.py` | Old plotly `ScatterPlot` prototype. |
| `pitch_category.py` | Old pitch-category helper. |
| `scripts/` | Old classification pipeline: `ClassifyAll.py`, `ClassifyFastball.py`, `ClassifySlider.py`, `ClassifyChangeup.py`, `clean_data.py`, `pipeline.py`, `__init__.py`. |
| `visuals/` | `displayFastball.py` + `ClassifyFastball.pdf` (a generated PDF). |
| `frontendfixes.txt` | Scratch note (contents: just "Dependencies:"). |

None of these are referenced by `backend/app/main.py` or its imports.

---

## 3. Unused frontend source files

Not imported anywhere (traced from `main.tsx` / `App.tsx`).

| File | Notes |
|------|-------|
| `frontend/src/App.css` | Not imported by any component (the app styles via `index.css` + Tailwind tokens). |
| `frontend/src/assets/react.svg` | Default Vite starter asset; unreferenced. (Dir becomes empty.) |
| `frontend/src/lib/utils.ts` | The `cn()` helper — **not imported anywhere**. Removing it also makes two dependencies unused: **`clsx`** and **`tailwind-merge`** can then be dropped from `frontend/package.json`. |

---

## 4. Unused public assets

Files in `frontend/public/` are served at the site root; these are never
referenced in `src/` or `index.html`.

| File | Notes |
|------|-------|
| `frontend/public/baseball.gif` | Not referenced. |
| `frontend/public/oberlin.png` | Oberlin logo; not referenced. |
| `frontend/public/zone.png` | Not referenced (the location chart draws the zone in CSS, not from an image). |

**Keep (do not remove):**
- `frontend/public/sample-pitch-data.csv` — served by the `/sample` page.
- `frontend/public/vite.svg` — currently the browser-tab **favicon** (`index.html`). It's the default Vite icon; consider **replacing** it with your own rather than deleting (deleting it leaves a broken favicon link).

---

## 5. Your call — tooling / config files

Not app code; keep or remove based on preference.

| Path | Consideration |
|------|---------------|
| `frontend/README.md` | The default "React + TypeScript + Vite" template readme. Low value to contributors — consider deleting or replacing with a short pointer to `docs/frontend.md`. |
| `BSBL-Scout.code-workspace` | Personal VS Code workspace file. Fine to keep; some prefer not to commit editor files. |
| `.claude/` and `CLAUDE.md` | Claude Code config (currently untracked). **Note:** `CLAUDE.md` instructs tools to use a `graphify-out/` knowledge graph that **does not exist** in the repo, so those instructions are dead. If you commit `CLAUDE.md`, prune the graphify section; otherwise leave both untracked. |

---

## Summary command (review each line first!)

```bash
# 1. Untrack artifacts (see section 1)
git rm --cached .DS_Store data_visual.cpython-312.pyc \
  __pycache__/data_visual.cpython-312.pyc __pycache__/pitch_category.cpython-312.pyc

# 2. Legacy prototype (only if you don't want it archived)
git rm -r Player_profile.py data_visual.py pitch_category.py scripts visuals frontendfixes.txt

# 3. Unused frontend source
git rm frontend/src/App.css frontend/src/assets/react.svg frontend/src/lib/utils.ts
#    …then remove "clsx" and "tailwind-merge" from frontend/package.json and re-lock.

# 4. Unused assets
git rm frontend/public/baseball.gif frontend/public/oberlin.png frontend/public/zone.png
```

After any frontend removals, run `npm run build` in `frontend/` to confirm
nothing broke, and `uvicorn app.main:app` in `backend/` to confirm the API still
starts.
