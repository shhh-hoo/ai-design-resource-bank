# AI Design Resource Bank

A visual knowledge atlas and a machine retrieval projection over one canonical Core. Both can explore candidates in parallel; explicit selection commit comes before AI lock and deep Resource fetch.

**Atlas | Explore | Dictionary | Index**

The first Subject Pack is Chemistry: 12 canonical knowledge areas, 48 concrete example slots (6 LIVE, 16 REFERENCE, 26 honest GAPs). The inventory is explicit coverage planning, not a claim that every syllabus objective has a completed visualization. Cambridge 9701 and AP Chemistry are provenance inputs, not Human taxonomy.

## Run

Requires Python 3.12+, PyYAML, jsonschema, and Node 24+ for tests.

```sh
python3 -m pip install pyyaml jsonschema
npm ci
npm run build
npm run dev
```

Open `http://127.0.0.1:4173`. Root loads the Atlas from generated `catalog/web-index.json`. No old decision-board scripts, AI index, relation graph or full build records load at startup. Example detail loads its own compact resolve record and, for LIVE, the shared preview runtime. That preview code is distinct from machine-side full Resource Package fetch.

## Source of truth

| Location | Responsibility |
| --- | --- |
| knowledge/ | Concept, Example, new Tool, Intent, Collection and normalized Source records |
| subjects/ | Canonical subject/topic maps and directed curriculum crosswalks |
| resources/ | Authoritative Resource Packages; extracted only where useful |
| registries/ | Preserved legacy inputs, adapted by stable ID; no competing editable copies |
| catalog/ | Generated web/AI indexes, resolve records, typed relations, FTS input and SQLite |
| app/ | Lightweight visual projection |
| catalog.yaml | Generated Resource compatibility export |

Canonical **content** types are Concept, Example, Tool and Resource. Method is a generated per-Example AI Build view. Lifecycle properties `collected`, `showable`, `reusable`, `verified` are independent. REFERENCE does not imply reuse rights; GAP never pretends to be implemented.

## Retrieve and select

```sh
python3 scripts/retrieve.py query 'reaction profile' --type Example
python3 scripts/retrieve.py resolve ex:chemistry-reaction-profile
```

Create selection.json:

```json
{"selector":"agent","selections":[{"id":"ex:chemistry-reaction-profile","aspect_notes":"Borrow the linked marker.","constraints":["Coordinate is not time."]}]}
```

```sh
python3 scripts/retrieve.py commit selection.json > committed.json
python3 scripts/retrieve.py lock committed.json > locked.json
python3 scripts/retrieve.py fetch locked.json
```

The Web selection screen exports the same committed format; continue with `lock` directly. Browser selections remain in the current tab and are not persisted across reloads. Locks freeze exact identities, notes and the catalog fingerprint; stale/tampered locks fail instead of substituting references. Legacy aliases such as `reaction-coordinate` still resolve but commits require canonical Example IDs.

## Validate

```sh
npm run validate
npm test
npx playwright install chromium
npm run test:browser
npm run build:site
```

On a machine using installed Chrome, set `AIDRB_CHROME=1` for browser tests. Screenshots/results default to `.browser-test/`; CI uploads them as an artifact. Reviewed evidence for this PR lives under `docs/evidence/`. SQLite is generated from committed `fts-input.jsonl`, not committed as a version-dependent binary. `build_catalog.py --check` rejects text catalog drift and unexpected generated files.

CI validates the corrected Core, compatibility data, generated drift, retrieval/lock failures, scientific model constraints and actual browser behavior/startup budget. Pages stages `_site/` on main; no deployment or merge is required to review a PR. Legacy UI files remain under `web/` and `legacy.html`, outside startup. To run legacy evidence locally, generate `data/board.json`, `data/subject-atlas.json` with the old builders and run `npm run build:framework-demos` first.

## Contracts and limits

- [Corrected North Star v2.1](docs/KNOWLEDGE-ATLAS-CONTRACT.md): architecture, semantics, migration and tool decision.
- [Visual contract](docs/EDITORIAL-UI-CONTRACT.md): visual-first views and progressive disclosure.
- [Retrieval skill](skills/aidrb-retrieve/SKILL.md): machine workflow and identity discipline.
- [Resource ingestion](skills/resource-ingest/SKILL.md): optional extraction and rights.
- [Validation evidence](docs/evidence/REVIEW.md): measured results and unresolved scope.

This is a Chemistry vertical slice. Original diagrams are bounded teaching studies; scientific behavior checks do not imply external chemistry peer review. 26 slots are explicitly missing. Legacy tool recommendations preserve evidence/rights caveats and do not mean upstream tools were locally installed or validated. No third-party binary reference art is copied.
