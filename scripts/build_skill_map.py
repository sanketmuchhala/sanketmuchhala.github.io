#!/usr/bin/env python3
"""Regenerate the /skill-map knowledge graph.

Usage:
    python scripts/build_skill_map.py                # fetch fresh from GitHub, build, validate, write
    python scripts/build_skill_map.py --skip-fetch    # reuse cached GitHub data (faster iteration on overrides.yml)
    python scripts/build_skill_map.py --validate-only # build in-memory and validate, write nothing

Requires `gh auth login` (with repo + read:org scope) unless --skip-fetch is
used with an existing cache. Output is committed to git — the Jekyll build
itself never needs GitHub credentials.
"""
from __future__ import annotations

import argparse
import datetime
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from skill_map import build_graph, fetch_github, validate  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_GRAPH = REPO_ROOT / "skill-map" / "data.generated.json"
OUTPUT_JEKYLL_DATA = REPO_ROOT / "_data" / "skill_map.json"

CURATED_REPOS_FOR_EVIDENCE = [
    # Repos worth spending a Pass-2 README/manifest fetch on. Kept as an
    # explicit list (rather than fetching all 78) to keep regeneration fast
    # and to avoid pulling evidence for repos overrides.yml excludes anyway.
    "LexOrchestrator", "LanguageLineage", "Nerdplexity", "GTM-SImulator",
    "mirofish-api-server", "ai-slop-detector-model", "Project-AirNet",
    "US-Metro-Transit-Network-Mega-Visualization", "AIStudyBuddy",
    "house-price-ml-pipeline", "FileChatAI", "RAG-Chatbot-Jupyter",
    "Linkedin-Connections", "kemlang-py", "claudos", "Raichu", "NewsSite",
    "ApplicationAgent", "TallyCart", "WindowPilot", "jobfit",
    "Superstore-Sales-Management-Dashboard", "Project-Patent-Classification",
    "Game-analytics", "ECC-LBFS",
]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-fetch", action="store_true", help="reuse cached GitHub data")
    parser.add_argument("--validate-only", action="store_true", help="don't write output files")
    args = parser.parse_args()

    if not args.skip_fetch:
        print("Fetching repository list from GitHub...")
        repos = fetch_github.fetch_repo_list()
        print(f"  {len(repos)} repositories fetched.")
        print("Fetching README/manifest evidence for shortlisted repos...")
        for name in CURATED_REPOS_FOR_EVIDENCE:
            fetch_github.fetch_repo_evidence("sanketmuchhala", name)
        print(f"  evidence cached for {len(CURATED_REPOS_FOR_EVIDENCE)} repos.")
    else:
        repos = fetch_github.load_cached_repos()

    print("Building graph...")
    graph = build_graph.build()
    core = [n for n in graph["nodes"] if n.get("tier") == "core"]
    print(f"  {len(graph['nodes'])} nodes, {len(graph['edges'])} edges "
          f"({len(core)} nodes in the default view).")

    print("Validating...")
    errors = validate.validate(
        graph,
        repos,
        build_graph._load_yaml("private_abstractions.yml"),
    )
    if errors:
        print(f"VALIDATION FAILED ({len(errors)} issue(s)) — nothing written:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1
    print("  validation passed.")

    if args.validate_only:
        print("--validate-only: not writing output.")
        return 0

    graph["generated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    OUTPUT_GRAPH.write_text(json.dumps(graph, indent=2, sort_keys=False) + "\n")
    OUTPUT_JEKYLL_DATA.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JEKYLL_DATA.write_text(json.dumps(graph, indent=2, sort_keys=False) + "\n")
    print(f"Wrote {OUTPUT_GRAPH.relative_to(REPO_ROOT)}")
    print(f"Wrote {OUTPUT_JEKYLL_DATA.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
