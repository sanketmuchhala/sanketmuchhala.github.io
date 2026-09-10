# Updating `/skill-map`

## Adding a new public project

1. Push/finish the repo on GitHub as usual.
2. (Optional but recommended) add a `_projects/*.md` entry for it as before — the pipeline uses its `description`/`technologies` as documentation-tier evidence if the repo itself has no GitHub description.
3. If it should appear in the **default (core) view**, add an entry to `skill-map/source/overrides.yml` under `projects:` with `tier: core`, a short accurate `description`, and — most importantly — the `capabilities:` it actually demonstrates. Capabilities are the primary layer of the graph, and the list you write is authoritative: keyword inference for that project is discarded, not merged. Add `domains:` if relevant, and `capability_notes:` for anything worth explaining in the detail panel.

   Note the size budget: the core view is capped at roughly 60-80 nodes and `validate.py` enforces it. Adding a 23rd core project will fail the build until something else drops to `tier: extended` — that pressure is deliberate.

   If it's a fork, record real provenance instead of claiming it:
   ```yaml
   origin: fork
   upstream: someone-else/their-repo
   substantially_modified: true
   include_in_portfolio: true
   contribution_note: >
     What I actually built on top — never the upstream author's work.
   ```
4. If it's a genuinely new capability, add it to `CAPABILITIES` in `scripts/skill_map/ontology.py` (name, `tier`, one-line description, keyword triggers). New technologies go in `TECH_CATALOG` in `scripts/skill_map/classify.py`; add it to `CORE_TECHNOLOGIES` there only if it belongs in the default view.
5. If it's private but you want a public-safe abstraction of it (like MatterGraph or the MCP flight recorder), write the abstraction yourself in `skill-map/source/private_abstractions.yml` — never let the pipeline pull the private repo's real name/URL in automatically; that's actively blocked by `scripts/skill_map/privacy.py`.
6. Regenerate:
   ```
   python3 scripts/build_skill_map.py
   ```
   Review the diff of `skill-map/data.generated.json` before committing — this is the same discipline as reviewing any generated-code diff.
7. Commit `skill-map/data.generated.json`, `_data/skill_map.json`, and whatever `skill-map/source/*.yml` files you changed together.

## Narrative connections (evolved-into / related-to)

Add an entry under `narrative_edges:` in `skill-map/source/overrides.yml`:

```yaml
narrative_edges:
  - from: <project id>
    to: <project id>
    type: EVOLVED_INTO
    context: "One sentence explaining the relationship."
```

Pick the type that's actually true — they mean different things and validation requires all of them to be curated, never inferred:

| Type | Meaning |
|---|---|
| `EVOLVED_INTO` | earlier work of mine matured into later work |
| `DERIVED_FROM` | built on top of someone else's upstream work |
| `INSPIRED_BY` | idea borrowed, code not |
| `SHARES_PATTERN_WITH` | same technique, different context |
| `RELATED_TO` | generic sibling relationship |

`from`/`to` are the project node ids (GitHub repo name, or a `private_abstractions.yml` id for abstracted private work).

## Story modes

Add/edit an entry under `story_modes:` in `skill-map/source/entities.yml` — an `id`, `name`, `description`, and a `node_ids` list (mix of project ids, `cap-<id>` capability ids, `dom-<id>` domain ids, or experience ids). These power the narrative-path buttons on the page.

## Hiding a project

Add its repo name to the `hidden:` list in `skill-map/source/overrides.yml`, or set `tier: extended` instead of `core` if it should still exist in Full Ecosystem mode.

## Refreshing GitHub metadata without touching curation

```
python3 scripts/build_skill_map.py
```

Re-fetches repo metadata and README/manifest evidence for the shortlisted repos in `scripts/build_skill_map.py`'s `CURATED_REPOS_FOR_EVIDENCE`, then rebuilds against the current `overrides.yml`/`entities.yml`/`private_abstractions.yml` unchanged. Add a repo name to that list if you want its README/manifests fetched for evidence too.

## If validation fails

`scripts/skill_map/validate.py` will print each issue and the script exits non-zero without writing anything — the site keeps serving the last good generated file. Common causes:

* a new project with an empty description and no `_projects/*.md` entry;
* the core view drifting outside its 60-80 node budget after a tier change;
* a core node with no edges to other core nodes (it would render as an island);
* a narrative edge referencing an id that doesn't exist yet;
* an edge touching a private-derived abstraction that wasn't itself approved in `private_abstractions.yml`;
* or — the one that should never happen — a private repo name, URL, or deployment host appearing in the output.
