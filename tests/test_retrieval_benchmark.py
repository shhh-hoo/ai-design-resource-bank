import unittest

from scripts.evaluate_retrieval_benchmark import evaluate

class RetrievalBenchmarkTests(unittest.TestCase):
    def test_required_cases_and_gap_candidates(self):
        result = evaluate()
        self.assertEqual(30, result["case_count"])
        self.assertEqual(30, result["required"]["total"])
        self.assertEqual([], result["required"]["misses"])
        self.assertEqual(0, result["open_gaps"]["total"])
        self.assertEqual(0, result["open_gaps"]["candidate_ready"])
        self.assertEqual([], result["open_gaps"]["invalid_candidates"])

if __name__ == "__main__":
    unittest.main(verbosity=2)
