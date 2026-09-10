"""Pass 1 + Pass 2 GitHub evidence collection.

Uses the local `gh` CLI (the developer's own authenticated session — no
token is stored or committed). Writes raw, gitignored caches under
skill-map/source/cache/. Nothing here decides what's public-safe; that's
privacy.py's job, downstream.
"""
from __future__ import annotations

import base64
import json
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CACHE_DIR = REPO_ROOT / "skill-map" / "source" / "cache"
REPOS_CACHE = CACHE_DIR / "repos.json"
EVIDENCE_DIR = CACHE_DIR / "repo_evidence"

REPO_FIELDS = (
    "name,description,isPrivate,isFork,isArchived,createdAt,updatedAt,"
    "pushedAt,primaryLanguage,languages,repositoryTopics,homepageUrl,"
    "diskUsage,url"
)

MANIFEST_PATHS = [
    "package.json",
    "pyproject.toml",
    "requirements.txt",
    "Dockerfile",
    "docker-compose.yml",
]


def _run_json(cmd: list[str]) -> object:
    out = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def fetch_repo_list(owner: str = "sanketmuchhala", limit: int = 300) -> list[dict]:
    """Pass 1: lightweight metadata for every repository the owner has."""
    repos = _run_json(
        ["gh", "repo", "list", owner, "--limit", str(limit), "--json", REPO_FIELDS]
    )
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    REPOS_CACHE.write_text(json.dumps(repos, indent=2))
    return repos


def _gh_api_text(path: str) -> str | None:
    try:
        out = subprocess.run(
            ["gh", "api", path, "--jq", ".content"],
            capture_output=True, text=True, check=True,
        )
        content = out.stdout.strip()
        if not content or content == "null":
            return None
        return base64.b64decode(content).decode("utf-8", errors="replace")
    except subprocess.CalledProcessError:
        return None


def fetch_repo_evidence(owner: str, repo_name: str) -> dict:
    """Pass 2: README + top-level manifests for one shortlisted repository."""
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    evidence = {
        "readme": _gh_api_text(f"repos/{owner}/{repo_name}/readme"),
        "manifests": {},
    }
    for path in MANIFEST_PATHS:
        text = _gh_api_text(f"repos/{owner}/{repo_name}/contents/{path}")
        if text:
            evidence["manifests"][path] = text
    out_path = EVIDENCE_DIR / f"{repo_name}.json"
    out_path.write_text(json.dumps(evidence, indent=2))
    return evidence


def load_cached_repos() -> list[dict]:
    if not REPOS_CACHE.exists():
        raise FileNotFoundError(
            f"{REPOS_CACHE} missing — run fetch_repo_list() first "
            "(scripts/build_skill_map.py without --skip-fetch)."
        )
    return json.loads(REPOS_CACHE.read_text())


def load_cached_evidence(repo_name: str) -> dict | None:
    path = EVIDENCE_DIR / f"{repo_name}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text())
