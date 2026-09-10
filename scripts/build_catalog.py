#!/usr/bin/env python3
"""Build reproducible text projections; SQLite is generated locally/CI from fts-input.jsonl."""
import argparse
import json
import sqlite3
from atlas_core import ROOT, inputs, generate_relations, build_view, encoded, fingerprint, record_path, validate_shapes


def build(output=ROOT/'catalog', check=False):
    records,aliases,migration,crosswalks=inputs()
    validate_shapes(records)
    records=sorted(records,key=lambda r:r['id'])
    by_id={r['id']:r for r in records}
    if len(by_id)!=len(records): raise ValueError('Duplicate canonical ID')
    relations=generate_relations(records)
    stamp=fingerprint()
    examples=[r for r in records if r['type']=='Example']
    topics=[r for r in records if r['type']=='SubjectTopic']
    web_fields=['id','title','kind','subject_id','topic_ids','concept_ids','medium','visual_traits','interaction','intent_ids','collection_ids','preview','gap_reason','demo_url']
    web=dict(version=1,examples=[dict({k:r[k] for k in web_fields if k in r},resolve_path='catalog/'+record_path(r['id'])) for r in examples],topics=topics,intents=[r for r in records if r['type']=='Intent'],collections=[r for r in records if r['type']=='Collection'])
    ai=[]
    for r in records:
        if r['type']=='Source': continue
        keys=['id','type','kind','title','summary','aliases','use_when','avoid_when','subject_id','topic_ids','concept_ids','visual_traits','medium','interaction','intent_ids','collection_ids','preview','lifecycle','verification','resource_ids','tool_ids','canonical_path','demo_url']
        a={k:r[k] for k in keys if k in r}
        if r['type']=='Example':
            a['tool_ids']=[t['id'] for t in r['tool_choices']]
            a['avoid_when']=' '.join(r['failure_modes'])
        a['resolve_path']='catalog/'+record_path(r['id'])
        a['aliases']=[alias for alias,target in aliases.items() if target==r['id']]
        ai.append(a)
    outputs={'web-index.json':encoded(web),'relations.json':encoded(relations),'aliases.json':encoded(aliases),'migration.json':encoded(migration),'crosswalks.json':encoded(crosswalks),'index.json':encoded([dict(id=r['id'],type=r['type'],title=r['title'],resolve_path='catalog/'+record_path(r['id'])) for r in records]),'dictionary.json':encoded([dict(id=r['id'],title=r['title'],summary=r.get('summary',''),example_ids=[e['id'] for e in examples if r['id'] in e['concept_ids']],adjacent_ids=sorted({c for e in examples if r['id'] in e['concept_ids'] for c in e['concept_ids'] if c!=r['id']})) for r in records if r['type']=='Concept']),'ai-index.jsonl':b''.join((json.dumps(a,ensure_ascii=False,sort_keys=True)+'\n').encode() for a in ai)}
    fts=[]
    for a in ai:
        r=by_id[a['id']]
        context=[by_id[x]['title'] for x in r.get('topic_ids',[])+r.get('concept_ids',[])+r.get('intent_ids',[])+r.get('collection_ids',[])]
        fts.append(dict(id=r['id'],type=r['type'],kind=r.get('kind',''),title=r['title'],text=' '.join([str(a.get(k,'')) for k in ['summary','aliases','use_when','avoid_when','visual_traits','medium','interaction']]+context)))
    outputs['fts-input.jsonl']=b''.join((json.dumps(a,sort_keys=True)+'\n').encode() for a in fts)
    for r in records:
        result=dict(record=r,relations=[e for e in relations if r['id'] in (e['source'],e['target'])],sources=[by_id[s] for s in r.get('source_refs',[])])
        if r['type']=='Example':
            result['ai_build']=build_view(r,by_id)
            result['crosswalks']=[x for x in crosswalks if x['topic_id'] in r.get('topic_ids',[])]
            result['sources']+=[by_id[s] for s in sorted({x['source_id'] for x in result['crosswalks']}) if s not in r['source_refs']]
        outputs[record_path(r['id'])]=encoded(result)
    outputs['manifest.json']=encoded(dict(version=1,fingerprint=stamp,record_count=len(records),relation_count=len(relations),example_counts={k:sum(e['kind']==k for e in examples) for k in ['LIVE','REFERENCE','GAP']},crosswalk_count=len(crosswalks),major_topics=sum(t['parent'] is not None for t in topics)))
    legacy=dict(version=1,resources=[dict(id=r['legacy_id'],title=r['title'],domain=r['domain'],tags=r.get('tags',[]),path=r['package_path'],status=r['status'],hint=r['summary']) for r in records if r['type']=='Resource'])
    if check:
        for name,data in outputs.items():
            path=output/name
            if not path.exists() or path.read_bytes()!=data: raise ValueError(f'Generated drift: {path.relative_to(ROOT)}')
        actual={p.relative_to(output).as_posix() for p in output.rglob('*') if p.is_file() and p.name!='search.sqlite'}
        if actual!=set(outputs): raise ValueError(f'Unexpected catalog files: {actual-set(outputs)}')
        if (ROOT/'catalog.yaml').read_bytes()!=encoded(legacy): raise ValueError('Generated drift: catalog.yaml')
    else:
        output.mkdir(parents=True,exist_ok=True)
        for p in output.rglob('*'):
            if p.is_file() and p.relative_to(output).as_posix() not in outputs and p.name!='search.sqlite': p.unlink()
        for name,data in outputs.items():
            p=output/name; p.parent.mkdir(parents=True,exist_ok=True); p.write_bytes(data)
        (ROOT/'catalog.yaml').write_bytes(encoded(legacy))
    db=output/'search.sqlite'
    if db.exists(): db.unlink()
    con=sqlite3.connect(db)
    con.execute('CREATE VIRTUAL TABLE search USING fts5(id UNINDEXED, type UNINDEXED, kind UNINDEXED, title, text, tokenize="unicode61")')
    con.executemany('INSERT INTO search VALUES (:id,:type,:kind,:title,:text)',fts)
    con.commit(); con.close()
    print(json.dumps(dict(records=len(records),relations=len(relations),examples=len(examples),crosswalks=len(crosswalks),drift='clean' if check else 'generated')))

if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('--check',action='store_true'); args=p.parse_args(); build(check=args.check)
