"""Shared ontology for the skill-map knowledge graph.

Node types, edge types, evidence classes, and view tiers. Plain constants
(not an enum hierarchy) so the curated YAML files can reference them as
strings without importing anything.

Design notes that matter:
  * Capability is the primary layer. Projects prove capabilities;
    technologies explain how; domains explain where.
  * Repository is kept as a distinct node type for provenance and source
    links, but repositories live in the "deep" tier and never clutter the
    default view.
  * Relationships carry EVIDENCE (a list of typed observations), never a
    numeric confidence score shown to visitors.
"""

NODE_TYPES = [
    "project",
    "repository",
    "technology",
    "capability",
    "domain",
    "experience",
    "concept",
]

TECH_CATEGORIES = [
    "language",
    "framework",
    "database",
    "infrastructure",
    "cloud",
    "ai-framework",
    "model-provider",
    "visualization",
    "dev-tooling",
]

EDGE_TYPES = [
    "USES",                # Project -> Technology
    "IMPLEMENTS",           # Project -> Capability   (the primary relationship)
    "DEPLOYED_ON",           # Project -> Technology (cloud/infrastructure)
    "TARGETS_DOMAIN",         # Project -> Domain
    "HAS_REPOSITORY",          # Project -> Repository
    "IMPLEMENTED_WITH",         # Capability -> Technology
    "DEMONSTRATES",              # Experience -> Capability
    "USED",                       # Experience -> Technology
    # ── Narrative relationships. CURATED ONLY — never inferred from
    #    similarity, dates, dependencies or shared technologies. ──
    "EVOLVED_INTO",         # earlier work matured into later work
    "DERIVED_FROM",          # built on top of someone else's upstream work
    "INSPIRED_BY",            # idea/approach borrowed, code not
    "SHARES_PATTERN_WITH",     # same technique applied in a different context
    "RELATED_TO",               # generic sibling relationship
]

NARRATIVE_EDGE_TYPES = [
    "EVOLVED_INTO", "DERIVED_FROM", "INSPIRED_BY",
    "SHARES_PATTERN_WITH", "RELATED_TO",
]

# ── Evidence classes ─────────────────────────────────────────────────
# A relationship carries a list of these. No numeric confidence is ever
# published; the site renders a human-readable phrase built from the
# evidence types present (see evidence_label).
EVIDENCE_TYPES = {
    "direct":        "implementation",   # imported/implemented in source code
    "config":        "configuration",     # infrastructure / deployment config
    "manifest":      "dependency",         # package/dependency declaration
    "documentation": "documentation",       # README / project write-up
    "curated":       "curated",              # manually supplied by the author
}

# Internal ranking only — used to order evidence and to decide which
# claims are strong enough for the default view. Never rendered.
EVIDENCE_RANK = {
    "direct": 5,
    "config": 4,
    "manifest": 3,
    "documentation": 2,
    "curated": 1,
}


def evidence_label(evidence: list[dict]) -> str:
    """Human-readable phrase for a relationship's evidence.

    ["manifest", "direct"] -> "Implementation + dependency evidence"
    """
    seen: list[str] = []
    for item in sorted(evidence, key=lambda e: -EVIDENCE_RANK.get(e["type"], 0)):
        word = EVIDENCE_TYPES.get(item["type"], item["type"])
        if word not in seen:
            seen.append(word)
    if not seen:
        return ""
    phrase = " + ".join(seen)
    return phrase[0].upper() + phrase[1:] + " evidence"


def strongest(evidence: list[dict]) -> str:
    if not evidence:
        return "curated"
    return max(evidence, key=lambda e: EVIDENCE_RANK.get(e["type"], 0))["type"]


# ── View tiers ───────────────────────────────────────────────────────
# core     — the default view. Target ~60-80 nodes total.
# extended — full-ecosystem mode: smaller projects, secondary technologies.
# deep     — technical view: repository nodes and provenance detail.
TIERS = ["core", "extended", "deep"]

# ── Capability catalog ───────────────────────────────────────────────
# The primary layer of the graph. `tier: core` capabilities are the ones
# the default view is built around. Keywords are CANDIDATE generators
# only (documentation-class evidence); overrides.yml is authoritative
# for what a project actually demonstrates.
CAPABILITIES = {
    "agent-orchestration": {
        "name": "Agent Orchestration", "tier": "core",
        "description": "Coordinating multiple specialist agents through a sequenced workflow with shared state.",
        "keywords": ["multi-agent", "agent orchestration", "specialist agents", "swarm", "agentic"],
    },
    "rag": {
        "name": "Retrieval-Augmented Generation", "tier": "core",
        "description": "Grounding model output in retrieved source documents.",
        "keywords": ["rag", "graphrag", "retrieval-augmented", "retrieval augmented"],
    },
    "hybrid-retrieval": {
        "name": "Hybrid Retrieval", "tier": "core",
        "description": "Combining keyword, vector, and authority signals in a single ranking pass.",
        "keywords": ["hybrid retrieval", "hybrid rag", "keyword scoring", "authority boost"],
    },
    "information-retrieval": {
        "name": "Information Retrieval", "tier": "core",
        "description": "Indexing, embedding, and ranking a corpus for search.",
        "keywords": ["semantic search", "vector search", "embedding", "faiss", "vector index", "similarity search"],
    },
    "mcp": {
        "name": "MCP / Tool Interfaces", "tier": "core",
        "description": "Exposing and instrumenting tools for agents over the Model Context Protocol.",
        "keywords": ["model context protocol", "mcp server", "mcp protocol"],
    },
    "tool-calling": {
        "name": "Tool Calling", "tier": "core",
        "description": "Letting a model invoke typed functions and act on their results.",
        "keywords": ["tool calling", "tool use", "function calling", "tool execution"],
    },
    "evaluation-systems": {
        "name": "Evaluation Systems", "tier": "core",
        "description": "Scoring model and workflow output against benchmarks or rubrics.",
        "keywords": ["eval scoring", "evaluation pipeline", "benchmark", "evalscope", "eval harness"],
    },
    "llm-applications": {
        "name": "LLM Applications", "tier": "core",
        "description": "Shipping user-facing products built around language models.",
        "keywords": ["llm", "gpt-", "chatbot", "prompt", "ai-powered", "ai powered"],
    },
    "graph-systems": {
        "name": "Graph Systems", "tier": "core",
        "description": "Modeling, analyzing, and visualizing data as networks.",
        "keywords": ["network visualization", "graph visualization", "force-directed", "network graph",
                      "clustering coefficient", "centrality", "degrees of separation", "community detection",
                      "network theory", "evidence graph", "knowledge graph"],
    },
    "api-engineering": {
        "name": "API Engineering", "tier": "core",
        "description": "Designing and serving typed HTTP interfaces with real consumers.",
        "keywords": ["rest api", "api endpoint", "fastapi", "api server", "endpoint"],
    },
    "nlp": {
        "name": "NLP", "tier": "core",
        "description": "Extracting structure and meaning from natural-language text.",
        "keywords": ["natural language processing", "named entity recognition", "sentiment analysis",
                      "tokeniz", "text classification", "keyword extraction"],
    },
    "mlops": {
        "name": "MLOps", "tier": "core",
        "description": "Tracking experiments, versioning models, and shipping them repeatably.",
        "keywords": ["mlflow", "experiment tracking", "model registry", "mlops", "model deployment"],
    },
    "data-engineering": {
        "name": "Data Engineering", "tier": "core",
        "description": "Moving, cleaning, and reshaping data through repeatable pipelines.",
        "keywords": ["etl", "data pipeline", "data lake", "ingestion", "airflow", "data factory"],
    },
    "observability": {
        "name": "Observability", "tier": "core",
        "description": "Making system and agent behavior inspectable after the fact.",
        "keywords": ["observability", "trace viewer", "flight recorder", "audit trail", "telemetry"],
    },
    "computer-vision": {
        "name": "Computer Vision", "tier": "extended",
        "description": "Classifying and extracting structure from images.",
        "keywords": ["computer vision", "facial", "landmark detection", "image classification"],
    },
    "forecasting": {
        "name": "Forecasting", "tier": "extended",
        "description": "Projecting future values from historical series.",
        "keywords": ["forecasting", "time series", "time-series"],
    },
    "classification": {
        "name": "Classification", "tier": "extended",
        "description": "Training supervised models to label inputs.",
        "keywords": ["classifier", "classification model", "binary text classifier", "prediction model"],
    },
    "schema-constrained-generation": {
        "name": "Structured Generation", "tier": "extended",
        "description": "Forcing model output into a validated schema.",
        "keywords": ["structured output", "schema-constrained", "json schema", "zod"],
    },
    "simulation": {
        "name": "Multi-Agent Simulation", "tier": "extended",
        "description": "Running populations of agents to observe emergent outcomes.",
        "keywords": ["swarm simulation", "swarm intelligence", "multi-agent simulation", "simulation engine"],
    },
    "citation-verification": {
        "name": "Citation Verification", "tier": "extended",
        "description": "Checking generated claims against the sources they cite.",
        "keywords": ["citation verification", "citation checking", "quote accuracy"],
    },
    "authentication": {
        "name": "Authentication", "tier": "extended",
        "description": "Identity, sessions, and access control.",
        "keywords": ["authentication", "auth flow", "session token", "oauth"],
    },
}

CORE_CAPABILITIES = [k for k, v in CAPABILITIES.items() if v["tier"] == "core"]

DOMAINS = {
    "legal-tech": "Legal Tech",
    "insurance": "Insurance",
    "education": "Education",
    "developer-tooling": "Developer Tooling",
    "transportation": "Transportation",
    "real-estate": "Real Estate",
    "healthcare": "Healthcare",
    "finance": "Finance",
    "social-network-analysis": "Social / Network Analysis",
    "gaming": "Gaming",
    "linguistics": "Programming Languages",
    "security": "Security",
    "e-commerce": "E-Commerce / Retail",
    "media": "Media / News",
}
