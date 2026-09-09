#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]


def load_yaml(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle) or {}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("_site/data/board.json"))
    args = parser.parse_args()

    payload = {
        "mechanisms": load_yaml(ROOT / "registries" / "frontend-mechanisms.yaml"),
        "tools": load_yaml(ROOT / "registries" / "frontend-tools.yaml"),
        "references": load_yaml(ROOT / "registries" / "reference-galleries.yaml"),
        "catalog": load_yaml(ROOT / "catalog.yaml"),
    }

    output = args.output if args.output.is_absolute() else ROOT / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Board data compiled: {output.relative_to(ROOT)} ({output.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
