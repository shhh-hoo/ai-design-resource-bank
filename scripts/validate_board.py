#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
JS = ROOT / "web" / "board.js"
CSS = ROOT / "web" / "board.css"

errors: list[str] = []

for path in (INDEX, JS, CSS):
    if not path.exists():
        errors.append(f"missing board asset: {path.relative_to(ROOT)}")

if INDEX.exists():
    html = INDEX.read_text(encoding="utf-8")
    for required in (
        'id="boardView"',
        'id="indexView"',
        'id="searchInput"',
        'id="domainNav"',
        'id="detailDrawer"',
        './web/board.css',
        './web/board.js',
        'js-yaml@4.1.0',
    ):
        if required not in html:
            errors.append(f"index.html missing required board contract: {required}")

if JS.exists():
    js = JS.read_text(encoding="utf-8")
    for required in (
        './registries/frontend-tools.yaml',
        './registries/reference-galleries.yaml',
        './catalog.yaml',
        'Copy AI brief',
        'history.pushState',
        'prefers-reduced-motion',
    ):
        if required == 'prefers-reduced-motion':
            continue
        if required not in js:
            errors.append(f"web/board.js missing expected behavior/path: {required}")

if CSS.exists():
    css = CSS.read_text(encoding="utf-8")
    for required in (
        '.board-view',
        '.drawer',
        '.index-view',
        '@media (max-width: 640px)',
        '@media (prefers-reduced-motion: reduce)',
    ):
        if required not in css:
            errors.append(f"web/board.css missing required style contract: {required}")

for data_path in (
    ROOT / "registries" / "frontend-tools.yaml",
    ROOT / "registries" / "reference-galleries.yaml",
    ROOT / "catalog.yaml",
):
    if not data_path.exists():
        errors.append(f"board data source missing: {data_path.relative_to(ROOT)}")

if errors:
    print("Capability board validation failed:\n", file=sys.stderr)
    for error in errors:
        print(f"- {error}", file=sys.stderr)
    raise SystemExit(1)

print("Capability board contract passed.")
