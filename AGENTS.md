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
2. use `docs/FRONTEND-CAPABILITY-MAP.md` to identify the narrowest mature abstraction matching the hard problem;
3. use `registries/reference-galleries.yaml` when official examples or high-quality interaction references would help;
4. follow `skills/select-frontend-resource/SKILL.md` for nontrivial selection decisions;
5. prefer an existing verified Resource Package when one already contains the needed mechanism.

The registries are discovery/selection infrastructure. They do **not** mean every listed external tool has been validated locally or ingested as a Resource Package.

Prefer domain semantics over generic rendering when correctness matters: e.g. a chemistry toolkit before hand-drawn bond SVG, a math engine before manually implementing coordinates, a geospatial engine before raw Three.js Earth geometry, and an actual physics engine before timeline animation presented as simulation.

When a registry technique is used successfully and is worth reusing, promote the concrete mechanism into a Resource Package.

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
