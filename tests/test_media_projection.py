import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class MediaProjectionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.web = json.loads((ROOT / "catalog" / "web-index.json").read_text(encoding="utf-8"))
        cls.media = json.loads((ROOT / "app" / "media.json").read_text(encoding="utf-8"))

    def test_all_creative_examples_are_audited(self):
        creative = {
            item["id"]
            for item in self.web["examples"]
            if not item.get("subject_id") and item["kind"] != "GAP"
        }
        audited = set(self.media["examples"])
        self.assertEqual(creative, audited)
        self.assertEqual(28, len(audited))

    def test_media_contract(self):
        allowed_modes = {"embed", "on-demand-embed", "poster", "link"}
        for example_id, media in self.media["examples"].items():
            with self.subTest(example_id=example_id):
                self.assertIn(media["mode"], allowed_modes)
                self.assertTrue(media["source_url"].startswith("https://"))
                self.assertTrue(media["attribution"])
                self.assertTrue(media["rights_status"])
                if media["mode"] == "embed":
                    self.assertTrue(media["embed_url"].startswith("https://"))
                    self.assertIn(
                        media["rights_status"],
                        {"open-license", "explicit-embed"},
                    )
                    self.assertTrue(media.get("rights_evidence_url"))
                if media["mode"] == "poster":
                    self.assertTrue(media["poster_url"].startswith("https://"))
                    self.assertTrue(media.get("rights_evidence_url"))
                if media["mode"] == "on-demand-embed":
                    self.assertEqual(
                        "publisher-controlled-frame", media["rights_status"]
                    )

    def test_media_sources_match_example_provenance(self):
        by_id = {item["id"]: item for item in self.web["examples"]}
        for example_id, media in self.media["examples"].items():
            with self.subTest(example_id=example_id):
                resolved = json.loads(
                    (ROOT / by_id[example_id]["resolve_path"]).read_text(encoding="utf-8")
                )
                source_urls = {
                    source["locator"]
                    for source in resolved["sources"]
                    if source.get("locator_type") in {"url", "image", "video"}
                    and source.get("locator", "").startswith("https://")
                }
                self.assertIn(media["source_url"], source_urls)


if __name__ == "__main__":
    unittest.main()
