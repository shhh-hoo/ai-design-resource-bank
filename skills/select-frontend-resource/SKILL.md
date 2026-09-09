# Skill: Select Frontend Resource

Use this skill whenever the task involves implementing, prototyping, or banking a frontend visual/interactive capability such as mathematical plotting, scientific visualization, subject simulation, diagrams, canvas interaction, animation, 3D, or maps.

The objective is **not** to maximize library usage. The objective is to avoid reinventing mature semantics while still choosing the smallest appropriate implementation surface.

## Inputs

At least one of:

- a desired interaction or visual mechanism;
- a subject-matter representation;
- a screenshot/reference/link to reproduce or learn from;
- a frontend feature request whose hard part is visual, spatial, animated, diagrammatic, or simulated.

## Required sources

Read:

1. `registries/frontend-tools.yaml`
2. `docs/FRONTEND-CAPABILITY-MAP.md`
3. `registries/reference-galleries.yaml` when examples or art-direction references would help.

If a relevant Resource Package already exists under `resources/`, prefer its verified mechanism over starting from a registry entry again.

## Procedure

### 1. Translate appearance into capability

Do not begin with aesthetic labels.

Convert the request into one or more semantic requirements such as:

- `function-plot + draggable-point + coordinate-transform`
- `chemical-structure-editor + reaction-arrow`
- `rigid-body-2d + collision + drag`
- `node-editor + directed-edge + auto-layout`
- `scroll-scrub + pin + camera-transition`
- `3d-globe + time-dynamic-orbit`

Separate required behavior from optional visual treatment.

### 2. Classify the hard problem

Pick the dominant class:

- subject/domain semantics;
- data visualization grammar;
- graph/diagram semantics;
- editor/canvas interaction;
- physics/simulation;
- 2D rendering throughput;
- 3D rendering/spatial scene;
- animation/choreography;
- geospatial semantics;
- formula/input rendering.

A task may use multiple classes, but name the primary one first.

### 3. Retrieve candidates

Search `frontend-tools.yaml` by `domains`, `capabilities`, and `tags`.

Select at most three candidates for serious comparison. Prefer `tier: core` unless a specialized tool matches the semantics substantially better.

For each candidate, inspect:

- `use_when`
- `avoid_when`
- `agent_notes`
- `license` / `rights_note`
- official docs/examples

Do not select a library merely because it is familiar.

### 4. Apply the domain-first rule

When domain correctness matters, prefer domain-aware tools over generic renderers.

Examples:

- molecule semantics → RDKit.js/Mol* before raw SVG/Three.js;
- dynamic geometry → Mafs/JSXGraph before generic Canvas;
- 3D Earth/terrain → CesiumJS before raw Three.js;
- relationship network → G6/Cytoscape.js before manually positioned SVG;
- actual rigid-body dynamics → Matter.js/Rapier before timeline animation.

Generic renderers remain appropriate for overlays, styling, bespoke explanatory layers, and cases where the domain engine cannot express the desired interaction.

### 5. Check reference galleries only for unresolved mechanism/design questions

Use `reference-galleries.yaml` to answer questions such as:

- Has someone implemented this motion grammar well?
- What interaction states are needed?
- What does a strong educational manipulation look like?
- Is there an official example of this renderer feature?

Prefer first-party examples for implementation correctness. Use galleries such as Codrops, Ciechanowski, PhET, Mathigon, React Bits, or Aceternity primarily to learn mechanisms and composition.

Do not infer reuse permission from visual availability.

### 6. Make a selection record

Before implementation, be able to state:

```text
Need:
Primary tool:
Why this tool:
Rejected alternatives:
Reference example(s):
Rights/licensing caveat:
Hard behavior to prove first:
```

This can remain in working notes unless it materially improves a Resource Package.

### 7. Build the smallest proof of the hard behavior

Do not start with a polished page.

Examples:

- math: one draggable parameter actually changes the plotted function;
- graph: adding a node preserves/updates layout as required;
- animation: timeline can scrub forward/backward deterministically;
- chemistry: source structure parses and highlights the correct substructure;
- 3D: camera/object coordinate model is correct before postprocessing;
- physics: collision/constraint result behaves correctly before decorative particles.

The spike should make library mismatch obvious early.

### 8. Add presentation layers deliberately

After the semantic mechanism works, add visual treatment using the appropriate layer:

- Motion/GSAP/Anime.js for choreography;
- SVG.js/Rough.js/Rough Notation for vector/annotation treatment;
- Three.js/PixiJS for rendering effects;
- ordinary CSS/React for product UI.

Do not force the domain engine to own every decorative concern.

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

### 10. Promote durable mechanisms into the bank

If the technique is worth reusing, invoke `skills/resource-ingest/SKILL.md` and create a proper Resource Package.

A registry entry says **where capability exists**.
A Resource Package says **we have actually distilled this reusable mechanism**.

## Selection heuristics

### Prefer high-level over low-level when

- the task maps directly to a mature domain abstraction;
- AI needs to serialize/generate the result reliably;
- correctness and interaction conventions matter more than bespoke rendering.

### Prefer low-level over high-level when

- the visual encoding itself is novel;
- existing engines actively constrain the intended mechanism;
- a tiny custom SVG/Canvas implementation is genuinely simpler than adapting a large system;
- the reusable mechanism is a renderer primitive, shader, or geometry algorithm.

### Combine libraries when responsibilities are clean

Good combinations include:

- Mafs + Motion for mathematical semantics plus UI transitions;
- RDKit.js + SVG overlays for chemistry plus explanatory annotation;
- React Flow + Dagre/ELK for editor semantics plus layout;
- MapLibre + deck.gl for basemap plus large data layers;
- Three.js/R3F + Rapier for rendering plus physics;
- Mol* + ordinary React UI for molecular scene plus product controls.

Avoid combinations where multiple libraries compete to own the same DOM/scene/state responsibility.

## Failure conditions

Stop and reconsider the choice when:

- more code is spent fighting the library than expressing the mechanism;
- the required semantics have to be recreated outside the chosen tool;
- the library cannot support the needed interaction state deterministically;
- an external API/license blocks the intended distribution model;
- performance requires bypassing most of the abstraction;
- the selected tool is being used only because an agent knew its name.
