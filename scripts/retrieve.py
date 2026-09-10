#!/usr/bin/env python3
"""Metadata/FTS candidates → stable-ID resolve → commit → lock → bounded deep fetch."""
import argparse
import hashlib
import json
import re
import sqlite3
from contextlib import closing
from pathlib import Path
from atlas_core import ROOT, encoded
CAT=ROOT/'catalog'

def load(name): return json.loads((CAT/name).read_text())
def resolve(id):
    id=load('aliases.json').get(id,id)
    if not re.fullmatch(r'[a-z]+:[a-z0-9-]+',id):raise ValueError('Invalid stable ID')
    path=CAT/'records'/f'{id}.json'
    if not path.is_file():raise ValueError(f'Unknown stable ID: {id}')
    return json.loads(path.read_text())

def query(brief,kind=None,limit=8):
    if not 1<=limit<=8:raise ValueError('Candidate limit must be 1–8')
    known=load('aliases.json').get(brief,brief)
    if re.fullmatch(r'[a-z]+:[a-z0-9-]+',known) and (CAT/'records'/f'{known}.json').exists():
        r=resolve(known)['record']
        return [dict(id=r['id'],type=r['type'],kind=r.get('kind',''),title=r['title'])] if kind is None or r['type']==kind else []
    terms=re.findall(r'[^\W_]+',brief,flags=re.UNICODE)
    if not terms:return []
    # Quoted tokens prevent user input from becoming FTS operators; OR gives compact broad-brief recall.
    match=' OR '.join('"'+t+'"' for t in terms)
    with closing(sqlite3.connect(CAT/'search.sqlite')) as db:
        sql='SELECT id,type,kind,title,bm25(search,0,0,0,8,1) AS score FROM search WHERE search MATCH ?'
        params=[match]
        if kind:sql+=' AND type = ?';params.append(kind)
        sql+=' ORDER BY score,id LIMIT ?';params.append(limit)
        return [dict(zip(['id','type','kind','title','score'],r)) for r in db.execute(sql,params)]

def digest(value):return hashlib.sha256(encoded(value)).hexdigest()
def commit(selection):
    if selection.get('selector') not in ['human','agent','mixed']:raise ValueError('Selector must be human, agent or mixed')
    items=selection.get('selections',[])
    if not isinstance(items,list) or not items:raise ValueError('Selection must not be empty')
    seen=set()
    for item in items:
        if set(item)-{'id','aspect_notes','constraints'}:raise ValueError('Unsupported selection fields')
        id=item.get('id');r=resolve(id)['record']
        if id!=r['id']:raise ValueError('Commit requires exact stable IDs, not aliases')
        if r['type']!='Example' or r['kind']=='GAP':raise ValueError('Commit needs an available Example; GAP cannot be substituted')
        if id in seen:raise ValueError('Duplicate selection')
        seen.add(id)
        if not isinstance(item.get('aspect_notes',''),str):raise ValueError('Aspect notes must be text')
        if not isinstance(item.get('constraints',[]),list) or any(not isinstance(x,str) for x in item.get('constraints',[])):raise ValueError('Constraints must be strings')
    if set(selection)-{'selector','selections'}:raise ValueError('Unsupported selection fields')
    body=dict(version=1,state='committed',selection=selection,catalog_fingerprint=load('manifest.json')['fingerprint'])
    return dict(body,commit_digest=digest(body))

def lock(committed):
    if set(committed)!={'version','state','selection','catalog_fingerprint','commit_digest'}:raise ValueError('Expected a committed selection')
    regenerated=commit(committed['selection'])
    if committed!=regenerated:raise ValueError('Commit changed or catalog is stale; explicitly recommit')
    return dict(version=1,state='locked',committed=committed,locked_ids=[x['id'] for x in committed['selection']['selections']],lock_digest=digest(committed))

def deep_fetch(locked):
    if locked.get('state')!='locked':raise ValueError('Deep fetch requires AI lock')
    expected=lock(locked.get('committed',{}))
    if locked!=expected:raise ValueError('Lock changed; selected identities and notes must be preserved')
    from atlas_core import fingerprint
    if fingerprint()!=locked['committed']['catalog_fingerprint']:raise ValueError('Canonical inputs changed; rebuild and explicitly recommit')
    results=[]
    for selected in locked['committed']['selection']['selections']:
        result=resolve(selected['id']);packages=[]
        for hint in result['ai_build']['resources']:
            resource=resolve(hint['id'])['record'];package=(ROOT/resource['package_path']).resolve()
            package.relative_to((ROOT/'resources').resolve())
            files={}
            for name in ['resource.yaml','README.md']+[a['path'] for a in resource['artifacts']]:
                path=(package/name).resolve();path.relative_to(package)
                if path.stat().st_size>1_000_000:raise ValueError('Artifact exceeds inline fetch budget')
                try:files[name]=path.read_text()
                except UnicodeDecodeError:files[name]={'path':str(path.relative_to(ROOT)),'encoding':'binary','sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
            packages.append(dict(id=resource['id'],files=files))
        results.append(dict(selection=selected,resolved=result,packages=packages))
    return dict(locked_ids=locked['locked_ids'],contexts=results)

if __name__=='__main__':
    p=argparse.ArgumentParser();sub=p.add_subparsers(dest='stage',required=True)
    q=sub.add_parser('query');q.add_argument('brief');q.add_argument('--type',choices=['Concept','Example','Tool','Resource','SubjectTopic','Intent','Collection']);q.add_argument('--limit',type=int,default=8)
    r=sub.add_parser('resolve');r.add_argument('id')
    for name in ['commit','lock','fetch']:
        s=sub.add_parser(name);s.add_argument('file',type=Path)
    a=p.parse_args()
    try:
        if a.stage=='query':result=query(a.brief,a.type,a.limit)
        elif a.stage=='resolve':result=resolve(a.id)
        else:result={'commit':commit,'lock':lock,'fetch':deep_fetch}[a.stage](json.loads(a.file.read_text()))
        print(json.dumps(result,ensure_ascii=False,indent=2))
    except (ValueError,KeyError,FileNotFoundError,sqlite3.Error) as e:p.exit(1,f'{e}\n')
