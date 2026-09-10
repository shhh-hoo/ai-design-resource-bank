# Chemistry Subject Pack / Knowledge Atlas — implementation contract

## Authority and scope
The product-level authority is the Google Doc **AIDRB — North Star, Architecture v2**:
https://docs.google.com/document/d/1oFwGGkhMwVhMacZUzXdqhHyflb5DA3gQrRFn0iGw-CA/edit

This file is subordinate to that North Star. It specifies the Chemistry Subject Pack and supporting implementation details only. It must not rename, supersede, narrow, or redefine AIDRB as a whole. If this file conflicts with the North Star, the North Star wins and this file must be corrected.

AIDRB is a design resource bank whose canonical Core contains Concepts, Examples, Tools, Resources, relations and provenance. Visual / Interactive and Machine Retrieval are parallel projections over that bank. Subject Packs are domain overlays; they do not own global information architecture or require every Example to belong to a subject.

## Chemistry Subject Pack
Chemistry maintains its own canonical knowledge map under `subjects/chemistry/`, with topic hierarchy, prerequisites, mapped Examples and curriculum provenance. Cambridge/AP mappings answer coverage/provenance questions; curriculum labels do not become the global bank taxonomy.

Chemistry Examples may be LIVE, REFERENCE or GAP. GAP means a named missing example and cannot carry a fabricated preview, implementation claim or reusable package. `collected`, `showable`, `reusable` and `verified` remain independent lifecycle flags. Verification must state evidence and scope.

The Chemistry UI is reached through the global **Subjects** view. A subject topic may have an Atlas-like visual inventory, but “Atlas” is not the product identity or required global home page.

## Global Example compatibility
An Example is any concrete reference, generated study, live demo, diagram, sequence or other perceivable/inspectable/tryable/comparable instance. `subject_id` and `topic_ids` are optional overlays. A stagecraft demo, typography study, cinema reference or interaction example is valid without any SubjectTopic.

Pre-existing visible or interactive examples are product assets, not migration debris. Architecture work must preserve their Example identity and user-visible accessibility unless they are explicitly deprecated with a documented replacement. Keeping implementation files in Git while removing them from the generated catalog or deployment counts as a preservation failure.

## Core and generated projections
Concept, Example, Tool and Resource are the four canonical content types. Intent, Collection and SubjectTopic are organization overlays. Source is provenance. Grammar is descriptive metadata. Method is a generated per-Example view rather than a fifth content entity.

Hand-edit canonical inputs under `knowledge/`, `subjects/` and `resources/`. Existing registries remain compatibility inputs until explicitly migrated. `catalog/` and `catalog.yaml` are generated and drift-checked. Stable IDs are identities, not filenames. `scripts/atlas_core.py::record_path(id)` maps IDs to portable catalog paths. Web and machine indexes publish the same resolve pointers.

## Selection and retrieval
Visual / Interactive and Machine Retrieval may discover and compare in parallel. Candidate query → stable-ID resolve/compare → explicit selection commit → AI lock → bounded deep fetch. Commit preserves exact Example IDs, aspect notes and constraints. Lock refuses changed IDs, changed notes, stale catalogs or GAP substitution.

## Provenance
Source records use `locator_type + locator`; locators are not assumed to be URLs. File names, uploads, repository references, DOI strings and prompt text retain their semantics. Browser rendering only links actual HTTP(S) locators and escapes local/prompt text.

## Preservation invariant
The pre-PR12 mechanism workbench is retained as a set of first-class Examples, not merely Concept metadata. Its thirteen interactive demos remain deployable and browseable while they are incrementally migrated into newer presentation components. Exact original implementations may be reused as preserved views during that transition.

## Validation
Validation covers schema shapes, typed relations, provenance, subject cycles/inventory, crosswalks, generated drift, retrieval/lock identity, portable record paths and browser behavior. Browser tests must cover both global resource-bank examples and Chemistry Subject Pack behavior. A migration is not complete if an existing visible Example becomes unreachable from the deployed bank.
