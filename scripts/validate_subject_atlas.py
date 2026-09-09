#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import urlparse

import yaml

ROOT = Path(__file__).resolve().parents[1]
SUBJECTS_PATH = ROOT / "registries" / "curriculum-subjects.yaml"
ATLAS_PATH = ROOT / "registries" / "subject-visualization-families.yaml"
SOURCES_PATH = ROOT / "registries" / "curriculum-research-sources.yaml"
TOOLS_PATH = ROOT / "registries" / "frontend-tools.yaml"
MECHANISMS_PATH = ROOT / "registries" / "frontend-mechanisms.yaml"
ID_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
ALLOWED_PROGRAMS = {"cambridge-international-as-a-level", "ap"}
ALLOWED_PRIORITIES = {"high", "medium", "selective"}


def load_yaml(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle) or {}


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def ids_from_list(doc: dict, key: str) -> set[str]:
    entries = doc.get(key, [])
    if not isinstance(entries, list):
        return set()
    return {entry.get("id") for entry in entries if isinstance(entry, dict) and isinstance(entry.get("id"), str)}


def valid_https_url(value: object) -> bool:
    if not isinstance(value, str):
        return False
    parsed = urlparse(value)
    return parsed.scheme == "https" and bool(parsed.netloc)


def validate_subjects(errors: list[str], doc: dict, family_ids: set[str]) -> tuple[int, int]:
    if doc.get("version") != 1:
        fail(errors, f"{SUBJECTS_PATH.relative_to(ROOT)}: version must be 1")

    subjects = doc.get("subjects")
    if not isinstance(subjects, list) or not subjects:
        fail(errors, "curriculum-subjects.subjects must be a non-empty list")
        return 0, 0

    seen: set[str] = set()
    counts = {program: 0 for program in ALLOWED_PROGRAMS}
    for index, subject in enumerate(subjects):
        prefix = f"curriculum-subjects.subjects[{index}]"
        if not isinstance(subject, dict):
            fail(errors, f"{prefix}: expected a mapping")
            continue

        for field in ("id", "program", "name", "family"):
            if not subject.get(field):
                fail(errors, f"{prefix}: missing/empty {field!r}")

        subject_id = subject.get("id")
        if isinstance(subject_id, str):
            if not ID_RE.fullmatch(subject_id):
                fail(errors, f"{prefix}: id must be kebab-case: {subject_id!r}")
            if subject_id in seen:
                fail(errors, f"curriculum-subjects: duplicate id {subject_id!r}")
            seen.add(subject_id)

        program = subject.get("program")
        if program not in ALLOWED_PROGRAMS:
            fail(errors, f"{prefix}: unsupported program {program!r}")
        else:
            counts[program] += 1

        if program == "cambridge-international-as-a-level":
            code = subject.get("code")
            if not isinstance(code, str) or not re.fullmatch(r"\d{4}", code):
                fail(errors, f"{prefix}: Cambridge subject requires a four-digit string code")

        family = subject.get("family")
        if family not in family_ids:
            fail(errors, f"{prefix}: unknown family {family!r}")

    scope = doc.get("scope") if isinstance(doc.get("scope"), dict) else {}
    expected_cambridge = scope.get("cambridge_catalog_entries")
    expected_ap = scope.get("ap_catalog_entries")
    actual_cambridge = counts["cambridge-international-as-a-level"]
    actual_ap = counts["ap"]
    if expected_cambridge != actual_cambridge:
        fail(errors, f"curriculum-subjects: Cambridge count {actual_cambridge} != declared {expected_cambridge}")
    if expected_ap != actual_ap:
        fail(errors, f"curriculum-subjects: AP count {actual_ap} != declared {expected_ap}")

    return actual_cambridge, actual_ap


def validate_atlas(
    errors: list[str],
    doc: dict,
    tool_ids: set[str],
    mechanism_ids: set[str],
) -> tuple[int, int]:
    if doc.get("version") != 1:
        fail(errors, f"{ATLAS_PATH.relative_to(ROOT)}: version must be 1")

    grammars = doc.get("grammars")
    if not isinstance(grammars, dict) or not grammars:
        fail(errors, "subject-visualization-families.grammars must be a non-empty mapping")
        grammars = {}

    for grammar_id, grammar in grammars.items():
        prefix = f"subject-visualization-families.grammars.{grammar_id}"
        if not isinstance(grammar_id, str) or not ID_RE.fullmatch(grammar_id):
            fail(errors, f"{prefix}: grammar id must be kebab-case")
        if not isinstance(grammar, dict):
            fail(errors, f"{prefix}: expected a mapping")
            continue
        if not grammar.get("description"):
            fail(errors, f"{prefix}: missing/empty description")
        default_tools = grammar.get("default_tools")
        if not isinstance(default_tools, list) or not default_tools:
            fail(errors, f"{prefix}: default_tools must be a non-empty list")
        else:
            for tool in default_tools:
                if tool not in tool_ids:
                    fail(errors, f"{prefix}: unknown tool {tool!r}")

    families = doc.get("families")
    if not isinstance(families, dict) or not families:
        fail(errors, "subject-visualization-families.families must be a non-empty mapping")
        families = {}

    grammar_ids = set(grammars)
    for family_id, family in families.items():
        prefix = f"subject-visualization-families.families.{family_id}"
        if not isinstance(family_id, str) or not ID_RE.fullmatch(family_id):
            fail(errors, f"{prefix}: family id must be kebab-case")
        if not isinstance(family, dict):
            fail(errors, f"{prefix}: expected a mapping")
            continue
        if not family.get("label"):
            fail(errors, f"{prefix}: missing/empty label")
        if family.get("visual_priority") not in ALLOWED_PRIORITIES:
            fail(errors, f"{prefix}: unsupported visual_priority {family.get('visual_priority')!r}")

        family_grammars = family.get("grammars")
        if not isinstance(family_grammars, list) or not family_grammars:
            fail(errors, f"{prefix}: grammars must be a non-empty list")
        else:
            for grammar_id in family_grammars:
                if grammar_id not in grammar_ids:
                    fail(errors, f"{prefix}: unknown grammar {grammar_id!r}")

        family_tools = family.get("tools")
        if not isinstance(family_tools, list) or not family_tools:
            fail(errors, f"{prefix}: tools must be a non-empty list")
        else:
            for tool in family_tools:
                if tool not in tool_ids:
                    fail(errors, f"{prefix}: unknown tool {tool!r}")

        family_mechanisms = family.get("mechanisms")
        if not isinstance(family_mechanisms, list) or not family_mechanisms:
            fail(errors, f"{prefix}: mechanisms must be a non-empty list")
        else:
            for mechanism in family_mechanisms:
                if mechanism not in mechanism_ids:
                    fail(errors, f"{prefix}: unknown mechanism {mechanism!r}")

        seeds = family.get("topic_seeds")
        if not isinstance(seeds, list) or not seeds:
            fail(errors, f"{prefix}: topic_seeds must be a non-empty list")
        else:
            for seed_index, seed in enumerate(seeds):
                seed_prefix = f"{prefix}.topic_seeds[{seed_index}]"
                if not isinstance(seed, dict):
                    fail(errors, f"{seed_prefix}: expected a mapping")
                    continue
                if not seed.get("topic"):
                    fail(errors, f"{seed_prefix}: missing/empty topic")
                if not seed.get("visualize_as"):
                    fail(errors, f"{seed_prefix}: missing/empty visualize_as")

    return len(grammars), len(families)


def validate_sources(errors: list[str], doc: dict, family_ids: set[str]) -> int:
    if doc.get("version") != 1:
        fail(errors, f"{SOURCES_PATH.relative_to(ROOT)}: version must be 1")

    families = doc.get("families")
    if not isinstance(families, dict) or not families:
        fail(errors, "curriculum-research-sources.families must be a non-empty mapping")
        return 0

    source_family_ids = set(families)
    missing = family_ids - source_family_ids
    extra = source_family_ids - family_ids
    for family_id in sorted(missing):
        fail(errors, f"curriculum-research-sources: missing sources for family {family_id!r}")
    for family_id in sorted(extra):
        fail(errors, f"curriculum-research-sources: unknown family {family_id!r}")

    source_count = 0
    for family_id, sources in families.items():
        prefix = f"curriculum-research-sources.families.{family_id}"
        if not isinstance(sources, list) or not sources:
            fail(errors, f"{prefix}: expected a non-empty list")
            continue
        for index, source in enumerate(sources):
            source_count += 1
            source_prefix = f"{prefix}[{index}]"
            if not isinstance(source, dict):
                fail(errors, f"{source_prefix}: expected a mapping")
                continue
            if source.get("program") not in ALLOWED_PROGRAMS:
                fail(errors, f"{source_prefix}: unsupported program {source.get('program')!r}")
            if not source.get("label"):
                fail(errors, f"{source_prefix}: missing/empty label")
            if not valid_https_url(source.get("url")):
                fail(errors, f"{source_prefix}: url must be an https URL")

    return source_count


def main() -> int:
    errors: list[str] = []
    tools_doc = load_yaml(TOOLS_PATH)
    mechanisms_doc = load_yaml(MECHANISMS_PATH)
    atlas_doc = load_yaml(ATLAS_PATH)
    subjects_doc = load_yaml(SUBJECTS_PATH)
    sources_doc = load_yaml(SOURCES_PATH)

    tool_ids = ids_from_list(tools_doc, "tools")
    mechanism_ids = ids_from_list(mechanisms_doc, "mechanisms")
    grammar_count, family_count = validate_atlas(errors, atlas_doc, tool_ids, mechanism_ids)
    family_ids = set(atlas_doc.get("families", {})) if isinstance(atlas_doc.get("families"), dict) else set()
    cambridge_count, ap_count = validate_subjects(errors, subjects_doc, family_ids)
    source_count = validate_sources(errors, sources_doc, family_ids)

    if errors:
        print("Subject visualization atlas validation failed:\n", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(
        "Subject visualization atlas validation passed: "
        f"{cambridge_count} Cambridge entries, {ap_count} AP subjects, "
        f"{family_count} families, {grammar_count} visualization grammars, "
        f"{source_count} official provenance anchors."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
