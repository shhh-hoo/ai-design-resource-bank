# Skill: Select Frontend Resource

Use this skill whenever the task involves implementing, prototyping, or banking a frontend visual/interactive capability such as mathematical plotting, scientific visualization, subject simulation, diagrams, canvas interaction, animation, 3D, or maps.

The objective is **not** to maximize library usage. The objective is to identify the reusable mechanism first, then choose the smallest mature implementation surface that preserves the required semantics.

## Required sources

Read in this order:

1. `registries/frontend-mechanisms.yaml`
2. relevant verified Resource Packages under `resources/`
3. `registries/frontend-tools.yaml`
4. `docs/FRONTEND-CAPABILITY-MAP.md`
5. `registries/reference-galleries.yaml` when examples or art-direction references would help.

## Procedure

### 1. Translate the request into behavior

Do not begin with aesthetic labels or library names. Convert the request into semantic behavior such as:

- `function-plot + draggable-point + tangent`
- `reaction-coordinate + scrubber + state-marker`
- `rigid-body-2d + collision + drag`
- `focus-node + preserve-context`
- `scroll-pin + progressive-state-change`

Separate the explanatory/interaction mechanism from optional visual treatment.

### 2. Check the mechanism registry first

Search `frontend-mechanisms.yaml` for an existing pattern that already captures the requested behavior.

If one matches, inspect:

- `summary`
- `use_when`
- `primitives`
- `implementation_note`
- `tools`
- its live workbench demo

Treat the demo as a **behavior proof**, not as production code or art direction.

If no mechanism matches, continue with capability/tool selection. If the new behavior proves reusable, add it to the mechanism registry later.

### 3. Prefer verified local evidence

If a relevant Resource Package already exists under `resources/`, prefer its implemented/verified mechanism over starting from an upstream registry entry again.

A Resource Package is stronger evidence than a mechanism seed or tool registry entry.

### 4. Select implementation tools

Search `frontend-tools.yaml` by `domains`, `capabilities`, and `tags`. Select at most three serious candidates.

Inspect:

- `use_when`
- `avoid_when`
- `agent_notes`
- `license` / `rights_note`
- official docs/examples

Prefer `tier: core` unless a specialized tool matches the semantics substantially better. Do not select a library merely because it is familiar.

When domain correctness matters, prefer domain-aware tools over generic renderers:

- molecule semantics → RDKit.js/Mol* before raw SVG/Three.js;
- dynamic geometry → Mafs/JSXGraph before generic Canvas;
- relationship network → G6/Cytoscape.js before manually positioned SVG;
- 3D Earth/terrain → CesiumJS before raw Three.js;
- actual rigid-body dynamics → Matter.js/Rapier before timeline animation.

### 5. Use references only for unresolved design/mechanism questions

Use `reference-galleries.yaml` to answer questions such as:

- Has someone implemented this motion grammar well?
- What interaction states make the mechanism understandable?
- What does a strong educational manipulation look like?
- Is there a first-party example of the renderer feature?

Prefer first-party examples for implementation correctness. Use galleries such as Codrops, Ciechanowski, PhET, Mathigon, React Bits, or Aceternity primarily to study mechanism and composition.

Do not infer reuse permission from visual availability.

### 6. Record the decision

Before implementation, be able to state:

```text
Mechanism:
Need:
Primary tool:
Why this tool:
Rejected alternatives:
Reference example(s):
Rights/licensing caveat:
Hard behavior to prove first:
```

### 7. Prove the hard behavior before polishing

Build the smallest deterministic proof that can falsify the choice.

Examples:

- math: one draggable parameter actually changes the dependent geometry;
- graph: focus preserves enough context to stay oriented;
- animation: timeline can scrub forward/backward predictably;
- chemistry: state change remains chemically meaningful;
- 3D: camera/object coordinate model is correct before postprocessing;
- physics: model behavior works before decorative motion.

### 8. Add presentation layers deliberately

After the semantic mechanism works, add visual treatment using the appropriate layer:

- Motion/GSAP/Anime.js for choreography;
- SVG.js/Rough.js/Rough Notation for vector/annotation treatment;
- Three.js/PixiJS for rendering effects;
- ordinary CSS/React for product UI.

Do not force one engine to own semantics, rendering, product UI, and decoration at once.

### 9. Validate

Check the dimensions that apply:

- semantic/domain correctness;
- interaction correctness;
- deterministic state behavior;
- accessibility/keyboard/pointer behavior;
- resize/responsiveness;
- rendering performance;
- reduced-motion behavior for nonessential animation;
- dependency weight/complexity;
- license/API/embed terms;
- visual fidelity to the intended mechanism.

For scientific/educational simulation, visual plausibility is not evidence of model correctness.

### 10. Promote what survives

If a new mechanism is durable, add it to `frontend-mechanisms.yaml` with a small behavior proof and recommended tools.

If a concrete implementation is worth reusing, invoke `skills/resource-ingest/SKILL.md` and create a Resource Package.

The layers mean different things:

- **Mechanism registry** — this interaction/explanation pattern is worth recognizing and trying.
- **Tool registry** — mature capability exists here.
- **Resource Package** — we have actually distilled/implemented this concrete technique.

## Failure conditions

Stop and reconsider when:

- the page is being polished before the hard behavior is proven;
- more code is spent fighting the library than expressing the mechanism;
- the required semantics have to be recreated outside the chosen tool;
- an external API/license blocks the intended distribution model;
- performance requires bypassing most of the abstraction;
- the selected tool is being used only because an agent knew its name;
- a new demo is visually impressive but does not isolate one reusable mechanism.
