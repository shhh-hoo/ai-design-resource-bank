# AI Design Resource Bank

AIDRB is a **design resource bank** with one canonical Core and two parallel access layers: a Visual / Interactive projection for seeing, trying and comparing resources, and a Machine Retrieval projection for structured search and AI use.

The bank contains concrete **Examples**, reusable **Concepts**, implementation **Tools**, executable/reusable **Resources**, relations and provenance. Subject Packs such as Chemistry are domain overlays inside the same bank; they do not define the whole product.

**Explore | Examples | Dictionary | Subjects | Collections | Index**

## Current content
The current bank includes the Chemistry Subject Pack plus the preserved interactive mechanism studies that predate PR #12. Those earlier demos are first-class Examples again rather than hidden legacy files: camera dolly, orbital overlap, depth parallax, split-text reveal, particle attractor, noise-threshold wipe, explode/assemble, scroll scrub, stage spotlight, bond morph, graph relayout, canvas focus lens and anchored callout.

Chemistry remains a vertical slice: 12 canonical knowledge areas and 48 mapped example slots (6 Chemistry LIVE, 16 REFERENCE, 26 explicit GAPs). The global bank also contains non-subject Examples; an Example does not need to belong to a Subject Pack.

## Run
Requires Python 3.12+, PyYAML, jsonschema, and Node 24+ for tests.
```sh
python3 -m pip install pyyaml jsonschema
npm ci
npm run build
npm run dev
```
Open `http://127.0.0.1:4173`. The default view is Examples. The current projection loads the generated web index; deeper records remain lazy. Preserved pre-Atlas demos are loaded only when their Example is opened.

## Source of truth
The product-level authority is the Google Doc **AIDRB — North Star, Architecture v2**. Repository implementation contracts are subordinate to it and may not silently redefine the product.

| Location | Responsibility |
| --- | --- |
| `knowledge/` | Concepts, Examples, new Tools, Intents, Collections and normalized Sources |
| `subjects/` | Domain/Subject Pack knowledge maps and curriculum provenance |
| `resources/` | Authoritative Resource Packages, extracted only where useful |
| `registries/` | Preserved compatibility/discovery inputs |
| `catalog/` | Generated web/AI indexes, resolve records, relations and FTS input |
| `app/` | Current Visual / Interactive resource-bank projection |
| `web/` + `legacy.html` | Preserved interactive implementations still used by first-class Examples during migration |

## Preservation contract
Architecture migration must not make existing good examples disappear. Before replacing a presentation layer, inventory visible/interactive content and retain it as canonical Examples. A file that remains in Git but is absent from the generated bank or Pages deployment is considered lost from the product. The thirteen pre-PR12 mechanism demos are covered by preservation regressions and remain deployable through their original implementation while newer presentation components can be developed incrementally.

## Retrieve and select
```sh
python3 scripts/retrieve.py query 'stage spotlight' --type Example
python3 scripts/retrieve.py resolve ex:stage-spotlight-interactive-study
python3 scripts/retrieve.py query 'reaction profile' --type Example
```
Selections preserve exact Example IDs, aspect notes and constraints before AI lock/deep fetch. Visual and machine retrieval may explore independently before commit.

## Validate
```sh
npm run validate
npm test
npx playwright install chromium
npm run test:browser
npm run build:site
```
Browser tests exercise the staged Pages artifact, including the global resource-bank views, preserved interactive demos, Chemistry Subject Pack, selection/lock behavior, mobile overflow and provenance escaping. Generated catalog drift is rejected.

## Contracts
- Google Doc **AIDRB — North Star, Architecture v2** — authoritative product definition and architecture.
- [`docs/KNOWLEDGE-ATLAS-CONTRACT.md`](docs/KNOWLEDGE-ATLAS-CONTRACT.md) — subordinate Chemistry Subject Pack implementation contract.
- [`docs/EDITORIAL-UI-CONTRACT.md`](docs/EDITORIAL-UI-CONTRACT.md) — presentation quality and progressive disclosure.
- [`skills/aidrb-retrieve/SKILL.md`](skills/aidrb-retrieve/SKILL.md) — machine retrieval and identity discipline.
- [`skills/resource-ingest/SKILL.md`](skills/resource-ingest/SKILL.md) — ingestion and optional Resource extraction.
