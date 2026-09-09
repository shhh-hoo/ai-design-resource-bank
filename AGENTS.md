# Agent Instructions

This repository is an **AI-usable design resource bank**, not a bookmark dump.

When a user provides a file, image, repository, article, website, video, prompt, UI reference, visual effect, component, or other potentially reusable resource, process it using `skills/resource-ingest/SKILL.md`.

## Core rule

Store the **reusable mechanism**, not merely the source.

Every accepted resource must become a self-contained package under:

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

The registries are discovery/selection infrastructure. They do **not** mean every listed external tool has been validated locally or ingested as a Resource Package.

Prefer domain semantics over generic rendering when correctness matters: e.g. a chemistry toolkit before hand-drawn bond SVG, a math engine before manually implementing coordinates, a geospatial engine before raw Three.js Earth geometry, and an actual physics engine before timeline animation presented as simulation.

When a registry technique is used successfully and is worth reusing, promote the concrete mechanism into a Resource Package.

## Web board: human-readable first

When editing the navigable board, follow `docs/EDITORIAL-UI-CONTRACT.md`.

The default Explore surface is for human browsing, not for exposing every machine-readable field. Use progressive disclosure:

`subject → mechanism → live demo → recommended tool → technical detail`

Default UI rules:

- black, white, off-white, and neutral grey for interface chrome;
- no rainbow domain system;
- color only as a restrained interaction/demo accent or meaningful semantic distinction;
- editorial typography, rules, spacing, and hierarchy before dashboard cards, pills, gradients, shadows, or decorative chrome;
- one sentence per mechanism on the Explore surface;
- licenses, ecosystems, tags, tiers, rights, maintenance notes, and similar metadata belong in details or Index/Search views;
- do not display totals or vanity statistics unless they help a decision;
- each live demo proves one mechanism only.

Do not reintroduce information density simply because the underlying registries contain more data.

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
