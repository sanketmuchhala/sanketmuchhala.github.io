# Future roadmap: "Ask my portfolio"

Not implemented in this build. This document exists so the schema is designed to support it later without a rewrite, per the design principle: build for the graph traversal need that's real today, not the retrieval system that might be needed someday.

## The feature

A natural-language box where a visitor can ask things like:

- "What projects demonstrate agent orchestration?"
- "Where has Sanket used PostgreSQL with AI systems?"
- "How did his work move from traditional ML toward agentic AI?"
- "What projects combine retrieval, FastAPI, and PostgreSQL?"

## Why the current schema is ready for this

Every one of the example questions above is answerable by **typed graph traversal** over the ontology already in `skill-map/data.generated.json`:

- "Projects demonstrating agent orchestration" = `Project --IMPLEMENTS--> Capability(agent-orchestration)`.
- "PostgreSQL used with AI systems" = `Project --USES--> Technology(PostgreSQL)` intersected with `Project --IMPLEMENTS--> Capability(*)` where the capability's category is AI/ML.
- "Evolution from ML to agentic AI" = walking `EVOLVED_INTO` edges plus each project's `Experience`/date, already present.
- "Retrieval + FastAPI + PostgreSQL" = a 3-way intersection over `USES`/`IMPLEMENTS` edges.

None of these need semantic retrieval — they need a small query planner over the existing typed edges.

## Staged comparison, simplest first

1. **Deterministic graph traversal** — a hand-written or lightly pattern-matched query layer over `data.generated.json` (e.g. keyword → entity resolution, then BFS/intersection over typed edges). No LLM, no backend, runs entirely client-side. Handles the four example questions above and most realistic variants. **Start here.**
2. **Graph + lexical search** — add fuzzy/keyword ranking (already present for the visual search box) as a fallback when entity resolution in (1) doesn't find a confident match, so a slightly-off phrasing still returns something.
3. **Embeddings + ordinary RAG** — only if (1)+(2) demonstrably fail on real question phrasings (would need to be observed, not assumed). Requires a query-time embedding call, which means either a small server endpoint (breaking the static-site model) or a client-side embedding model (bundle-size and latency cost). This is the point at which "does this need a backend" becomes a real question worth revisiting.
4. **Graph-enhanced RAG** — embeddings for entity resolution, then graph traversal for the actual answer. Only worth it if (3) is adopted and multi-hop questions turn out to be common.
5. **Full GraphRAG** — community summarization + LLM-driven multi-hop retrieval. Given the graph's size (hundreds, not tens of thousands, of nodes), this tier is unlikely to ever be justified — it solves a scale problem this portfolio doesn't have.

## Hard constraint carried forward

This is a static site. Any stage beyond (2) that calls an LLM at query time needs a server-side proxy holding the API key — it can never be called directly from browser code. That alone is a reason to exhaust (1) and (2) thoroughly before considering (3)+.
