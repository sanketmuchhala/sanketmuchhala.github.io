# `/skill-map` Audit

Findings from a full review of the existing implementation, run before the ontology/pipeline redesign. Two sources were audited: the code and data currently powering `/skill-map`, and the actual state of `github.com/sanketmuchhala` (78 repositories, fetched via `gh api`/`gh repo list` on 2026-09-10).

## 1. Current implementation

| File | Role |
|---|---|
| `skill-map/index.html` (561 lines) | Page markup, all CSS inline in a `<style>` block |
| `skill-map/graph.js` (827 lines) | D3 v7 force-directed graph |
| `skill-map/data.json` (237 lines) | Hand-edited node/edge data — the only data source |
| `_projects/*.md` (27 files) | Jekyll collection powering `/projects/` and each project's own page |
| `_data/featured_projects.yml` | 4 hand-curated entries for the homepage carousel (unrelated to skill-map) |
| `index.md` | Static hardcoded "Technologies & Tools" list (lines 63–93) and a static "Other Projects" section (lines 256–331), independent of both `_projects` and skill-map |
| `resume/index.html` | Its own hardcoded skills table and mini project list |

**No generation script exists anywhere in the repo.** `data.json` is typed by hand and there is nothing that checks it against `_projects/*.md`, GitHub, or the homepage skills list.

### Data schema

Single node array with a `group` field (`project`, `experience`, `language`, `ai`, `data`, `cloud`, `tool`) and a single link array — every edge is `{source, target, context}`, always `project|experience → technology`. No capability, domain, or project↔project relationships exist. No provenance or confidence field exists on any node or edge.

Counts: 73 nodes (27 project, 14 tool, 12 ai, 6 language, 6 data, 5 cloud, 3 experience), 115 edges. The header in `skill-map/index.html` hardcodes these counts as static initial-paint text (lines 471–483); `graph.js`'s `applyFilter()` overwrites them at runtime, so a `data.json` edit that isn't matched by an HTML edit produces a momentary flash of stale numbers before JS runs.

### D3 implementation (worth keeping)

SVG (not canvas) rendered with D3 v7 loaded from CDN. `forceLink` + `forceManyBody` + `forceCollide` + a custom `clusterForce` (`graph.js:31-39, 140-148`) pull each `group` toward its own fixed gravity well, pre-ticked 140 times before first paint to avoid a visible explosion. Node radius scales with degree. Zoom/pan via `d3.zoom()` with auto-fit and a `zoomToNeighborhood()` re-frame on click. Filtering is pill-button based (`applyFilter`, `graph.js:670-719`); search is live substring matching over node names with 1-hop dimming (`filterBySearch`, `graph.js:726-765`); click opens an info panel with 1-hop/2-hop highlight (`setHighlight`/`applyHighlight`, `graph.js:381-472`); hover shows node and edge tooltips (edges use an invisible 10px hit-area overlay since thin SVG lines are hard to target, `graph.js:239-250`). Tech-node icons are fetched live from `cdn.jsdelivr.net` (Devicon) and `cdn.simpleicons.org` (SimpleIcons) with no local fallback. Mobile CSS converts the info panel to a bottom sheet and makes filter pills horizontally scrollable.

This is a solid, purpose-built implementation — the redesign extends it (new node/edge types, filters, story mode, curated/full toggle) rather than replacing the rendering approach.

## 2. `_projects` inventory (27 files)

All 27 `_projects/*.md` files have a matching `p-*` node in `data.json` and the URL fields agree — no orphans in either direction. One gap: file numbering jumps from `17-kemlang.md` to `19-programming-language-graph.md`; no `18-*.md` exists and no corresponding skill-map node was found either. Worth a one-line confirmation with the site owner that this was an intentional removal, not a lost file.

## 3. Stale, duplicate, and inaccurate data found

- **`kemlang.md` → wrong GitHub URL.** `_projects/17-kemlang.md` links to `github.com/sanketmuchhala/Gujju.py`; the real, actively-pushed repo is `kemlang-py` (pushed 2026-05-13, has CI). `Gujju.py` does not appear in the account's repository list at all.
- **`LanguageLineage` tech stack conflicts across two files.** `_projects/19-programming-language-graph.md` lists `TypeScript, D3.js`. `_data/featured_projects.yml`'s `language-lineage` entry lists `Vue.js, TypeScript, D3.js, Firebase`. The actual repo's `package.json` shows neither Vue nor Firebase — it uses React, Cytoscape.js + Cytoscape-cose-bilkent, D3 (d3-hierarchy/selection/shape/transition/zoom), Zustand, Vite, and Zod. Both existing descriptions of this project are wrong.
- **`GTM-SImulator` is a GitHub fork** but is presented everywhere on the site (rank 2, high priority) as an original project. This needs an explicit, documented "substantially modified fork" decision rather than silent inclusion or silent exclusion — folded into the new pipeline as an override with a stated reason.
- **Four different naming/id schemes for the same projects.** `_projects/*.md` filenames (`17-kemlang.md`), skill-map ids (`p-kemlang`), `_data/featured_projects.yml` ids (`kemlang`), and the real GitHub repo name (`kemlang-py`) never had a validated mapping between them.
- **Three to four independent copies of the same project description** exist per project (front matter, `data.json` node `desc`, `index.md`'s hardcoded cards for a subset, `resume/index.html`'s own mini list), with no propagation between them — wording already drifts (e.g. LexOrchestrator's description differs slightly in each).
- **Homepage skills list is disconnected from skill-map.** `index.md`'s static list is missing most technologies present in `data.json` (TypeScript, Docker, Next.js, Supabase, D3.js, Swift, Airflow, Vercel, Claude Code, Gemini, DeepSeek, Ollama…), and skill-map is missing several technologies the resume claims (PySpark, Snowflake, MySQL, Teradata, Power BI, Tableau) — none of these appear as nodes anywhere in skill-map.
- **Live-icon CDN dependency with no fallback.** Every tech-node icon is fetched live from jsdelivr/simpleicons at render time; a CDN outage silently removes icons rather than degrading gracefully.

## 4. GitHub inventory (`sanketmuchhala`, 78 repositories)

- **9 private.** Deliberately not enumerated here — this document lives in a public repository, so it names private repositories no more than the generated graph does. Two of them have author-approved public abstractions in `skill-map/source/private_abstractions.yml`; the other seven contribute nothing to the public graph.
- **10 forks**: `gods-eye-view`, `ai-model-quality-challenge`, `GTM-SImulator`, `worldmonitor`, `openclaw`, `Care-Coordination`, `data-science-from-scratch`, `Fake_News_Detection`, `text_summarization`, `ML_from_Scratch`.
- **0 archived.**
- **Only 27 of 78** are currently represented on `/skill-map`.

### Notable public work missing entirely from the current graph

- `LanguageLineage` — an interactive, cited, confidence-scored graph of 152 programming languages, live at `languagelineage.org`, built with React + Cytoscape.js + D3 + Zustand + Zod, with `vitest`/`playwright` tests and a `resvg`/`satori`-based OG-image build step. This is itself a knowledge-graph project directly relevant to "which projects involve graphs."
- `Project-AirNet` (network-graph visualization of the US airport network — degrees of separation, clustering coefficient, preferential attachment) and `US-Metro-Transit-Network-Mega-Visualization` (multi-city transit network analytics, pathfinding, disruption simulation) — two more graph/network-theory projects with a clear thematic link to each other and to `LanguageLineage`.
- `WindowPilot` — a small Swift macOS scheduling utility for using Claude Code more effectively.

### Notable private work with public-safe abstraction potential

- A legal-tech product, publicly branded as **MatterGraph**, that grew out of the public `LexOrchestrator` litigation-agent demo. Approved public signal: Domain = legal tech; Capabilities = agent orchestration, graph systems, RAG, LLM applications.
- MCP security/observability tooling, published under the abstraction **MCP Flight Recorder**. Approved public signal: Capabilities = MCP, observability.

Both abstractions are written by hand in `skill-map/source/private_abstractions.yml`, which is the only route by which private work reaches the public graph. The wording there is the author's own, not copied from the private repositories.

### Repositories classified as excluded-by-default (documented, not silently dropped)

- **Forks with no substantial modification**: `ai-model-quality-challenge` (a hiring-challenge fork), `data-science-from-scratch`, `ML_from_Scratch`, `Fake_News_Detection`, `text_summarization`, `Care-Coordination`, `openclaw`, `gods-eye-view`, `worldmonitor`.
- **Coursework / internship / tutorial repos**: `Elem-AI-FA-22`, `Coursera-Google-Data-Analytics`, `The-Sparks-Foundation---Data-Science-and-Business-Analytics`, `Sahu-Internship-`, `Sparks-Internship-task-1`, `LeetCode-`, `Interns-Management-Portal-`, `Scholarship-Management-Portal`, `ADSA-PROJECT.github.io`, `Meeting-Scheduler`, `VanillaJS-WeatherAppDemo.github.io`, `PBL.github.io`, `Python-Screen-Recorder-`.
- **Config/empty/test repos**: `sanketmuchhala` (GitHub profile config), `Claude-code-Source-code` (0 KB), plus two private scratch/challenge repos.
- **All 9 private repos** as *named, linked* nodes — two contribute author-approved abstracted capability/domain evidence per the privacy model in `docs/skill-map-architecture.md`; the rest contribute nothing.

`GTM-SImulator` is the one fork included in the portfolio, and it records real provenance (`origin: fork`, `upstream: 666ghj/MiroFish`, `substantially_modified: true`) with a contribution note describing only the author's own layer. Everything below the `core` tier (e.g. `TallyCart`, `WindowPilot`, `Rock-Paper-Scissor-Lizard-Spock`, `Cat-Racing`, `CatGPT`, `BloodPressure_tracker`) appears only in Full Ecosystem mode.

## 5. Timeline signal (grounded in repo `createdAt`/`pushedAt`, not assumed)

- **2021–2022**: coursework and first web/data projects (`Coursera-Google-Data-Analytics`, `Scholarship-Management-Portal`, `face-landmark-detection`, `Sales-Data-Analysis-`).
- **2023–2024 (Aug)**: applied data science and ML foundations — `house-price-ml-pipeline`, `Project-Patent-Classification`, `Superstore-Sales-Management-Dashboard`, `Game-analytics`, `jobfit`, IBM/IU experience entries.
- **2024 (Sep) – 2025**: NLP/RAG experimentation and early agentic tools — `FileChatAI`, `RAG-Chatbot-Jupyter`, `ApplicationAgent`, `ai-slop-detector-model`, `Linkedin-Connections`, `AIStudyBuddy`, `mirofish-api-server`, `GTM-SImulator`, `LexOrchestrator` (first agent-orchestration project), `kemlang-py`, `LanguageLineage`.
- **2026**: production-oriented AI systems and infrastructure/graph tooling — the MatterGraph legal-AI product (evolution of `LexOrchestrator`), MCP security tooling, `NewsSite`/funnynews.club, and continued `LanguageLineage` development.

This progression (data analysis → applied ML → RAG experimentation → multi-agent orchestration → production AI SaaS + agent infrastructure/security) is real and repo-dated; it is the basis for the "evolution" timeline view and the `EVOLVED_INTO` edges in the new schema.
