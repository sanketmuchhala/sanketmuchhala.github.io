"""Data quality + privacy gate. Non-zero exit means nothing gets published."""
from __future__ import annotations

import datetime
import json

from . import ontology, privacy

# Default-view size targets (see the plan corrections): roughly
# 15-20 projects, 10-15 capabilities, 6-10 domains, 15-25 technologies,
# 3-5 experience -> ~60-80 nodes.
CORE_TARGETS = {
    "project":    (12, 22),
    "capability": (8, 16),
    "domain":     (5, 11),
    "technology": (12, 27),
    "experience": (2, 6),
}
CORE_TOTAL_RANGE = (50, 90)


def validate(graph: dict, repos: list[dict], private_abstractions: dict) -> list[str]:
    errors: list[str] = []
    nodes = graph["nodes"]
    edges = graph["edges"]

    # ── Structural ───────────────────────────────────────────────────
    seen: set[str] = set()
    for node in nodes:
        if node["id"] in seen:
            errors.append(f"duplicate node id: {node['id']}")
        seen.add(node["id"])

    tech_names: dict[str, str] = {}
    for n in nodes:
        if n.get("type") == "technology":
            norm = n["name"].strip().lower()
            if norm in tech_names and tech_names[norm] != n["id"]:
                errors.append(
                    f"duplicate normalized technology name '{n['name']}' "
                    f"({tech_names[norm]} vs {n['id']})")
            tech_names[norm] = n["id"]
        if n.get("type") not in ontology.NODE_TYPES:
            errors.append(f"unknown node type '{n.get('type')}' on {n['id']}")

    node_ids = set(seen)
    connected: set[str] = set()
    for e in edges:
        if e["source"] not in node_ids:
            errors.append(f"edge references missing source node: {e['source']} -> {e['target']}")
        if e["target"] not in node_ids:
            errors.append(f"edge references missing target node: {e['source']} -> {e['target']}")
        if e["type"] not in ontology.EDGE_TYPES:
            errors.append(f"unknown edge type '{e['type']}' on {e['source']} -> {e['target']}")
        connected.add(e["source"])
        connected.add(e["target"])

    for node_id in node_ids:
        if node_id not in connected:
            errors.append(f"orphan node (no edges): {node_id}")

    for n in nodes:
        if n.get("type") == "project" and not (n.get("description") or "").strip():
            errors.append(f"empty description on project node: {n['id']}")

    seen_aliases: dict[str, str] = {}
    for n in nodes:
        for alias in n.get("aliases", []) or []:
            norm = alias.strip().lower()
            if norm in seen_aliases and seen_aliases[norm] != n["id"]:
                errors.append(f"duplicate alias '{alias}' on {n['id']} and {seen_aliases[norm]}")
            seen_aliases[norm] = n["id"]

    now = datetime.datetime.now(datetime.timezone.utc)
    for n in nodes:
        for field in ("createdAt", "updatedAt"):
            raw = n.get(field)
            if not raw:
                continue
            try:
                ts = datetime.datetime.fromisoformat(raw.replace("Z", "+00:00"))
            except ValueError:
                errors.append(f"malformed {field} on {n['id']}: {raw}")
                continue
            if ts > now + datetime.timedelta(days=1):
                errors.append(f"impossible future {field} on {n['id']}: {raw}")

    # ── Evidence model ───────────────────────────────────────────────
    for e in edges:
        if not e.get("evidence"):
            errors.append(f"edge with no evidence: {e['source']} -> {e['target']}")
            continue
        for item in e["evidence"]:
            if item.get("type") not in ontology.EVIDENCE_TYPES:
                errors.append(
                    f"unknown evidence type '{item.get('type')}' on {e['source']} -> {e['target']}")
        if not e.get("evidenceLabel"):
            errors.append(f"edge missing evidenceLabel: {e['source']} -> {e['target']}")
        if "confidence" in e:
            errors.append(
                f"numeric confidence must not be published: {e['source']} -> {e['target']}")

    # Narrative relationships must be curated, never inferred.
    for e in edges:
        if e["type"] in ontology.NARRATIVE_EDGE_TYPES:
            if ontology.strongest(e["evidence"]) != "curated" or e["provenance"] != "curated":
                errors.append(
                    f"narrative edge must be curated, not inferred: "
                    f"{e['source']} -{e['type']}-> {e['target']}")

    # ── Privacy: provenance allowlist (A) ────────────────────────────
    approved_ids = privacy.approved_abstraction_ids(private_abstractions)
    approved_pairs = privacy.approved_relationships(private_abstractions)

    for n in nodes:
        prov = n.get("provenance")
        if prov not in privacy.PUBLIC_PROVENANCE:
            errors.append(f"PRIVACY: node {n['id']} has non-public provenance '{prov}'")
        if prov == "approved-abstraction" and n["id"] not in approved_ids:
            errors.append(
                f"PRIVACY: node {n['id']} claims approved-abstraction provenance but is not "
                "listed in private_abstractions.yml")

    for e in edges:
        prov = e.get("provenance")
        if prov not in privacy.PUBLIC_PROVENANCE:
            errors.append(
                f"PRIVACY: edge {e['source']} -> {e['target']} has non-public provenance '{prov}'")
        if prov == "approved-abstraction":
            if (e["source"], e["target"]) not in approved_pairs:
                errors.append(
                    f"PRIVACY: unapproved relationship from private-derived work: "
                    f"{e['source']} -> {e['target']}")

    # Any edge touching an abstraction node must itself be approved —
    # this is what keeps public aggregates ("used across N projects")
    # from silently absorbing unapproved private relationships.
    for e in edges:
        for endpoint in (e["source"], e["target"]):
            if endpoint in approved_ids:
                pair = (e["source"], e["target"]) if e["source"] in approved_ids else (e["target"], e["source"])
                if pair not in approved_pairs and e["type"] not in ontology.NARRATIVE_EDGE_TYPES:
                    errors.append(
                        f"PRIVACY: edge touching approved abstraction '{endpoint}' was not "
                        f"itself approved: {e['source']} -{e['type']}-> {e['target']}")

    # ── Privacy: denylist backstop (B) ───────────────────────────────
    serialized = json.dumps(graph)
    for name in privacy.private_repo_names(repos):
        if name and name in serialized:
            errors.append(f"PRIVACY: private repo name '{name}' found in generated output")
    for url in privacy.private_repo_urls(repos) | privacy.private_homepages(repos):
        if url and url in serialized:
            errors.append(f"PRIVACY: private repo URL '{url}' found in generated output")

    # ── Default-view size discipline ─────────────────────────────────
    core = [n for n in nodes if n.get("tier") == "core"]
    counts = {}
    for n in core:
        counts[n["type"]] = counts.get(n["type"], 0) + 1
    for ntype, (lo, hi) in CORE_TARGETS.items():
        got = counts.get(ntype, 0)
        if not (lo <= got <= hi):
            errors.append(
                f"default view has {got} core {ntype} nodes; target is {lo}-{hi} "
                "(adjust tiers in overrides.yml / classify.CORE_TECHNOLOGIES)")
    if not (CORE_TOTAL_RANGE[0] <= len(core) <= CORE_TOTAL_RANGE[1]):
        errors.append(
            f"default view has {len(core)} core nodes; target is "
            f"{CORE_TOTAL_RANGE[0]}-{CORE_TOTAL_RANGE[1]}")

    # Repositories must never sit in a visitor-facing tier.
    for n in nodes:
        if n.get("type") == "repository" and n.get("tier") != "deep":
            errors.append(f"repository node {n['id']} must be tier 'deep', got '{n.get('tier')}'")

    # Every core node must be reachable from a core node, or the default
    # view will render disconnected islands.
    core_ids = {n["id"] for n in core}
    core_connected = set()
    for e in edges:
        if e["source"] in core_ids and e["target"] in core_ids:
            core_connected.add(e["source"])
            core_connected.add(e["target"])
    for node_id in core_ids - core_connected:
        errors.append(f"core node {node_id} has no edges to other core nodes (island in default view)")

    return errors
