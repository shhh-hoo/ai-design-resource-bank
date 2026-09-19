import unittest
from pathlib import Path

from scripts.atlas_core import inputs, read
from scripts.validate_atlas import validate

ROOT = Path(__file__).resolve().parents[1]
LINKS = {
    "ex:whole-earth-index": "resource:archive-as-interface",
    "ex:fiona-vilmer": "resource:archive-as-interface",
    "ex:parable-of-polygons": "resource:editable-model-sandbox",
    "ex:seeing-theory-basic-probability": "resource:editable-model-sandbox",
    "ex:setosa-markov-chains": "resource:editable-model-sandbox",
    "ex:setosa-image-kernels": "resource:linked-computation-inspector",
    "ex:google-100000-stars": "resource:semantic-zoom-levels",
}

class Wave01ResourceTests(unittest.TestCase):
    def setUp(self):
        self.data = inputs()
        self.by_id = {r["id"]: r for r in self.data[0]}

    def test_resource_links_are_canonical_and_reusable(self):
        validate(*self.data)
        for example_id, resource_id in LINKS.items():
            example = self.by_id[example_id]
            self.assertTrue(example["lifecycle"]["reusable"])
            self.assertEqual([resource_id], example["resource_ids"])
            self.assertEqual("Resource", self.by_id[resource_id]["type"])

    def test_extracted_resources_are_implemented_not_overclaimed_verified(self):
        for resource_id in set(LINKS.values()):
            resource = self.by_id[resource_id]
            self.assertEqual("implemented", resource["status"])
            self.assertTrue(resource["artifacts"])
            self.assertFalse(any(a.get("generated") for a in resource["artifacts"]))

if __name__ == "__main__":
    unittest.main(verbosity=2)
