#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

from retrieve import ROOT, query

BENCHMARK = ROOT / "benchmarks" / "retrieval-v1.json"

def load_benchmark(path: Path = BENCHMARK) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("version") != 1 or not isinstance(data.get("cases"), list):
        raise ValueError("Unsupported retrieval benchmark")
    ids = [case.get("id") for case in data["cases"]]
    if len(ids) != len(set(ids)) or any(not x for x in ids):
        raise ValueError("Benchmark case IDs must be unique and non-empty")
    return data

def candidate_exists(candidate_id: str) -> bool:
    for path in (ROOT / "inbox" / "candidates").glob("*.json"):
        record = json.loads(path.read_text(encoding="utf-8"))
        if record.get("id") == candidate_id:
            return record.get("status") in {"promote", "promoted"}
    return False

def evaluate(path: Path = BENCHMARK) -> dict:
    data = load_benchmark(path)
    results = []
    required_misses = []
    invalid_gap_candidates = []
    for case in data["cases"]:
        rows = query(case["brief"], case.get("type"), 8)
        ids = [row["id"] for row in rows]
        expected = case.get("expected_any", [])
        hit = bool(set(ids) & set(expected)) if expected else False
        item = {
            "id": case["id"],
            "cluster": case["cluster"],
            "status": case["status"],
            "brief": case["brief"],
            "result_ids": ids,
            "expected_any": expected,
            "hit": hit,
        }
        if case["status"] == "required" and not hit:
            required_misses.append(case["id"])
        if case["status"] == "open_gap":
            candidate_ids = case.get("candidate_ids", [])
            valid = bool(candidate_ids) and all(candidate_exists(cid) for cid in candidate_ids)
            item["candidate_ids"] = candidate_ids
            item["candidate_ready"] = valid
            if not valid:
                invalid_gap_candidates.append(case["id"])
        results.append(item)
    required = [r for r in results if r["status"] == "required"]
    gaps = [r for r in results if r["status"] == "open_gap"]
    return {
        "version": data["version"],
        "case_count": len(results),
        "required": {
            "total": len(required),
            "passed": sum(r["hit"] for r in required),
            "misses": required_misses,
        },
        "open_gaps": {
            "total": len(gaps),
            "candidate_ready": sum(bool(r.get("candidate_ready")) for r in gaps),
            "invalid_candidates": invalid_gap_candidates,
        },
        "cases": results,
    }

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()
    result = evaluate()
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if args.strict:
        errors = []
        if result["required"]["misses"]:
            errors.append("required retrieval misses: " + ", ".join(result["required"]["misses"]))
        if result["open_gaps"]["invalid_candidates"]:
            errors.append("open gaps without promote/promoted candidates: " + ", ".join(result["open_gaps"]["invalid_candidates"]))
        if errors:
            raise SystemExit("\n".join(errors))

if __name__ == "__main__":
    main()
