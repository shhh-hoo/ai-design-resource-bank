#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
MAP_PATH = ROOT / "registries" / "visualization-grammar-mechanisms.yaml"
ATLAS_PATH = ROOT / "registries" / "subject-visualization-families.yaml"
MECHANISMS_PATH = ROOT / "registries" / "frontend-mechanisms.yaml"


def load(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle) or {}


def main() -> int:
    errors: list[str] = []
    routing = load(MAP_PATH)
    atlas = load(ATLAS_PATH)
    mechanisms = load(MECHANISMS_PATH)

    if routing.get("version") != 1:
        errors.append("visualization-grammar-mechanisms.yaml: version must be 1")

    mapping = routing.get("grammar_mechanisms")
    if not isinstance(mapping, dict):
        errors.append("visualization-grammar-mechanisms.yaml: grammar_mechanisms must be a mapping")
        mapping = {}

    grammar_ids = set((atlas.get("grammars") or {}).keys())
    mechanism_ids = {
        item.get("id")
        for item in (mechanisms.get("mechanisms") or [])
        if isinstance(item, dict) and isinstance(item.get("id"), str)
    }

    missing = sorted(grammar_ids - set(mapping))
    extra = sorted(set(mapping) - grammar_ids)
    if missing:
        errors.append(f"grammar mechanism map missing grammar(s): {', '.join(missing)}")
    if extra:
        errors.append(f"grammar mechanism map contains unknown grammar(s): {', '.join(extra)}")

    for grammar_id, values in mapping.items():
        if not isinstance(values, list):
            errors.append(f"{grammar_id}: expected a list of mechanism ids")
            continue
        if len(values) != len(set(values)):
            errors.append(f"{grammar_id}: duplicate mechanism id")
        for mechanism_id in values:
            if mechanism_id not in mechanism_ids:
                errors.append(f"{grammar_id}: unknown mechanism {mechanism_id!r}")

    spatial = mapping.get("spatial-map", [])
    expected_spatial = ["semantic-zoom", "canvas-focus-lens", "anchored-callout"]
    if spatial != expected_spatial:
        errors.append(
            "spatial-map routing must stay deliberately map-specific: "
            + ", ".join(expected_spatial)
        )

    if errors:
        print("Grammar-mechanism routing validation failed:\n", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    routed = sum(len(values) for values in mapping.values())
    print(f"Grammar-mechanism routing validation passed: {len(mapping)} grammars, {routed} curated links.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
