# Agent Instructions

This repository is an **AI-usable design resource bank**, not a bookmark dump, curriculum site, or single-purpose knowledge atlas.

## Governing product authority
The authoritative product-level specification is the Google Doc **AIDRB — North Star, Architecture v2**:
https://docs.google.com/document/d/1oFwGGkhMwVhMacZUzXdqhHyflb5DA3gQrRFn0iGw-CA/edit

Read it before making product architecture, information architecture, ontology, navigation, migration, or milestone decisions. Repository contracts may specify narrower implementation details, but they must not supersede or silently reinterpret the North Star. `docs/KNOWLEDGE-ATLAS-CONTRACT.md` is only the Chemistry Subject Pack / Atlas implementation contract.

AIDRB's Core contains Concept, Example, Tool and Resource content, plus relations and provenance. Intent, Collection and SubjectTopic are overlays. Visual / Interactive and Machine Retrieval are parallel projections over the same bank.

## Preservation rule
Existing high-quality references, live demos and interactive studies are product assets. Do not treat them as disposable legacy UI. During migrations: inventory existing visible/interactive examples before replacing a projection; preserve their stable identity and provenance; keep them browseable and deployable until a verified replacement exists; represent concrete demos/references as Examples, not only as Concept metadata; add regression coverage for preserved examples.

Keeping files in Git while removing them from the generated bank or deployment is not preservation.

## Resource ingest
When a user provides potentially reusable material, process it using `skills/resource-ingest/SKILL.md`. Do not force every Example into a Resource Package. Example means something concrete that can be observed, tried or compared. Resource means implementation material intended for direct reuse. A useful Example may yield zero Resources.

## Capability selection before implementation
For frontend visual, interactive, scientific, educational, diagrammatic, animation, canvas, 3D, or map work, do not hand-build first. Read `registries/frontend-tools.yaml`, `registries/frontend-mechanisms.yaml`, `docs/FRONTEND-CAPABILITY-MAP.md`, relevant reference galleries and `skills/select-frontend-resource/SKILL.md`; prefer an existing verified Resource Package when one already captures the mechanism. Registries are discovery infrastructure, not proof that every upstream tool has been locally validated.

Prefer domain semantics over generic rendering when correctness matters.

## Visual / Interactive resource bank
The global projection is a resource-bank browsing surface. Preserve the North Star views and roles:
- **Explore** — discover Examples by intent, visual trait, interaction, medium and collection.
- **Examples** — directly see/try concrete references and live studies before reading taxonomy.
- **Dictionary** — learn Concept vocabulary through grounded Examples.
- **Subjects** — enter domain-specific Subject Packs such as Chemistry.
- **Collections** — curated cross-media groupings.
- **Index** — compact exhaustive lookup; useful as a utility, not the product identity.

Subject Packs may use their own knowledge hierarchy internally, but they do not own global navigation. A general Example does not require `subject_id` or `topic_ids`.

Follow `docs/EDITORIAL-UI-CONTRACT.md` for presentation quality and `docs/KNOWLEDGE-ATLAS-CONTRACT.md` only when working on the Chemistry Subject Pack.

## Source of truth and generated data
Edit canonical inputs under `knowledge/`, `subjects/`, and `resources/`. Existing registries remain compatibility inputs until explicitly migrated. Do not hand-edit generated `catalog/` or `catalog.yaml`; regenerate with `python3 scripts/build_catalog.py` and verify with `--check`. Stable IDs are semantic identities and must survive presentation or filesystem changes. Web and machine projections must resolve the same IDs.

## Provenance and rights
For third-party resources, preserve source locators and attribution. Do not copy third-party binary assets into this public repository unless the license/permission is clear. A public link is not itself redistribution permission.

## Quality bar
A bank entry should let a capable future agent determine what it is, what can actually be seen/tried, which Concepts it demonstrates, how it might be implemented or reused, and what evidence/constraints/fidelity/rights limits apply. Never reduce a strong visual reference to vague adjectives or metadata-only taxonomy. Preserve the concrete thing that made it worth keeping.
