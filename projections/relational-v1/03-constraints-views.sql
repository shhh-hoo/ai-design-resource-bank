CREATE TRIGGER concepts_type_insert BEFORE INSERT ON concepts
WHEN NOT EXISTS (SELECT 1 FROM entities WHERE id=NEW.entity_id AND entity_type='concept')
BEGIN SELECT RAISE(ABORT,'subtype mismatch'); END;

CREATE TRIGGER concepts_type_update BEFORE UPDATE ON concepts
WHEN NOT EXISTS (SELECT 1 FROM entities WHERE id=NEW.entity_id AND entity_type='concept')
BEGIN SELECT RAISE(ABORT,'subtype mismatch'); END;

CREATE TRIGGER concepts_hash_stale_update AFTER UPDATE ON concepts
BEGIN UPDATE entities SET hash_status='stale' WHERE id=NEW.entity_id; END;

CREATE TRIGGER concepts_hash_stale_delete AFTER DELETE ON concepts
BEGIN UPDATE entities SET hash_status='stale' WHERE id=OLD.entity_id; END;

CREATE TRIGGER examples_type_insert BEFORE INSERT ON examples
WHEN NOT EXISTS (SELECT 1 FROM entities WHERE id=NEW.entity_id AND entity_type='example')
BEGIN SELECT RAISE(ABORT,'subtype mismatch'); END;

CREATE TRIGGER examples_type_update BEFORE UPDATE ON examples
WHEN NOT EXISTS (SELECT 1 FROM entities WHERE id=NEW.entity_id AND entity_type='example')
BEGIN SELECT RAISE(ABORT,'subtype mismatch'); END;

CREATE TRIGGER examples_hash_stale_update AFTER UPDATE ON examples
BEGIN UPDATE entities SET hash_status='stale' WHERE id=NEW.entity_id; END;

CREATE TRIGGER examples_hash_stale_delete AFTER DELETE ON examples
BEGIN UPDATE entities SET hash_status='stale' WHERE id=OLD.entity_id; END;

CREATE TRIGGER tools_type_insert BEFORE INSERT ON tools
WHEN NOT EXISTS (SELECT 1 FROM entities WHERE id=NEW.entity_id AND entity_type='tool')
BEGIN SELECT RAISE(ABORT,'subtype mismatch'); END;

CREATE TRIGGER tools_type_update BEFORE UPDATE ON tools
WHEN NOT EXISTS (SELECT 1 FROM entities WHERE id=NEW.entity_id AND entity_type='tool')
BEGIN SELECT RAISE(ABORT,'subtype mismatch'); END;

CREATE TRIGGER tools_hash_stale_update AFTER UPDATE ON tools
BEGIN UPDATE entities SET hash_status='stale' WHERE id=NEW.entity_id; END;

CREATE TRIGGER tools_hash_stale_delete AFTER DELETE ON tools
BEGIN UPDATE entities SET hash_status='stale' WHERE id=OLD.entity_id; END;

CREATE TRIGGER resources_type_insert BEFORE INSERT ON resources
WHEN NOT EXISTS (SELECT 1 FROM entities WHERE id=NEW.entity_id AND entity_type='resource')
BEGIN SELECT RAISE(ABORT,'subtype mismatch'); END;

CREATE TRIGGER resources_type_update BEFORE UPDATE ON resources
WHEN NOT EXISTS (SELECT 1 FROM entities WHERE id=NEW.entity_id AND entity_type='resource')
BEGIN SELECT RAISE(ABORT,'subtype mismatch'); END;

CREATE TRIGGER resources_hash_stale_update AFTER UPDATE ON resources
BEGIN UPDATE entities SET hash_status='stale' WHERE id=NEW.entity_id; END;

CREATE TRIGGER resources_hash_stale_delete AFTER DELETE ON resources
BEGIN UPDATE entities SET hash_status='stale' WHERE id=OLD.entity_id; END;

CREATE TRIGGER entity_type_immutable BEFORE UPDATE OF entity_type ON entities WHEN NEW.entity_type <> OLD.entity_type BEGIN SELECT RAISE(ABORT,'entity type is immutable'); END;

CREATE TRIGGER entities_hash_stale_update AFTER UPDATE OF slug,name,summary,aliases_json,traits_json,status,canonical_locator ON entities WHEN NEW.hash_status='current' BEGIN UPDATE entities SET hash_status='stale' WHERE id=NEW.id; END;

CREATE TRIGGER entity_relations_typing_insert BEFORE INSERT ON entity_relations
WHEN NOT EXISTS(SELECT 1 FROM entities s, entities t WHERE s.id=NEW.from_entity_id AND t.id=NEW.to_entity_id AND ((NEW.predicate='demonstrates' AND ((s.entity_type='example' AND t.entity_type='concept'))) OR (NEW.predicate='intended_to_demonstrate' AND ((s.entity_type='example' AND t.entity_type='concept'))) OR (NEW.predicate='implements' AND ((s.entity_type='resource' AND t.entity_type='concept'))) OR (NEW.predicate='built_with' AND ((s.entity_type='example' AND t.entity_type='tool') OR (s.entity_type='resource' AND t.entity_type='tool'))) OR (NEW.predicate='requires' AND ((s.entity_type='resource' AND t.entity_type='tool') OR (s.entity_type='resource' AND t.entity_type='resource'))) OR (NEW.predicate='uses' AND ((s.entity_type='example' AND t.entity_type='resource'))) OR (NEW.predicate='yields' AND ((s.entity_type='example' AND t.entity_type='resource'))) OR (NEW.predicate='derived_from' AND ((s.entity_type='example' AND t.entity_type='example') OR (s.entity_type='example' AND t.entity_type='resource') OR (s.entity_type='resource' AND t.entity_type='example') OR (s.entity_type='resource' AND t.entity_type='resource'))) OR (NEW.predicate='extracted_from' AND ((s.entity_type='resource' AND t.entity_type='example'))) OR (NEW.predicate='reimplementation_of' AND ((s.entity_type='resource' AND t.entity_type='example') OR (s.entity_type='resource' AND t.entity_type='resource'))) OR (NEW.predicate='inspired_by' AND ((s.entity_type='example' AND t.entity_type='example') OR (s.entity_type='example' AND t.entity_type='resource') OR (s.entity_type='resource' AND t.entity_type='example') OR (s.entity_type='resource' AND t.entity_type='resource'))) OR (NEW.predicate='variant_of' AND ((s.entity_type='concept' AND t.entity_type='concept'))) OR (NEW.predicate='part_of' AND ((s.entity_type='concept' AND t.entity_type='concept') OR (s.entity_type='example' AND t.entity_type='example') OR (s.entity_type='resource' AND t.entity_type='resource'))) OR (NEW.predicate='extends' AND ((s.entity_type='tool' AND t.entity_type='tool')))))
BEGIN SELECT RAISE(ABORT,'illegal relation endpoint types or predicate'); END;

CREATE TRIGGER entity_relations_typing_update BEFORE UPDATE ON entity_relations
WHEN NOT EXISTS(SELECT 1 FROM entities s, entities t WHERE s.id=NEW.from_entity_id AND t.id=NEW.to_entity_id AND ((NEW.predicate='demonstrates' AND ((s.entity_type='example' AND t.entity_type='concept'))) OR (NEW.predicate='intended_to_demonstrate' AND ((s.entity_type='example' AND t.entity_type='concept'))) OR (NEW.predicate='implements' AND ((s.entity_type='resource' AND t.entity_type='concept'))) OR (NEW.predicate='built_with' AND ((s.entity_type='example' AND t.entity_type='tool') OR (s.entity_type='resource' AND t.entity_type='tool'))) OR (NEW.predicate='requires' AND ((s.entity_type='resource' AND t.entity_type='tool') OR (s.entity_type='resource' AND t.entity_type='resource'))) OR (NEW.predicate='uses' AND ((s.entity_type='example' AND t.entity_type='resource'))) OR (NEW.predicate='yields' AND ((s.entity_type='example' AND t.entity_type='resource'))) OR (NEW.predicate='derived_from' AND ((s.entity_type='example' AND t.entity_type='example') OR (s.entity_type='example' AND t.entity_type='resource') OR (s.entity_type='resource' AND t.entity_type='example') OR (s.entity_type='resource' AND t.entity_type='resource'))) OR (NEW.predicate='extracted_from' AND ((s.entity_type='resource' AND t.entity_type='example'))) OR (NEW.predicate='reimplementation_of' AND ((s.entity_type='resource' AND t.entity_type='example') OR (s.entity_type='resource' AND t.entity_type='resource'))) OR (NEW.predicate='inspired_by' AND ((s.entity_type='example' AND t.entity_type='example') OR (s.entity_type='example' AND t.entity_type='resource') OR (s.entity_type='resource' AND t.entity_type='example') OR (s.entity_type='resource' AND t.entity_type='resource'))) OR (NEW.predicate='variant_of' AND ((s.entity_type='concept' AND t.entity_type='concept'))) OR (NEW.predicate='part_of' AND ((s.entity_type='concept' AND t.entity_type='concept') OR (s.entity_type='example' AND t.entity_type='example') OR (s.entity_type='resource' AND t.entity_type='resource'))) OR (NEW.predicate='extends' AND ((s.entity_type='tool' AND t.entity_type='tool')))))
BEGIN SELECT RAISE(ABORT,'illegal relation endpoint types or predicate'); END;

CREATE TRIGGER entity_recommendations_typing_insert BEFORE INSERT ON entity_recommendations
WHEN NOT EXISTS(SELECT 1 FROM entities s, entities t WHERE s.id=NEW.from_entity_id AND t.id=NEW.to_entity_id AND ((NEW.predicate='can_implement_with' AND ((s.entity_type='concept' AND t.entity_type='tool'))) OR (NEW.predicate='can_reimplement_with' AND ((s.entity_type='example' AND t.entity_type='tool'))) OR (NEW.predicate='similar_to' AND ((s.entity_type='concept' AND t.entity_type='concept') OR (s.entity_type='example' AND t.entity_type='example') OR (s.entity_type='tool' AND t.entity_type='tool') OR (s.entity_type='resource' AND t.entity_type='resource'))) OR (NEW.predicate='contrasts_with' AND ((s.entity_type='concept' AND t.entity_type='concept') OR (s.entity_type='example' AND t.entity_type='example') OR (s.entity_type='tool' AND t.entity_type='tool') OR (s.entity_type='resource' AND t.entity_type='resource'))) OR (NEW.predicate='alternative_to' AND ((s.entity_type='concept' AND t.entity_type='concept') OR (s.entity_type='example' AND t.entity_type='example') OR (s.entity_type='tool' AND t.entity_type='tool') OR (s.entity_type='resource' AND t.entity_type='resource'))) OR (NEW.predicate='combine_with' AND ((s.entity_type='concept' AND t.entity_type='concept') OR (s.entity_type='concept' AND t.entity_type='resource') OR (s.entity_type='resource' AND t.entity_type='concept') OR (s.entity_type='resource' AND t.entity_type='resource')))))
BEGIN SELECT RAISE(ABORT,'illegal relation endpoint types or predicate'); END;

CREATE TRIGGER entity_recommendations_typing_update BEFORE UPDATE ON entity_recommendations
WHEN NOT EXISTS(SELECT 1 FROM entities s, entities t WHERE s.id=NEW.from_entity_id AND t.id=NEW.to_entity_id AND ((NEW.predicate='can_implement_with' AND ((s.entity_type='concept' AND t.entity_type='tool'))) OR (NEW.predicate='can_reimplement_with' AND ((s.entity_type='example' AND t.entity_type='tool'))) OR (NEW.predicate='similar_to' AND ((s.entity_type='concept' AND t.entity_type='concept') OR (s.entity_type='example' AND t.entity_type='example') OR (s.entity_type='tool' AND t.entity_type='tool') OR (s.entity_type='resource' AND t.entity_type='resource'))) OR (NEW.predicate='contrasts_with' AND ((s.entity_type='concept' AND t.entity_type='concept') OR (s.entity_type='example' AND t.entity_type='example') OR (s.entity_type='tool' AND t.entity_type='tool') OR (s.entity_type='resource' AND t.entity_type='resource'))) OR (NEW.predicate='alternative_to' AND ((s.entity_type='concept' AND t.entity_type='concept') OR (s.entity_type='example' AND t.entity_type='example') OR (s.entity_type='tool' AND t.entity_type='tool') OR (s.entity_type='resource' AND t.entity_type='resource'))) OR (NEW.predicate='combine_with' AND ((s.entity_type='concept' AND t.entity_type='concept') OR (s.entity_type='concept' AND t.entity_type='resource') OR (s.entity_type='resource' AND t.entity_type='concept') OR (s.entity_type='resource' AND t.entity_type='resource')))))
BEGIN SELECT RAISE(ABORT,'illegal relation endpoint types or predicate'); END;

CREATE TRIGGER entity_subjects_owner_insert BEFORE INSERT ON entity_subjects WHEN NOT EXISTS(SELECT 1 FROM entities WHERE id=NEW.entity_id AND entity_type IN ('example','resource')) BEGIN SELECT RAISE(ABORT,'requires example or resource owner'); END;

CREATE TRIGGER entity_subjects_owner_update BEFORE UPDATE ON entity_subjects WHEN NOT EXISTS(SELECT 1 FROM entities WHERE id=NEW.entity_id AND entity_type IN ('example','resource')) BEGIN SELECT RAISE(ABORT,'requires example or resource owner'); END;

CREATE TRIGGER entity_knowledge_points_owner_insert BEFORE INSERT ON entity_knowledge_points WHEN NOT EXISTS(SELECT 1 FROM entities WHERE id=NEW.entity_id AND entity_type IN ('example','resource')) BEGIN SELECT RAISE(ABORT,'requires example or resource owner'); END;

CREATE TRIGGER entity_knowledge_points_owner_update BEFORE UPDATE ON entity_knowledge_points WHEN NOT EXISTS(SELECT 1 FROM entities WHERE id=NEW.entity_id AND entity_type IN ('example','resource')) BEGIN SELECT RAISE(ABORT,'requires example or resource owner'); END;

CREATE TRIGGER entity_tool_primitives_owner_insert BEFORE INSERT ON entity_tool_primitives WHEN NOT EXISTS(SELECT 1 FROM entities WHERE id=NEW.entity_id AND entity_type IN ('example','resource')) BEGIN SELECT RAISE(ABORT,'requires example or resource owner'); END;

CREATE TRIGGER entity_tool_primitives_owner_update BEFORE UPDATE ON entity_tool_primitives WHEN NOT EXISTS(SELECT 1 FROM entities WHERE id=NEW.entity_id AND entity_type IN ('example','resource')) BEGIN SELECT RAISE(ABORT,'requires example or resource owner'); END;

CREATE TRIGGER artifacts_owner_insert BEFORE INSERT ON artifacts WHEN NOT EXISTS(SELECT 1 FROM entities WHERE id=NEW.owner_entity_id AND entity_type IN ('example','resource')) BEGIN SELECT RAISE(ABORT,'requires example or resource owner'); END;

CREATE TRIGGER artifacts_owner_update BEFORE UPDATE ON artifacts WHEN NOT EXISTS(SELECT 1 FROM entities WHERE id=NEW.owner_entity_id AND entity_type IN ('example','resource')) BEGIN SELECT RAISE(ABORT,'requires example or resource owner'); END;

CREATE TRIGGER representation_role_insert BEFORE INSERT ON knowledge_point_representations WHEN NOT EXISTS(SELECT 1 FROM concepts c,json_each(c.kinds_json) k WHERE c.entity_id=NEW.concept_id AND k.value='representation_method') BEGIN SELECT RAISE(ABORT,'target is not a representation method'); END;

CREATE TRIGGER representation_role_update BEFORE UPDATE ON knowledge_point_representations WHEN NOT EXISTS(SELECT 1 FROM concepts c,json_each(c.kinds_json) k WHERE c.entity_id=NEW.concept_id AND k.value='representation_method') BEGIN SELECT RAISE(ABORT,'target is not a representation method'); END;

CREATE TRIGGER knowledge_point_representations_review_stale_update AFTER UPDATE OF knowledge_point_id,concept_id,context_key,context_json,verdict,rationale,curator,evidence_set_id ON knowledge_point_representations WHEN NEW.review_status='accepted' BEGIN UPDATE knowledge_point_representations SET review_status='proposed' WHERE rowid=NEW.rowid; END;

CREATE TRIGGER entity_recommendations_review_stale_update AFTER UPDATE OF from_entity_id,to_entity_id,predicate,context_key,context_json,verdict,rationale,curator,evidence_set_id ON entity_recommendations WHEN NEW.review_status='accepted' BEGIN UPDATE entity_recommendations SET review_status='proposed' WHERE rowid=NEW.rowid; END;

CREATE TRIGGER entity_intents_review_stale_update AFTER UPDATE OF entity_id,intent_id,context_key,context_json,polarity,rationale,curator,evidence_set_id ON entity_intents WHEN NEW.review_status='accepted' BEGIN UPDATE entity_intents SET review_status='proposed' WHERE rowid=NEW.rowid; END;

CREATE TRIGGER evidence_sets_review_stale_update AFTER UPDATE OF basis_kind,summary,producer ON evidence_sets WHEN NEW.review_status IN ('accepted','disputed') BEGIN UPDATE evidence_sets SET review_status='unreviewed' WHERE id=NEW.id; END;

CREATE TRIGGER evidence_sources_review_stale_insert AFTER INSERT ON evidence_set_sources BEGIN UPDATE evidence_sets SET review_status='unreviewed' WHERE id=NEW.evidence_set_id AND review_status IN ('accepted','disputed'); END;

CREATE TRIGGER evidence_sources_review_stale_update AFTER UPDATE ON evidence_set_sources BEGIN UPDATE evidence_sets SET review_status='unreviewed' WHERE id IN (OLD.evidence_set_id,NEW.evidence_set_id) AND review_status IN ('accepted','disputed'); END;

CREATE TRIGGER evidence_sources_review_stale_delete AFTER DELETE ON evidence_set_sources BEGIN UPDATE evidence_sets SET review_status='unreviewed' WHERE id=OLD.evidence_set_id AND review_status IN ('accepted','disputed'); END;

CREATE UNIQUE INDEX entity_domains_one_primary ON entity_domains(entity_id) WHERE is_primary=1;

CREATE UNIQUE INDEX knowledge_point_subjects_one_primary ON knowledge_point_subjects(knowledge_point_id) WHERE is_primary=1;

CREATE UNIQUE INDEX kp_one_navigation_parent ON knowledge_point_relations(from_knowledge_point_id,scope_key) WHERE is_navigation_parent=1;

CREATE INDEX entity_relations_reverse ON entity_relations(to_entity_id,predicate,from_entity_id);

CREATE INDEX entity_domains_reverse ON entity_domains(creative_domain_id,entity_id);

CREATE INDEX entity_knowledge_points_reverse ON entity_knowledge_points(knowledge_point_id,entity_id);

CREATE INDEX knowledge_point_subjects_reverse ON knowledge_point_subjects(subject_id,knowledge_point_id);

CREATE INDEX knowledge_point_representations_reverse ON knowledge_point_representations(concept_id,knowledge_point_id);

CREATE INDEX tool_capability_support_reverse ON tool_capability_support(capability_id,tool_entity_id);

CREATE INDEX primitive_capabilities_reverse ON primitive_capabilities(capability_id,tool_primitive_id);

CREATE INDEX entity_tool_primitives_reverse ON entity_tool_primitives(tool_primitive_id,entity_id);

CREATE INDEX entity_intents_reverse ON entity_intents(intent_id,entity_id);

CREATE INDEX entity_subjects_reverse ON entity_subjects(subject_id,entity_id);

CREATE INDEX entity_recommendations_reverse ON entity_recommendations(to_entity_id,predicate,from_entity_id);

CREATE VIEW fact_entity_relations AS SELECT r.* FROM entity_relations r JOIN evidence_sets e ON e.id=r.evidence_set_id WHERE e.review_status='accepted' AND e.basis_kind IN ('documentation','observation','test') AND EXISTS(SELECT 1 FROM evidence_set_sources es WHERE es.evidence_set_id=e.id AND es.stance='supports' AND length(trim(es.locator))>0);

CREATE VIEW fact_entity_domains AS SELECT r.* FROM entity_domains r JOIN evidence_sets e ON e.id=r.evidence_set_id WHERE e.review_status='accepted' AND e.basis_kind IN ('documentation','observation','test') AND EXISTS(SELECT 1 FROM evidence_set_sources es WHERE es.evidence_set_id=e.id AND es.stance='supports' AND length(trim(es.locator))>0);

CREATE VIEW fact_knowledge_point_subjects AS SELECT r.* FROM knowledge_point_subjects r JOIN evidence_sets e ON e.id=r.evidence_set_id WHERE e.review_status='accepted' AND e.basis_kind IN ('documentation','observation','test') AND EXISTS(SELECT 1 FROM evidence_set_sources es WHERE es.evidence_set_id=e.id AND es.stance='supports' AND length(trim(es.locator))>0);

CREATE VIEW fact_entity_subjects AS SELECT r.* FROM entity_subjects r JOIN evidence_sets e ON e.id=r.evidence_set_id WHERE e.review_status='accepted' AND e.basis_kind IN ('documentation','observation','test') AND EXISTS(SELECT 1 FROM evidence_set_sources es WHERE es.evidence_set_id=e.id AND es.stance='supports' AND length(trim(es.locator))>0);

CREATE VIEW fact_entity_knowledge_points AS SELECT r.* FROM entity_knowledge_points r JOIN evidence_sets e ON e.id=r.evidence_set_id WHERE e.review_status='accepted' AND e.basis_kind IN ('documentation','observation','test') AND EXISTS(SELECT 1 FROM evidence_set_sources es WHERE es.evidence_set_id=e.id AND es.stance='supports' AND length(trim(es.locator))>0);

CREATE VIEW fact_knowledge_point_relations AS SELECT r.* FROM knowledge_point_relations r JOIN evidence_sets e ON e.id=r.evidence_set_id WHERE e.review_status='accepted' AND e.basis_kind IN ('documentation','observation','test') AND EXISTS(SELECT 1 FROM evidence_set_sources es WHERE es.evidence_set_id=e.id AND es.stance='supports' AND length(trim(es.locator))>0);

CREATE VIEW fact_tool_capability_support AS SELECT r.* FROM tool_capability_support r JOIN evidence_sets e ON e.id=r.evidence_set_id WHERE e.review_status='accepted' AND e.basis_kind IN ('documentation','observation','test') AND EXISTS(SELECT 1 FROM evidence_set_sources es WHERE es.evidence_set_id=e.id AND es.stance='supports' AND length(trim(es.locator))>0);

CREATE VIEW fact_primitive_capabilities AS SELECT r.* FROM primitive_capabilities r JOIN evidence_sets e ON e.id=r.evidence_set_id WHERE e.review_status='accepted' AND e.basis_kind IN ('documentation','observation','test') AND EXISTS(SELECT 1 FROM evidence_set_sources es WHERE es.evidence_set_id=e.id AND es.stance='supports' AND length(trim(es.locator))>0);

CREATE VIEW fact_entity_tool_primitives AS SELECT r.* FROM entity_tool_primitives r JOIN evidence_sets e ON e.id=r.evidence_set_id WHERE e.review_status='accepted' AND e.basis_kind IN ('documentation','observation','test') AND EXISTS(SELECT 1 FROM evidence_set_sources es WHERE es.evidence_set_id=e.id AND es.stance='supports' AND length(trim(es.locator))>0);
