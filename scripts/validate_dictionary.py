#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import json
import sys

import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "dictionary" / "index.yaml"
TERM_SCHEMA = ROOT / "schemas" / "dictionary-term.schema.json"
REPRESENTATION_SCHEMA = ROOT / "schemas" / "dictionary-representation.schema.json"


def fail(message: str) -> None:
    print(f"dictionary validation failed: {message}", file=sys.stderr)
    raise SystemExit(1)


def validate_document(path_label: str, data: object, schema_path: Path) -> None:
    schema = json.loads(schema_path.read_text(encoding="utf-8"))
    validator = Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(data), key=lambda e: list(e.path))
    if errors:
        for error in errors[:20]:
            where = ".".join(str(part) for part in error.path) or "<root>"
            print(f"{path_label}:{where}: {error.message}", file=sys.stderr)
        raise SystemExit(1)


def main() -> None:
    index = yaml.safe_load(INDEX.read_text(encoding="utf-8"))
    if not isinstance(index, dict):
        fail("dictionary/index.yaml must be a mapping")
    if not isinstance(index.get("version"), str):
        fail("dictionary/index.yaml requires version")

    sources = index.get("sources")
    if not isinstance(sources, list) or not sources:
        fail("dictionary/index.yaml requires a non-empty sources list")
    if len(sources) != len(set(sources)):
        fail("dictionary source paths must be unique")

    terms: list[dict] = []
    for source in sources:
        if not isinstance(source, str) or not source.startswith("./dictionary/terms/"):
            fail(f"invalid dictionary source path: {source!r}")
        path = ROOT / source.removeprefix("./")
        if not path.exists():
            fail(f"missing dictionary source: {source}")
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        validate_document(source, data, TERM_SCHEMA)
        if data["version"] != index["version"]:
            fail(f"{source} version {data['version']!r} does not match index version {index['version']!r}")
        terms.extend(data["terms"])

    ids = [term["id"] for term in terms]
    if len(ids) != len(set(ids)):
        fail("term ids must be unique across all source files")

    english = [term["term"]["en"].casefold() for term in terms]
    if len(english) != len(set(english)):
        fail("English term names must be unique")

    known = set(ids)
    for term in terms:
        for related in term["related"]:
            if related not in known:
                fail(f"{term['id']} related term {related!r} is not present in the registry")
            if related == term["id"]:
                fail(f"{term['id']} cannot relate to itself")
        if term["entry_status"] == "verified":
            for example in term["examples"]:
                if example["asset_policy"] in {"text-reference-only", "linked-external"} and not example.get("url"):
                    fail(f"{term['id']} is verified but an external example has no URL")

    representation_sources = index.get("representations")
    if isinstance(representation_sources, str):
        representation_sources = [representation_sources]
    if not isinstance(representation_sources, list) or not representation_sources:
        fail("dictionary/index.yaml requires one or more representation registry paths")
    if len(representation_sources) != len(set(representation_sources)):
        fail("Dictionary representation source paths must be unique")

    representations: list[dict] = []
    for representation_source in representation_sources:
        if not isinstance(representation_source, str) or not representation_source.startswith("./dictionary/"):
            fail(f"invalid Dictionary representation registry path: {representation_source!r}")
        representation_path = ROOT / representation_source.removeprefix("./")
        if not representation_path.exists():
            fail(f"missing Dictionary representation registry: {representation_source}")
        representation_data = yaml.safe_load(representation_path.read_text(encoding="utf-8"))
        validate_document(representation_source, representation_data, REPRESENTATION_SCHEMA)
        if representation_data["version"] != index["version"]:
            fail(f"{representation_source} version must match dictionary/index.yaml")
        representations.extend(representation_data["representations"])

    representation_ids = [item["id"] for item in representations]
    if len(representation_ids) != len(set(representation_ids)):
        fail("Dictionary representation ids must be unique across all representation sources")
    if set(representation_ids) != known:
        missing = sorted(known - set(representation_ids))
        extra = sorted(set(representation_ids) - known)
        fail(f"representation coverage must exactly match terms; missing={missing}, extra={extra}")

    generated_count = 0
    first_wave_count = 0
    for item in representations:
        if item["preferred"] in item["fallbacks"]:
            fail(f"{item['id']} repeats preferred medium in fallbacks")
        study = item.get("study")
        if item["preferred"] == "generated-study":
            generated_count += 1
            if not isinstance(study, dict):
                fail(f"{item['id']} prefers generated-study but has no study specification")
            if study["priority"] == "first-wave":
                first_wave_count += 1
            if study["status"] == "available":
                if not study.get("asset") or not study.get("alt"):
                    fail(f"{item['id']} available generated study requires asset and alt")
                asset_path = ROOT / study["asset"].removeprefix("./")
                if not asset_path.exists():
                    fail(f"{item['id']} generated study asset does not exist: {study['asset']}")
        elif study is not None:
            fail(f"{item['id']} has a generated study specification but generated-study is not preferred")

    if index["version"] == "0.1" and len(terms) < 40:
        fail("Dictionary v0.1 must keep at least 40 seed terms")

    domains = {d for term in terms for d in term["domains"]}
    kinds = {k for term in terms for k in term["kinds"]}
    media = {item["preferred"] for item in representations}
    print(
        f"dictionary OK: {len(terms)} terms, {len(domains)} domains, {len(kinds)} kinds, "
        f"{len(media)} preferred media, {generated_count} generated-study routes ({first_wave_count} first-wave), "
        f"{len(sources)} term source files, {len(representation_sources)} representation source files"
    )


if __name__ == "__main__":
    main()
