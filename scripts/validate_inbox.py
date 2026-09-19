#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]


def validate_inbox(root: Path = ROOT) -> list[str]:
    inbox = root / "inbox"
    schema = json.loads((inbox / "candidate.schema.json").read_text(encoding="utf-8"))
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    errors: list[str] = []
    seen_ids: dict[str, Path] = {}
    seen_locators: dict[str, Path] = {}

    for path in sorted((inbox / "candidates").glob("*.json")):
        try:
            record = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            errors.append(f"{path.relative_to(root)}: invalid JSON: {exc}")
            continue

        for err in sorted(validator.iter_errors(record), key=lambda e: list(e.path)):
            where = ".".join(str(x) for x in err.path)
            errors.append(f"{path.relative_to(root)}:{where}: {err.message}")

        candidate_id = record.get("id")
        if candidate_id:
            if candidate_id in seen_ids:
                errors.append(
                    f"duplicate candidate id {candidate_id}: "
                    f"{seen_ids[candidate_id].relative_to(root)} and {path.relative_to(root)}"
                )
            seen_ids[candidate_id] = path

        locator = (record.get("source") or {}).get("locator")
        if locator:
            if locator in seen_locators:
                errors.append(
                    f"duplicate candidate locator {locator}: "
                    f"{seen_locators[locator].relative_to(root)} and {path.relative_to(root)}"
                )
            seen_locators[locator] = path

        status = record.get("status")
        decision = record.get("decision")
        if status in {"promote", "rejected", "deferred", "promoted"} and decision:
            if decision.get("outcome") != status:
                errors.append(
                    f"{path.relative_to(root)}: decision.outcome must equal status "
                    f"({decision.get('outcome')} != {status})"
                )
        if status == "promoted" and not (decision or {}).get("canonical_ids"):
            errors.append(f"{path.relative_to(root)}: promoted candidate requires canonical_ids")

    return errors


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.parse_args()
    errors = validate_inbox()
    if errors:
        raise SystemExit("\n".join(errors))
    count = len(list((ROOT / "inbox" / "candidates").glob("*.json")))
    print(f"Candidate inbox validation passed: {count} candidate(s).")


if __name__ == "__main__":
    main()
