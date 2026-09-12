-- AIDRB V1 RC2: relational prototype; schema-only, no production migration.

PRAGMA foreign_keys = ON;

CREATE TABLE entities (
  id TEXT NOT NULL PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('concept','example','tool','resource')),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  summary TEXT,
  aliases_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(aliases_json) AND json_type(aliases_json) = 'array'),
  traits_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(traits_json) AND json_type(traits_json) = 'object'),
  status TEXT NOT NULL DEFAULT 'captured' CHECK (status IN ('captured','reviewed','archived')),
  canonical_locator TEXT NOT NULL UNIQUE,
  record_hash TEXT NOT NULL,
  hash_status TEXT NOT NULL DEFAULT 'current' CHECK (hash_status IN ('current','stale')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (entity_type, slug)
);

CREATE TABLE concepts (
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  kinds_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(kinds_json) AND json_type(kinds_json) = 'array'),
  definition TEXT NOT NULL,
  grammar_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(grammar_json) AND json_type(grammar_json) = 'object'),
  PRIMARY KEY (entity_id)
);

CREATE TABLE examples (
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  example_kind TEXT NOT NULL CHECK (example_kind IN ('LIVE','REFERENCE','GAP')),
  origin_kind TEXT NOT NULL CHECK (origin_kind IN ('real_reference','authored_study','generated_study')),
  medium TEXT,
  formats_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(formats_json) AND json_type(formats_json) = 'array'),
  creator TEXT,
  year INTEGER,
  collected INTEGER NOT NULL DEFAULT 1 CHECK (collected IN (0,1)),
  showable INTEGER NOT NULL DEFAULT 0 CHECK (showable IN (0,1)),
  reusable INTEGER NOT NULL DEFAULT 0 CHECK (reusable IN (0,1)),
  verified INTEGER NOT NULL DEFAULT 0 CHECK (verified IN (0,1)),
  preview_artifact_id TEXT REFERENCES artifacts(id) ON DELETE RESTRICT,
  viewing_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(viewing_json) AND json_type(viewing_json) = 'object'),
  PRIMARY KEY (entity_id)
);

CREATE TABLE tools (
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  tool_subtype TEXT NOT NULL CHECK (tool_subtype IN ('authoring-editor','declarative-grammar','domain-viewer','embed-api','framework','library','renderer','simulation-engine','web-component')),
  homepage_url TEXT,
  runtimes_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(runtimes_json) AND json_type(runtimes_json) = 'array'),
  license TEXT,
  version_note TEXT,
  PRIMARY KEY (entity_id)
);

CREATE TABLE resources (
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('code','prompt','skill','asset','spec','mixed')),
  package_path TEXT NOT NULL UNIQUE,
  entrypoint TEXT,
  version TEXT,
  fidelity_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(fidelity_json) AND json_type(fidelity_json) = 'object'),
  validation_status TEXT NOT NULL DEFAULT 'untested' CHECK (validation_status IN ('untested','passed','failed','stale')),
  validated_hash TEXT,
  validation_evidence_set_id TEXT REFERENCES evidence_sets(id) ON DELETE RESTRICT,
  PRIMARY KEY (entity_id)
);

CREATE TABLE creative_domains (
  id TEXT NOT NULL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  canonical_locator TEXT NOT NULL UNIQUE,
  parent_id TEXT REFERENCES creative_domains(id) ON DELETE RESTRICT
);

CREATE TABLE subjects (
  id TEXT NOT NULL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  canonical_locator TEXT NOT NULL UNIQUE,
  parent_id TEXT REFERENCES subjects(id) ON DELETE RESTRICT,
  pack_path TEXT
);

CREATE TABLE knowledge_points (
  id TEXT NOT NULL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  canonical_locator TEXT NOT NULL UNIQUE,
  aliases_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(aliases_json) AND json_type(aliases_json) = 'array'),
  curriculum_refs_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(curriculum_refs_json) AND json_type(curriculum_refs_json) = 'array')
);

CREATE TABLE tool_capabilities (
  id TEXT NOT NULL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  canonical_locator TEXT NOT NULL UNIQUE
);

CREATE TABLE tool_primitives (
  id TEXT NOT NULL PRIMARY KEY,
  tool_entity_id TEXT NOT NULL REFERENCES tools(entity_id) ON DELETE RESTRICT,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  primitive_type TEXT NOT NULL CHECK (primitive_type IN ('module','class','node','operator','preset','plugin','technique')),
  module_path TEXT,
  documentation_url TEXT,
  backend TEXT,
  version_scope TEXT,
  description TEXT,
  canonical_locator TEXT NOT NULL UNIQUE,
  UNIQUE (tool_entity_id, slug)
);

CREATE TABLE intents (
  id TEXT NOT NULL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  canonical_locator TEXT NOT NULL UNIQUE
);

CREATE TABLE collections (
  id TEXT NOT NULL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  canonical_locator TEXT NOT NULL UNIQUE,
  curator TEXT NOT NULL
);

CREATE TABLE sources (
  id TEXT NOT NULL PRIMARY KEY,
  source_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  locator_type TEXT NOT NULL CHECK (locator_type IN ('url','file','image','video','repository','paper','prompt','other','user-upload')),
  locator TEXT NOT NULL CHECK (length(trim(locator)) > 0),
  captured_at TEXT NOT NULL,
  checked_at TEXT,
  check_scope TEXT NOT NULL,
  author TEXT,
  notes TEXT,
  version_ref TEXT,
  rights_status TEXT NOT NULL DEFAULT 'unknown' CHECK (rights_status IN ('unknown','known','restricted')),
  license TEXT,
  rights_note TEXT
);

CREATE TABLE artifacts (
  id TEXT NOT NULL PRIMARY KEY,
  owner_entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  artifact_type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  content_hash TEXT,
  origin_kind TEXT NOT NULL CHECK (origin_kind IN ('reference_capture','extracted','reimplemented','generated','authored')),
  role TEXT NOT NULL,
  rights_status TEXT NOT NULL DEFAULT 'unknown' CHECK (rights_status IN ('unknown','known','restricted')),
  license TEXT,
  source_id TEXT REFERENCES sources(id) ON DELETE RESTRICT,
  validation_status TEXT NOT NULL DEFAULT 'untested' CHECK (validation_status IN ('untested','passed','failed','stale'))
);

CREATE TABLE evidence_sets (
  id TEXT NOT NULL PRIMARY KEY,
  basis_kind TEXT NOT NULL CHECK (basis_kind IN ('documentation','observation','test','reasoning')),
  summary TEXT NOT NULL,
  producer TEXT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'unreviewed' CHECK (review_status IN ('unreviewed','accepted','disputed','rejected')),
  canonical_locator TEXT NOT NULL UNIQUE
);
