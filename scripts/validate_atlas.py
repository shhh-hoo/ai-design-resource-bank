#!/usr/bin/env python3
import json
import re
from pathlib import Path
from collections import Counter
from atlas_core import ROOT, TYPES, RELATIONS, inputs, generate_relations, build_view, read, validate_shapes, ID_PREFIX


def validate(records, aliases, migration, crosswalks):
    validate_shapes(records)
    errors=[]
    def require(ok,message):
        if not ok:errors.append(message)
    ids=[r.get('id') for r in records];by_id={r.get('id'):r for r in records}
    require(len(ids)==len(set(ids)),'Duplicate canonical ID')
    prefix=ID_PREFIX
    for r in records:
        id=r.get('id','');type=r.get('type')
        require(type in TYPES,f'{id}: invalid content/overlay type')
        require(bool(re.fullmatch(prefix.get(type,'INVALID')+r':[a-z0-9-]+',id)),f'{id}: invalid ID prefix')
        require((ROOT/r.get('canonical_path','MISSING')).is_file(),f'{id}: missing authoritative path')
        for sid in r.get('source_refs',[]):require(by_id.get(sid,{}).get('type')=='Source',f'{id}: invalid Source {sid}')
        if type=='Tool':
            require(r.get('subtype') in set(read('knowledge/tools/adapter.json')['subtype_map'].values()),f'{id}: unknown tool subtype')
            require(bool(r.get('use_when')) and bool(r.get('avoid_when')) and bool(r.get('capabilities')),f'{id}: incomplete capability evidence')
        if type=='Concept':
            for g in r.get('grammar',[]):require('concept:grammar-'+g in by_id,f'{id}: invalid grammar')
        if type=='Example':
            life=r.get('lifecycle',{})
            require(set(life)=={'collected','showable','reusable','verified'} and all(isinstance(v,bool) for v in life.values()),f'{id}: lifecycle is orthogonal booleans')
            gap=r.get('kind')=='GAP'
            require(bool(r.get('concept_ids')),f'{id}: no concept')
            require(bool(r.get('topic_ids')),f'{id}: no topic')
            for tid in r.get('topic_ids',[]):
                require(by_id.get(tid,{}).get('type')=='SubjectTopic',f'{id}: invalid topic')
                require(id in by_id.get(tid,{}).get('example_ids',[]),f'{id}: missing reciprocal topic inventory')
            require(r.get('subject_id') in by_id and by_id.get(r.get('subject_id'),{}).get('parent') is None,f'{id}: invalid subject')
            if gap:
                require(bool(r.get('gap_reason')),f'{id}: GAP needs reason')
                require(not r.get('preview') and not r.get('resource_ids') and not r.get('tool_choices'),f'{id}: GAP cannot claim a preview, resource or implementation')
                require(not any(life.values()),f'{id}: GAP cannot claim lifecycle completion')
            else:
                require(bool(r.get('preview',{}).get('renderer')) and life.get('showable'),f'{id}: showable instance needs preview')
                require(r.get('preview',{}).get('url')=='#example/'+id,f'{id}: preview does not resolve exact identity')
            if life.get('reusable'):require(bool(r.get('resource_ids')),f'{id}: reusable needs a package')
            if life.get('verified'):require(bool(r.get('verification',{}).get('evidence')) and bool(r.get('verification',{}).get('scope')),f'{id}: verified needs scoped evidence')
            for key in ['grammar','transfer_constraints','fidelity_constraints','failure_modes']:require(bool(r.get(key)),f'{id}: missing Method input {key}')
            for g in r.get('grammar',[]):require('concept:grammar-'+g in by_id,f'{id}: invalid grammar')
        if type=='SubjectTopic':
            if r.get('parent'):require(by_id.get(r['parent'],{}).get('type')=='SubjectTopic',f'{id}: missing parent')
            if r.get('parent'):require(bool(r.get('example_ids')),f'{id}: empty major-topic inventory')
            for eid in r.get('example_ids',[]):require(id in by_id.get(eid,{}).get('topic_ids',[]),f'{id}: unowned example in inventory')
        if type=='Resource':
            require(r.get('package_path','').startswith('resources/'),f'{id}: Resource must come from authoritative package')
            for a in r.get('artifacts',[]):
                p=(ROOT/r['package_path']/a['path']).resolve()
                require(p.is_relative_to((ROOT/r['package_path']).resolve()) and p.is_file(),f'{id}: invalid artifact path')
    for alias,id in aliases.items():require(id in by_id and alias not in by_id,f'Invalid legacy alias {alias}')
    for edge in generate_relations(records):
        signature=RELATIONS.get(edge['type']);a=by_id.get(edge['source'],{}).get('type');b=by_id.get(edge['target'],{}).get('type')
        require(signature is not None,f'Unknown relation: {edge}')
        if signature:
            source_types=signature[0] if isinstance(signature[0],tuple) else (signature[0],)
            require(a in source_types and b==signature[1],f'Invalid typed relation: {edge}')
        if edge['type']=='implemented_with':require(edge.get('evidence') in ['observed','proposed'] and bool(edge.get('reason')),f'Unqualified implementation edge {edge}')
    # Hierarchy and prerequisite cycles are independently forbidden.
    for relation,key in [('parent','parent'),('prerequisites','prerequisites')]:
        def visit(id,trail):
            if id in trail:errors.append(f'{relation} cycle at {id}');return
            node=by_id.get(id,{})
            targets=[node[key]] if key=='parent' and node.get(key) else node.get(key,[]) if key!='parent' else []
            for target in targets:visit(target,trail|{id})
        for r in records:
            if r['type']=='SubjectTopic':visit(r['id'],set())
    seen=set()
    for c in crosswalks:
        require(by_id.get(c.get('topic_id'),{}).get('type')=='SubjectTopic','Crosswalk missing canonical topic')
        source=by_id.get(c.get('source_id'),{})
        require(source.get('type')=='Source' and bool(source.get('checked_at')),'Crosswalk missing checked Source')
        require(c.get('relation') in ['exact','partial','broader','narrower'],'Invalid directed crosswalk relation')
        require(bool(c.get('rationale')) and bool(c.get('canonical_scope')),'Crosswalk missing scope/rationale')
        require(all(c.get('node',{}).get(k) for k in ['id','label','section']),'Crosswalk missing source node locator')
        key=(c.get('topic_id'),c.get('source_id'),c.get('node',{}).get('id'))
        require(key not in seen,'Duplicate crosswalk');seen.add(key)
    for r in records:
        if r['type']=='SubjectTopic' and r.get('parent'):require(any(c['topic_id']==r['id'] for c in crosswalks),f'{r["id"]}: no curriculum provenance')
    require(len(migration['tools'])==len(read('registries/frontend-tools.yaml')['tools']),'Tool adapter incomplete')
    require(len(migration['mechanisms'])==len(read('registries/frontend-mechanisms.yaml')['mechanisms']),'Mechanism adapter incomplete')
    require(len(migration['curriculum_subjects'])==len(read('registries/curriculum-subjects.yaml')['subjects']),'Curriculum migration incomplete')
    require(len(migration['families'])==len(read('registries/subject-visualization-families.yaml')['families']),'Family migration incomplete')
    for m in migration['curriculum_subjects']:
        require(all(s in by_id for s in m['source_ids']),'Curriculum migration dangling source')
    if errors:raise ValueError('\n'.join(errors))
    return dict(records=len(records),content=dict(Counter(r['type'] for r in records)),examples=dict(Counter(r['kind'] for r in records if r['type']=='Example')),crosswalks=len(crosswalks),adapter_counts={k:len(v) for k,v in migration.items()})

if __name__=='__main__':
    print(json.dumps(validate(*inputs()),indent=2))
