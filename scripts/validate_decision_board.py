#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
BOARD_JS = ROOT / "web" / "board.js"
DECISION_JS = ROOT / "web" / "decision-board.js"
DECISION_CSS = ROOT / "web" / "decision-board.css"
CSS = ROOT / "web" / "board.css"
BUILD_SCRIPT = ROOT / "scripts" / "build_subject_atlas_data.py"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=Path(".board-test/data/subject-atlas.json"))
    args = parser.parse_args()
    data_path = args.data if args.data.is_absolute() else ROOT / args.data

    errors: list[str] = []
    for path in (INDEX, BOARD_JS, DECISION_JS, DECISION_CSS, CSS, BUILD_SCRIPT, data_path):
        if not path.exists():
            errors.append(f"missing decision-board asset: {path.relative_to(ROOT) if path.is_relative_to(ROOT) else path}")

    if INDEX.exists():
        html = INDEX.read_text(encoding="utf-8")
        for required in (
            'data-view="decide"',
            'id="decisionView"',
            'id="decisionRoot"',
            'id="globalSearch"',
            'Curriculum → relationship → representation → tool',
            'Start a decision',
        ):
            if required not in html:
                errors.append(f"index.html missing decision-board contract: {required}")
        if 'modulepreload" href="./web/decision-board.js' in html:
            errors.append("decision-board.js must remain lazy and must not be modulepreloaded")
        if './web/decision-board.css' in html:
            errors.append("decision-board.css must remain lazy and must not be linked from index.html")

    if BOARD_JS.exists():
        text = BOARD_JS.read_text(encoding="utf-8")
        for required in (
            'import("./decision-board.js")',
            'view === "decide"',
            'hash.startsWith("subject:")',
            'hash.startsWith("grammar:")',
        ):
            if required not in text:
                errors.append(f"web/board.js missing decision routing: {required}")

    if DECISION_JS.exists():
        text = DECISION_JS.read_text(encoding="utf-8")
        for required in (
            'data/subject-atlas.json',
            'I know the subject',
            'I know what I need to show',
            'Copy build brief',
            'Recommended representation routes',
            'Reuse what the bank already knows',
            'history.pushState',
            'navigator.clipboard.writeText',
            'window.__BOARD_DATA__',
            'loadDecisionStyles',
            'matchesQuery',
        ):
            if required not in text:
                errors.append(f"web/decision-board.js missing expected behavior: {required}")
        for banned in (
            'requestAnimationFrame(frame)',
            'setInterval(',
            'cdn.jsdelivr.net',
            'js-yaml',
        ):
            if banned in text:
                errors.append(f"web/decision-board.js reintroduced heavy/runtime dependency: {banned}")
        if DECISION_JS.stat().st_size > 42_000:
            errors.append(f"decision-board.js exceeds 42 KB lazy-code budget: {DECISION_JS.stat().st_size:,} bytes")

    if DECISION_CSS.exists():
        decision_css = DECISION_CSS.read_text(encoding="utf-8")
        for required in (
            '.decision-view',
            '.decision-path',
            '.decision-workspace',
            '.decision-topic',
            '.decision-route-row',
            '.decision-bank-row',
        ):
            if required not in decision_css:
                errors.append(f"web/decision-board.css missing decision style: {required}")
        if DECISION_CSS.stat().st_size > 16_000:
            errors.append(f"decision-board.css exceeds 16 KB lazy-style budget: {DECISION_CSS.stat().st_size:,} bytes")

    if CSS.exists() and '.decision-view' in CSS.read_text(encoding="utf-8"):
        errors.append("web/board.css must not include lazy decision-board styles")

    if data_path.exists():
        if data_path.stat().st_size > 120_000:
            errors.append(f"subject-atlas.json exceeds 120 KB lazy-data budget: {data_path.stat().st_size:,} bytes")
        try:
            payload = json.loads(data_path.read_text(encoding="utf-8"))
        except Exception as exc:
            errors.append(f"subject-atlas.json is not valid JSON: {exc}")
        else:
            subjects = payload.get("subjects", {}).get("subjects", [])
            families = payload.get("atlas", {}).get("families", {})
            grammars = payload.get("atlas", {}).get("grammars", {})
            if len(subjects) < 90:
                errors.append(f"subject-atlas.json unexpectedly small subject catalog: {len(subjects)}")
            if len(families) < 15:
                errors.append(f"subject-atlas.json unexpectedly small family catalog: {len(families)}")
            if len(grammars) < 18:
                errors.append(f"subject-atlas.json unexpectedly small grammar catalog: {len(grammars)}")

    if errors:
        print("Master decision board validation failed:\n", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    lazy_total = DECISION_JS.stat().st_size + DECISION_CSS.stat().st_size + data_path.stat().st_size
    if lazy_total > 90_000:
        print(f"Master decision board lazy payload exceeds 90 KB: {lazy_total:,} bytes", file=sys.stderr)
        return 1
    print(
        "Master decision board validation passed: "
        f"{DECISION_JS.stat().st_size:,} B lazy JS, {DECISION_CSS.stat().st_size:,} B lazy CSS, "
        f"{data_path.stat().st_size:,} B lazy data; {lazy_total:,} B total before compression."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
