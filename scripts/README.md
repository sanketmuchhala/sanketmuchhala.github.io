# scripts/

## `build_skill_map.py`

Regenerates the `/skill-map` knowledge graph (`skill-map/data.generated.json` and `_data/skill_map.json`) from GitHub + the curated files in `skill-map/source/`.

```
python3 scripts/build_skill_map.py                # fetch fresh from GitHub, build, validate, write
python3 scripts/build_skill_map.py --skip-fetch    # reuse the last cached GitHub fetch (fast — use this while iterating on overrides.yml)
python3 scripts/build_skill_map.py --validate-only # build in memory and validate, write nothing
```

Requires:
- Python 3.10+, with `pyyaml` installed (`pip install pyyaml`).
- `gh auth login` (scopes `repo`, `read:org`) — only for a real fetch, not `--skip-fetch`.

Nothing here needs to run as part of the Jekyll build — the generated JSON is committed to git, so `jekyll build`/`jekyll serve` never touches GitHub or Python.

See `docs/skill-map-architecture.md` for why this is a local, deterministic, build-time script rather than a CI pipeline or a runtime backend, and `docs/skill-map-updating.md` for the day-to-day workflow of adding a new project.

## `skill_map/`

The pipeline itself:

- `fetch_github.py` — Pass 1 (repo list) + Pass 2 (README/manifest evidence) via the local `gh` CLI.
- `classify.py` — technology/capability detection, category classification, and the hand-reviewed exclusion lists (forks, coursework, misc).
- `ontology.py` — shared node/edge type constants and confidence tiers.
- `build_graph.py` — merges GitHub evidence + `skill-map/source/overrides.yml` + `skill-map/source/entities.yml` + `skill-map/source/private_abstractions.yml` into the normalized graph.
- `privacy.py` — default-deny guard: a private repo's name/URL can never become a named node.
- `validate.py` — Phase-15 data quality gate; a failing check blocks the write.
