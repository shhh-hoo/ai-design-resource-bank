"""Canonical input adapters and generated projections. No catalog data is read here."""
from pathlib import Path
import hashlib
import json
import re
from datetime import date
from jsonschema import Draft202012Validator, FormatChecker
import yaml

ROOT = Path(__file__).resolve().parents[1]
CONTENT_TYPES = {'Concept', 'Example', 'Tool', 'Resource'}
TYPES = CONTENT_TYPES | {'Intent', 'Collection', 'SubjectTopic', 'Source'}
ID_PREFIX = {'Concept':'concept','Example':'ex','Resource':'resource','Tool':'tool',
             'SubjectTopic':'topic','Intent':'intent','Collection':'collection','Source':'source'}
RELATIONS = {
 'demonstrates': ('Example', 'Concept'), 'intended_to_demonstrate': ('Example', 'Concept'), 'implemented_with': (('Example', 'Concept'), 'Tool'),
 'yields': ('Example', 'Resource'), 'implements': ('Resource', 'Concept'),
 'requires': ('Resource', 'Tool'), 'has_example': ('SubjectTopic', 'Example'),
 'part_of': ('SubjectTopic', 'SubjectTopic'), 'prerequisite': ('SubjectTopic', 'SubjectTopic'),
 'supports_intent': ('Example', 'Intent'), 'in_collection': ('Example', 'Collection'),
 'derived_from': ('Concept', 'Concept'),
}

def read(path):
    return yaml.safe_load((ROOT / path).read_text(encoding='utf-8'))

def encoded(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + '\n').encode()

def record_path(id):
    """Catalog-relative POSIX path, independent of the stable ID's punctuation.

    Escape Windows device basenames with an underscore (not allowed in IDs),
    keeping this mapping injective, including ex:con and tool:com1.
    """
    if not isinstance(id,str) or not re.fullmatch(r'[a-z]+:[a-z0-9-]+',id):
        raise ValueError('Invalid stable ID')
    namespace,slug=id.split(':')
    if namespace not in ID_PREFIX.values():raise ValueError('Invalid stable ID namespace')
    reserved={'con','prn','aux','nul'} | {f'{p}{i}' for p in ['com','lpt'] for i in range(1,10)}
    if slug in reserved:slug='_'+slug
    return f'records/{namespace}/{slug}.json'

def validate_shapes(records):
    """Reject malformed inputs before semantic validation or projection generation."""
    schema=json.loads((ROOT/'schemas/core.schema.json').read_text(encoding='utf-8'))
    Draft202012Validator.check_schema(schema)
    validator=Draft202012Validator(schema,format_checker=FormatChecker())
    errors=[]
    for record in records:
        for error in validator.iter_errors(record):
            id=record.get('id','<unknown>') if isinstance(record,dict) else '<non-record>'
            path='/'.join(map(str,error.absolute_path)) or '<record>'
            errors.append(f'{id}: schema {path}: {error.message}')
    if errors:raise ValueError('\n'.join(errors))

def source(id, title, publisher, locator, path, checked=None, scope='Legacy discovery evidence; upstream implementation not validated locally.', locator_type='url'):
    return dict(id=id, type='Source', title=title, publisher=publisher, locator_type=locator_type, locator=locator,
                captured_at='2026-09-10', checked_at=checked, check_scope=scope, canonical_path=path)

def inputs():
    records, aliases, migration = [], {}, {'mechanisms': [], 'tools': [], 'curriculum_subjects': [], 'families': [], 'resources': []}
    for base in ['knowledge', 'subjects']:
        for path in sorted((ROOT / base).rglob('*.json')):
            if path.name == 'adapter.json' or 'curriculum' in path.parts:
                continue
            data = json.loads(path.read_text(encoding='utf-8'))
            for r in data if isinstance(data, list) else [data]:
                records.append(dict(r, canonical_path=path.relative_to(ROOT).as_posix()))
    def add(r, alias=None):
        records.append(r)
        if alias:
            if alias in aliases:
                raise ValueError(f'Ambiguous legacy alias: {alias}')
            aliases[alias] = r['id']
    tool_path = 'registries/frontend-tools.yaml'
    normalization = read('knowledge/tools/adapter.json')['subtype_map']
    for old in read(tool_path)['tools']:
        sid = 'source:tool-' + old['id']
        add(source(sid, old['name'] + ' official documentation', old['name'], old['docs'], tool_path))
        r = {k:v for k,v in old.items() if k not in ['id','name','kind']}
        r.update(id='tool:'+old['id'], type='Tool', title=old['name'], subtype=normalization[old['kind']],
                 legacy_kind=old['kind'], summary=old['use_when'], canonical_path=tool_path, source_refs=[sid])
        add(r, old['id']); migration['tools'].append(r['id'])
    mech_path = 'registries/frontend-mechanisms.yaml'
    add(source('source:legacy-mechanisms', 'Legacy mechanism registry', 'AIDRB',
               'https://github.com/shhh-hoo/ai-design-resource-bank/blob/main/'+mech_path, mech_path))
    for old in read(mech_path)['mechanisms']:
        r = dict(id='concept:'+old['id'], type='Concept', title=old['name'], subtypes=['mechanism'],
                 summary=old['summary'], use_when=old['use_when'], primitives=old['primitives'],
                 implementation_note=old['implementation_note'], tool_ids=['tool:'+x for x in old['tools']],
                 evidence='seed', source_refs=['source:legacy-mechanisms'], canonical_path=mech_path)
        add(r, old['id']); migration['mechanisms'].append(r['id'])
    family_path='registries/subject-visualization-families.yaml'
    add(source('source:legacy-families','Legacy subject family seeds','AIDRB',
               'https://github.com/shhh-hoo/ai-design-resource-bank/blob/main/'+family_path, family_path))
    family = read(family_path)
    for id, old in family['grammars'].items():
        add(dict(id='concept:grammar-'+id,type='Concept',title=id.replace('-',' ').title(),subtypes=['grammar'],
                 summary=old['description'],tool_ids=['tool:'+x for x in old['default_tools']],
                 source_refs=['source:legacy-families'],canonical_path=family_path))
    migration['families']=[dict(id=id,source_id='source:legacy-families',legacy_record=old) for id,old in family['families'].items()]
    research_path='registries/curriculum-research-sources.yaml'
    for family_id, entries in read(research_path)['families'].items():
        for i, old in enumerate(entries):
            add(source(f'source:curriculum-{family_id}-{i}',old['label'],old['program'],old['url'],research_path))
    gallery_path='registries/reference-galleries.yaml'
    for old in read(gallery_path)['galleries']:
        add(source('source:gallery-'+old['id'],old['name'],old['name'],old.get('url',old.get('homepage')),gallery_path))
    curriculum_path='registries/curriculum-subjects.yaml'
    curriculum=read(curriculum_path)
    for i,(label,url) in enumerate(curriculum['sources'].items()):
        add(source('source:curriculum-directory-'+str(i),label.replace('_',' '),
                   'College Board' if label.startswith('ap') else 'Cambridge International Education',url,curriculum_path))
    for old in curriculum['subjects']:
        refs=[r['id'] for r in records if r['id'].startswith('source:curriculum-'+old['family']+'-')]
        migration['curriculum_subjects'].append(dict(legacy_id=old['id'],legacy_record=old,source_ids=refs,
            canonical_path=curriculum_path,disposition='provenance-only; requires curated canonical topic mapping'))
    for path in sorted((ROOT/'resources').glob('**/resource.yaml')):
        old=read(path); rel=path.relative_to(ROOT).as_posix(); sid='source:resource-'+old['id']
        legacy_source=old.get('source')
        if legacy_source:
            add(source(sid,legacy_source.get('title') or old['title'],legacy_source.get('author') or 'Legacy package source',
                       legacy_source['locator'],rel,locator_type=legacy_source['type'],
                       scope='Legacy package provenance; not independently checked.'))
            for key in ['author', 'notes']:
                if key in legacy_source: records[-1][key]=legacy_source[key]
            captured=legacy_source['captured_at']
            records[-1]['captured_at']=captured.isoformat() if isinstance(captured,date) else captured
            refs=[sid]
        else: refs=old['source_refs']
        r={k:v for k,v in old.items() if k!='source'}
        r.update(id='resource:'+old['id'],type='Resource',legacy_id=old['id'],canonical_path=rel,
                 package_path=path.parent.relative_to(ROOT).as_posix(),summary=old['mechanism']['summary'],source_refs=refs)
        add(r,old['id']); migration['resources'].append(r['id'])
    crosswalks=[]
    for path in sorted((ROOT/'subjects').glob('*/curriculum/*.json')):
        crosswalks.extend(json.loads(path.read_text(encoding='utf-8')))
    return records,aliases,migration,crosswalks

def generate_relations(records):
    edges=[]
    def edge(a,t,b,**extra): edges.append(dict(source=a,type=t,target=b,**extra))
    for r in records:
        id=r['id']
        if r['type']=='Example':
            for x in r['concept_ids']:edge(id,'intended_to_demonstrate' if r['kind']=='GAP' else 'demonstrates',x)
            for x in r['tool_choices']:edge(id,'implemented_with',x['id'],evidence=x['evidence'],reason=x['reason'])
            for x in r['resource_ids']:edge(id,'yields',x)
            for x in r['intent_ids']:edge(id,'supports_intent',x)
            for x in r['collection_ids']:edge(id,'in_collection',x)
        if r['type']=='Concept':
            for x in r.get('tool_ids',[]):edge(id,'implemented_with',x,evidence='proposed',reason='Legacy registry recommendation, not observed implementation.')
        if r['type']=='SubjectTopic':
            if r['parent']:edge(id,'part_of',r['parent'])
            for x in r['example_ids']:edge(id,'has_example',x)
            for x in r['prerequisites']:edge(id,'prerequisite',x)
        if r['type']=='Resource':
            for x in r.get('implements',[]):edge(id,'implements',x)
            for x in r.get('requires',[]):edge(id,'requires',x)
    return sorted(edges,key=lambda e:(e['source'],e['type'],e['target']))

def build_view(example, by_id):
    if example['type']!='Example':return None
    mechanisms=[by_id[x] for x in example['concept_ids'] if 'mechanism' in by_id[x].get('subtypes',[])]
    return dict(example_id=example['id'],availability='missing' if example['kind']=='GAP' else 'available',
        method=dict(concepts=example['concept_ids'],mechanisms=[dict(id=m['id'],primitives=m['primitives'],
          implementation_note=m['implementation_note'],evidence=m['evidence']) for m in mechanisms],
          grammar=example['grammar'],interaction_model=example['interaction_model'],state_model=example['state_model'],
          transfer_constraints=example['transfer_constraints'],fidelity_constraints=example['fidelity_constraints'],
          failure_modes=example['failure_modes']),
        tools=[dict(record=by_id[t['id']],evidence=t['evidence'],reason=t['reason']) for t in example['tool_choices']],
        resources=[dict(id=x,title=by_id[x]['title'],package_path=by_id[x]['package_path'],status=by_id[x]['status']) for x in example['resource_ids']])

def fingerprint():
    paths=[]
    for d in ['knowledge','subjects','resources','registries','schemas','app']:
        paths.extend(p for p in (ROOT/d).rglob('*') if p.is_file())
    paths.extend([ROOT/'scripts/atlas_core.py',ROOT/'scripts/build_catalog.py'])
    h=hashlib.sha256()
    for p in sorted(paths,key=lambda p:p.relative_to(ROOT).as_posix()):
        h.update(p.relative_to(ROOT).as_posix().encode()+b'\0'+p.read_bytes())
    return h.hexdigest()
