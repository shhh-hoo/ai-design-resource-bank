# Agent Instructions

This repository is an **AI-usable design resource bank**, not a bookmark dump.

When a user provides a file, image, repository, article, website, video, prompt, UI reference, visual effect, component, or other potentially reusable resource, process it using `skills/resource-ingest/SKILL.md`.

## Governing architecture

Read `docs/KNOWLEDGE-ATLAS-CONTRACT.md` first. It supersedes earlier board/subject routing instructions. Content entities are Concept, Example, Tool and Resource; Method is a generated view. Both projections operate over the same canonical Core. Machine retrieval uses explicit selection commit before AI lock; the Human projection has no selection workflow. Default navigation is Atlas | Explore | Dictionary | Index.

## Gathering and scouting

Before running any discovery sweep, read `docs/GATHERING-PROTOCOL.md`. New finds go to `inbox/candidates/` first and must validate against `inbox/candidate.schema.json`.

A scout may discover and inspect candidates, but it must not promote a candidate, create canonical records, or expand taxonomy merely to increase inventory. Promotion requires a separate curation decision based on marginal value, dedupe, saturation and retrieval gaps. Rejected/deferred candidates remain useful dedupe history.

## Core rule

Store the **reusable mechanism**, not merely the source.

Only accepted **reusable implementation material** becomes a Resource Package. Perceivable references are Examples and may yield zero Resources. Do not force extraction. Resource Packages live under:

`resources/<domain>/<slug>/`

At minimum, a package contains:

- `resource.yaml` — machine-readable manifest and provenance
- `README.md` — concise explanation of what is useful, how to use it, and what not to copy

Add only the artifact types that materially improve reuse, such as:

- `artifacts/prompt.md`
- `artifacts/SKILL.md`
- `artifacts/*.html`, `*.tsx`, `*.ts`, `*.css`
- `artifacts/*.svg`
- `artifacts/*.png`
- `artifacts/tokens.json`
- `artifacts/motion.json`
- `examples/`
- `tests/`

Do not manufacture every format for every resource.

## Capability selection before implementation

For frontend visual, interactive, scientific, educational, diagrammatic, animation, canvas, 3D, or map work, **do not hand-build first**.

Before choosing an implementation:

1. read `registries/frontend-tools.yaml`;
2. read `registries/frontend-mechanisms.yaml` for a reusable interaction/explanatory pattern before inventing one;
3. use `docs/FRONTEND-CAPABILITY-MAP.md` to identify the narrowest mature abstraction matching the hard problem;
4. use `registries/reference-galleries.yaml` when official examples or high-quality interaction references would help;
5. follow `skills/select-frontend-resource/SKILL.md` for nontrivial selection decisions;
6. prefer an existing verified Resource Package when one already contains the needed mechanism.

For subject-matter visualization, browse `subjects/` canonical knowledge and its concrete Example inventory first. Curriculum files supply provenance/crosswalks; they do not own Human taxonomy. Resolve selected Examples to generated Method + Tool + Resource evidence. Reuse legacy registries through `scripts/atlas_core.py`, never by making a competing editable copy.

Do not build one bespoke visualization stack per school subject. Curriculum labels are retrieval metadata; implementations should be shared when the underlying relationship is the same. A derivative, a supply-demand equilibrium, a migration flow, and a protein structure should not be forced through one generic renderer simply because all are “visualizations.”

The registries are discovery/selection infrastructure. They do **not** mean every listed external tool has already been validated locally or ingested as a Resource Package.

Prefer domain semantics over generic rendering when correctness matters: e.g. a chemistry toolkit before hand-drawn bond SVG, a math engine before manually implementing coordinates, a geospatial engine before raw Three.js Earth geometry, and an actual physics engine before timeline animation presented as simulation.

When a registry technique is used successfully and is worth reusing, promote the concrete mechanism into a Resource Package.

## Visual / Interactive Web

Follow `docs/EDITORIAL-UI-CONTRACT.md` and `docs/KNOWLEDGE-ATLAS-CONTRACT.md`.

- Default Atlas: Creative World first, grouped for cross-media recognition and comparison. Academic packs preserve subject → canonical topic → concrete example navigation as a secondary projection.
- Derive Human presentation strategy from canonical Example kind/medium/relations; do not add a competing presentation truth to canonical records.
- External REFERENCE, local LIVE and original Resource demo are visually and semantically distinct. Prefer actual original media for external references: open-license / explicit-embed media may render automatically; otherwise use publisher-controlled on-demand framing plus a direct source link. Never manufacture a screenshot or imply that a Resource demo is the source Example.
- Human UI is a content-first reference library, not an explanation of AIDRB. Do not surface architecture/onboarding copy such as projection, canonical Core, selection/lock workflow or rights-policy explanations in the primary hierarchy.
- Detail opens with the reference identity, then the visual/reference itself, concise summary, demonstrated Concepts, reuse/failure notes, related Examples and Resources. Machine/build projection is not a Human UI section; provenance stays collapsed and subordinate.
- Explore is an editorial discovery stream with search plus secondary refinement by world/domain/Concept/medium/interaction/trait/Resource/coverage; it is not a generic card wall.
- Dictionary routes Concept → real Examples → related Concepts → Resource/Tool implementation path. Resource pages may run only declared local AIDRB demos.
- A public source locator does not imply permission to copy third-party bytes. Presentation decisions live in `app/media.json`: local copy requires a clear redistribution basis; open-license/explicit embed may display automatically; other official source pages may be framed only on demand so the publisher retains technical control. Use the medium-aware plate only when original media cannot be shown.
- Do not add Human selection/cart/commit/download UI. Human handoff is an exact stable URL/ID plus natural-language intent; machine retrieval owns selection → commit → lock → fetch.
- Neutral editorial chrome, restrained meaningful color, readable type scale, keyboard access and responsive layouts. Prefer content labels and working artifacts over slogans, manifesto copy, defensive disclaimers or oversized editorial headings.
- Old web/ assets are compatibility evidence only and must not load from index.html.
- Edit canonical inputs; regenerate catalog/ and catalog.yaml. Projection-only changes must preserve deterministic catalog output, stable IDs, the machine selection commit/lock contract and retrieval benchmarks.

## Provenance and rights

For third-party resources, preserve source URLs and attribution. Do not copy third-party binary assets into this public repository unless the license/permission is clear. Prefer transformed analysis, implementation primitives, recreated diagrams, code that expresses a general technique, and links back to the original.

Capability registry entries must also preserve licensing/API/embed caveats. A link to public code, demo, component, or gallery is not by itself evidence that redistribution is allowed.

## Quality bar

A package is not complete unless another capable AI agent can answer all four questions from the files alone:

1. What is the resource?
2. What specific mechanism is worth reusing?
3. How should that mechanism be instantiated in a new design?
4. What constraints, fidelity limits, or rights issues apply?

Never describe a visual reference only with vague adjectives such as “clean”, “premium”, or “modern”. Extract concrete geometry, hierarchy, spacing, typography behavior, state transitions, compositing, timing, interaction rules, or implementation techniques.
