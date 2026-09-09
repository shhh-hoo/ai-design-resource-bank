#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
BOOT_JS = ROOT / "web" / "boot.js"
JS = ROOT / "web" / "board.js"
WORKBENCH_JS = ROOT / "web" / "mechanism-workbench.js"
CSS = ROOT / "web" / "board.css"

errors: list[str] = []

for path in (INDEX, BOOT_JS, JS, WORKBENCH_JS, CSS):
    if not path.exists():
        errors.append(f"missing board asset: {path.relative_to(ROOT)}")

if INDEX.exists():
    html = INDEX.read_text(encoding="utf-8")
    for required in (
        'id="exploreView"',
        'id="indexView"',
        'id="searchInput"',
        'id="chapterNav"',
        'id="detailDrawer"',
        'id="mechanismCardTemplate"',
        './web/board.css',
        './web/boot.js',
        './web/board.js',
        './web/mechanism-workbench.js',
        'Subject → mechanism → demo → tool',
    ):
        if required not in html:
            errors.append(f"index.html missing required board contract: {required}")
    for removed in (
        'id="heroStats"',
        'id="typeFilters"',
        'id="tierSelect"',
        'id="boardView"',
        'class="card-tags"',
        'cdn.jsdelivr.net',
        'js-yaml',
    ):
        if removed in html:
            errors.append(f"index.html reintroduced dense/slow legacy surface: {removed}")

if BOOT_JS.exists():
    boot = BOOT_JS.read_text(encoding="utf-8")
    for required in (
        "data/board.json",
        "window.__BOARD_DATA__",
        'cache: "default"',
        'import("./board.js")',
        'import("./mechanism-workbench.js")',
    ):
        if required not in boot:
            errors.append(f"web/boot.js missing fast-start behavior: {required}")
    if 'cache: "no-store"' in boot:
        errors.append("web/boot.js must not disable HTTP caching")

if JS.exists():
    js = JS.read_text(encoding="utf-8")
    for required in (
        'Copy AI brief',
        'history.pushState',
        'demoMovableTangent',
        'demoElectron',
        'demoFocus',
        'prefers-reduced-motion',
    ):
        if required not in js:
            errors.append(f"web/board.js missing expected behavior/path: {required}")

if WORKBENCH_JS.exists():
    extension = WORKBENCH_JS.read_text(encoding="utf-8")
    for required in (
        'registry.chapters',
        'renderRegistryChapters',
        'demoCameraDolly',
        'demoSplitText',
        'demoParticleAttractor',
        'demoNoiseWipe',
        'demoBondMorph',
        'demoGraphRelayout',
        'demoFocusLens',
        'demoAnchoredCallout',
        'prefers-reduced-motion',
    ):
        if required not in extension:
            errors.append(f"web/mechanism-workbench.js missing expected behavior: {required}")

if CSS.exists():
    css = CSS.read_text(encoding="utf-8")
    for required in (
        '.chapter',
        '.mechanism-card',
        '.demo-stage',
        '.drawer',
        '.index-view',
        '@media (max-width: 560px)',
        '@media (prefers-reduced-motion: reduce)',
    ):
        if required not in css:
            errors.append(f"web/board.css missing required style contract: {required}")
    for banned in (
        'linear-gradient(',
        'radial-gradient(',
        '.domain-chip::before',
        '.card-tag',
        '.hero-stats',
    ):
        if banned in css:
            errors.append(f"web/board.css violates editorial surface contract: {banned}")

for data_path in (
    ROOT / "registries" / "frontend-mechanisms.yaml",
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
