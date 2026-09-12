import hashlib, json, sqlite3, unittest
from pathlib import Path
from scripts.validate_relational_model import validate, schema_sql

ROOT=Path(__file__).resolve().parents[1]

def h(s): return hashlib.sha256(s.encode()).hexdigest()

class Base(unittest.TestCase):
    def setUp(self):
        self.db=sqlite3.connect(':memory:')
        self.db.executescript(schema_sql(ROOT))
        self.put('sources',id='source:manual',title='Manual record',publisher='fixture',locator_type='other',locator='manual-record',captured_at='2026-09-13',check_scope='structural fixture')
        self.put('sources',id='source:web',title='Web source',publisher='example.invalid',locator_type='url',locator='https://example.invalid',captured_at='2026-09-13',check_scope='structural fixture')
        for i,k,status in [('evidence:obs','observation','unreviewed'),('evidence:test','test','unreviewed'),('evidence:reason','reasoning','accepted'),('evidence:unreviewed','observation','unreviewed')]:
            self.put('evidence_sets',id=i,basis_kind=k,summary=i,producer='test',review_status=status,canonical_locator=f'evidence/{i}')
        self.put('evidence_set_sources',evidence_set_id='evidence:obs',source_id='source:web',locator='section-1',stance='supports')
        self.put('evidence_set_sources',evidence_set_id='evidence:test',source_id='source:manual',locator='test-log',stance='supports')
        self.db.execute("UPDATE evidence_sets SET review_status='accepted' WHERE id IN ('evidence:obs','evidence:test')")
    def tearDown(self): self.db.close()
    def put(self,t,**kw):
        self.db.execute(f"INSERT INTO {t} ({','.join(kw)}) VALUES ({','.join('?' for _ in kw)})",tuple(kw.values()))
    def entity(self,eid,typ,**extra):
        self.put('entities',id=eid,entity_type=typ,slug=eid.split(':')[-1],name=eid,canonical_locator=f'knowledge/{eid}',record_hash=h(eid),created_at='2026-09-13',updated_at='2026-09-13')
        table={'concept':'concepts','example':'examples','tool':'tools','resource':'resources'}[typ]
        defaults={'concept':dict(definition=eid,kinds_json='["technique"]'), 'example':dict(example_kind='REFERENCE',origin_kind='real_reference'), 'tool':dict(tool_subtype='library'), 'resource':dict(resource_type='code',package_path=f'resources/{eid.split(":")[-1]}')}
        defaults[typ].update(extra); self.put(table,entity_id=eid,**defaults[typ])
    def named(self,t,id,**extra):
        self.put(t,id=id,slug=id.split(':')[-1],name=id,canonical_locator=f'{t}/{id}',**extra)

class GoodCases(Base):
    def test_A_pure_creative_unknown_tool(self):
        self.entity('ex:curtain','example',medium='stage-video')
        self.entity('concept:occlusion','concept',definition='Occlusion reveal',kinds_json='["effect","representation_method"]')
        self.named('creative_domains','domain:stage')
        self.put('entity_domains',entity_id='ex:curtain',creative_domain_id='domain:stage',is_primary=1,evidence_set_id='evidence:obs')
        self.put('entity_relations',from_entity_id='ex:curtain',to_entity_id='concept:occlusion',predicate='demonstrates',evidence_set_id='evidence:obs')
        self.assertEqual([], validate(self.db))
        self.assertEqual(0,self.db.execute("SELECT count(*) FROM entity_relations WHERE predicate='built_with'").fetchone()[0])

    def test_B_editorial_prompt_resource_without_implementation_chain(self):
        self.entity('concept:editorial','concept',definition='Editorial density',kinds_json='["style","composition"]')
        self.entity('resource:prompt','resource',resource_type='prompt',package_path='resources/editorial-prompt')
        self.put('entity_relations',from_entity_id='resource:prompt',to_entity_id='concept:editorial',predicate='implements',evidence_set_id='evidence:obs')
        self.assertEqual([], validate(self.db))
        self.assertEqual(0,self.db.execute('SELECT count(*) FROM tool_capabilities').fetchone()[0])

    def test_C_diffusion_cross_subject(self):
        for s in ['topic:chem','topic:bio','topic:physics']:
            self.named('subjects',s)
        self.named('knowledge_points','topic:diffusion')
        self.put('knowledge_point_subjects',knowledge_point_id='topic:diffusion',subject_id='topic:chem',is_primary=1,evidence_set_id='evidence:obs')
        self.put('knowledge_point_subjects',knowledge_point_id='topic:diffusion',subject_id='topic:bio',evidence_set_id='evidence:obs')
        self.put('knowledge_point_subjects',knowledge_point_id='topic:diffusion',subject_id='topic:physics',evidence_set_id='evidence:obs')
        self.assertEqual([], validate(self.db))
        self.assertEqual(3,self.db.execute("SELECT count(*) FROM knowledge_point_subjects WHERE knowledge_point_id='topic:diffusion'").fetchone()[0])

    def test_D_multi_parent_knowledge_graph(self):
        for k in ['topic:sn2','topic:nuc-sub','topic:mechanism']:
            self.named('knowledge_points',k)
        self.put('knowledge_point_relations',from_knowledge_point_id='topic:sn2',to_knowledge_point_id='topic:nuc-sub',predicate='is_a',scope_key='global',is_navigation_parent=1,evidence_set_id='evidence:obs')
        self.put('knowledge_point_relations',from_knowledge_point_id='topic:sn2',to_knowledge_point_id='topic:mechanism',predicate='part_of',scope_key='global',evidence_set_id='evidence:obs')
        self.assertEqual([], validate(self.db))

    def test_E_representation_concept_shared_across_subjects(self):
        for s in ['topic:chem','topic:physics']:
            self.named('subjects',s)
        for k in ['topic:sn2','topic:collision']:
            self.named('knowledge_points',k)
        self.entity('concept:particle-animation','concept',definition='Particle animation',kinds_json='["representation_method","motion"]')
        for kp,purpose in [('topic:sn2','show collision geometry'),('topic:collision','show collision geometry')]:
            self.put('knowledge_point_representations',knowledge_point_id=kp,concept_id='concept:particle-animation',context_key='geometry',context_json=json.dumps({'purpose':purpose}),verdict='conditional',rationale='Useful when spatial relation matters',curator='tester',evidence_set_id='evidence:reason')
        self.assertEqual([], validate(self.db))
        self.assertEqual(1,self.db.execute('SELECT count(DISTINCT concept_id) FROM knowledge_point_representations').fetchone()[0])

    def test_F_primitive_many_capabilities(self):
        self.entity('tool:three','tool',tool_subtype='library')
        self.put('tool_primitives',id='primitive:raycaster',tool_entity_id='tool:three',slug='raycaster',name='Raycaster',primitive_type='class',module_path='three',version_scope='r180',canonical_locator='tools/three/raycaster')
        for cap in ['capability:picking','capability:intersection']:
            self.named('tool_capabilities',cap)
            self.put('primitive_capabilities',tool_primitive_id='primitive:raycaster',capability_id=cap,scope_key='r180',evidence_set_id='evidence:obs')
        self.assertEqual([], validate(self.db))

    def test_G_actual_tool_fact_and_recommendation_coexist(self):
        self.entity('ex:actual','example')
        self.entity('concept:effect','concept',definition='Effect',kinds_json='["effect"]')
        self.entity('tool:three','tool',tool_subtype='library')
        self.put('entity_relations',from_entity_id='ex:actual',to_entity_id='tool:three',predicate='built_with',evidence_set_id='evidence:obs')
        self.put('entity_recommendations',from_entity_id='concept:effect',to_entity_id='tool:three',predicate='can_implement_with',context_key='web',context_json='{"purpose":"web implementation"}',verdict='suitable',rationale='A possible route',curator='tester',evidence_set_id='evidence:reason',review_status='accepted')
        self.assertEqual([], validate(self.db))
        self.assertEqual(1,self.db.execute('SELECT count(*) FROM fact_entity_relations').fetchone()[0])

class AdversarialGaps(Base):
    # These assertions describe desired RC behavior. Failures expose current gaps.
    def test_01_blank_locator_should_not_publish_fact(self):
        self.db.execute("DELETE FROM evidence_set_sources WHERE evidence_set_id='evidence:obs'")
        with self.assertRaises(sqlite3.IntegrityError):
            self.put('evidence_set_sources',evidence_set_id='evidence:obs',source_id='source:web',locator='',stance='supports')
        self.entity('ex:x','example'); self.entity('concept:x','concept')
        self.put('entity_relations',from_entity_id='ex:x',to_entity_id='concept:x',predicate='demonstrates',evidence_set_id='evidence:obs')
        errors=validate(self.db)
        published=self.db.execute('SELECT count(*) FROM fact_entity_relations').fetchone()[0]
        self.assertEqual(0,published)

    def test_02_accepted_evidence_mutation_should_invalidate_review(self):
        self.put('evidence_set_sources',evidence_set_id='evidence:obs',source_id='source:web',locator='section-2',stance='contradicts')
        status=self.db.execute("SELECT review_status FROM evidence_sets WHERE id='evidence:obs'").fetchone()[0]
        self.assertNotEqual('accepted', status, 'accepted evidence set remained accepted after mutation')

    def test_03_accepted_recommendation_edit_should_reset_review(self):
        self.entity('concept:x','concept'); self.entity('tool:x','tool')
        self.put('entity_recommendations',from_entity_id='concept:x',to_entity_id='tool:x',predicate='can_implement_with',context_key='web',context_json='{"purpose":"p1"}',verdict='suitable',rationale='r1',curator='tester',review_status='accepted')
        self.db.execute("UPDATE entity_recommendations SET verdict='avoid', rationale='changed' WHERE from_entity_id='concept:x'")
        status=self.db.execute("SELECT review_status FROM entity_recommendations WHERE from_entity_id='concept:x'").fetchone()[0]
        self.assertNotEqual('accepted', status, 'accepted recommendation stayed accepted after substantive edit')

    def test_04_accepted_representation_edit_should_reset_review(self):
        self.named('knowledge_points','topic:x'); self.entity('concept:repr','concept',definition='r',kinds_json='["representation_method"]')
        self.put('knowledge_point_representations',knowledge_point_id='topic:x',concept_id='concept:repr',context_key='c',context_json='{"purpose":"p1"}',verdict='suitable',rationale='r1',curator='tester',review_status='accepted')
        self.db.execute("UPDATE knowledge_point_representations SET verdict='avoid', rationale='changed' WHERE knowledge_point_id='topic:x'")
        status=self.db.execute("SELECT review_status FROM knowledge_point_representations WHERE knowledge_point_id='topic:x'").fetchone()[0]
        self.assertNotEqual('accepted', status, 'accepted representation stayed accepted after substantive edit')

    def test_05_entity_intent_requires_purpose_and_nonblank_rationale(self):
        self.entity('ex:x','example')
        self.named('intents','intent:dramatic')
        with self.assertRaises(sqlite3.IntegrityError):
            self.put('entity_intents',entity_id='ex:x',intent_id='intent:dramatic',context_key='x',context_json='{}',polarity='use_when',rationale='',curator='tester',review_status='accepted')
        self.put('entity_intents',entity_id='ex:x',intent_id='intent:dramatic',context_key='x',context_json='{}',polarity='use_when',rationale='nonblank',curator='tester',review_status='accepted')
        errors=validate(self.db)
        self.assertTrue(any('entity_intents' in e or 'purpose' in e for e in errors), f'missing purpose passed: {errors}')

    def test_06_native_support_cannot_name_external_provider(self):
        self.entity('tool:a','tool'); self.entity('tool:b','tool')
        self.named('tool_capabilities','capability:x')
        with self.assertRaises(sqlite3.IntegrityError):
            self.put('tool_capability_support',tool_entity_id='tool:a',capability_id='capability:x',scope_key='v1',mode='native',provider_tool_entity_id='tool:b',evidence_set_id='evidence:obs')

    def test_07_factual_tables_need_guarded_publish_views(self):
        views={r[0] for r in self.db.execute("SELECT name FROM sqlite_master WHERE type='view'")}
        required={'fact_entity_relations','fact_entity_domains','fact_knowledge_point_subjects','fact_entity_subjects','fact_entity_knowledge_points','fact_knowledge_point_relations','fact_tool_capability_support','fact_primitive_capabilities','fact_entity_tool_primitives'}
        self.assertTrue(required <= views, f'missing guarded fact views: {sorted(required-views)}')

    def test_08_accepted_intent_edit_should_reset_review(self):
        self.entity('ex:x','example'); self.named('intents','intent:x')
        self.put('entity_intents',entity_id='ex:x',intent_id='intent:x',context_key='web',context_json='{"purpose":"p1"}',polarity='use_when',rationale='r1',curator='tester',review_status='accepted')
        self.db.execute("UPDATE entity_intents SET polarity='avoid_when', rationale='changed' WHERE entity_id='ex:x'")
        status=self.db.execute("SELECT review_status FROM entity_intents WHERE entity_id='ex:x'").fetchone()[0]
        self.assertNotEqual('accepted', status, 'accepted intent stayed accepted after substantive edit')

    def test_09_validator_should_detect_record_hash_staleness_after_content_edit(self):
        self.entity('concept:x','concept',definition='old',kinds_json='["effect"]')
        self.db.execute("UPDATE concepts SET definition='new' WHERE entity_id='concept:x'")
        errors=validate(self.db)
        self.assertTrue(any('hash' in e and 'stale' in e for e in errors), f'content changed without stale hash detection: {errors}')

    def test_10_hot_path_reverse_indexes_exist(self):
        indexes={r[0] for r in self.db.execute("SELECT name FROM sqlite_master WHERE type='index'")}
        for name in ('entity_intents_reverse','entity_subjects_reverse','entity_recommendations_reverse'):
            self.assertIn(name,indexes)

    def test_11_hot_path_queries_use_reverse_indexes(self):
        queries={
            'entity_intents_reverse': "SELECT entity_id FROM entity_intents WHERE intent_id='intent:x'",
            'entity_subjects_reverse': "SELECT entity_id FROM entity_subjects WHERE subject_id='topic:subject-x'",
            'entity_recommendations_reverse': "SELECT from_entity_id FROM entity_recommendations WHERE to_entity_id='tool:x' AND predicate='can_implement_with'",
        }
        for index_name,sql in queries.items():
            plan=' '.join(str(row) for row in self.db.execute('EXPLAIN QUERY PLAN '+sql))
            self.assertIn(index_name,plan,plan)

if __name__=='__main__': unittest.main(verbosity=2)
