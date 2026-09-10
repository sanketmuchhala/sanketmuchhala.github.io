"""Repository classification and evidence extraction.

Turns Pass-1 GitHub metadata + Pass-2 README/manifest text into typed
EVIDENCE observations. Nothing here emits a numeric confidence score;
every observation is one of ontology.EVIDENCE_TYPES with a source.

The excluded-repo lists below are NOT heuristics — they were decided by
hand during the audit (docs/skill-map-audit.md §4), because "is this a
hiring-challenge or coursework repo" is not reliably inferable from
metadata. overrides.yml can flip any of them per repo.
"""
from __future__ import annotations

import re

from . import ontology

# ── Canonical technology catalog ────────────────────────────────────────
# id -> (display name, category, [lowercase substrings matched against
#        dependency manifests / README text])
TECH_CATALOG: dict[str, tuple[str, str, list[str]]] = {
    "python":       ("Python", "language", ["python"]),
    "typescript":   ("TypeScript", "language", ["typescript"]),
    "javascript":   ("JavaScript", "language", ["javascript"]),
    "r-lang":       ("R", "language", []),
    "swift":        ("Swift", "language", ["swift"]),
    "php":          ("PHP", "language", ["php"]),
    "sql":          ("SQL", "language", ["sql"]),
    "html":         ("HTML", "language", []),
    "css":          ("CSS", "language", []),
    "shell":        ("Shell", "language", []),

    "tensorflow":   ("TensorFlow", "ai-framework", ["tensorflow"]),
    "pytorch":      ("PyTorch", "ai-framework", ["pytorch", "torch"]),
    "sklearn":      ("Scikit-learn", "ai-framework", ["scikit-learn", "sklearn"]),
    "spacy":        ("spaCy", "ai-framework", ["spacy"]),
    "transformers": ("Transformers", "ai-framework", ["transformers", "huggingface"]),
    "nltk":         ("NLTK", "ai-framework", ["nltk"]),
    "langchain":    ("LangChain", "ai-framework", ["langchain"]),
    "faiss":        ("FAISS", "ai-framework", ["faiss"]),
    "sentence-transformers": ("Sentence Transformers", "ai-framework", ["sentence-transformers", "sentence transformer"]),

    "openai":       ("OpenAI", "model-provider", ["openai"]),
    "gemini":       ("Google Gemini", "model-provider", ["gemini", "google.generativeai", "@google/genai"]),
    "deepseek":     ("DeepSeek", "model-provider", ["deepseek"]),
    "ollama":       ("Ollama", "model-provider", ["ollama"]),
    "claude":       ("Claude / Anthropic", "model-provider", ["anthropic", "claude"]),

    "pandas":       ("Pandas", "framework", ["pandas"]),
    "numpy":        ("NumPy", "framework", ["numpy"]),
    "matplotlib":   ("Matplotlib", "framework", ["matplotlib"]),
    "seaborn":      ("Seaborn", "framework", ["seaborn"]),
    "mlflow":       ("MLflow", "dev-tooling", ["mlflow"]),
    "networkx":     ("NetworkX", "framework", ["networkx"]),
    "geopandas":    ("GeoPandas", "framework", ["geopandas"]),

    "aws":          ("AWS", "cloud", ["boto3", "amazonaws", "aws-sdk"]),
    "azure":        ("Azure", "cloud", ["azure"]),
    "docker":       ("Docker", "infrastructure", ["docker"]),
    "supabase":     ("Supabase", "database", ["supabase"]),
    "vercel":       ("Vercel", "cloud", ["vercel"]),
    "postgresql":   ("PostgreSQL", "database", ["postgres", "postgresql"]),
    "firebase":     ("Firebase", "database", ["firebase"]),
    "railway":      ("Railway", "cloud", ["railway"]),

    "react":        ("React", "framework", ["\"react\"", "react-dom"]),
    "nextjs":       ("Next.js", "framework", ["\"next\"", "next.js", "nextjs"]),
    "vuejs":        ("Vue.js", "framework", ["vue"]),
    "fastapi":      ("FastAPI", "framework", ["fastapi"]),
    "flask":        ("Flask", "framework", ["flask"]),
    "nodejs":       ("Node.js", "framework", ["node"]),
    "d3":           ("D3.js", "visualization", ["d3-hierarchy", "d3-selection", "d3-shape", "d3-zoom", "\"d3\""]),
    "cytoscape":    ("Cytoscape.js", "visualization", ["cytoscape"]),
    "vis-network":  ("vis-network", "visualization", ["vis-network"]),
    "rshiny":       ("R Shiny", "framework", ["shiny"]),
    "mcp":          ("Model Context Protocol", "dev-tooling", ["@modelcontextprotocol/sdk", "mcp server", "model context protocol"]),
    "tailwind":     ("Tailwind CSS", "framework", ["tailwind"]),
    "airflow":      ("Apache Airflow", "infrastructure", ["airflow"]),
    "web3":         ("Web3", "framework", ["web3", "x402"]),
    "zustand":      ("Zustand", "framework", ["zustand"]),
    "zod":          ("Zod", "dev-tooling", ["zod"]),
    "vite":         ("Vite", "dev-tooling", ["vite"]),
    "swiftui":      ("SwiftUI", "framework", ["swiftui"]),
    "wordpress":    ("WordPress", "framework", ["wordpress"]),
    "leaflet":      ("Leaflet.js", "visualization", ["leaflet"]),
    "vitest":       ("Vitest", "dev-tooling", ["vitest"]),
    "playwright":   ("Playwright", "dev-tooling", ["playwright"]),
    "streamlit":    ("Streamlit", "framework", ["streamlit"]),
}

# Technologies allowed into the default (core) view. Everything else is
# real and stays in the graph, but only surfaces in Full Ecosystem mode
# or when you expand a project's neighborhood — this is what keeps the
# opening view at ~60-80 nodes instead of 140.
CORE_TECHNOLOGIES = {
    "python", "typescript", "javascript", "sql", "swift",
    "pytorch", "tensorflow", "sklearn", "transformers", "langchain",
    "openai", "claude", "gemini", "deepseek",
    "postgresql", "supabase", "docker", "aws", "azure",
    "react", "nextjs", "fastapi", "d3", "mcp", "mlflow", "airflow",
}

# Language detection uses exact matches on GitHub's language fields —
# substring matching would make "R" hit inside "react"/"processor".
LANGUAGE_EXACT_MAP = {
    "python": "python",
    "typescript": "typescript",
    "javascript": "javascript",
    "r": "r-lang",
    "swift": "swift",
    "php": "php",
    "html": "html",
    "css": "css",
    "shell": "shell",
    "jupyter notebook": "python",
    "vue": "vuejs",
}

MANIFEST_EVIDENCE_KIND = {
    "package.json": "manifest",
    "pyproject.toml": "manifest",
    "requirements.txt": "manifest",
    "Dockerfile": "config",
    "docker-compose.yml": "config",
}


def _matches(text: str, needles: list[str]) -> bool:
    """Substring match — fine for distinctive package names in manifests."""
    return any(n in text for n in needles)


def _matches_word(text: str, needles: list[str]) -> bool:
    """Word-boundary match for prose keywords.

    Capability keywords are English words, so naive substring matching
    produces false claims: "rag" hits inside "drag and drop", which is
    how a chess game ended up claiming Retrieval-Augmented Generation.
    The boundary is leading-only so deliberate prefixes still work
    ("tokeniz" -> tokenizer/tokenization).
    """
    return any(re.search(r"\b" + re.escape(n), text) for n in needles)


def detect_technologies(repo: dict, raw_evidence: dict | None) -> dict[str, list[dict]]:
    """repo -> {tech_id: [evidence, ...]}. Evidence accumulates per tech."""
    found: dict[str, list[dict]] = {}

    def add(tech_id: str, ev_type: str, source: str):
        bucket = found.setdefault(tech_id, [])
        if not any(e["type"] == ev_type and e["source"] == source for e in bucket):
            bucket.append({"type": ev_type, "source": source})

    lang = (repo.get("primaryLanguage") or {}).get("name", "") or ""
    languages = [l["node"]["name"] for l in (repo.get("languages") or [])]
    for lang_name in [lang] + languages:
        tech_id = LANGUAGE_EXACT_MAP.get(lang_name.strip().lower())
        if tech_id:
            add(tech_id, "direct", "source language breakdown")

    manifests = (raw_evidence or {}).get("manifests", {})
    for path, content in manifests.items():
        text = (content or "").lower()
        ev_type = MANIFEST_EVIDENCE_KIND.get(path, "manifest")
        for tech_id, (_, _, needles) in TECH_CATALOG.items():
            if needles and _matches(text, [n.lower() for n in needles]):
                add(tech_id, ev_type, path)

    readme = ((raw_evidence or {}).get("readme") or "").lower()
    if readme:
        for tech_id, (_, _, needles) in TECH_CATALOG.items():
            if needles and _matches(readme, [n.lower() for n in needles]):
                add(tech_id, "documentation", "README")

    return found


def detect_capabilities(repo: dict, raw_evidence: dict | None) -> dict[str, list[dict]]:
    """Candidate capabilities from text. Documentation-class evidence only.

    overrides.yml is authoritative for what a project actually
    demonstrates — these are suggestions, deliberately weaker.
    """
    found: dict[str, list[dict]] = {}
    desc = (repo.get("description") or "").lower()
    readme = ((raw_evidence or {}).get("readme") or "").lower()
    topics = " ".join(t["name"] for t in (repo.get("repositoryTopics") or [])).lower()

    for cap_id, spec in ontology.CAPABILITIES.items():
        kws = [k.lower() for k in spec["keywords"]]
        if _matches_word(desc, kws) or _matches_word(topics, kws):
            found.setdefault(cap_id, []).append({"type": "documentation", "source": "repository description"})
        elif _matches_word(readme, kws):
            found.setdefault(cap_id, []).append({"type": "documentation", "source": "README"})

    return found


# ── Exclusion lists decided by hand during the audit ───────────────────
EXCLUDED_FORKS_NOT_SUBSTANTIALLY_MODIFIED = {
    "ai-model-quality-challenge", "data-science-from-scratch", "ML_from_Scratch",
    "Fake_News_Detection", "text_summarization", "Care-Coordination",
    "openclaw", "gods-eye-view", "worldmonitor",
}

EXCLUDED_COURSEWORK_TUTORIAL = {
    "Elem-AI-FA-22", "Coursera-Google-Data-Analytics",
    "The-Sparks-Foundation---Data-Science-and-Business-Analytics",
    "Sahu-Internship-", "Sparks-Internship-task-1", "LeetCode-",
    "Interns-Management-Portal-", "Scholarship-Management-Portal",
    "ADSA-PROJECT.github.io", "Meeting-Scheduler",
    "VanillaJS-WeatherAppDemo.github.io", "PBL.github.io",
    "Python-Screen-Recorder-",
}

EXCLUDED_MISC = {
    "sanketmuchhala",            # GitHub profile config repo
    "Claude-code-Source-code",    # 0 KB placeholder
    "mark1.github.io", "WorkoutLog.github.io",  # superseded personal sites
}
# Note: private repos need no entry here — build_graph.py skips every
# private repo before consulting any exclusion list or override, so
# naming them would leak identifiers into a public repository for no
# functional gain.


def is_excluded_by_default(repo_name: str, repo: dict) -> str | None:
    """Exclusion reason, or None if the repo should be considered."""
    if repo_name in EXCLUDED_MISC:
        return "miscellaneous/config/placeholder repo"
    if repo_name in EXCLUDED_COURSEWORK_TUTORIAL:
        return "coursework/tutorial/internship artifact"
    if repo.get("isFork"):
        if repo_name in EXCLUDED_FORKS_NOT_SUBSTANTIALLY_MODIFIED:
            return "fork, not substantially modified"
        return "fork (unreviewed — include_in_portfolio must be set explicitly)"
    if (repo.get("diskUsage") or 0) == 0 and not (repo.get("description") or ""):
        return "empty repository"
    return None


CATEGORY_KEYWORDS = [
    ("agentic-ai", ["agent", "orchestrat", "swarm", "multi-agent"]),
    ("ai-ml", ["ai", "ml", "rag", "llm", "nlp", "classif", "model"]),
    ("infrastructure", ["security", "flight recorder", "control plane", "mcp"]),
    ("visualization", ["visualization", "graph", "network", "dashboard"]),
    ("developer-tool", ["cli", "sdk", "developer", "tool", "extension"]),
    ("data-science", ["data science", "analysis", "pipeline", "forecast"]),
    ("mobile-application", ["ios", "swift", "swiftui"]),
    ("web-application", ["web app", "website", "platform"]),
]


def classify_category(repo: dict) -> str:
    text = f"{repo.get('description', '')} {repo.get('name', '')}".lower()
    for category, keywords in CATEGORY_KEYWORDS:
        if any(kw in text for kw in keywords):
            return category
    return "miscellaneous"
