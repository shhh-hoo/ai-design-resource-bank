---
name: resource-ingest
description: Convert a useful design/development reference into a self-contained, AI-usable resource package with provenance, distilled mechanisms, and only the representations that materially improve reuse.
---

# Resource Ingest

Use this skill whenever the user provides a file, image, screenshot, URL, repository, article, video, prompt, component, visual effect, interaction, or other reference and wants it retained for future design/production use.

The corrected Core contract is `docs/KNOWLEDGE-ATLAS-CONTRACT.md`. First distinguish an Example from reusable implementation material. A perceivable reference can remain an Example and yield zero Resources; a missing subject instance is GAP. The package steps below apply only when extraction is justified.

The target repository is `shhh-hoo/ai-design-resource-bank` unless the user explicitly says otherwise.

## Objective

Turn the input into a **reusable mechanism package**, not a bookmark and not a loose inspiration note.

A successful ingestion lets a future AI agent retrieve the package and produce a materially better design or implementation without needing to rediscover why the original reference was useful.

## Workflow

### 1. Inspect the source

Use the best available inspection method for the source type. Do not infer visual or technical details that were not actually observed.

Capture:

- source locator (URL or user-provided filename)
- source title/author/project when available
- date captured
- the user's stated reason for saving it, if given
- what is directly observed vs inferred

If the source cannot be inspected fully, create no high-fidelity claims. Either make a lower-fidelity distilled package or leave it `raw` with the exact missing evidence stated.

### 2. Decide whether it deserves ingestion

Accept when there is a concrete reusable mechanism, implementation technique, interaction, composition, visual primitive, prompt pattern, agent procedure, or design-system rule.

Reject or keep as a plain reference when the value is only “looks nice” and no specific transferable mechanism can be identified yet.

### 3. Extract the mechanism

Write one precise mechanism summary and decompose it into primitives.

For visual/UI references, inspect as applicable:

- information hierarchy
- geometry, alignment, ratios, spacing
- typography roles and behavior
- color relationships and contrast logic
- layer/compositing structure
- masks, clipping, gradients, texture
- responsive changes
- trigger/state/feedback/exit behavior
- motion timing, easing, sequencing
- implementation technique

For code/components:

- external API
- internal state model
- dependency choices
- transferable implementation pattern
- edge cases and failure behavior

For prompts/skills:

- input contract
- selection/reasoning policy
- output contract
- examples
- failure handling
- acceptance checks

### 4. Separate essence from source identity

Explicitly distinguish:

- **reuse**: transferable mechanism/primitives
- **do not copy**: logos, trademarked identity, proprietary copy, unique illustrations, photos, branded colors where identity-defining, or other source-specific expression

Do not put third-party binary assets in the public repository unless license/permission is clear. When rights are unclear, preserve the URL and create transformed notes, generalized code, recreated primitives, or an original diagram instead.

### 5. Choose output representations

Do **not** create every format. Choose the smallest set that captures the reusable value.

Preferred mapping:

- geometry/icon/ornament → SVG
- UI/layout → runnable HTML/CSS or TSX; tokens when repeated values matter
- motion/transition → runnable demo + explicit timing/state spec (`motion.json` when useful)
- 3D/shader/canvas → minimal runnable code + tunable parameters + fallback
- raster composition → structured visual spec; PNG only when rights allow or when generated originally for the package
- prompting technique → `prompt.md` + examples
- repeatable agent process → `SKILL.md` + checks
- design system → `tokens.json` + usage notes
- paper/article/talk → mechanism notes and citations; implementation only when justified

Prefer editable, semantic representations over screenshots. Prefer SVG over PNG for vector geometry. Prefer runnable minimal code over long prose when behavior is the main value.

### 6. Create package

Create:

`resources/<domain>/<slug>/resource.yaml`

and

`resources/<domain>/<slug>/README.md`

Use `docs/RESOURCE-PACKAGE.md` and `schemas/resource.schema.json` as the contract.

Add derived artifacts under `artifacts/`, examples under `examples/`, and validation under `tests/` only when useful.

### 7. Validate before saving

Check all applicable items:

- [ ] provenance is explicit
- [ ] observed facts and inferences are not mixed
- [ ] mechanism is concrete enough to implement
- [ ] primitives are source-independent where possible
- [ ] output formats were selected intentionally
- [ ] code is runnable or labelled pseudocode
- [ ] SVG has a valid `viewBox` and no unnecessary raster embedding
- [ ] prompts/skills specify inputs and outputs
- [ ] important parameters are exposed rather than hard-coded without explanation
- [ ] rights basis is recorded
- [ ] package README states “Use this when”, “Why it works”, “Implementation”, “Controls”, “Do not copy”, and “Source”
- [ ] status is not stronger than the evidence (`distilled` vs `implemented` vs `verified`)

### 8. Update catalog

Do not hand-edit catalog.yaml or catalog/. Run `python3 scripts/build_catalog.py` after editing canonical inputs or Resource manifests, then `python3 scripts/build_catalog.py --check`. The legacy catalog.yaml is a generated compatibility export. New packages use `source_refs` pointing to normalized Source records; existing embedded legacy source metadata is supported through the adapter.

### 9. Commit discipline

For substantial ingestions, use a focused branch/PR. Keep one major resource or tightly related resource family per commit/PR.

Recommended commit prefix: `resource:`.

## Output to user after ingestion

Report only what matters:

1. what mechanism was extracted
2. which artifacts were created and why
3. package path
4. validation/fidelity level
5. any rights or evidence limitation
6. commit/PR link when available

Do not bury the result in a long generic design explanation.
