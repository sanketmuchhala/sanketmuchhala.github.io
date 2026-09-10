"""Merges GitHub evidence + curated overrides into the normalized graph.

Output shape per relationship:

    {"source": ..., "target": ..., "type": "USES",
     "context": "...",
     "evidence": [{"type": "manifest", "source": "package.json"}, ...],
     "evidenceLabel": "Implementation + dependency evidence",
     "provenance": "public-repository"}

No numeric confidence is emitted. Every node and edge carries a
provenance value from privacy.PUBLIC_PROVENANCE, which validate.py
enforces.
"""
from __future__ import annotations

import re
from pathlib import Path

import yaml

from . import classify, fetch_github, ontology, privacy

REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = REPO_ROOT / "skill-map" / "source"
PROJECTS_DIR = REPO_ROOT / "_projects"


def _load_yaml(name: str) -> dict:
    path = SOURCE_DIR / name
    if not path.exists():
        return {}
    return yaml.safe_load(path.read_text()) or {}


def _load_local_project_front_matter() -> dict[str, dict]:
    """_projects/*.md front matter, keyed by GitHub repo name.

    The author's own portfolio write-up — documentation-class evidence.
    """
    by_repo: dict[str, dict] = {}
    if not PROJECTS_DIR.exists():
        return by_repo
    for md_path in PROJECTS_DIR.glob("*.md"):
        text = md_path.read_text()
        if not text.startswith("---"):
            continue
        parts = text.split("---", 2)
        if len(parts) < 3:
            continue
        try:
            front_matter = yaml.safe_load(parts[1]) or {}
        except yaml.YAMLError:
            continue
        github_url = front_matter.get("github_url", "")
        if "github.com/" not in github_url:
            continue
        repo_name = github_url.rstrip("/").split("github.com/")[-1].split("/")[-1]
        by_repo[repo_name] = front_matter
    return by_repo


def build() -> dict:
    repos = fetch_github.load_cached_repos()
    overrides = _load_yaml("overrides.yml")
    entities = _load_yaml("entities.yml")
    private_abstractions = _load_yaml("private_abstractions.yml")

    override_projects: dict = overrides.get("projects", {}) or {}
    narrative_edges = overrides.get("narrative_edges", []) or []
    hidden = set(overrides.get("hidden", []) or [])
    local_project_docs = _load_local_project_front_matter()

    nodes: dict[str, dict] = {}
    edges: list[dict] = []

    def add_node(node_id: str, **fields) -> dict:
        node = nodes.setdefault(node_id, {"id": node_id})
        node.update({k: v for k, v in fields.items() if v is not None})
        return node

    def add_edge(source: str, target: str, edge_type: str,
                 evidence: list[dict], context: str, provenance: str):
        edges.append({
            "source": source, "target": target, "type": edge_type,
            "context": context,
            "evidence": evidence,
            "evidenceLabel": ontology.evidence_label(evidence),
            "provenance": provenance,
        })

    def tech_node(tech_id: str) -> str:
        name, category, _ = classify.TECH_CATALOG.get(tech_id, (tech_id, "framework", []))
        add_node(tech_id, type="technology", name=name, category=category,
                 tier="extended", provenance="public-repository")
        return tech_id

    def capability_node(cap_id: str) -> str:
        spec = ontology.CAPABILITIES.get(cap_id, {})
        node_id = f"cap-{cap_id}"
        add_node(node_id, type="capability",
                 name=spec.get("name", cap_id),
                 description=spec.get("description"),
                 tier="extended", provenance="curated")
        return node_id

    def domain_node(domain_id: str) -> str:
        node_id = f"dom-{domain_id}"
        add_node(node_id, type="domain", name=ontology.DOMAINS.get(domain_id, domain_id),
                 tier="extended", provenance="curated")
        return node_id

    core_projects: set[str] = set()
    referenced_by_core: set[str] = set()

    # ── Public GitHub repos → Project (+ Repository) nodes ───────────────
    for repo in repos:
        name = repo["name"]
        if repo.get("isPrivate"):
            continue  # never a named node; only private_abstractions.yml crosses
        if name in hidden:
            continue
        override = override_projects.get(name, {})
        if override.get("private"):
            continue  # placeholder; the real node comes from private_abstractions

        exclusion_reason = classify.is_excluded_by_default(name, repo)
        if exclusion_reason and not override.get("include_in_portfolio"):
            continue

        privacy.assert_public_safe(repo)

        raw_evidence = fetch_github.load_cached_evidence(name)
        local_doc = local_project_docs.get(name, {})
        tech_evidence = classify.detect_technologies(repo, raw_evidence)
        cap_evidence = classify.detect_capabilities(repo, raw_evidence)

        # The author's own _projects write-up (documentation evidence).
        for raw_tech_name in local_doc.get("technologies", []) or []:
            raw_words = set(re.findall(r"[a-z0-9]+", raw_tech_name.lower()))
            for tech_id, (disp_name, _, _) in classify.TECH_CATALOG.items():
                disp_words = set(re.findall(r"[a-z0-9]+", disp_name.lower()))
                if disp_words and disp_words <= raw_words:
                    tech_evidence.setdefault(tech_id, []).append(
                        {"type": "documentation", "source": "portfolio project page"})

        # Curated corrections win over inference.
        corrections = override.get("tech_corrections", {}) or {}
        for tech_id in corrections.get("remove", []):
            tech_evidence.pop(tech_id, None)
        for tech_id in corrections.get("add", []):
            tech_evidence.setdefault(tech_id, []).append(
                {"type": "curated", "source": "author"})

        # Curated capabilities are AUTHORITATIVE — when overrides.yml
        # lists them, inference is discarded rather than merged, so a
        # stray README keyword can't add a capability claim.
        curated_caps = override.get("capabilities")
        if curated_caps is not None:
            cap_evidence = {c: [{"type": "curated", "source": "author"}] for c in curated_caps}

        project_id = name
        tier = override.get("tier", "extended")
        if tier == "core":
            core_projects.add(project_id)

        description = (
            override.get("description")
            or repo.get("description")
            or local_doc.get("description")
            or f"A {classify.classify_category(repo)} project. See the linked repository for details."
        ).strip()

        origin = override.get("origin") or ("fork" if repo.get("isFork") else "original")

        add_node(
            project_id,
            type="project",
            name=override.get("display_name", local_doc.get("title") or repo.get("name")),
            description=description,
            tier=tier,
            rank=override.get("rank", 999),
            category=classify.classify_category(repo),
            origin=origin,
            upstream=override.get("upstream"),
            substantiallyModified=override.get("substantially_modified"),
            contributionNote=override.get("contribution_note"),
            createdAt=repo.get("createdAt"),
            updatedAt=repo.get("pushedAt"),
            aliases=override.get("aliases", []),
            provenance="public-repository",
        )

        # Repository node — provenance/source links only, "deep" tier so
        # it never clutters the default or full-ecosystem views.
        repository_id = f"repo:{name}"
        add_node(
            repository_id,
            type="repository",
            name=name,
            tier="deep",
            url=repo.get("url"),
            homepage=repo.get("homepageUrl") or local_doc.get("demo_url"),
            primaryLanguage=(repo.get("primaryLanguage") or {}).get("name"),
            createdAt=repo.get("createdAt"),
            updatedAt=repo.get("pushedAt"),
            isFork=bool(repo.get("isFork")),
            upstream=override.get("upstream"),
            provenance="public-repository",
        )
        add_edge(project_id, repository_id, "HAS_REPOSITORY",
                 [{"type": "direct", "source": "GitHub API"}],
                 f"Source repository for {override.get('display_name', name)}.",
                 "public-repository")

        for tech_id, evidence in tech_evidence.items():
            tid = tech_node(tech_id)
            category = nodes[tid].get("category")
            edge_type = "DEPLOYED_ON" if category in ("cloud", "infrastructure") else "USES"
            add_edge(project_id, tid, edge_type, evidence,
                     _tech_context(nodes[tid]["name"], evidence, edge_type),
                     "public-repository")
            if tier == "core":
                referenced_by_core.add(tid)

        for cap_id, evidence in cap_evidence.items():
            cid = capability_node(cap_id)
            add_edge(project_id, cid, "IMPLEMENTS", evidence,
                     override.get("capability_notes", {}).get(cap_id)
                     or f"{nodes[cid]['name']} demonstrated in {nodes[project_id]['name']}.",
                     "curated" if ontology.strongest(evidence) == "curated" else "public-repository")
            if tier == "core":
                referenced_by_core.add(cid)

        for domain_id in override.get("domains", []):
            did = domain_node(domain_id)
            add_edge(project_id, did, "TARGETS_DOMAIN",
                     [{"type": "curated", "source": "author"}],
                     f"Applied in the {nodes[did]['name'].lower()} domain.", "curated")
            if tier == "core":
                referenced_by_core.add(did)

    # ── Private-repo public-safe abstractions (the ONLY private route) ──
    approved_pairs = privacy.approved_relationships(private_abstractions)
    for abstraction in private_abstractions.get("abstractions", []) or []:
        project_id = abstraction["id"]
        tier = abstraction.get("tier", "core")
        if tier == "core":
            core_projects.add(project_id)
        add_node(
            project_id,
            type="project",
            name=abstraction["display_name"],
            description=abstraction["description"].strip(),
            tier=tier,
            rank=abstraction.get("rank", 999),
            category="private-abstracted",
            origin="original",
            evidenceNote=abstraction.get("evidence_note"),
            provenance="approved-abstraction",
        )
        curated_ev = [{"type": "curated", "source": "author-approved abstraction"}]
        for tech_id in abstraction.get("technologies", []):
            if (project_id, tech_id) not in approved_pairs:
                continue
            tid = tech_node(tech_id)
            add_edge(project_id, tid, "USES", curated_ev,
                     f"{nodes[tid]['name']} used in this work.", "approved-abstraction")
            if tier == "core":
                referenced_by_core.add(tid)
        for cap_id in abstraction.get("capabilities", []):
            if (project_id, f"cap-{cap_id}") not in approved_pairs:
                continue
            cid = capability_node(cap_id)
            add_edge(project_id, cid, "IMPLEMENTS", curated_ev,
                     f"{nodes[cid]['name']} demonstrated in this work.", "approved-abstraction")
            if tier == "core":
                referenced_by_core.add(cid)
        for domain_id in abstraction.get("domains", []):
            if (project_id, f"dom-{domain_id}") not in approved_pairs:
                continue
            did = domain_node(domain_id)
            add_edge(project_id, did, "TARGETS_DOMAIN", curated_ev,
                     f"Applied in the {nodes[did]['name'].lower()} domain.", "approved-abstraction")
            if tier == "core":
                referenced_by_core.add(did)

    # ── Experience nodes ─────────────────────────────────────────────────
    for exp in entities.get("experience", []) or []:
        exp_id = exp["id"]
        add_node(exp_id, type="experience", name=exp["name"], role=exp.get("role"),
                 period=exp.get("period"), description=exp.get("detail", "").strip(),
                 tier="core", provenance="curated")
        curated_ev = [{"type": "curated", "source": "author"}]
        for tech_id in exp.get("technologies", []):
            tid = tech_node(tech_id)
            add_edge(exp_id, tid, "USED", curated_ev,
                     f"Used as {exp.get('role')} at {exp['name']}.", "curated")
            referenced_by_core.add(tid)
        for cap_id in exp.get("capabilities", []):
            cid = capability_node(cap_id)
            add_edge(exp_id, cid, "DEMONSTRATES", curated_ev,
                     f"Demonstrated as {exp.get('role')} at {exp['name']}.", "curated")
            referenced_by_core.add(cid)
        for domain_id in exp.get("domains", []):
            did = domain_node(domain_id)
            add_edge(exp_id, did, "TARGETS_DOMAIN", curated_ev,
                     f"{exp['name']} works in the {nodes[did]['name'].lower()} domain.", "curated")
            referenced_by_core.add(did)

    # ── Narrative edges — curated only, never inferred ──────────────────
    for rel in narrative_edges:
        src, tgt, etype = rel["from"], rel["to"], rel["type"]
        if etype not in ontology.NARRATIVE_EDGE_TYPES:
            raise ValueError(f"{etype} is not a narrative edge type")
        if src not in nodes or tgt not in nodes:
            continue
        add_edge(src, tgt, etype, [{"type": "curated", "source": "author"}],
                 rel.get("context", ""), "curated")

    # ── Capability -> Technology, derived from co-occurrence in a project ─
    project_caps: dict[str, set[str]] = {}
    project_techs: dict[str, set[str]] = {}
    for e in edges:
        if e["type"] == "IMPLEMENTS":
            project_caps.setdefault(e["source"], set()).add(e["target"])
        if e["type"] in ("USES", "DEPLOYED_ON"):
            project_techs.setdefault(e["source"], set()).add(e["target"])

    seen_pairs: set[tuple[str, str]] = set()
    # Sorted iteration: set order varies per process, and unsorted output
    # would make every regeneration produce a spurious diff.
    for project_id, caps in project_caps.items():
        for tech_id in sorted(project_techs.get(project_id, set())):
            if nodes.get(tech_id, {}).get("category") not in ("ai-framework", "model-provider"):
                continue
            for cap_node_id in sorted(caps):
                if (cap_node_id, tech_id) in seen_pairs:
                    continue
                seen_pairs.add((cap_node_id, tech_id))
                add_edge(cap_node_id, tech_id, "IMPLEMENTED_WITH",
                         [{"type": "direct", "source": f"co-occurrence in {nodes[project_id]['name']}"}],
                         f"Used to implement this in {nodes[project_id]['name']}.",
                         "public-repository")

    _assign_tiers(nodes, core_projects, referenced_by_core)

    return {
        "version": 3,
        "nodes": list(nodes.values()),
        "edges": edges,
        "story_modes": entities.get("story_modes", []) or [],
    }


def _tech_context(tech_name: str, evidence: list[dict], edge_type: str) -> str:
    strongest = ontology.strongest(evidence)
    verb = "Deployed on" if edge_type == "DEPLOYED_ON" else "Uses"
    detail = {
        "direct": "implemented directly in the source",
        "config": "wired up in deployment configuration",
        "manifest": "declared as a project dependency",
        "documentation": "described in the project write-up",
        "curated": "recorded by the author",
    }[strongest]
    return f"{verb} {tech_name} — {detail}."


def _assign_tiers(nodes: dict, core_projects: set[str], referenced_by_core: set[str]) -> None:
    """Promote to `core` only what the default view should open with.

    Target: ~15-20 projects, 10-15 capabilities, 6-10 domains,
    15-25 technologies, 3-5 experience -> roughly 60-80 nodes.
    """
    for node_id, node in nodes.items():
        ntype = node.get("type")
        if ntype == "repository":
            node["tier"] = "deep"
        elif ntype == "project":
            node["tier"] = "core" if node_id in core_projects else "extended"
        elif ntype == "experience":
            node["tier"] = "core"
        elif ntype == "capability":
            cap_id = node_id.removeprefix("cap-")
            is_core_cap = ontology.CAPABILITIES.get(cap_id, {}).get("tier") == "core"
            node["tier"] = "core" if (is_core_cap and node_id in referenced_by_core) else "extended"
        elif ntype == "domain":
            node["tier"] = "core" if node_id in referenced_by_core else "extended"
        elif ntype == "technology":
            in_core_set = node_id in classify.CORE_TECHNOLOGIES
            node["tier"] = "core" if (in_core_set and node_id in referenced_by_core) else "extended"
