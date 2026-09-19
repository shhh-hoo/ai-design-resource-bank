import json
import unittest
from pathlib import Path

from scripts.atlas_core import inputs
from scripts.validate_atlas import validate

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {
    "ex:pattern-breaking",
    "ex:whole-earth-index",
    "ex:fiona-vilmer",
    "ex:aott-severance",
    "ex:aott-spider-verse",
    "ex:aott-uncut-gems",
    "ex:esdevlin-formation-tour",
    "ex:esdevlin-mirror-maze",
    "ex:esdevlin-u2-sphere",
    "ex:dia-catk",
    "ex:dia-nike-statement-house",
    "ex:dia-atrak-live-visuals",
}

class Wave01CreativeTests(unittest.TestCase):
    def setUp(self):
        self.data = inputs()
        self.by_id = {r["id"]: r for r in self.data[0]}

    def test_wave01_is_valid_canonical_core(self):
        validate(*self.data)
        self.assertTrue(EXPECTED <= self.by_id.keys())

    def test_wave01_examples_are_subjectless_external_references(self):
        for eid in EXPECTED:
            r = self.by_id[eid]
            self.assertEqual("Example", r["type"])
            self.assertEqual("REFERENCE", r["kind"])
            self.assertNotIn("subject_id", r)
            self.assertEqual([], r["topic_ids"])
            self.assertTrue(r["lifecycle"]["collected"])
            self.assertFalse(r["lifecycle"]["showable"])
            self.assertNotIn("preview", r)
            self.assertFalse(r["lifecycle"]["verified"])

    def test_promoted_candidates_point_to_real_canonical_ids(self):
        for path in (ROOT / "inbox" / "candidates").glob("*.json"):
            r = json.loads(path.read_text(encoding="utf-8"))
            if r.get("status") != "promoted":
                continue
            ids = (r.get("decision") or {}).get("canonical_ids", [])
            self.assertTrue(ids, path.name)
            for cid in ids:
                self.assertIn(cid, self.by_id, f"{path.name}: {cid}")

if __name__ == "__main__":
    unittest.main(verbosity=2)
