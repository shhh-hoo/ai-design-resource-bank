import unittest
from pathlib import Path

from scripts.validate_inbox import validate_inbox

ROOT = Path(__file__).resolve().parents[1]


class CandidateInboxTests(unittest.TestCase):
    def test_seed_candidates_validate_and_dedupe(self):
        self.assertEqual([], validate_inbox(ROOT))

    def test_seed_wave_is_noncanonical(self):
        candidate_dir = ROOT / "inbox" / "candidates"
        self.assertTrue(any(candidate_dir.glob("*.json")))
        canonical_dirs = {"knowledge", "subjects", "resources"}
        self.assertTrue(all(p.parts[-3] == "inbox" for p in candidate_dir.glob("*.json")))
        self.assertEqual({"knowledge", "subjects", "resources"}, canonical_dirs)


if __name__ == "__main__":
    unittest.main(verbosity=2)
