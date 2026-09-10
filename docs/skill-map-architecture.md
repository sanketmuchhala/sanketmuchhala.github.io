# `/skill-map` Architecture Decision

## Constraints that shape the decision

- The site is static Jekyll/GitHub Pages. There is no server, no database, no API-key-safe runtime — anything that needs a secret must run at build time, offline, never in the browser.
- The real graph, even fully expanded, is small: on the order of 150–220 nodes (projects, repositories, technologies, capabilities, domains, experience, a handful of concepts) and 350–500 typed edges. This is not "web-scale" data.
- The underlying evidence (READMEs, manifests, source layout) is text, not a large unstructured corpus that needs chunking/retrieval to be useful — it needs to be *read once, extracted, and structured*.
- Freshness only needs to change when the owner adds or changes a project — not continuously.

## Options evaluated

| | Usefulness for this graph | Build/hosting complexity | Recurring cost | GH Pages/Jekyll fit | Freshness model | Needs a runtime LLM? |
|---|---|---|---|---|---|---|
| **A. Build-time KG → static JSON → browser viz** | High — exactly matches the data shape and question set | Low | None | Native | Manual regen, committed output | No |
| **B. A + lightweight local text/search index** | High — covers all Phase 11 search requirements | Low (search is substring/keyword over the same JSON, no index service) | None | Native | Same as A | No |
| **C. A + embeddings/semantic retrieval** | Marginal at this scale — keyword search over curated fields already answers every stated question | Medium (embedding model, vector storage, similarity code) | Possibly (embedding API calls at build time, or a local model to maintain) | Works but adds a moving part | Same as A, plus re-embed step | No at build; **yes** if used for a future NL Q&A feature |
| **D. Full GraphRAG pipeline** | Low — GraphRAG earns its cost on large, unstructured, frequently-changing corpora feeding an LLM at query time; this graph is small, structured, and mostly static | High (graph DB or GraphRAG library, chunking/community-summary pipeline, retrieval orchestration) | Yes — LLM calls at index time and likely at query time | Poor — needs a backend for query-time LLM calls, which a static site doesn't have | Requires re-indexing pipeline | **Yes**, and it can't run in-browser without exposing a key |
| **E. Markdown/Obsidian-style source compiled into graph data** | High, but only as *the curation layer* — great for facts a machine can't infer (importance, narrative connections, domain classification) | Low | None | Native | Manual edits, same regen step | No |

## Decision: A + E, plus the search slice of B

The generation pipeline is **build-time only** (Option A): a local Python script reads GitHub + curated YAML, writes a single deterministic `skill-map/data.generated.json`, and the browser only ever fetches and renders that static file — identical operating model to the current `data.json`, so no hosting or deployment change is needed.

**Curation is Option E**, not a second automated pass: `skill-map/source/overrides.yml` and `skill-map/source/entities.yml` are the explicit, hand-maintained source of truth for anything a script can't reliably infer — which of two similar projects is more important, whether a fork counts as "substantially modified," what a private repo's public-safe abstraction should say, which projects narratively evolved into which. Keeping this as plain YAML (not a second automated LLM classification pass) means the output is fully deterministic and auditable by reading two small files, and it never requires an API key to regenerate the site.

**Search is answered by a slice of Option B**, not C: the graph's `name`/`description`/`aliases`/capability/domain text is a small, well-curated corpus. A plain substring/keyword match over that JSON, done entirely client-side in `graph.js`, satisfies every search case in the brief ("search projects, skills, capabilities, domains, technologies, and experiences"). There is no query-time ambiguity this graph's data needs semantic embedding to resolve — a search for "RAG" or "graph" or "legal" already matches the curated `description`/`aliases` fields directly.

**Options C and D are explicitly rejected for the current build**, and the rejection tracks the user's own working hypothesis:

- **C (embeddings)** is deferred. It would only earn its complexity if free-text natural-language queries need ranking beyond keyword match (e.g. "what did Sanket build for lawyers" without the word "legal" appearing). That's a real future capability, not a current one — see `docs/skill-map-roadmap.md`.
- **D (GraphRAG)** is rejected outright for this graph. GraphRAG solves multi-hop semantic retrieval over large, loosely-structured document collections feeding an LLM's context window. This graph is the opposite of that problem: it's small, explicitly typed, and its questions ("what capabilities does this project demonstrate," "how did X evolve into Y") are answered by direct graph traversal over typed edges — no retrieval or ranking step is involved at all. Building GraphRAG here would add a graph database, an LLM-driven summarization/indexing step, recurring API cost, and a query-time backend the static site doesn't have — for a problem that deterministic traversal already solves for free. It would also directly contradict the "no LLM API key in browser code" constraint, since GraphRAG's retrieval step typically runs at query time, not build time.

## Why not a CI/webhook pipeline

Phase 16 (`docs/skill-map-audit.md` §4) and the brief both caution against introducing credentials or cross-repo webhook automation without a strong reason. The generator is invoked manually and locally — `python scripts/build_skill_map.py` — using the developer's own `gh auth login` session (already configured with `repo`/`read:org` scopes). Output is committed to git, so the public Jekyll build never needs GitHub credentials, and there is no secret to manage in GitHub Actions. A periodic manual refresh (run the script, review the diff, commit) is proportionate to how often the underlying repos actually change.

## Evidence model

Relationships do not carry a numeric confidence score. A score like `0.93` looks precise and means nothing to a visitor — and inventing one invites over-claiming. Instead each relationship carries a list of typed **evidence observations**:

```json
"evidence": [
  {"type": "manifest", "source": "package.json"},
  {"type": "direct",   "source": "source language breakdown"}
],
"evidenceLabel": "Implementation + dependency evidence"
```

The five classes are `direct` (implemented in source), `config` (infrastructure/deployment configuration), `manifest` (declared dependency), `documentation` (README or project write-up), and `curated` (supplied by the author). Multiple classes can support one relationship, and the site renders the human-readable `evidenceLabel`, never a number. An internal rank exists in `ontology.EVIDENCE_RANK` purely to order evidence and decide what is strong enough for the default view; it is never published.

Capability claims are the ones that matter most, so they are handled more strictly than technologies: when `overrides.yml` lists a project's `capabilities`, keyword inference for that project is **discarded rather than merged**. A stray README word cannot add a capability claim to a curated project. (This is not hypothetical — before word-boundary matching was added, the substring `rag` inside "drag and drop" made a chess game claim Retrieval-Augmented Generation.)

## Projects, repositories, and what the visitor sees

`Project` and `Repository` are separate node types, but they serve different purposes. Repositories exist for provenance: source links, deployment URLs, language breakdown, dependency extraction, update tracking, and the fact that one project may span several repositories. They are **not** what a visitor came to see, so every repository node is tier `deep` and appears only in the Technical view — repository detail otherwise surfaces inside a project's detail panel as links.

The visitor-facing graph communicates:

    Capability  <->  Project  <->  Capability
         with Technology, Domain, and Experience providing context

## Privacy model

The rule is an allowlist, not just a denylist. Filtering happens once, at generation time, never at runtime:

1. `fetch_github.py` fetches all repos including private ones — knowing the shape of private work is useful for classification, and the raw cache is gitignored.
2. A private repository can never become a named node. `privacy.assert_public_safe` raises if anything tries.
3. The only route from private work to the public graph is `skill-map/source/private_abstractions.yml`, where the author writes the public-safe wording by hand. The `capabilities`, `technologies`, and `domains` lists in that file are **allowlists**: `validate.py` rejects any edge touching an abstraction node that is not enumerated there.
4. That allowlist is what keeps public aggregates honest. A count like "used across 7 projects" can only include a private project's contribution if that specific relationship was approved, because unapproved private work produces no nodes and no edges at all — there is nothing to count.
5. Every node and edge carries a `provenance` value from `privacy.PUBLIC_PROVENANCE` (`public-repository`, `portfolio-document`, `curated`, `approved-abstraction`). Validation rejects anything else.
6. As a mechanical backstop behind the process, `validate.py` also greps the finished output against every private repo name, URL, and deployment homepage.

Never published without explicit approval: private repository names, paths, URLs, descriptions, architecture, libraries, endpoints, customer or company names, counts, commit information, inferred capabilities, inferred domains, or internal terminology.

## Fork provenance

Forks record what actually happened rather than a flag that flattens it:

```yaml
origin: fork
upstream: 666ghj/MiroFish
substantially_modified: true
include_in_portfolio: true
contribution_note: >
  My work is the GTM productization layer ... not the underlying
  simulation engine, which is upstream work.
```

The public description and the detail panel both describe the author's own contribution and link the upstream repository. Nothing implies authorship of upstream work.

## Default view size

The full graph is ~184 nodes. Rendering all of it at once is a hairball, so the default (`core`) view is capped at roughly 60-80 nodes — currently 71: 18 projects, 14 capabilities, 11 domains, 25 technologies, 3 roles. `validate.py` enforces those bands and fails the build if a curation change pushes the opening view out of range. Everything else is reachable through Full ecosystem mode, the Technical view, or per-node expansion.

## Answering "is GraphRAG needed eventually?"

Only if a future "ask my portfolio" natural-language Q&A feature is built (explicitly out of scope for this build — see `docs/skill-map-roadmap.md`), and even then the roadmap recommends starting with deterministic graph traversal + the existing lexical search before reaching for embeddings, and treating full GraphRAG as the last resort for a problem this graph's size is unlikely to ever actually have.
