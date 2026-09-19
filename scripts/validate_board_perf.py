#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=Path(".board-test/data/board.json"))
    args = parser.parse_args()

    data_path = args.data if args.data.is_absolute() else ROOT / args.data
    index = ROOT / "index.html"
    boot = ROOT / "web" / "boot.js"
    board = ROOT / "web" / "board.js"
    workbench = ROOT / "web" / "mechanism-workbench.js"
    css = ROOT / "web" / "board.css"

    errors: list[str] = []
    for path in (index, boot, board, workbench, css, data_path):
        if not path.exists():
            errors.append(f"missing performance input: {path}")

    if index.exists():
        html = index.read_text(encoding="utf-8")
        for banned in ("cdn.jsdelivr.net", "js-yaml", "jsyaml"):
            if banned in html:
                errors.append(f"index.html must not load runtime YAML infrastructure: {banned}")
        for required in (
            'type="module" src="./web/boot.js"',
            'rel="modulepreload" href="./web/board.js"',
            'rel="modulepreload" href="./web/mechanism-workbench.js"',
        ):
            if required not in html:
                errors.append(f"index.html missing fast-boot contract: {required}")

    if boot.exists():
        text = boot.read_text(encoding="utf-8")
        for required in (
            "data/board.json",
            'cache: "default"',
            "window.__BOARD_DATA__",
            'import("./board.js")',
            'import("./mechanism-workbench.js")',
        ):
            if required not in text:
                errors.append(f"web/boot.js missing fast-boot behavior: {required}")
        if 'cache: "no-store"' in text:
            errors.append("web/boot.js must not disable HTTP caching")

    if data_path.exists() and data_path.stat().st_size > 100_000:
        errors.append(
            f"compiled board data exceeds 100 KB budget: {data_path.stat().st_size:,} bytes"
        )

    if all(path.exists() for path in (index, boot, board, workbench, css, data_path)):
        critical = {
            "index.html": index.stat().st_size,
            "web/boot.js": boot.stat().st_size,
            "web/board.js": board.stat().st_size,
            "web/mechanism-workbench.js": workbench.stat().st_size,
            "web/board.css": css.stat().st_size,
            "data/board.json": data_path.stat().st_size,
        }
        total = sum(critical.values())
        if total > 210_000:
            errors.append(f"uncompressed critical payload exceeds 210 KB budget: {total:,} bytes")
        print("Board performance budget:")
        for name, size in critical.items():
            print(f"- {name}: {size:,} bytes")
        print(f"- total: {total:,} bytes before transfer compression")

    if errors:
        print("Board performance validation failed:\n", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print("Board performance validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
