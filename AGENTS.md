# Agent Instructions

This repository is an **AI-usable creative resource bank**, not a bookmark dump and not a frontend-only library.

When a user provides a file, image, repository, article, website, video, prompt, UI reference, artwork, cinematic technique, game/HCI pattern, material/texture reference, visual effect, component, or other potentially reusable creative resource, process it using `skills/resource-ingest/SKILL.md`.

## Core rule

Store the **reusable knowledge**, not merely the source, and put that knowledge in the correct layer.

The bank separates:

1. **Dictionary** — names, recognition cues, natural-language descriptions, confusing concepts, example references, and related vocabulary;
2. **Examples** — provenance-aware references showing the vocabulary/mechanism in practice;
3. **Mechanisms** — transferable explanations of how an effect, interaction, representation, or process works;
4. **Resource Packages** — concrete reusable production artifacts when implementation reuse is actually useful.

Do **not** force every useful creative concept to become code or a Resource Package. Chiaroscuro, Foil Stamping, Blocking, Coyote Time, and other terms can be worth banking as vocabulary even when no package is justified.

When a reusable production mechanism is present, create a self-contained package under:

`resources/<domain>/<slug>/`

At minimum, a Resource Package contains:

- `resource.yaml` — machine-readable manifest and provenance
- `README.md` — concise explanation of what is useful, how to use it, and what not to copy

Add only the artifact types that materially improve reuse, such as:

- `artifacts/prompt.md`
- `artifacts/SKILL.md`
- `artifacts/*.html`, `*.tsx`, `*.ts`, `*.css`
- `artifacts/*.svg`
- `artifacts/*.png`
- `artifacts/*.glsl`
- `artifacts/tokens.json`
- `artifacts/motion.json`
- `examples/`
- `tests/`

Do not manufacture every format for every resource.

## Design Dictionary

Before adding or renaming cross-media creative vocabulary, read `docs/DICTIONARY-ONTOLOGY.md` and validate against `schemas/dictionary-term.schema.json`.

Dictionary rules:

- `domain` is not `kind`; a term may span multiple media while still representing one or more knowledge types;
- prefer established disciplinary terminology when it exists;
- mark normalized but non-canonical language as `descriptive`, and practitioner/community language as `vernacular`;
- write `recognition` as concrete visible/behavioral cues, not adjectives;
- write `looks_like` in ordinary language so users can retrieve a term without already knowing its name;
- distinguish concepts in `not_to_confuse_with` instead of merging nearby terms;
- link to real works/products as provenance-aware examples, but do not copy third-party binaries without rights;
- use original mnemonic diagrams on the public Dictionary surface when they explain the concept well;
- **image generation is explicitly allowed for original Dictionary teaching artefacts** when a concept is materially clearer as an image than as code/SVG — especially texture, material, lighting, painterly treatment, photographic/cinematic atmosphere, or complex visual composition;
- generated teaching artefacts must be labeled as generated/original studies and must never be presented as a real historical work, film frame, product screenshot, material sample, or other external evidence;
- prefer live/code demonstrations for temporal, interactive, spatial, or behavioral concepts when the behavior itself is what must be learned; do not replace Hit Stop, Coyote Time, Match Cut, direct manipulation, etc. with a static generated image merely because image generation is available;
- generated Dictionary artefacts belong under `dictionary/artifacts/<term-id>/` (or an equivalently explicit term-scoped path) and should preserve a short generation/purpose note so a later agent knows what the image is meant to teach;
- use `resource_refs` only when a real reusable Resource Package exists;
- a selection of terms is creative working vocabulary, not proof that the terms automatically form one coherent style.

Dictionary records use `seed → reviewed → verified → deprecated`. Do not label a seed `verified` merely because the term itself is well known; verification describes the record and its evidence.

## Illustration grammar

For illustration, drawing, comic, storybook, editorial image, hand-drawn, painterly, or sketch-like work, read `docs/ILLUSTRATION-GRAMMAR.md` and consult `registries/illustration-sources.yaml` before treating a named style, artist reference, or numbered preset as the design itself.

Illustration rules:

- decompose references into independent axes such as mark/line, shape language, fill/value, edge behavior, medium/material, palette, lighting, space, composition role, narrative mechanism, character system, annotation, imperfection, and temporal behavior;
- named styles and numbered presets are browsing/retrieval aids or recipes over those axes, **not the ontology of illustration**;
- a useful source repository may contribute one mechanism without setting the bank's visual limits; synthesize across multiple sources when that gives a clearer production model;
- keep `style`, `palette`, `character`, `composition`, `material`, `lighting`, and `scene` reference roles explicit rather than treating every supplied image as undifferentiated inspiration;
- do not silently transfer the subject, composition, story, character, or text from a style-only reference;
- judge generated illustration against the property it is meant to teach or produce, not generic prettiness;
- distinguish controllable procedural sketch parameters (roughness, bowing, pressure, hachure, seed, etc.) from actual physical media such as ink, graphite, crayon, watercolor, or gouache;
- use code/SVG/live rendering when geometry, stroke behavior, pressure, timing, or interaction is the real concept; use generated/owned raster studies when material, paint, atmosphere, lighting, or whole-scene perception is the real concept;
- do not copy third-party prompt libraries, style galleries, or example images wholesale merely because they are publicly visible on GitHub; obey the source registry's license and `reuse_policy` notes.

## Capability selection before implementation

For frontend visual, interactive, scientific, educational, diagrammatic, animation, canvas, 3D, or map work, **do not hand-build first**.

Before choosing an implementation:

1. read `registries/frontend-tools.yaml`;
2. read `registries/frontend-mechanisms.yaml` for a reusable interaction/explanatory pattern before inventing one;
3. use `docs/FRONTEND-CAPABILITY-MAP.md` to identify the narrowest mature abstraction matching the hard problem;
4. use `registries/reference-galleries.yaml` when official examples or high-quality interaction references would help;
5. follow `skills/select-frontend-resource/SKILL.md` for nontrivial selection decisions;
6. prefer an existing verified Resource Package when one already contains the needed mechanism.

For curriculum or subject-matter visualization, add a curriculum-aware routing step **before** tool selection:

1. identify the subject in `registries/curriculum-subjects.yaml`;
2. read its family in `registries/subject-visualization-families.yaml`;
3. translate the actual learning relationship into one of the atlas visualization grammars;
4. then select the narrowest existing tool/mechanism from the bank;
5. consult `docs/SUBJECT-VISUALIZATION-ATLAS.md` for fidelity rules and cross-subject implementation priorities.

Do not build one bespoke visualization stack per school subject. Curriculum labels are retrieval metadata; implementations should be shared when the underlying relationship is the same. A derivative, a supply-demand equilibrium, a migration flow, and a protein structure should not be forced through one generic renderer simply because all are “visualizations.”

These frontend registries are implementation discovery/selection infrastructure, not the conceptual boundary of the bank. They do **not** mean every listed external tool has been validated locally or ingested as a Resource Package.

Prefer domain semantics over generic rendering when correctness matters: e.g. a chemistry toolkit before hand-drawn bond SVG, a math engine before manually implementing coordinates, a geospatial engine before raw Three.js Earth geometry, and an actual physics engine before timeline animation presented as simulation.

When a registry technique is used successfully and is worth reusing, promote the concrete mechanism into a Resource Package.

## Human-facing surfaces

When editing the navigable workbench, follow `docs/EDITORIAL-UI-CONTRACT.md`. When editing Dictionary behavior/content, also follow `docs/DICTIONARY-ONTOLOGY.md`.

The Explore surface uses progressive disclosure:

`subject → mechanism → live demo → recommended tool → technical detail`

The Dictionary surface uses:

`term → mnemonic / generated study when useful → recognition → example → related vocabulary → selection`

Default UI rules:

- black, white, off-white, and neutral grey for interface chrome;
- no rainbow domain system;
- color only as a restrained interaction/demo accent or meaningful semantic distinction;
- editorial typography, rules, spacing, and hierarchy before dashboard cards, pills, gradients, shadows, or decorative chrome;
- keep browsing surfaces human-readable; machine metadata belongs in details, registries, manifests, or Index;
- do not display vanity statistics unless they help a decision;
- each live demo, mnemonic, or generated teaching artefact should teach one concept clearly;
- generated teaching artefacts must have a visible provenance label such as `GENERATED STUDY`; never visually imply that they are sourced examples;
- respect reduced-motion preferences.

Do not reintroduce information density simply because the underlying registries contain more data.

## Provenance and rights

For third-party resources, preserve source URLs and attribution when available. Do not copy third-party binary assets into this public repository unless the license/permission is clear. Prefer transformed analysis, textual references, implementation primitives, recreated diagrams, original mnemonics, **original generated teaching artefacts**, code that expresses a general technique, and links back to the original.

A named artwork, film shot, game, interface, or material example in a Dictionary entry is a **reference**, not permission to mirror its imagery. An AI-generated teaching artefact is likewise an explanatory study, not evidence that a cited real-world example looks exactly like the generated image.

Capability registry entries must also preserve licensing/API/embed caveats. A link to public code, demo, component, or gallery is not by itself evidence that redistribution is allowed.

## Quality bar

A Dictionary entry is useful when another capable agent or person can answer:

1. What is this called?
2. How do I recognize it?
3. What is it easy to confuse with?
4. Where can I see it in practice?
5. What related vocabulary or reusable resources should I inspect next?

A Resource Package is complete only when another capable AI agent can answer:

1. What is the resource?
2. What specific mechanism is worth reusing?
3. How should that mechanism be instantiated in a new design?
4. What constraints, fidelity limits, or rights issues apply?

Never describe a creative reference only with vague adjectives such as “clean”, “premium”, “modern”, or “cinematic”. Extract concrete geometry, hierarchy, spacing, typography behavior, camera behavior, material/process properties, state transitions, compositing, timing, interaction rules, or implementation techniques.
