"""Privacy boundary: allowlist first, denylist as a backstop.

The rule is not "scan the output for known private strings and hope".
It is: every fact in the public graph must be traceable to an allowed
source. Facts derived from private repositories may only enter through
skill-map/source/private_abstractions.yml, where the author has written
the public-safe wording by hand and explicitly approved each
relationship.

    private repository
      -> private extraction (stays in the gitignored cache)
      -> manually approved abstraction (private_abstractions.yml)
      -> public graph

Nothing else crosses. Aggregate statistics inherit this: a count like
"used across 7 projects" can only include a private project's
contribution if that project's relationships were themselves approved,
because unapproved private work never produces nodes or edges at all.
"""
from __future__ import annotations

# Provenance values allowed to appear on a public node or edge.
PUBLIC_PROVENANCE = {
    "public-repository",     # derived from a public repo's own metadata/files
    "portfolio-document",     # derived from _projects/*.md written by the author
    "curated",                 # hand-written in overrides.yml / entities.yml
    "approved-abstraction",     # hand-written in private_abstractions.yml
}

PRIVATE_PROVENANCE_PREFIX = "private"


class PrivacyError(Exception):
    pass


def assert_public_safe(repo: dict) -> None:
    """Raise if a private repo is about to be emitted as a named node."""
    if repo.get("isPrivate"):
        raise PrivacyError(
            f"Refusing to emit a named node for private repo '{repo.get('name')}'. "
            "Private-repo signal must go through private_abstractions.yml."
        )


def private_repo_names(repos: list[dict]) -> set[str]:
    return {r["name"] for r in repos if r.get("isPrivate")}


def private_repo_urls(repos: list[dict]) -> set[str]:
    return {r["url"] for r in repos if r.get("isPrivate") and r.get("url")}


def private_homepages(repos: list[dict]) -> set[str]:
    """Deployment URLs of private repos — also must never be published."""
    return {r["homepageUrl"] for r in repos if r.get("isPrivate") and r.get("homepageUrl")}


def approved_abstraction_ids(private_abstractions: dict) -> set[str]:
    return {a["id"] for a in (private_abstractions.get("abstractions") or [])}


def approved_relationships(private_abstractions: dict) -> set[tuple[str, str]]:
    """(abstraction_id, target_id) pairs the author explicitly approved.

    Anything an abstraction node connects to must appear here, so a
    private project can never quietly widen a public aggregate.
    """
    approved: set[tuple[str, str]] = set()
    for a in private_abstractions.get("abstractions") or []:
        for cap in a.get("capabilities", []):
            approved.add((a["id"], f"cap-{cap}"))
        for tech in a.get("technologies", []):
            approved.add((a["id"], tech))
        for dom in a.get("domains", []):
            approved.add((a["id"], f"dom-{dom}"))
    return approved
