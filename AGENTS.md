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

## Provenance and rights

For third-party resources, preserve source URLs and attribution. Do not copy third-party binary assets into this public repository unless the license/permission is clear. Prefer transformed analysis, implementation primitives, recreated diagrams, code that expresses a general technique, and links back to the original.

## Quality bar

A package is not complete unless another capable AI agent can answer all four questions from the files alone:

1. What is the resource?
2. What specific mechanism is worth reusing?
3. How should that mechanism be instantiated in a new design?
4. What constraints, fidelity limits, or rights issues apply?

Never describe a visual reference only with vague adjectives such as “clean”, “premium”, or “modern”. Extract concrete geometry, hierarchy, spacing, typography behavior, state transitions, compositing, timing, interaction rules, or implementation techniques.
