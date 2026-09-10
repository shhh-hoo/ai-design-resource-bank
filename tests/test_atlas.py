import copy
import json
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from atlas_core import inputs, build_view, ROOT
from validate_atlas import validate
from retrieve import query,resolve,commit,lock,deep_fetch

class AtlasTests(unittest.TestCase):
    def setUp(self):self.data=inputs()
    def test_schema(self):validate(*self.data)
    def test_duplicate_id_rejected(self):
        self.data[0].append(copy.deepcopy(self.data[0][0]))
        with self.assertRaisesRegex(ValueError,'Duplicate'):validate(*self.data)
    def test_fake_gap_rejected(self):
        gap=next(r for r in self.data[0] if r.get('kind')=='GAP');gap['preview']={'renderer':'particles'}
        with self.assertRaisesRegex(ValueError,'GAP cannot'):validate(*self.data)
    def test_dangling_source_rejected(self):
        self.data[0][0]['source_refs']=['source:missing']
        with self.assertRaisesRegex(ValueError,'invalid Source'):validate(*self.data)
    def test_invalid_crosswalk_rejected(self):
        self.data[3][0]['relation']='similar'
        with self.assertRaisesRegex(ValueError,'crosswalk relation'):validate(*self.data)
    def test_topic_cycle_rejected(self):
        topic=next(r for r in self.data[0] if r['type']=='SubjectTopic' and r['parent']);topic['parent']=topic['id']
        with self.assertRaisesRegex(ValueError,'cycle'):validate(*self.data)
    def test_wrong_relation_target_rejected(self):
        example=next(r for r in self.data[0] if r['type']=='Example');example['concept_ids']=['tool:d3']
        with self.assertRaisesRegex(ValueError,'Invalid typed relation'):validate(*self.data)
    def test_query_resolve_build_fetch(self):
        candidates=query('reaction profile','Example')
        self.assertEqual(candidates[0]['id'],'ex:chemistry-reaction-profile')
        r=resolve(candidates[0]['id']);self.assertEqual(r['ai_build']['method']['mechanisms'][0]['id'],'concept:reaction-coordinate')
        self.assertEqual(r['ai_build']['tools'][0]['record']['id'],'tool:native-svg')
        self.assertEqual(r['ai_build']['resources'][0]['id'],'resource:reaction-profile')
        s={'selector':'mixed','selections':[{'id':r['record']['id'],'aspect_notes':'Borrow the linked marker; preserve labels.','constraints':['Coordinate is not time.']}]}
        result=deep_fetch(lock(commit(s)))
        self.assertEqual(result['contexts'][0]['selection'],s['selections'][0])
        self.assertIn('artifacts/profile.js',result['contexts'][0]['packages'][0]['files'])
    def test_deep_fetch_rejects_uncommitted_input(self):
        with self.assertRaises(ValueError):deep_fetch({'locked_ids':['ex:chemistry-reaction-profile']})
    def test_mutations_rejected(self):
        c=commit({'selector':'agent','selections':[{'id':'ex:chemistry-reaction-profile','aspect_notes':'Keep ΔH.'}]})
        for field,value in [('catalog_fingerprint','stale'),('commit_digest','forged')]:
            changed=copy.deepcopy(c);changed[field]=value
            with self.assertRaises(ValueError):lock(changed)
        l=lock(c);l['locked_ids']=['ex:chemistry-hess-cycle']
        with self.assertRaises(ValueError):deep_fetch(l)
        l=lock(c);l['committed']['selection']['selections'][0]['aspect_notes']='Replace reference'
        with self.assertRaises(ValueError):deep_fetch(l)
    def test_gap_and_alias_cannot_be_committed(self):
        for id in ['ex:chemistry-born-haber','reaction-coordinate']:
            with self.assertRaises(ValueError):commit({'selector':'agent','selections':[{'id':id}]})
    def test_aliases_and_every_stable_id_resolve(self):
        self.assertEqual(resolve('reaction-coordinate')['record']['id'],'concept:reaction-coordinate')
        for r in self.data[0]:self.assertEqual(resolve(r['id'])['record']['id'],r['id'])
        for alias,id in self.data[1].items():self.assertEqual(resolve(alias)['record']['id'],id)
    def test_duplicate_selection_rejected(self):
        item={'id':'ex:chemistry-reaction-profile'}
        with self.assertRaisesRegex(ValueError,'Duplicate selection'):commit({'selector':'human','selections':[item,item]})
    def test_fts_safe_and_known_id(self):
        self.assertEqual(query('ex:chemistry-reaction-profile')[0]['id'],'ex:chemistry-reaction-profile')
        self.assertIsInstance(query('" OR * NEAR()'),list)
        self.assertEqual(query(''),[])
    def test_resource_path_escape_rejected(self):
        r=next(r for r in self.data[0] if r['type']=='Resource');r['artifacts'][0]['path']='../../../../index.html'
        with self.assertRaisesRegex(ValueError,'invalid artifact'):validate(*self.data)

if __name__=='__main__':unittest.main()
