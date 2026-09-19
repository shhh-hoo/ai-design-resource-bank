# AIDRB V1 Data Model — RC2 relational projection

Status: **RC2 implementation candidate, not frozen.** This is a generated SQLite/query projection over the existing canonical corpus; it does not replace `knowledge/`, `subjects/`, `resources/`, `schemas/core.schema.json`, or the current catalog builder.

Design sources:

- Product architecture: [AIDRB — North Star](https://docs.google.com/document/d/1oFwGGkhMwVhMacZUzXdqhHyflb5DA3gQrRFn0iGw-CA/edit)
- Detailed data-model review: [AIDRB — V1 Data Model & ERD · RC1/RC2 review](https://docs.google.com/document/d/13WDdd0iL0u5arYFBoVXj7fUE77FYwzo3G6Yxwixl4Tw/edit)

The documents are independent and are reconciled against real cases, query needs, maintenance cost and validation results rather than by a fixed precedence rule.

## Core decisions

Creative World remains primary. Canonical content identities remain Concept, Example, Tool and Resource. Academic World (Subject / Knowledge Point) and implementation resolution (Capability / Primitive) are required orthogonal dimensions.

Representation methods do **not** get a parallel identity table. A representation method is a multi-valued role of a Concept (`representation_method`), so Dictionary, Subject, Example and Resource views can refer to the same stable Concept ID. This does **not** make the existing generated `Method` view canonical: `Method` remains an Example-specific synthesized view, while `representation_method` names a reusable generic Concept.

Observed facts and contextual recommendations are separate. `built_with` requires evidence of actual use; `can_implement_with`, `use_when`, `avoid_when`, knowledge-point representation choices, similarity and alternatives remain reviewable recommendations with purpose, context, rationale and curator.

Knowledge structure is a graph. Subject membership is explicit; knowledge-point relations distinguish `is_a`, `part_of`, `related_to`, `contrasts_with` and scoped `prerequisite_for`. A navigation tree is only one projection of those relations.

Tool resolution is Tool + Capability + Primitive. Primitive↔Capability is many-to-many. Tool subtypes preserve the existing canonical Atlas vocabulary (`library`, `renderer`, `simulation-engine`, `authoring-editor`, etc.). Support rows retain mode/scope/provider semantics; actual Example/Resource use of a Primitive is recorded separately.

Source projection preserves the existing canonical provenance contract: `locator_type + locator`, captured/checked dates and checking scope. `Source.url` is not reintroduced; URL is only one locator type. Evidence locators point to the exact supporting segment inside a versioned Source. Existing stable namespaces are preserved rather than renamed (`ex:*`, `concept:*`, `tool:*`, `resource:*`, `source:*`, `topic:*`, `intent:*`, `collection:*`). The normalized `subjects` projection uses existing root `topic:*` identities; it does not mint `subject:*` aliases. New support records use explicit namespaces such as `capability:*`, `primitive:*`, `domain:*` and `evidence:*`.

## RC2 fixes from adversarial testing

RC1 passed its initial 18 structural tests but nine adversarial checks exposed six lifecycle/publication defects. RC2 fixes them without adding a new world or changing the core object model:

1. Evidence support locators are non-blank and fact views require a non-blank supporting locator.
2. Editing an accepted evidence set, recommendation, knowledge-point representation or intent invalidates the previous review state.
3. Intent curation requires non-empty rationale and validator-enforced `context.purpose`.
4. `native` / `addon` capability support cannot name an external provider; `external` requires a distinct provider.
5. All factual relation tables have guarded `fact_*` publication views, not only `entity_relations`.
6. Entity content edits mark the compiler-owned record hash stale; the validator rejects stale hash state until the compiler recomputes it.

Hot-path reverse indexes are also added for intent→entity, subject→entity and inbound recommendations.

## Files

- `projections/relational-v1/01-core.sql` — 15 object/support tables.
- `projections/relational-v1/02-relations.sql` — 16 relation tables.
- `projections/relational-v1/03-constraints-views.sql` — endpoint typing, review invalidation, hash-staleness triggers, reverse indexes and guarded `fact_*` views.
- `scripts/validate_relational_model.py` — schema loader plus cross-table, graph, evidence, source-date and publication checks; `--self-check` builds an in-memory database.
- `tests/test_relational_model.py` — 20 baseline/compatibility structural tests.
- `tests/test_relational_model_adversarial.py` — heterogeneous positive cases and adversarial lifecycle/publication/index checks.

## Verification in this PR

Local reference run before opening the PR:

- baseline/compatibility structural tests: **20/20 passed**
- adversarial/integration suite: **18/18 passed**
- total: **38/38 passed**
- relational schema self-check: passed
- full existing-repository drift/browser suite: pending GitHub CI (the isolated runner did not have a network clone of the repository)

The tests use in-memory SQLite and synthetic fixtures. They prove the modeled structural behavior only; they do not prove reference quality, scientific correctness, retrieval quality or frontend-generation improvement.

## Still required before freeze

RC2 remains unfrozen until real corpus migration and product-level validation pass: heterogeneous real references/resources without forced identities, consistent Web/Machine projections for the same ID/revision/evidence, commit-before-lock integrity, and the three M1 briefs (theatrical portfolio, high-density editorial page, subject visualization).

## Migration compatibility notes

The projection intentionally allows metadata that the current canonical corpus does not yet state to remain NULL instead of inferring it. In particular, `examples.origin_kind`, `resources.resource_type`, artifact MIME/origin fields, and Collection curator metadata are optional in the relational projection. A migration may populate them only when the canonical record or a reviewed transform supports the value. Existing Concept subtypes such as `knowledge` and `mechanism` remain valid roles; `representation_method` is additive rather than a destructive rename.
