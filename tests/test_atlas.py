import copy
import json
import sys
import unittest
from pathlib import Path, PureWindowsPath
import warnings
import tempfile
import shutil
from unittest.mock import patch
import yaml
from jsonschema import Draft202012Validator, FormatChecker
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import atlas_core
import build_catalog
import validate_atlas
import retrieve
from atlas_core import inputs, build_view, ROOT, record_path, validate_shapes
from validate_atlas import validate
from retrieve import query,resolve,commit,lock,deep_fetch

class AtlasTests(unittest.TestCase):
    def setUp(self):self.data=inputs()
    def test_schema(self):validate(*self.data)
    def test_duplicate_id_rejected(self):
        self.data[0].append(copy.deepcopy(self.data[0][0]))
        with self.assertRaisesRegex(ValueError,'Duplicate'):validate(*self.data)
    def test_fake_gap_rejected(self):
        gap=next(r for r in self.data[0] if r.get('kind')=='GAP');gap['preview']={'renderer':'particles','url':'#example/'+gap['id'],'description':'Generic particles'}
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
        with self.assertRaisesRegex(ValueError,'schema concept_ids'):validate(*self.data)
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
        self.assertIsInstance(query('unknown:namespace'),list)
    def test_resource_path_escape_rejected(self):
        r=next(r for r in self.data[0] if r['type']=='Resource');r['artifacts'][0]['path']='../../../../index.html'
        with self.assertRaisesRegex(ValueError,'invalid artifact'):validate(*self.data)

    def test_record_paths_are_portable_and_injective(self):
        records=self.data[0]
        paths=[record_path(r['id']) for r in records]
        self.assertEqual(len(paths),len(set(paths)))
        self.assertEqual(record_path('ex:chemistry-reaction-profile'),'records/ex/chemistry-reaction-profile.json')
        for path in paths+[record_path(f'ex:{name}') for name in ['con','aux','prn','nul','com1','lpt9']]:
            self.assertNotRegex(path,r'[<>:"\\|?*]')
            # PureWindowsPath also checks Windows names when tests run on Unix.
            with warnings.catch_warnings():
                warnings.simplefilter('ignore',DeprecationWarning)
                self.assertFalse(PureWindowsPath(path).is_reserved())
        for invalid in ['../escape','ex:../escape','ex:a/b','ex:a\\b','ex:a:b','ex:CON','con:example',None,42]:
            with self.subTest(id=invalid),self.assertRaises(ValueError):record_path(invalid)
        for r in records:
            self.assertTrue((ROOT/'catalog'/record_path(r['id'])).is_file())
        for filename,key in [('web-index.json','examples'),('index.json',None)]:
            index=json.loads((ROOT/'catalog'/filename).read_text(encoding='utf-8'))
            for r in index[key] if key else index:
                self.assertEqual(r['resolve_path'],'catalog/'+record_path(r['id']))
        for line in (ROOT/'catalog/ai-index.jsonl').read_text(encoding='utf-8').splitlines():
            r=json.loads(line);self.assertEqual(r['resolve_path'],'catalog/'+record_path(r['id']))

    def test_required_core_fields_are_typed(self):
        malformed={
            'Example':{'interaction_model':[{'trigger':'inspect'}],'state_model':'static','tool_choices':['tool:d3'],
                'concept_ids':'concept:reaction-coordinate','topic_ids':[3],'intent_ids':[False],'resource_ids':{},
                'transfer_constraints':[False],'fidelity_constraints':'labels','failure_modes':[{}]},
            'Source':{'captured_at':20260910,'checked_at':True,'locator':42,'locator_type':'screenshot',
                'publisher':[],'check_scope':{},'url':'https://example.org'},
            'Resource':{'artifacts':[{'path':42,'kind':'code','purpose':'reuse'}],'package_path':[],
                'mechanism':'curve','rights':False},
            'SubjectTopic':{'parent':7,'example_ids':['tool:d3'],'prerequisites':'topic:chemistry','scope':[]},
            'Concept':{'subtypes':'mechanism','summary':False,'tool_ids':[42]},
            'Tool':{'capabilities':[42],'use_when':False,'avoid_when':[]},
            'Intent':{'title':42},'Collection':{'canonical_path':False}}
        for kind,fields in malformed.items():
            original=next(r for r in self.data[0] if r['type']==kind)
            for field,value in fields.items():
                with self.subTest(kind=kind,field=field):
                    r=copy.deepcopy(original);r[field]=value
                    with self.assertRaisesRegex(ValueError,'schema'):validate_shapes([r])
        # Nested structures and date formats must fail, not merely their outer container.
        r=copy.deepcopy(next(r for r in self.data[0] if r['type']=='Example'))
        for field,value in [
            ('interaction_model',{'trigger':False,'response':'diagram'}),
            ('state_model',{'model':'curve','deterministic':'yes'}),
            ('state_model',{'model':'curve','deterministic':True,'parameters':{'x':{'min':'zero','max':1,'initial':0}}}),
            ('tool_choices',[{'id':'tool:d3','evidence':'observed','reason':[]}]),
            ('tool_choices',[{'id':'tool:d3','reason':'curve'}]),
            ('tool_choices',[{'id':'tool:d3','evidence':'guessed','reason':'curve'}])]:
            changed=copy.deepcopy(r);changed[field]=value
            with self.subTest(field=field,value=value),self.assertRaisesRegex(ValueError,'schema'):validate_shapes([changed])
        source=copy.deepcopy(next(r for r in self.data[0] if r['type']=='Source'))
        for field,value in [('captured_at',None),('captured_at','2026-02-30'),('checked_at','yesterday')]:
            changed=copy.deepcopy(source);changed[field]=value
            with self.subTest(field=field,value=value),self.assertRaisesRegex(ValueError,'schema'):validate_shapes([changed])
        source['checked_at']=None;source['locator_type']='user-upload';source['locator']='uploaded figure.png'
        validate_shapes([source])

    def test_schema_preflight_precedes_semantics_and_generation(self):
        self.data[0][0]['id']=['unhashable']
        with self.assertRaisesRegex(ValueError,'schema'):validate(*self.data)
        with tempfile.TemporaryDirectory() as tmp,patch.object(build_catalog,'inputs',return_value=self.data):
            with self.assertRaisesRegex(ValueError,'schema'):build_catalog.build(Path(tmp)/'catalog')
            self.assertFalse((Path(tmp)/'catalog').exists())

    def test_core_resource_shapes_match_manifest_contract(self):
        core=json.loads((ROOT/'schemas/core.schema.json').read_text(encoding='utf-8'))
        manifest=json.loads((ROOT/'schemas/resource.schema.json').read_text(encoding='utf-8'))
        resource=next(c['then']['properties'] for c in core['allOf'] if c['if']['properties']['type']['const']=='Resource')
        for field in ['artifacts','mechanism','rights','fidelity']:
            self.assertEqual(resource[field],manifest['properties'][field])

    def test_legacy_source_locators_survive_real_package_migration(self):
        manifest_schema=json.loads((ROOT/'schemas/resource.schema.json').read_text(encoding='utf-8'))
        validator=Draft202012Validator(manifest_schema,format_checker=FormatChecker())
        original=ROOT/'resources/chemistry/reaction-profile'
        locators={'url':'https://example.org/reference','file':'uploads/反应 profile.pdf',
            'image':r'C:\\captures\\reaction screenshot.png','video':'lesson.mp4',
            'repository':'../local-checkout','paper':'doi:10.1000/example',
            'prompt':'Draw ΔH with labels.','other':'Whiteboard session, page 3'}
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            for folder in ['knowledge','subjects','resources','registries','schemas','scripts','app']:
                shutil.copytree(ROOT/folder,root/folder,ignore=shutil.ignore_patterns('__pycache__'))
            for kind,locator in locators.items():
                package=root/'resources/fixtures'/kind
                shutil.copytree(original,package)
                manifest=yaml.safe_load((package/'resource.yaml').read_text(encoding='utf-8'))
                manifest.pop('source_refs');manifest['id']='fixture-'+kind
                manifest['source']={'type':kind,'locator':locator,'captured_at':'2026-09-10',
                    'title':'User supplied '+kind,'author':'Example author','notes':'Original provenance notes'}
                validator.validate(manifest)
                (package/'resource.yaml').write_text(yaml.safe_dump(manifest,allow_unicode=True),encoding='utf-8')
            with patch.object(atlas_core,'ROOT',root),patch.object(validate_atlas,'ROOT',root),patch.object(build_catalog,'ROOT',root),patch.object(retrieve,'ROOT',root),patch.object(retrieve,'CAT',root/'catalog'):
                data=inputs();validate(*data)
                build_catalog.build(root/'catalog')
                build_catalog.build(root/'catalog',check=True)
                for kind,locator in locators.items():
                    resolved=resolve('resource:fixture-'+kind)
                    source=resolved['sources'][0]
                    self.assertEqual(source['locator_type'],kind)
                    self.assertEqual(source['locator'],locator)
                    self.assertEqual(source['author'],'Example author')
                    self.assertEqual(source['notes'],'Original provenance notes')
                    self.assertEqual(source['captured_at'],'2026-09-10')
                    self.assertIsNone(source['checked_at'])
                    self.assertNotIn('url',source)
                    self.assertNotIn('source',resolved['record'])
                    self.assertEqual(resolve(source['id'])['record'],source)

if __name__=='__main__':unittest.main()
