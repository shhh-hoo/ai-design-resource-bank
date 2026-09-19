"""Synthetic structural fixtures; NOT real bank content or science/UX evidence."""
import hashlib,json,sqlite3,unittest
from pathlib import Path
from scripts.validate_relational_model import validate, schema_sql
ROOT=Path(__file__).resolve().parents[1]

class ModelTests(unittest.TestCase):
    def setUp(self):
        self.db=sqlite3.connect(':memory:')
        self.db.executescript(schema_sql(ROOT))
        self.put('sources',id='source:fixture',title='SYNTHETIC STRUCTURAL TEST ONLY',publisher='fixture',locator_type='other',locator='synthetic-fixture',captured_at='2026-09-13',check_scope='structural fixture')
        for i,k in [('evidence:observed','observation'),('evidence:reasoning','reasoning'),('evidence:test','test')]:
            self.put('evidence_sets',id=i,basis_kind=k,summary='Synthetic evidence stub; not a real observation.',producer='fixture',review_status='unreviewed' if k!='reasoning' else 'accepted',canonical_locator=i)
            if k!='reasoning':self.put('evidence_set_sources',evidence_set_id=i,source_id='source:fixture',locator='fixture-only',stance='supports')
            if k!='reasoning':self.db.execute('UPDATE evidence_sets SET review_status=\'accepted\' WHERE id=?',(i,))
    def tearDown(self):self.db.close()
    def put(self,t,**kw):
        self.db.execute(f"INSERT INTO {t} ({','.join(kw)}) VALUES ({','.join('?' for _ in kw)})",tuple(kw.values()))
    def entity(self,eid,typ,**extra):
        self.put('entities',id=eid,entity_type=typ,slug=eid.split(':')[-1],name=eid,canonical_locator=eid,record_hash=hashlib.sha256(eid.encode()).hexdigest(),created_at='fixture',updated_at='fixture')
        if typ=='example': extra={'example_kind':'REFERENCE','origin_kind':'real_reference',**extra}
        if typ=='tool': extra={'tool_subtype':'library',**extra}
        self.put(dict(concept='concepts',example='examples',resource='resources',tool='tools')[typ],entity_id=eid,**extra)
    def named(self,t,id,**extra):self.put(t,id=id,slug=id.split(':')[-1],name=id,canonical_locator=id,**extra)
    def kp(self):
        self.named('subjects','topic:chemistry')
        self.named('subjects','topic:organic-chemistry',parent_id='topic:chemistry')
        self.named('knowledge_points','topic:sn2')
        self.put('knowledge_point_subjects',knowledge_point_id='topic:sn2',subject_id='topic:organic-chemistry',is_primary=1,evidence_set_id='evidence:observed')
    def test_01_tables_and_integrity(self):
        self.assertEqual(31,self.db.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchone()[0]);self.assertEqual([],validate(self.db))
    def test_02_creative_reference_without_academic_or_resource(self):
        self.entity('ex:curtain','example',origin_kind='real_reference')
        self.entity('concept:reveal','concept',definition='Synthetic definition',kinds_json='["effect"]')
        self.put('entity_relations',from_entity_id='ex:curtain',to_entity_id='concept:reveal',predicate='demonstrates',evidence_set_id='evidence:observed')
        self.assertEqual([],validate(self.db));self.assertEqual(1,self.db.execute('SELECT count(*) FROM fact_entity_relations').fetchone()[0])
    def test_03_subject_ancestry(self):
        self.kp()
        rows=self.db.execute("WITH RECURSIVE ancestry(id) AS (SELECT subject_id FROM knowledge_point_subjects WHERE knowledge_point_id='topic:sn2' UNION SELECT s.parent_id FROM subjects s JOIN ancestry a ON s.id=a.id WHERE s.parent_id IS NOT NULL) SELECT id FROM ancestry ORDER BY id").fetchall()
        self.assertEqual([('topic:chemistry',),('topic:organic-chemistry',)],rows)
    def test_04_shared_representation_identity(self):
        self.kp();self.named('knowledge_points','topic:another-topic')
        self.entity('concept:sequence','concept',definition='Synthetic method',kinds_json='["representation_method","technique"]')
        for kp in ('topic:sn2','topic:another-topic'):
            self.put('knowledge_point_representations',knowledge_point_id=kp,concept_id='concept:sequence',context_key='step-order',context_json='{"purpose":"show step order"}',verdict='conditional',rationale='Synthetic proposal',curator='fixture',evidence_set_id='evidence:reasoning')
        self.assertEqual(1,self.db.execute('SELECT count(DISTINCT concept_id) FROM knowledge_point_representations').fetchone()[0]);self.assertEqual([],validate(self.db))
    def test_05_primitive_many_capabilities(self):
        self.entity('tool:renderer','tool',tool_subtype='library')
        self.put('tool_primitives',id='primitive:picker',tool_entity_id='tool:renderer',slug='picker',name='Picker',primitive_type='class',canonical_locator='primitive:picker')
        for cap in ('capability:picking','capability:intersection'):
            self.named('tool_capabilities',cap)
            self.put('primitive_capabilities',tool_primitive_id='primitive:picker',capability_id=cap,scope_key='fixture',evidence_set_id='evidence:observed')
        self.assertEqual(2,self.db.execute('SELECT count(*) FROM primitive_capabilities').fetchone()[0]);self.assertEqual([],validate(self.db))
    def test_06_illegal_endpoint_insert_and_update(self):
        self.entity('tool:x','tool',tool_subtype='library');self.entity('concept:x','concept',definition='x',kinds_json='["effect"]')
        with self.assertRaises(sqlite3.IntegrityError):self.put('entity_relations',from_entity_id='tool:x',to_entity_id='concept:x',predicate='demonstrates',evidence_set_id='evidence:observed')
        self.entity('ex:x','example',origin_kind='authored_study')
        self.put('entity_relations',from_entity_id='ex:x',to_entity_id='concept:x',predicate='demonstrates',evidence_set_id='evidence:observed')
        with self.assertRaises(sqlite3.IntegrityError):self.db.execute("UPDATE entity_relations SET from_entity_id='tool:x'")
    def test_07_inverse_not_double_stored(self):
        self.entity('concept:x','concept',definition='x',kinds_json='["effect"]');self.entity('ex:x','example',origin_kind='real_reference')
        with self.assertRaises(sqlite3.IntegrityError):self.put('entity_relations',from_entity_id='concept:x',to_entity_id='ex:x',predicate='seen_as',evidence_set_id='evidence:observed')
    def test_08_orphan_foreign_key(self):
        with self.assertRaises(sqlite3.IntegrityError):self.put('knowledge_point_subjects',knowledge_point_id='missing',subject_id='missing',evidence_set_id='evidence:observed')
    def test_09_wrong_subtype_and_missing_subtype(self):
        self.entity('tool:x','tool',tool_subtype='library')
        with self.assertRaises(sqlite3.IntegrityError):self.put('concepts',entity_id='tool:x',definition='bad')
        self.put('entities',id='concept:orphan',entity_type='concept',slug='orphan',name='orphan',canonical_locator='orphan',record_hash='0'*64,created_at='fixture',updated_at='fixture')
        self.assertTrue(any('subtype' in e for e in validate(self.db)))
    def test_10_recommendation_not_fact(self):
        self.entity('concept:x','concept',definition='x',kinds_json='["effect"]');self.entity('tool:x','tool',tool_subtype='library')
        self.put('entity_recommendations',from_entity_id='concept:x',to_entity_id='tool:x',predicate='can_implement_with',context_key='web',context_json='{"purpose":"web effect"}',verdict='conditional',rationale='Only a proposal',curator='fixture',review_status='accepted',evidence_set_id='evidence:reasoning')
        self.assertEqual(0,self.db.execute('SELECT count(*) FROM fact_entity_relations').fetchone()[0]);self.assertEqual([],validate(self.db))
    def test_11_nonmethod_rejected(self):
        self.kp();self.entity('concept:style','concept',definition='style',kinds_json='["style"]')
        with self.assertRaises(sqlite3.IntegrityError):self.put('knowledge_point_representations',knowledge_point_id='topic:sn2',concept_id='concept:style',context_key='x',context_json='{"purpose":"x"}',verdict='suitable',rationale='x',curator='fixture')
    def test_12_graph_cycles_rejected_by_build_validator(self):
        for x in ('topic:a','topic:b'):self.named('knowledge_points',x)
        for a,b in [('topic:a','topic:b'),('topic:b','topic:a')]:self.put('knowledge_point_relations',from_knowledge_point_id=a,to_knowledge_point_id=b,predicate='is_a',evidence_set_id='evidence:observed')
        self.assertTrue(any('cycle' in e for e in validate(self.db)))
    def test_13_prerequisite_requires_scope(self):
        for x in ('topic:a','topic:b'):self.named('knowledge_points',x)
        with self.assertRaises(sqlite3.IntegrityError):self.put('knowledge_point_relations',from_knowledge_point_id='topic:a',to_knowledge_point_id='topic:b',predicate='prerequisite_for',evidence_set_id='evidence:reasoning')
    def test_14_missing_evidence_locator_is_not_publishable(self):
        self.entity('ex:x','example',origin_kind='real_reference');self.entity('concept:x','concept',definition='x',kinds_json='["effect"]')
        self.put('entity_relations',from_entity_id='ex:x',to_entity_id='concept:x',predicate='demonstrates',evidence_set_id='evidence:observed')
        self.assertEqual(1,self.db.execute('SELECT count(*) FROM fact_entity_relations').fetchone()[0])
        self.db.execute("DELETE FROM evidence_set_sources WHERE evidence_set_id='evidence:observed'")
        self.assertEqual('unreviewed',self.db.execute("SELECT review_status FROM evidence_sets WHERE id='evidence:observed'").fetchone()[0])
        self.assertEqual(0,self.db.execute('SELECT count(*) FROM fact_entity_relations').fetchone()[0])
    def test_15_stale_resource_validation(self):
        self.entity('resource:x','resource',resource_type='code',package_path='resources/x',validation_status='passed',validated_hash='f'*64,validation_evidence_set_id='evidence:test')
        self.assertTrue(any('stale resource' in e for e in validate(self.db)))
    def test_16_reference_and_resource_share_artifact(self):
        self.entity('resource:x','resource',resource_type='asset',package_path='resources/x')
        self.put('artifacts',id='artifact:x',owner_entity_id='resource:x',artifact_type='image',mime_type='image/svg+xml',path='resources/x/preview.svg',origin_kind='authored',role='preview')
        self.entity('ex:x','example',origin_kind='authored_study',preview_artifact_id='artifact:x')
        self.assertEqual(1,self.db.execute('SELECT count(*) FROM artifacts').fetchone()[0]);self.assertEqual([],validate(self.db))
    def test_17_no_unconditional_scientific_suitability(self):
        self.kp();self.entity('concept:x','concept',definition='x',kinds_json='["representation_method"]')
        self.put('knowledge_point_representations',knowledge_point_id='topic:sn2',concept_id='concept:x',context_key='missing',verdict='suitable',rationale='x',curator='fixture')
        self.assertTrue(any('purpose' in e for e in validate(self.db)))
    def test_19_current_canonical_id_namespaces_are_preserved(self):
        self.entity('ex:reference','example')
        self.entity('concept:method','concept',definition=None,kinds_json='["mechanism","representation_method"]')
        self.entity('tool:renderer','tool')
        self.entity('resource:package','resource',resource_type=None,package_path='resources/package')
        self.assertEqual([], validate(self.db))

    def test_20_projection_does_not_force_new_origin_metadata(self):
        self.put('entities',id='ex:legacy-shape',entity_type='example',slug='legacy-shape',name='Legacy shape',canonical_locator='knowledge/examples/legacy-shape.json',record_hash='0'*64,created_at='fixture',updated_at='fixture')
        self.put('examples',entity_id='ex:legacy-shape',example_kind='LIVE')
        self.assertEqual([], validate(self.db))

    def test_18_reasoning_not_implementation_fact(self):
        self.entity('ex:x','example',origin_kind='real_reference');self.entity('tool:x','tool',tool_subtype='library')
        self.put('entity_relations',from_entity_id='ex:x',to_entity_id='tool:x',predicate='built_with',evidence_set_id='evidence:reasoning')
        self.assertEqual(0,self.db.execute('SELECT count(*) FROM fact_entity_relations').fetchone()[0]);self.assertTrue(any('reasoning' in e for e in validate(self.db)))

if __name__=='__main__':unittest.main(verbosity=2)
