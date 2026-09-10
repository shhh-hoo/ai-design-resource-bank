#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import urlparse

import yaml

ROOT = Path(__file__).resolve().parents[1]
TOOLS_PATH = ROOT / "registries" / "frontend-tools.yaml"
GALLERIES_PATH = ROOT / "registries" / "reference-galleries.yaml"
ILLUSTRATION_SOURCES_PATH = ROOT / "registries" / "illustration-sources.yaml"
ID_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def load_yaml(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def valid_https_url(value: object) -> bool:
    if not isinstance(value, str):
        return False
    parsed = urlparse(value)
    return parsed.scheme == "https" and bool(parsed.netloc)


def validate_common_list(
    errors: list[str],
    entries: object,
    *,
    label: str,
    required: tuple[str, ...],
    list_fields: tuple[str, ...],
    url_fields: tuple[str, ...],
) -> int:
    if not isinstance(entries, list):
        fail(errors, f"{label}: expected a list")
        return 0

    seen_ids: set[str] = set()
    for index, entry in enumerate(entries):
        prefix = f"{label}[{index}]"
        if not isinstance(entry, dict):
            fail(errors, f"{prefix}: expected a mapping")
            continue

        for key in required:
            value = entry.get(key)
            if value is None or value == "" or value == []:
                fail(errors, f"{prefix}: missing/empty required field {key!r}")

        entry_id = entry.get("id")
        if isinstance(entry_id, str):
            if not ID_RE.fullmatch(entry_id):
                fail(errors, f"{prefix}: id must be kebab-case: {entry_id!r}")
            if entry_id in seen_ids:
                fail(errors, f"{label}: duplicate id {entry_id!r}")
            seen_ids.add(entry_id)

        for key in list_fields:
            if not isinstance(entry.get(key), list) or not entry.get(key):
                fail(errors, f"{prefix}: {key!r} must be a non-empty list")

        for key in url_fields:
            if key in entry and not valid_https_url(entry.get(key)):
                fail(errors, f"{prefix}: {key!r} must be an https URL")

    return len(entries)


def main() -> int:
    errors: list[str] = []

    tools_doc = load_yaml(TOOLS_PATH) or {}
    if tools_doc.get("version") != 1:
        fail(errors, "registries/frontend-tools.yaml: version must be 1")
    tool_count = validate_common_list(
        errors,
        tools_doc.get("tools"),
        label="frontend-tools.tools",
        required=(
            "id",
            "name",
            "kind",
            "tier",
            "domains",
            "capabilities",
            "homepage",
            "license",
            "use_when",
            "avoid_when",
            "agent_notes",
            "tags",
        ),
        list_fields=("domains", "capabilities", "tags"),
        url_fields=("homepage", "docs", "examples"),
    )

    allowed_tiers = {"core", "specialized", "secondary"}
    for index, entry in enumerate(tools_doc.get("tools", []) if isinstance(tools_doc.get("tools"), list) else []):
        if isinstance(entry, dict) and entry.get("tier") not in allowed_tiers:
            fail(errors, f"frontend-tools.tools[{index}]: unsupported tier {entry.get('tier')!r}")

    galleries_doc = load_yaml(GALLERIES_PATH) or {}
    if galleries_doc.get("version") != 1:
        fail(errors, "registries/reference-galleries.yaml: version must be 1")
    gallery_count = validate_common_list(
        errors,
        galleries_doc.get("galleries"),
        label="reference-galleries.galleries",
        required=(
            "id",
            "name",
            "priority",
            "url",
            "categories",
            "best_for",
            "reference_mode",
            "rights_note",
            "tags",
        ),
        list_fields=("categories", "tags"),
        url_fields=("url",),
    )

    allowed_priorities = {"core", "reference"}
    for index, entry in enumerate(
        galleries_doc.get("galleries", []) if isinstance(galleries_doc.get("galleries"), list) else []
    ):
        if isinstance(entry, dict) and entry.get("priority") not in allowed_priorities:
            fail(errors, f"reference-galleries.galleries[{index}]: unsupported priority {entry.get('priority')!r}")

    illustration_doc = load_yaml(ILLUSTRATION_SOURCES_PATH) or {}
    if illustration_doc.get("version") != 1:
        fail(errors, "registries/illustration-sources.yaml: version must be 1")
    illustration_count = validate_common_list(
        errors,
        illustration_doc.get("sources"),
        label="illustration-sources.sources",
        required=(
            "id",
            "name",
            "url",
            "source_type",
            "license",
            "reuse_policy",
            "useful_for",
            "borrow",
            "avoid",
            "notes",
        ),
        list_fields=("useful_for", "borrow", "avoid"),
        url_fields=("url",),
    )

    allowed_reuse_policies = {
        "ideas-only",
        "code-with-attribution",
        "mechanism-and-code-with-attribution",
    }
    for index, entry in enumerate(
        illustration_doc.get("sources", []) if isinstance(illustration_doc.get("sources"), list) else []
    ):
        if not isinstance(entry, dict):
            continue
        policy = entry.get("reuse_policy")
        if policy not in allowed_reuse_policies:
            fail(errors, f"illustration-sources.sources[{index}]: unsupported reuse_policy {policy!r}")
        if entry.get("license") == "no-license-detected" and policy != "ideas-only":
            fail(errors, f"illustration-sources.sources[{index}]: no-license-detected sources must use ideas-only")

    if errors:
        print("Registry validation failed:\n", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(
        "Registry validation passed: "
        f"{tool_count} frontend tools, {gallery_count} reference galleries, "
        f"{illustration_count} illustration research sources."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
