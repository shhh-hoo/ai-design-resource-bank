"""Build-time semantic checks for the V1 RC2 prototype.

This is a focused structural validator, not a complete ingestion pipeline or
an evidence truth detector. Run before publishing a generated database.
"""
from __future__ import annotations
import argparse
import json
import sqlite3
from pathlib import Path
from datetime import date
from collections import defaultdict
from typing import Iterable

KINDS = {'pattern','technique','style','medium','material','principle','format','interaction_pattern','motion','component','effect','texture','lighting','composition','representation_method','cinematography','stagecraft','mechanism','knowledge'}

def _cyclic(edges: Iterable[tuple[str,str]]) -> bool:
    graph: dict[str,list[str]] = defaultdict(list)
    for a,b in edges: graph[a].append(b)
    states: dict[str,int] = {}
    def visit(n: str) -> bool:
        if states.get(n)==1: return True
        if states.get(n)==2: return False
        states[n]=1
        if any(visit(m) for m in graph.get(n,())): return True
        states[n]=2
        return False
    return any(visit(n) for n in list(graph))

def validate(db: sqlite3.Connection) -> list[str]:
    """Return structural errors; an empty list is not a quality endorsement."""
    errors: list[str] = []
    if db.execute('PRAGMA foreign_keys').fetchone()[0] != 1:
        errors.append('foreign_keys must be enabled on the connection')
    if db.execute('PRAGMA foreign_key_check').fetchall(): errors.append('foreign key violations')
    prefixes={'concept':'concept:','example':'ex:','tool':'tool:','resource':'resource:'}
    for eid,typ in db.execute('SELECT id,entity_type FROM entities'):
        if not eid.startswith(prefixes[typ]): errors.append(f'canonical entity ID namespace mismatch: {eid}')
    for table,prefix in (('sources','source:'),('subjects','topic:'),('knowledge_points','topic:'),('intents','intent:'),('collections','collection:'),('creative_domains','domain:'),('tool_capabilities','capability:'),('tool_primitives','primitive:'),('evidence_sets','evidence:')):
        for value, in db.execute(f'SELECT id FROM {table}'):
            if not value.startswith(prefix): errors.append(f'canonical/support ID namespace mismatch: {value}')
    for eid, typ in db.execute('SELECT id,entity_type FROM entities'):
        children=[]
        for t in ('concepts','examples','tools','resources'):
            if db.execute(f'SELECT 1 FROM {t} WHERE entity_id=?',(eid,)).fetchone():children.append(t)
        if children != [dict(concept='concepts',example='examples',tool='tools',resource='resources')[typ]]:
            errors.append(f'exactly one matching subtype required: {eid}')
    for eid,kinds in db.execute('SELECT entity_id,kinds_json FROM concepts'):
        values=json.loads(kinds)
        if not values or len(values)!=len(set(values)) or not set(values)<=KINDS:
            errors.append(f'invalid concept roles: {eid}')
    for kp,cid in db.execute('SELECT knowledge_point_id,concept_id FROM knowledge_point_representations'):
        roles=json.loads(db.execute('SELECT kinds_json FROM concepts WHERE entity_id=?',(cid,)).fetchone()[0])
        if 'representation_method' not in roles:errors.append(f'not a representation method: {cid}')
    for t in ('subjects','creative_domains'):
        if _cyclic(db.execute(f'SELECT id,parent_id FROM {t} WHERE parent_id IS NOT NULL')):errors.append(f'cycle: {t}')
    for scope, in db.execute('SELECT DISTINCT scope_key FROM knowledge_point_relations'):
        edges=db.execute("SELECT from_knowledge_point_id,to_knowledge_point_id FROM knowledge_point_relations WHERE scope_key=? AND predicate IN ('is_a','part_of')",(scope,)).fetchall()
        if _cyclic(edges):errors.append(f'knowledge hierarchy cycle: {scope}')
        edges=db.execute("SELECT from_knowledge_point_id,to_knowledge_point_id FROM knowledge_point_relations WHERE scope_key=? AND predicate='prerequisite_for'",(scope,)).fetchall()
        if _cyclic(edges):errors.append(f'prerequisite cycle: {scope}')
    if _cyclic(db.execute("SELECT from_entity_id,to_entity_id FROM entity_relations WHERE predicate IN ('derived_from','extracted_from','reimplementation_of')")):
        errors.append('core derivation cycle')
    for pred in ('part_of','variant_of','derived_from','extends'):
        if _cyclic(db.execute('SELECT from_entity_id,to_entity_id FROM entity_relations WHERE predicate=?',(pred,))):errors.append(f'core cycle: {pred}')
    for t in ('entity_recommendations','knowledge_point_representations','entity_intents'):
        for ctx,rationale in db.execute(f'SELECT context_json,rationale FROM {t}'):
            context=json.loads(ctx)
            if not isinstance(context.get('purpose'),str) or not context['purpose'].strip():errors.append(f'missing recommendation purpose: {t}')
            if not rationale.strip():errors.append(f'empty rationale: {t}')
    for a,b in db.execute("SELECT from_entity_id,to_entity_id FROM entity_recommendations WHERE predicate IN ('similar_to','contrasts_with','combine_with')"):
        if a>=b:errors.append('symmetric recommendation must use ordered endpoints')
    for a,b in db.execute("SELECT from_knowledge_point_id,to_knowledge_point_id FROM knowledge_point_relations WHERE predicate IN ('related_to','contrasts_with')"):
        if a>=b:errors.append('symmetric knowledge relation must use ordered endpoints')
    for eid,kind,status in db.execute('SELECT id,basis_kind,review_status FROM evidence_sets'):
        has_source=db.execute("SELECT 1 FROM evidence_set_sources WHERE evidence_set_id=? AND stance='supports' AND length(trim(locator))>0",(eid,)).fetchone()
        if status=='accepted' and kind!='reasoning' and not has_source:errors.append(f'accepted external evidence lacks locator: {eid}')
    # Runtime factual claims cannot be approved by reasoning alone.
    for t in ('entity_relations','entity_tool_primitives','tool_capability_support','primitive_capabilities'):
        bad=db.execute(f"SELECT 1 FROM {t} r JOIN evidence_sets e ON e.id=r.evidence_set_id WHERE e.review_status='accepted' AND e.basis_kind='reasoning' LIMIT 1").fetchone()
        if bad:errors.append(f'reasoning cannot establish implementation fact: {t}')
    for eid,record_hash,validated_hash,status,evidence_id in db.execute('SELECT e.id,e.record_hash,r.validated_hash,r.validation_status,r.validation_evidence_set_id FROM resources r JOIN entities e ON e.id=r.entity_id'):
        if status=='passed':
            if validated_hash!=record_hash:errors.append(f'stale resource validation: {eid}')
            proof=db.execute("SELECT 1 FROM evidence_sets WHERE id=? AND basis_kind='test' AND review_status='accepted'",(evidence_id,)).fetchone()
            if not proof:errors.append(f'passed resource lacks accepted test: {eid}')
    for kid,refs in db.execute('SELECT id,curriculum_refs_json FROM knowledge_points'):
        for r in json.loads(refs):
            if not isinstance(r,dict) or not r.get('system') or not r.get('edition') or not r.get('code') or not db.execute('SELECT 1 FROM sources WHERE id=?',(r.get('source_id'),)).fetchone():errors.append(f'invalid curriculum reference: {kid}')
    for kind,hash_value in db.execute('SELECT entity_type,record_hash FROM entities'):
        if len(hash_value)!=64 or any(c not in '0123456789abcdef' for c in hash_value):errors.append('record_hash must be lowercase SHA-256 hex')
    for eid, in db.execute("SELECT id FROM entities WHERE hash_status='stale'"):
        errors.append(f'stale record hash: {eid}')
    bad_provider=db.execute("SELECT 1 FROM tool_capability_support WHERE (mode='external' AND (provider_tool_entity_id IS NULL OR provider_tool_entity_id=tool_entity_id)) OR (mode IN ('native','addon') AND provider_tool_entity_id IS NOT NULL) LIMIT 1").fetchone()
    if bad_provider:errors.append('inconsistent provider semantics: tool_capability_support')
    for sid,captured,checked,scope in db.execute('SELECT id,captured_at,checked_at,check_scope FROM sources'):
        try: date.fromisoformat(captured)
        except (TypeError,ValueError): errors.append(f'invalid source captured_at: {sid}')
        if checked is not None:
            try: date.fromisoformat(checked)
            except (TypeError,ValueError): errors.append(f'invalid source checked_at: {sid}')
        if not scope.strip(): errors.append(f'empty source check_scope: {sid}')
    return errors


def schema_sql(root: Path | None = None) -> str:
    root = root or Path(__file__).resolve().parents[1]
    schema_dir = root / 'schemas' / 'relational-v1'
    return '\n'.join((schema_dir / name).read_text() for name in ('01-core.sql','02-relations.sql','03-constraints-views.sql'))

def self_check(root: Path | None = None) -> list[str]:
    db=sqlite3.connect(':memory:')
    try:
        db.executescript(schema_sql(root))
        errors=validate(db)
        count=db.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchone()[0]
        if count != 31: errors.append(f'expected 31 business tables, found {count}')
        required={
            'fact_entity_relations','fact_entity_domains','fact_knowledge_point_subjects',
            'fact_entity_subjects','fact_entity_knowledge_points','fact_knowledge_point_relations',
            'fact_tool_capability_support','fact_primitive_capabilities','fact_entity_tool_primitives',
        }
        views={r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='view'")}
        missing=required-views
        if missing: errors.append('missing guarded fact views: '+', '.join(sorted(missing)))
        return errors
    finally:
        db.close()

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--self-check', action='store_true')
    args=parser.parse_args()
    if not args.self_check:
        parser.error('use --self-check for the standalone projection check')
    errors=self_check()
    if errors: raise SystemExit('\n'.join(errors))
    print('AIDRB relational RC2 self-check passed (31 tables).')

if __name__=='__main__':
    main()
