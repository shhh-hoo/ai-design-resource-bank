import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from atlas_core import inputs, ROOT
from validate_atlas import validate

PRESERVED={'camera-dolly','orbital-overlap','depth-parallax','split-text-reveal','particle-attractor','noise-threshold-wipe','explode-assemble','scroll-scrub','stage-spotlight','bond-morph','graph-relayout','canvas-focus-lens','anchored-callout'}
class PreservationTests(unittest.TestCase):
    def test_pre_atlas_interactive_examples_remain_first_class(self):
        data=inputs();validate(*data);records={r['id']:r for r in data[0]};workbench=(ROOT/'web/mechanism-workbench.js').read_text(encoding='utf-8')
        for slug in PRESERVED:
            example=records[f'ex:{slug}-interactive-study'];self.assertEqual(example['kind'],'LIVE');self.assertTrue(example['lifecycle']['showable']);self.assertNotIn('subject_id',example);self.assertNotIn('topic_ids',example);self.assertEqual(example['concept_ids'],[f'concept:{slug}']);self.assertEqual(example['demo_url'],f'legacy.html#mechanism:{slug}');self.assertIn(f'"{slug}"',workbench)
        self.assertEqual(sum(r.get('collection_ids')==['collection:interactive-mechanism-studies'] for r in records.values()),13)
if __name__=='__main__':unittest.main()
