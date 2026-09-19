#!/usr/bin/env python3
from pathlib import Path
import sys
from urllib.parse import urlparse
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
    chapters = mechanisms_doc.get("chapters", [])

    if mechanisms_doc.get("version") != 1:
        errors.append("frontend-mechanisms.yaml: version must be 1")
    if not isinstance(items, list):
        errors.append("frontend-mechanisms.yaml: mechanisms must be a list")
        items = []
    if not isinstance(chapters, list) or not chapters:
        errors.append("frontend-mechanisms.yaml: chapters must be a non-empty list")
        chapters = []

    chapter_ids: set[str] = set()
    for index, chapter in enumerate(chapters):
        if not isinstance(chapter, dict):
            errors.append(f"chapters[{index}] must be a mapping")
            continue
        cid = chapter.get("id")
        if not cid:
            errors.append(f"chapters[{index}] missing id")
            continue
        if cid in chapter_ids:
            errors.append(f"duplicate chapter id: {cid}")
        chapter_ids.add(cid)
        for key in ("label", "blurb"):
            if not chapter.get(key):
                errors.append(f"chapter {cid}: missing {key}")

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
        domain = item.get("domain")
        if domain and domain not in chapter_ids:
            errors.append(f"{mid}: domain {domain!r} has no declared chapter")
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

        references = item.get("references", [])
        if not isinstance(references, list):
            errors.append(f"{mid}: references must be a list")
        else:
            for url in references:
                parsed = urlparse(str(url))
                if parsed.scheme != "https" or not parsed.netloc:
                    errors.append(f"{mid}: reference must be an https URL: {url!r}")

    used_domains = {item.get("domain") for item in items if isinstance(item, dict) and item.get("domain")}
    for chapter_id in sorted(chapter_ids - used_domains):
        errors.append(f"chapter {chapter_id!r} has no mechanisms")

if errors:
    print("Mechanism validation failed:\n", file=sys.stderr)
    for error in errors:
        print(f"- {error}", file=sys.stderr)
    raise SystemExit(1)

print(f"Mechanism validation passed: {len(seen)} mechanism(s), {len(chapter_ids)} chapter(s).")
