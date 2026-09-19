CREATE TABLE entity_relations (
  from_entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  to_entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  predicate TEXT NOT NULL,
  context_key TEXT NOT NULL DEFAULT 'global',
  qualifiers_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(qualifiers_json) AND json_type(qualifiers_json) = 'object'),
  evidence_set_id TEXT NOT NULL REFERENCES evidence_sets(id) ON DELETE RESTRICT,
  PRIMARY KEY (from_entity_id, to_entity_id, predicate, context_key),
  CHECK (from_entity_id <> to_entity_id)
);

CREATE TABLE entity_domains (
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  creative_domain_id TEXT NOT NULL REFERENCES creative_domains(id) ON DELETE RESTRICT,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0,1)),
  evidence_set_id TEXT NOT NULL REFERENCES evidence_sets(id) ON DELETE RESTRICT,
  PRIMARY KEY (entity_id, creative_domain_id)
);

CREATE TABLE entity_sources (
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
  role TEXT NOT NULL CHECK (role IN ('primary','documentation','repository','reference','license','validation')),
  locator TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (entity_id, source_id, role, locator)
);

CREATE TABLE knowledge_point_subjects (
  knowledge_point_id TEXT NOT NULL REFERENCES knowledge_points(id) ON DELETE RESTRICT,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0,1)),
  evidence_set_id TEXT NOT NULL REFERENCES evidence_sets(id) ON DELETE RESTRICT,
  PRIMARY KEY (knowledge_point_id, subject_id)
);

CREATE TABLE entity_subjects (
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  predicate TEXT NOT NULL CHECK (predicate IN ('about')),
  evidence_set_id TEXT NOT NULL REFERENCES evidence_sets(id) ON DELETE RESTRICT,
  PRIMARY KEY (entity_id, subject_id, predicate)
);

CREATE TABLE entity_knowledge_points (
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  knowledge_point_id TEXT NOT NULL REFERENCES knowledge_points(id) ON DELETE RESTRICT,
  predicate TEXT NOT NULL CHECK (predicate IN ('depicts','explains','models','addresses')),
  evidence_set_id TEXT NOT NULL REFERENCES evidence_sets(id) ON DELETE RESTRICT,
  PRIMARY KEY (entity_id, knowledge_point_id, predicate)
);

CREATE TABLE knowledge_point_relations (
  from_knowledge_point_id TEXT NOT NULL REFERENCES knowledge_points(id) ON DELETE RESTRICT,
  to_knowledge_point_id TEXT NOT NULL REFERENCES knowledge_points(id) ON DELETE RESTRICT,
  predicate TEXT NOT NULL CHECK (predicate IN ('is_a','part_of','related_to','contrasts_with','prerequisite_for')),
  scope_key TEXT NOT NULL DEFAULT 'global',
  is_navigation_parent INTEGER NOT NULL DEFAULT 0 CHECK (is_navigation_parent IN (0,1)),
  notes TEXT,
  evidence_set_id TEXT NOT NULL REFERENCES evidence_sets(id) ON DELETE RESTRICT,
  PRIMARY KEY (from_knowledge_point_id, to_knowledge_point_id, predicate, scope_key),
  CHECK (from_knowledge_point_id <> to_knowledge_point_id),
  CHECK (is_navigation_parent = 0 OR predicate IN ('is_a','part_of')),
  CHECK (predicate <> 'prerequisite_for' OR scope_key <> 'global')
);

CREATE TABLE knowledge_point_representations (
  knowledge_point_id TEXT NOT NULL REFERENCES knowledge_points(id) ON DELETE RESTRICT,
  concept_id TEXT NOT NULL REFERENCES concepts(entity_id) ON DELETE RESTRICT,
  context_key TEXT NOT NULL,
  context_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(context_json) AND json_type(context_json) = 'object'),
  verdict TEXT NOT NULL CHECK (verdict IN ('suitable','conditional','avoid')),
  rationale TEXT NOT NULL CHECK (length(trim(rationale)) > 0),
  curator TEXT NOT NULL,
  evidence_set_id TEXT REFERENCES evidence_sets(id) ON DELETE RESTRICT,
  review_status TEXT NOT NULL DEFAULT 'proposed' CHECK (review_status IN ('proposed','accepted','rejected')),
  PRIMARY KEY (knowledge_point_id, concept_id, context_key, curator)
);

CREATE TABLE concept_capabilities (
  concept_id TEXT NOT NULL REFERENCES concepts(entity_id) ON DELETE RESTRICT,
  capability_id TEXT NOT NULL REFERENCES tool_capabilities(id) ON DELETE RESTRICT,
  approach_key TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('required','optional')),
  notes TEXT NOT NULL,
  evidence_set_id TEXT NOT NULL REFERENCES evidence_sets(id) ON DELETE RESTRICT,
  PRIMARY KEY (concept_id, capability_id, approach_key)
);

CREATE TABLE tool_capability_support (
  tool_entity_id TEXT NOT NULL REFERENCES tools(entity_id) ON DELETE RESTRICT,
  capability_id TEXT NOT NULL REFERENCES tool_capabilities(id) ON DELETE RESTRICT,
  scope_key TEXT NOT NULL,
  scope_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(scope_json) AND json_type(scope_json) = 'object'),
  mode TEXT NOT NULL CHECK (mode IN ('native','addon','external')),
  provider_tool_entity_id TEXT REFERENCES tools(entity_id) ON DELETE RESTRICT,
  evidence_set_id TEXT NOT NULL REFERENCES evidence_sets(id) ON DELETE RESTRICT,
  PRIMARY KEY (tool_entity_id, capability_id, scope_key),
  CHECK ((mode='external' AND provider_tool_entity_id IS NOT NULL AND provider_tool_entity_id <> tool_entity_id) OR (mode IN ('native','addon') AND provider_tool_entity_id IS NULL))
);

CREATE TABLE primitive_capabilities (
  tool_primitive_id TEXT NOT NULL REFERENCES tool_primitives(id) ON DELETE RESTRICT,
  capability_id TEXT NOT NULL REFERENCES tool_capabilities(id) ON DELETE RESTRICT,
  scope_key TEXT NOT NULL,
  notes TEXT,
  evidence_set_id TEXT NOT NULL REFERENCES evidence_sets(id) ON DELETE RESTRICT,
  PRIMARY KEY (tool_primitive_id, capability_id, scope_key)
);

CREATE TABLE entity_tool_primitives (
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  tool_primitive_id TEXT NOT NULL REFERENCES tool_primitives(id) ON DELETE RESTRICT,
  role TEXT NOT NULL CHECK (role IN ('uses','requires')),
  use_stage TEXT NOT NULL CHECK (use_stage IN ('runtime','build','authoring')),
  version_scope TEXT,
  evidence_set_id TEXT NOT NULL REFERENCES evidence_sets(id) ON DELETE RESTRICT,
  PRIMARY KEY (entity_id, tool_primitive_id, role, use_stage)
);

CREATE TABLE entity_intents (
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  intent_id TEXT NOT NULL REFERENCES intents(id) ON DELETE RESTRICT,
  context_key TEXT NOT NULL,
  context_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(context_json) AND json_type(context_json) = 'object'),
  polarity TEXT NOT NULL CHECK (polarity IN ('use_when','avoid_when')),
  rationale TEXT NOT NULL CHECK (length(trim(rationale)) > 0),
  curator TEXT NOT NULL,
  evidence_set_id TEXT REFERENCES evidence_sets(id) ON DELETE RESTRICT,
  review_status TEXT NOT NULL DEFAULT 'proposed' CHECK (review_status IN ('proposed','accepted','rejected')),
  PRIMARY KEY (entity_id, intent_id, context_key, curator)
);

CREATE TABLE collection_entities (
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE RESTRICT,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  position INTEGER NOT NULL CHECK (position >= 0),
  note TEXT,
  PRIMARY KEY (collection_id, entity_id),
  UNIQUE (collection_id, position)
);

CREATE TABLE entity_recommendations (
  from_entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  to_entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  predicate TEXT NOT NULL,
  context_key TEXT NOT NULL,
  context_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(context_json) AND json_type(context_json) = 'object'),
  verdict TEXT NOT NULL CHECK (verdict IN ('suitable','conditional','avoid')),
  rationale TEXT NOT NULL CHECK (length(trim(rationale)) > 0),
  curator TEXT NOT NULL,
  evidence_set_id TEXT REFERENCES evidence_sets(id) ON DELETE RESTRICT,
  review_status TEXT NOT NULL DEFAULT 'proposed' CHECK (review_status IN ('proposed','accepted','rejected')),
  PRIMARY KEY (from_entity_id, to_entity_id, predicate, context_key, curator),
  CHECK (from_entity_id <> to_entity_id)
);

CREATE TABLE evidence_set_sources (
  evidence_set_id TEXT NOT NULL REFERENCES evidence_sets(id) ON DELETE RESTRICT,
  source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
  locator TEXT NOT NULL CHECK (length(trim(locator)) > 0),
  stance TEXT NOT NULL CHECK (stance IN ('supports','contradicts')),
  PRIMARY KEY (evidence_set_id, source_id, locator, stance)
);
