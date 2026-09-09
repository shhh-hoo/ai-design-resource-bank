#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import json
import sys

import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "dictionary" / "index.yaml"
SCHEMA = ROOT / "schemas" / "dictionary-term.schema.json"


def fail(message: str) -> None:
    print(f"dictionary validation failed: {message}", file=sys.stderr)
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

    schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
    validator = Draft202012Validator(schema)

    terms: list[dict] = []
    for source in sources:
        if not isinstance(source, str) or not source.startswith("./dictionary/terms/"):
            fail(f"invalid dictionary source path: {source!r}")
        path = ROOT / source.removeprefix("./")
        if not path.exists():
            fail(f"missing dictionary source: {source}")
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        errors = sorted(validator.iter_errors(data), key=lambda e: list(e.path))
        if errors:
            for error in errors[:20]:
                where = ".".join(str(part) for part in error.path) or "<root>"
                print(f"{source}:{where}: {error.message}", file=sys.stderr)
            raise SystemExit(1)
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

    if index["version"] == "0.1" and len(terms) < 40:
        fail("Dictionary v0.1 must keep at least 40 seed terms")

    domains = {d for term in terms for d in term["domains"]}
    kinds = {k for term in terms for k in term["kinds"]}
    print(f"dictionary OK: {len(terms)} terms, {len(domains)} domains, {len(kinds)} kinds, {len(sources)} source files")


if __name__ == "__main__":
    main()
