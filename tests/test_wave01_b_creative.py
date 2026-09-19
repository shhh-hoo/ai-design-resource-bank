import json
import unittest
from pathlib import Path

from scripts.atlas_core import inputs
from scripts.validate_atlas import validate

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {
    "ex:evolution-of-trust",
    "ex:parable-of-polygons",
    "ex:seeing-theory-basic-probability",
    "ex:setosa-image-kernels",
    "ex:setosa-markov-chains",
    "ex:google-100000-stars",
    "ex:earth-nullschool",
    "ex:bruno-simon-portfolio",
    "ex:chrome-music-lab-kandinsky",
    "ex:patatap",
    "ex:pulse-room",
    "ex:rain-room",
    "ex:teamlab-borderless",
    "ex:uva-momentum",
    "ex:ryoji-data-verse-3",
    "ex:random-future-self",
}

class Wave01BCreativeTests(unittest.TestCase):
    def setUp(self):
        self.data = inputs()
        self.by_id = {r["id"]: r for r in self.data[0]}

    def test_batch_b_is_valid_canonical_core(self):
        validate(*self.data)
        self.assertTrue(EXPECTED <= self.by_id.keys())

    def test_batch_b_keeps_external_reference_boundary(self):
        for eid in EXPECTED:
            r = self.by_id[eid]
            self.assertEqual("Example", r["type"])
            self.assertEqual("REFERENCE", r["kind"])
            self.assertNotIn("subject_id", r)
            self.assertEqual([], r["topic_ids"])
            self.assertTrue(r["lifecycle"]["collected"])
            self.assertFalse(r["lifecycle"]["showable"])
            self.assertFalse(r["lifecycle"]["verified"])
            self.assertNotIn("preview", r)
            self.assertFalse(r["lifecycle"]["verified"])

    def test_observed_tools_are_only_explicitly_documented_cases(self):
        documented = {
            "ex:seeing-theory-basic-probability": {"tool:d3"},
            "ex:bruno-simon-portfolio": {"tool:threejs", "tool:rapier"},
        }
        for eid in EXPECTED:
            actual = {x["id"] for x in self.by_id[eid]["tool_choices"]}
            self.assertEqual(documented.get(eid, set()), actual)
            for choice in self.by_id[eid]["tool_choices"]:
                self.assertEqual("observed", choice["evidence"])

    def test_promoted_candidate_ids_resolve(self):
        for path in (ROOT / "inbox" / "candidates").glob("*.json"):
            record = json.loads(path.read_text(encoding="utf-8"))
            if record.get("status") != "promoted":
                continue
            for cid in (record.get("decision") or {}).get("canonical_ids", []):
                self.assertIn(cid, self.by_id, f"{path.name}: {cid}")

if __name__ == "__main__":
    unittest.main(verbosity=2)
