#!/usr/bin/env python3
from pathlib import Path
import sys
import yaml

ROOT = Path(__file__).resolve().parents[1]
MECHANISMS = ROOT / "registries" / "frontend-mechanisms.yaml"
TOOLS = ROOT / "registries" / "frontend-tools.yaml"

errors: list[str] = []

if not MECHANISMS.exists():
    errors.append("missing registries/frontend-mechanisms.yaml")
if not TOOLS.exists():
    errors.append("missing registries/frontend-tools.yaml")

seen: set[str] = set()

if not errors:
    mechanisms_doc = yaml.safe_load(MECHANISMS.read_text(encoding="utf-8")) or {}
    tools_doc = yaml.safe_load(TOOLS.read_text(encoding="utf-8")) or {}
    tool_ids = {item.get("id") for item in tools_doc.get("tools", []) if isinstance(item, dict)}
    items = mechanisms_doc.get("mechanisms", [])
    if mechanisms_doc.get("version") != 1:
        errors.append("frontend-mechanisms.yaml: version must be 1")
    if not isinstance(items, list):
        errors.append("frontend-mechanisms.yaml: mechanisms must be a list")
        items = []

    demos: set[str] = set()
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            errors.append(f"mechanisms[{index}] must be a mapping")
            continue
        mid = item.get("id")
        if not mid:
            errors.append(f"mechanisms[{index}] missing id")
            continue
        if mid in seen:
            errors.append(f"duplicate mechanism id: {mid}")
        seen.add(mid)
        for key in ("name", "domain", "summary", "use_when", "demo", "implementation_note", "status"):
            if not item.get(key):
                errors.append(f"{mid}: missing {key}")
        if not isinstance(item.get("tools", []), list):
            errors.append(f"{mid}: tools must be a list")
        else:
            for tool_id in item.get("tools", []):
                if tool_id not in tool_ids:
                    errors.append(f"{mid}: unknown tool id {tool_id!r}")
        if not isinstance(item.get("primitives", []), list):
            errors.append(f"{mid}: primitives must be a list")
        demo = item.get("demo")
        if demo in demos:
            errors.append(f"duplicate demo key: {demo}")
        demos.add(demo)

if errors:
    print("Mechanism validation failed:\n", file=sys.stderr)
    for error in errors:
        print(f"- {error}", file=sys.stderr)
    raise SystemExit(1)

print(f"Mechanism validation passed: {len(seen)} mechanism(s).")
