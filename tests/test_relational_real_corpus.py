import unittest

from scripts.project_relational_catalog import project_current_corpus


class RealCorpusProjectionTests(unittest.TestCase):
    def test_current_corpus_projects_without_structural_errors(self):
        db, report = project_current_corpus()
        try:
            counts = report["canonical_counts"]
            inserted = report["inserted"]
            self.assertEqual(counts.get("Concept", 0), inserted.get("concepts", 0))
            self.assertEqual(counts.get("Example", 0), inserted.get("examples", 0))
            self.assertEqual(counts.get("Tool", 0), inserted.get("tools", 0))
            self.assertEqual(counts.get("Resource", 0), inserted.get("resources", 0))
            self.assertEqual(counts.get("Source", 0), inserted.get("sources", 0))
            self.assertEqual(counts.get("Intent", 0), inserted.get("intents", 0))
            self.assertEqual(counts.get("Collection", 0), inserted.get("collections", 0))
            self.assertEqual(
                counts.get("SubjectTopic", 0),
                inserted.get("subjects", 0) + inserted.get("knowledge_points", 0),
            )
            self.assertEqual([], report["validator_errors"])
        finally:
            db.close()

    def test_all_current_relation_semantics_are_mapped(self):
        db, report = project_current_corpus()
        try:
            self.assertEqual({}, report["unresolved_relations"])
            for key in (
                "implemented_with:proposed_example",
                "intended_to_demonstrate",
                "yields",
            ):
                self.assertGreater(report["mapped_relations"].get(key, 0), 0)
        finally:
            db.close()

    def test_unreviewed_projection_does_not_publish_facts(self):
        db, report = project_current_corpus()
        try:
            self.assertTrue(report["published_fact_rows"])
            self.assertEqual(0, sum(report["published_fact_rows"].values()))
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
