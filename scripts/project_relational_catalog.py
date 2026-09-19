#!/usr/bin/env python3
"""Project the current canonical AIDRB corpus into disposable relational V1 SQLite."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sqlite3
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

try:
    from scripts.atlas_core import ROOT, inputs, generate_relations
    from scripts.validate_relational_model import schema_sql, validate
except ModuleNotFoundError:
    from atlas_core import ROOT, inputs, generate_relations
    from validate_relational_model import schema_sql, validate

EVIDENCE_ID = "evidence:migration-canonical"
CURATOR = "migration:real-corpus-rc2"


def j(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def slug(identifier: str) -> str:
    return identifier.split(":", 1)[-1]


def locator(record: dict[str, Any]) -> str:
    return f"{record['canonical_path']}#{record['id']}"


def record_hash(record: dict[str, Any]) -> str:
    return hashlib.sha256(j(record).encode("utf-8")).hexdigest()


def support_slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "unknown"


def put(db: sqlite3.Connection, table: str, **values: Any) -> None:
    cols = ",".join(values)
    marks = ",".join("?" for _ in values)
    db.execute(f"INSERT INTO {table} ({cols}) VALUES ({marks})", tuple(values.values()))


def build_projection(db: sqlite3.Connection) -> dict[str, Any]:
    records, aliases, _migration, crosswalks = inputs()
    relations = generate_relations(records)
    by_id = {r["id"]: r for r in records}
    aliases_by_target: dict[str, list[str]] = defaultdict(list)
    for alias, target in aliases.items():
        aliases_by_target[target].append(alias)

    db.executescript(schema_sql(ROOT))
    report: dict[str, Any] = {
        "canonical_record_count": len(records),
        "canonical_relation_count": len(relations),
        "canonical_counts": dict(Counter(r["type"] for r in records)),
        "inserted": Counter(),
        "mapped_relations": Counter(),
        "unresolved_relations": Counter(),
        "unresolved_metadata": Counter(),
    }

    put(
        db, "evidence_sets",
        id=EVIDENCE_ID,
        basis_kind="documentation",
        summary="Structural projection of current canonical corpus; not publication evidence.",
        producer="scripts/project_relational_catalog.py",
        review_status="unreviewed",
        canonical_locator="projection:relational-v1#real-corpus",
    )
    report["inserted"]["evidence_sets"] += 1

    for r in records:
        if r["type"] == "Source":
            put(
                db, "sources",
                id=r["id"], title=r["title"], publisher=r["publisher"],
                locator_type=r["locator_type"], locator=r["locator"],
                captured_at=r["captured_at"], checked_at=r.get("checked_at"),
                check_scope=r["check_scope"], author=r.get("author"),
                notes=r.get("notes"), version_ref=r.get("version_ref"),
                rights_status="unknown", license=r.get("license"), rights_note=r.get("rights_note"),
            )
            report["inserted"]["sources"] += 1

    topics = [r for r in records if r["type"] == "SubjectTopic"]
    topic_by_id = {r["id"]: r for r in topics}
    subject_ids = {r["id"] for r in topics if r.get("parent") is None}

    def root_subject(topic_id: str) -> str | None:
        seen: set[str] = set()
        current = topic_id
        while current in topic_by_id and current not in seen:
            seen.add(current)
            parent = topic_by_id[current].get("parent")
            if parent is None:
                return current
            current = parent
        return None

    for r in topics:
        if r["id"] in subject_ids:
            put(
                db, "subjects",
                id=r["id"], slug=slug(r["id"]), name=r["title"],
                description=r.get("scope"), canonical_locator=locator(r),
                parent_id=None, pack_path=str(Path(r["canonical_path"]).parent),
            )
            report["inserted"]["subjects"] += 1
        else:
            refs = []
            for x in crosswalks:
                if x.get("topic_id") != r["id"]:
                    continue
                node = x.get("node", {})
                node_id = str(node.get("id", ""))
                refs.append({
                    "system": node_id.split(":", 1)[0] or "unknown",
                    "edition": "canonical-crosswalk",
                    "code": node_id or node.get("label"),
                    "source_id": x.get("source_id"),
                    "locator": node.get("section"),
                    "relation": x.get("relation"),
                    "rationale": x.get("rationale"),
                })
            put(
                db, "knowledge_points",
                id=r["id"], slug=slug(r["id"]), name=r["title"],
                description=r.get("scope"), canonical_locator=locator(r),
                aliases_json="[]", curriculum_refs_json=j(refs),
            )
            report["inserted"]["knowledge_points"] += 1

    for r in topics:
        if r["id"] in subject_ids:
            continue
        root = root_subject(r["id"])
        if root:
            put(
                db, "knowledge_point_subjects",
                knowledge_point_id=r["id"], subject_id=root,
                is_primary=1, evidence_set_id=EVIDENCE_ID,
            )
            report["inserted"]["knowledge_point_subjects"] += 1
        else:
            report["unresolved_metadata"]["knowledge_point_without_root_subject"] += 1
        parent = r.get("parent")
        if parent and parent not in subject_ids:
            put(
                db, "knowledge_point_relations",
                from_knowledge_point_id=r["id"], to_knowledge_point_id=parent,
                predicate="part_of", scope_key="global", is_navigation_parent=1,
                notes="Projected from SubjectTopic.parent.", evidence_set_id=EVIDENCE_ID,
            )
            report["inserted"]["knowledge_point_relations"] += 1
        for prereq in r.get("prerequisites", []):
            put(
                db, "knowledge_point_relations",
                from_knowledge_point_id=prereq, to_knowledge_point_id=r["id"],
                predicate="prerequisite_for", scope_key=root or "topic:unknown",
                is_navigation_parent=0, notes="Projected from SubjectTopic.prerequisites.",
                evidence_set_id=EVIDENCE_ID,
            )
            report["inserted"]["knowledge_point_relations"] += 1

    for r in records:
        if r["type"] == "Intent":
            put(
                db, "intents",
                id=r["id"], slug=slug(r["id"]), name=r["title"],
                description=r.get("summary"), canonical_locator=locator(r),
            )
            report["inserted"]["intents"] += 1
        elif r["type"] == "Collection":
            put(
                db, "collections",
                id=r["id"], slug=slug(r["id"]), name=r["title"],
                description=r.get("summary"), canonical_locator=locator(r), curator=None,
            )
            report["inserted"]["collections"] += 1

    core_types = {"Concept", "Example", "Tool", "Resource"}
    for r in records:
        if r["type"] not in core_types:
            continue
        traits = {k: r[k] for k in ("visual_traits", "tags", "domains", "ecosystem", "interaction") if k in r}
        put(
            db, "entities",
            id=r["id"], entity_type=r["type"].lower(), slug=slug(r["id"]),
            name=r["title"], summary=r.get("summary"),
            aliases_json=j(sorted(aliases_by_target.get(r["id"], []))),
            traits_json=j(traits), status="captured", canonical_locator=locator(r),
            record_hash=record_hash(r), hash_status="current",
            created_at="projection", updated_at="projection",
        )
        report["inserted"]["entities"] += 1

        if r["type"] == "Concept":
            kinds = r.get("subtypes", [])
            put(
                db, "concepts",
                entity_id=r["id"], kinds_json=j(kinds), definition=r.get("summary"),
                grammar_json=j({"grammar": r.get("grammar", [])}),
            )
            report["inserted"]["concepts"] += 1
            if "representation_method" not in kinds:
                report["unresolved_metadata"]["concept_without_representation_method_role"] += 1
            report["unresolved_metadata"]["concept_primitives_are_not_tool_primitives"] += len(r.get("primitives", []))

        elif r["type"] == "Example":
            life = r.get("lifecycle", {})
            viewing = {
                "interaction": r.get("interaction"),
                "interaction_model": r.get("interaction_model"),
                "preview": r.get("preview"),
            }
            put(
                db, "examples",
                entity_id=r["id"], example_kind=r["kind"], origin_kind=None,
                medium=r.get("medium"), formats_json="[]", creator=None, year=None,
                collected=int(bool(life.get("collected"))),
                showable=int(bool(life.get("showable"))),
                reusable=int(bool(life.get("reusable"))),
                verified=int(bool(life.get("verified"))),
                preview_artifact_id=None, viewing_json=j(viewing),
            )
            report["inserted"]["examples"] += 1

        elif r["type"] == "Tool":
            put(
                db, "tools",
                entity_id=r["id"], tool_subtype=r["subtype"],
                homepage_url=r.get("homepage"), runtimes_json="[]",
                license=r.get("license"), version_note=None,
            )
            report["inserted"]["tools"] += 1
            if r.get("ecosystem"):
                report["unresolved_metadata"]["tool_ecosystem_not_equivalent_to_runtime"] += 1

        elif r["type"] == "Resource":
            put(
                db, "resources",
                entity_id=r["id"], resource_type=None, package_path=r["package_path"],
                entrypoint=None, version=None,
                fidelity_json=j({"facets": r.get("fidelity", [])}),
                validation_status="untested", validated_hash=None,
                validation_evidence_set_id=None,
            )
            report["inserted"]["resources"] += 1
            if r.get("status") == "verified":
                report["unresolved_metadata"]["canonical_verified_not_promoted_without_rc2_test_evidence"] += 1
            for i, artifact in enumerate(r.get("artifacts", []), 1):
                put(
                    db, "artifacts",
                    id=f"artifact:{slug(r['id'])}-{i}", owner_entity_id=r["id"],
                    artifact_type=artifact["kind"], mime_type=None,
                    path=str(Path(r["package_path"]) / artifact["path"]).replace("\\", "/"),
                    content_hash=None,
                    origin_kind="generated" if artifact.get("generated") else None,
                    role=artifact["purpose"], rights_status="unknown", license=None, source_id=None,
                    validation_status="passed" if artifact.get("validated") else "untested",
                )
                report["inserted"]["artifacts"] += 1

    for r in records:
        if r["type"] not in core_types:
            continue
        for source_id in r.get("source_refs", []):
            if by_id.get(source_id, {}).get("type") == "Source":
                put(
                    db, "entity_sources",
                    entity_id=r["id"], source_id=source_id, role="reference", locator="",
                )
                report["inserted"]["entity_sources"] += 1
            else:
                report["unresolved_metadata"]["missing_entity_source_ref"] += 1

    for r in records:
        if r["type"] != "Example":
            continue
        subject_id = r.get("subject_id")
        if subject_id in subject_ids:
            put(
                db, "entity_subjects",
                entity_id=r["id"], subject_id=subject_id,
                predicate="about", evidence_set_id=EVIDENCE_ID,
            )
            report["inserted"]["entity_subjects"] += 1
        elif subject_id:
            report["unresolved_metadata"]["example_subject_not_root_subject"] += 1
        for topic_id in r.get("topic_ids", []):
            if topic_id in topic_by_id and topic_id not in subject_ids:
                put(
                    db, "entity_knowledge_points",
                    entity_id=r["id"], knowledge_point_id=topic_id,
                    predicate="addresses", evidence_set_id=EVIDENCE_ID,
                )
                report["inserted"]["entity_knowledge_points"] += 1
            else:
                report["unresolved_metadata"]["example_topic_not_knowledge_point"] += 1

    capability_names = sorted({
        value
        for r in records if r["type"] == "Tool"
        for value in r.get("capabilities", [])
    })
    for name in capability_names:
        cid = f"capability:{support_slug(name)}"
        put(
            db, "tool_capabilities",
            id=cid, slug=slug(cid), name=name, description=None,
            canonical_locator=f"projection:tool-capability#{cid}",
        )
        report["inserted"]["tool_capabilities"] += 1
    report["unresolved_metadata"]["tool_capability_support_mode_missing"] = sum(
        len(r.get("capabilities", [])) for r in records if r["type"] == "Tool"
    )

    collection_members: dict[str, list[str]] = defaultdict(list)
    for rel in relations:
        if rel["type"] == "in_collection":
            collection_members[rel["target"]].append(rel["source"])
    for collection_id, members in collection_members.items():
        for position, entity_id in enumerate(sorted(set(members))):
            put(
                db, "collection_entities",
                collection_id=collection_id, entity_id=entity_id, position=position,
                note="Deterministic migration order; not a canonical curated rank.",
            )
            report["inserted"]["collection_entities"] += 1
            report["mapped_relations"]["in_collection"] += 1

    for rel in relations:
        if rel["type"] != "supports_intent":
            continue
        put(
            db, "entity_intents",
            entity_id=rel["source"], intent_id=rel["target"],
            context_key="legacy",
            context_json=j({"purpose": "preserve legacy intent retrieval mapping"}),
            polarity="use_when",
            rationale="Migrated from canonical supports_intent relation; requires curation review.",
            curator=CURATOR, evidence_set_id=None, review_status="proposed",
        )
        report["inserted"]["entity_intents"] += 1
        report["mapped_relations"]["supports_intent"] += 1

    consumed = {"in_collection", "supports_intent", "has_example", "part_of"}
    for rel in relations:
        rtype = rel["type"]
        if rtype in consumed:
            if rtype in {"has_example", "part_of"}:
                report["mapped_relations"][rtype] += 1
            continue
        source, target, evidence = rel["source"], rel["target"], rel.get("evidence")
        if rtype == "implemented_with":
            if evidence == "observed":
                put(
                    db, "entity_relations",
                    from_entity_id=source, to_entity_id=target, predicate="built_with",
                    context_key="global", qualifiers_json=j({"legacy_relation": "implemented_with"}),
                    evidence_set_id=EVIDENCE_ID,
                )
                report["inserted"]["entity_relations"] += 1
                report["mapped_relations"]["implemented_with:observed"] += 1
            elif evidence == "proposed" and by_id.get(source, {}).get("type") == "Concept":
                put(
                    db, "entity_recommendations",
                    from_entity_id=source, to_entity_id=target,
                    predicate="can_implement_with", context_key="legacy",
                    context_json=j({"purpose": by_id[source].get("use_when") or "legacy implementation recommendation"}),
                    verdict="conditional",
                    rationale=rel.get("reason") or "Migrated proposed implementation relation.",
                    curator=CURATOR, evidence_set_id=None, review_status="proposed",
                )
                report["inserted"]["entity_recommendations"] += 1
                report["mapped_relations"]["implemented_with:proposed_concept"] += 1
            elif evidence == "proposed" and by_id.get(source, {}).get("type") == "Example":
                report["unresolved_relations"]["implemented_with:proposed_example"] += 1
            else:
                report["unresolved_relations"][f"implemented_with:{evidence or 'unknown'}"] += 1
        elif rtype in {"demonstrates", "implements", "requires"}:
            put(
                db, "entity_relations",
                from_entity_id=source, to_entity_id=target, predicate=rtype,
                context_key="global", qualifiers_json="{}", evidence_set_id=EVIDENCE_ID,
            )
            report["inserted"]["entity_relations"] += 1
            report["mapped_relations"][rtype] += 1
        elif rtype in {"intended_to_demonstrate", "yields"}:
            report["unresolved_relations"][rtype] += 1
        else:
            report["unresolved_relations"][rtype] += 1

    report["validator_errors"] = validate(db)
    for key in ("inserted", "mapped_relations", "unresolved_relations", "unresolved_metadata"):
        report[key] = dict(report[key])
    views = [
        "fact_entity_relations", "fact_entity_domains", "fact_knowledge_point_subjects",
        "fact_entity_subjects", "fact_entity_knowledge_points", "fact_knowledge_point_relations",
        "fact_tool_capability_support", "fact_primitive_capabilities", "fact_entity_tool_primitives",
    ]
    report["published_fact_rows"] = {
        name: db.execute(f"SELECT count(*) FROM {name}").fetchone()[0] for name in views
    }
    return report


def project_current_corpus(db_path: Path | None = None) -> tuple[sqlite3.Connection, dict[str, Any]]:
    if db_path:
        db_path.parent.mkdir(parents=True, exist_ok=True)
        if db_path.exists():
            db_path.unlink()
        db = sqlite3.connect(db_path)
    else:
        db = sqlite3.connect(":memory:")
    report = build_projection(db)
    db.commit()
    return db, report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=Path)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()
    db, report = project_current_corpus(args.db)
    try:
        rendered = json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True)
        print(rendered)
        if args.report:
            args.report.parent.mkdir(parents=True, exist_ok=True)
            args.report.write_text(rendered + "\n", encoding="utf-8")
        if args.strict and report["validator_errors"]:
            raise SystemExit("\n".join(report["validator_errors"]))
    finally:
        db.close()


if __name__ == "__main__":
    main()
