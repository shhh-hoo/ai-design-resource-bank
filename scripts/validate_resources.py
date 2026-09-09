#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "schemas" / "resource.schema.json"
CATALOG_PATH = ROOT / "catalog.yaml"
RESOURCES_ROOT = ROOT / "resources"

REQUIRED_README_HEADINGS = (
    "## Use this when",
    "## Why it works",
    "## Implementation",
    "## Controls",
    "## Do not copy",
    "## Source",
)


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def load_yaml(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def main() -> int:
    errors: list[str] = []

    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    validator = Draft202012Validator(schema, format_checker=FormatChecker())

    catalog = load_yaml(CATALOG_PATH) or {}
    if catalog.get("version") != 1:
        fail(errors, "catalog.yaml: version must be 1")

    catalog_entries = catalog.get("resources", [])
    if not isinstance(catalog_entries, list):
        fail(errors, "catalog.yaml: resources must be a list")
        catalog_entries = []

    catalog_by_id: dict[str, dict] = {}
    for index, entry in enumerate(catalog_entries):
        if not isinstance(entry, dict):
            fail(errors, f"catalog.yaml: resources[{index}] must be a mapping")
            continue
        resource_id = entry.get("id")
        if not resource_id:
            fail(errors, f"catalog.yaml: resources[{index}] is missing id")
            continue
        if resource_id in catalog_by_id:
            fail(errors, f"catalog.yaml: duplicate id {resource_id!r}")
        catalog_by_id[resource_id] = entry
        for key in ("title", "domain", "path", "status", "hint"):
            if not entry.get(key):
                fail(errors, f"catalog.yaml: {resource_id!r} is missing {key}")
        if not isinstance(entry.get("tags", []), list):
            fail(errors, f"catalog.yaml: {resource_id!r} tags must be a list")

    manifest_paths = sorted(RESOURCES_ROOT.glob("**/resource.yaml")) if RESOURCES_ROOT.exists() else []
    seen_manifest_ids: set[str] = set()

    for manifest_path in manifest_paths:
        package_dir = manifest_path.parent
        relative_package = package_dir.relative_to(ROOT).as_posix()
        manifest = load_yaml(manifest_path)

        if not isinstance(manifest, dict):
            fail(errors, f"{manifest_path.relative_to(ROOT)}: manifest must be a mapping")
            continue

        for validation_error in sorted(validator.iter_errors(manifest), key=lambda e: list(e.path)):
            location = ".".join(str(part) for part in validation_error.path) or "<root>"
            fail(errors, f"{manifest_path.relative_to(ROOT)}:{location}: {validation_error.message}")

        resource_id = manifest.get("id")
        if not resource_id:
            continue
        if resource_id in seen_manifest_ids:
            fail(errors, f"duplicate resource id across manifests: {resource_id!r}")
        seen_manifest_ids.add(resource_id)

        readme_path = package_dir / "README.md"
        if not readme_path.exists():
            fail(errors, f"{relative_package}: missing README.md")
        else:
            readme = readme_path.read_text(encoding="utf-8")
            for heading in REQUIRED_README_HEADINGS:
                if heading not in readme:
                    fail(errors, f"{relative_package}/README.md: missing heading {heading!r}")

        for artifact in manifest.get("artifacts", []):
            artifact_path = package_dir / artifact.get("path", "")
            try:
                artifact_path.resolve().relative_to(package_dir.resolve())
            except ValueError:
                fail(errors, f"{relative_package}: artifact path escapes package: {artifact.get('path')!r}")
                continue
            if not artifact_path.exists():
                fail(errors, f"{relative_package}: declared artifact does not exist: {artifact.get('path')!r}")

        if manifest.get("rights", {}).get("source_assets_stored") and not (package_dir / "source").exists():
            fail(errors, f"{relative_package}: source_assets_stored=true but source/ is missing")

        catalog_entry = catalog_by_id.get(resource_id)
        if not catalog_entry:
            fail(errors, f"{relative_package}: resource id {resource_id!r} is missing from catalog.yaml")
        else:
            if catalog_entry.get("path") != relative_package:
                fail(
                    errors,
                    f"catalog.yaml: {resource_id!r} path {catalog_entry.get('path')!r} does not match {relative_package!r}",
                )
            for key in ("title", "domain", "status"):
                if catalog_entry.get(key) != manifest.get(key):
                    fail(
                        errors,
                        f"catalog.yaml: {resource_id!r} {key} does not match manifest "
                        f"({catalog_entry.get(key)!r} != {manifest.get(key)!r})",
                    )

    extra_catalog_ids = set(catalog_by_id) - seen_manifest_ids
    for resource_id in sorted(extra_catalog_ids):
        fail(errors, f"catalog.yaml: {resource_id!r} has no corresponding resource.yaml")

    if errors:
        print("Resource validation failed:\n", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(f"Resource validation passed: {len(manifest_paths)} package(s), {len(catalog_entries)} catalog entry/entries.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
