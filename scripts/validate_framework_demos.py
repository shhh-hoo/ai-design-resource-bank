#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dir", type=Path, default=Path(".board-test/framework"))
    args = parser.parse_args()
    bundle_dir = args.dir if args.dir.is_absolute() else ROOT / args.dir

    expected = {
        "three-demos.js": 800_000,
        "d3-demos.js": 120_000,
    }
    errors: list[str] = []

    for filename, budget in expected.items():
        path = bundle_dir / filename
        if not path.exists():
            errors.append(f"missing lazy framework bundle: {path}")
            continue
        size = path.stat().st_size
        print(f"- {filename}: {size:,} bytes (budget {budget:,})")
        if size > budget:
            errors.append(f"{filename} exceeds lazy bundle budget: {size:,} > {budget:,}")
        text = path.read_text(encoding="utf-8")
        if 'from"three"' in text or "from'three'" in text or 'from"d3-force"' in text or "from'd3-force'" in text:
            errors.append(f"{filename} still contains a bare npm import; bundle is incomplete")

    index = (ROOT / "index.html").read_text(encoding="utf-8")
    for filename in expected:
        if filename in index:
            errors.append(f"index.html must not preload lazy framework bundle: {filename}")

    workbench = (ROOT / "web" / "mechanism-workbench.js").read_text(encoding="utf-8")
    for required in (
        'lazyFrameworkDemo("./framework/three-demos.js"',
        'lazyFrameworkDemo("./framework/d3-demos.js"',
        '"orbital-overlap": lazyFrameworkDemo',
        '"graph-relayout": lazyFrameworkDemo',
    ):
        if required not in workbench:
            errors.append(f"framework demo wiring missing: {required}")

    three_source = (ROOT / "web" / "framework" / "three-demos.js").read_text(encoding="utf-8")
    for required in ("WebGLRenderer", "PerspectiveCamera", "world.project", "renderer.dispose"):
        if required not in three_source:
            errors.append(f"Three.js source missing expected real-rendering behavior: {required}")
    if "setAnimationLoop" in three_source:
        errors.append("Three.js demos must remain interaction-rendered; no permanent animation loop")

    d3_source = (ROOT / "web" / "framework" / "d3-demos.js").read_text(encoding="utf-8")
    for required in ("forceSimulation", ".stop()", ".tick(220)"):
        if required not in d3_source:
            errors.append(f"D3 source missing bounded force-layout behavior: {required}")

    if errors:
        print("Framework demo validation failed:\n", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print("Lazy framework demo validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
