# Subject Visualization Atlas

The Subject Visualization Atlas answers a different question from the frontend tool registry:

> Given a curriculum topic, what relationship is actually worth making visible, and what is the narrowest truthful representation for it?

It is not a collection of subject-themed illustrations. It is a routing layer from curriculum semantics into the mechanisms and mature engines already in this bank.

## Scope

The first curriculum snapshot covers:

- Cambridge International AS & A Level as the initial A-Level baseline.
- All AP subjects in the current College Board course catalog.
- AQA, Pearson Edexcel, and OCR are intentionally recorded as later A-Level overlays rather than mixed into the Cambridge labels.

Cambridge states that it offers a choice of 55 AS & A Level subjects, while its current public subject catalog exposes 57 syllabus entries because it also lists level, language, and regional variants. The registry preserves the current catalog entries rather than forcing them into a misleading count.

This first pass is **curriculum-complete at the subject level and topic-family-complete at a useful design depth**. It is not a transcription of every learning outcome. Detailed unit/outcome mappings should be added only when they help select or validate a visualization.

Primary curriculum sources:

- Cambridge subject catalog: https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-advanced/cambridge-international-as-and-a-levels/subjects/
- Cambridge curriculum: https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-advanced/cambridge-international-as-and-a-levels/curriculum/
- AP course catalog: https://apstudents.collegeboard.org/courses

Representative current topic sources used to test the model include Cambridge Biology 9700, Chemistry 9701, Physics 9702, Geography 9696, Economics 9708, Computer Science 9618, Design & Technology 9705, Psychology 9990, Music 9483, Sport & Physical Education 8386, and AP course/unit pages for the sciences, calculus/statistics, human geography, economics, history, art history, music theory, computer science, business, and cybersecurity.

## Architecture

The routing path is:

```text
curriculum subject
→ official topic / unit
→ relationship learners need to understand
→ visualization grammar
→ existing bank tool + reusable mechanism
→ missing capability, if any
→ smallest truthful spike
→ validated Resource Package
```

This separates three things that should not be conflated:

1. **Curriculum labels** are for retrieval and scope.
2. **Visualization grammars** describe the kind of relationship being made visible.
3. **Tools/mechanisms** are implementation choices and reusable behavior.

A Cambridge and an AP topic can therefore share the same implementation without pretending the syllabuses are identical.

## Why subject families rather than one implementation per course

A subject-by-subject demo plan would create unnecessary duplication. The same explanatory mechanisms recur across curricula:

- derivative in AP Calculus and Cambridge Mathematics → movable tangent / linked function views;
- force in AP Physics and Cambridge Physics → body state + force-vector overlay;
- supply/demand in AP Microeconomics and Cambridge Economics → linked functions + equilibrium + welfare area;
- migration in AP Human Geography and Cambridge Geography → authentic maps + flow layers;
- uncertainty in AP Statistics, Biology, Psychology, and research courses → distributions + sampling + interval/evidence views;
- chronology and source relationships across multiple history courses → time sequence + evidence comparison;
- structure/function in Chemistry and Biology → domain-correct structure + spatial annotation.

The atlas therefore maps all current subjects into 17 reusable families, then routes those families through 20 visualization grammars.

## Visualization priority

`high` does not mean “make every lesson visual.” It means visualization frequently carries core explanatory content.

`medium` means visualization often helps reasoning but should normally remain coupled to prose, symbols, evidence, or cases.

`selective` means visualization is valuable for particular structural relationships, while close reading, interpretation, writing, discussion, or performance remain primary.

This matters especially in humanities. The goal is not STEM-versus-humanities classification. Economics is graph-heavy; geography is inherently spatial; history often requires time-space-source reasoning; music is temporal and notational; art history requires visual comparison. Conversely, a literature interpretation can easily become *less* rigorous if converted into a false causal diagram.

## The 20 visualization grammars

The machine-readable definitions live in `registries/subject-visualization-families.yaml`. The important conceptual groups are:

### Quantity and mathematics

- `functional-graph`
- `dynamic-geometry`
- `statistical-distribution`
- `optimization-tradeoff`
- `vector-field`

### Change and process

- `dynamic-system`
- `state-process`
- `field-flow`
- `time-sequence`
- `code-execution`

### Structure and space

- `3d-spatial`
- `structure-anatomy`
- `micro-macro-bridge`
- `spatial-map`
- `network-relation`

### Evidence, image, and symbolic representation

- `evidence-comparison`
- `image-comparison`
- `composition-layer`
- `symbolic-notation`
- `audio-time`

A grammar is intentionally renderer-independent. For example, `3d-spatial` may route to Three.js for a custom mechanical object, Mol* for a protein, or CesiumJS for geospatial 3D.

## Representative routing examples

### AP Physics 1 / Cambridge Physics — force and dynamics

**Need:** learners must see that multiple forces are properties of one changing body state, not disconnected arrows in a textbook margin.

**Grammar:** `dynamic-system` + `vector-field`.

**Bank route:** Matter.js or Rapier for physical state; `force-vector-overlay` for explanation; Mafs/Plotly for synchronized quantitative plots when needed.

**Do not:** animate a box on a pre-authored CSS timeline and call it a simulation.

### Cambridge Chemistry / AP Chemistry — bonding and orbital overlap

**Need:** preserve chemical identity while exposing a spatial relationship.

**Grammar:** `structure-anatomy` + `3d-spatial` + `micro-macro-bridge`.

**Bank route:** RDKit.js for chemically correct 2D semantics; Mol*/3Dmol.js where domain molecular viewing fits; Three.js for a deliberately simplified orbital/spatial explanatory model; existing `orbital-overlap` and `anchored-callout` mechanisms.

**Do not:** hand-draw arbitrary bond geometry when the structural semantics matter.

### AP Microeconomics / Cambridge Economics — supply, demand, intervention, welfare

**Need:** one parameter change should propagate through curves, equilibrium, quantities, and areas.

**Grammar:** `functional-graph` + `optimization-tradeoff`.

**Bank route:** Mafs/JSXGraph for manipulable model geometry; `area-under-curve`-style area logic for surplus/deadweight regions; Observable Plot/Vega-Lite for empirical datasets.

**Do not:** use a chart library merely to draw a static supply-and-demand picture if the learning target is comparative statics.

### AP Human Geography / Cambridge Geography — migration, cities, climate, hazards

**Need:** geographic scale and real location are part of the concept.

**Grammar:** `spatial-map` + `field-flow` + `network-relation`.

**Bank route:** MapLibre for the map; deck.gl for large flow/data layers; CesiumJS when globe/terrain/time-dynamic geospatial semantics are genuinely needed; `semantic-zoom` and `focus-context` for navigation.

**Do not:** invent schematic geography when actual geography is the evidence.

### AP Music Theory / Cambridge Music — harmony and voice leading

**Need:** link sound, notation, pitch relationships, harmonic function, and time.

**Grammar:** `audio-time` + `symbolic-notation` + `time-sequence`.

**Current route:** D3/SVG can support analytic overlays and timelines, but the bank is missing dedicated audio scheduling and score-rendering primitives.

**Capability gap to research:** Tone.js or Web Audio for timed playback; VexFlow or OpenSheetMusicDisplay for notation; waveform/spectrum tooling only when audio inspection is part of the learning target.

**Do not:** manually fake a musical score with arbitrary SVG if notation correctness matters.

### AP Art History — comparison, chronology, context

**Need:** compare visual evidence while preserving work identity, location, chronology, material, and contextual claims.

**Grammar:** `image-comparison` + `time-sequence` + `spatial-map` + `evidence-comparison`.

**Bank route:** SVG/Paper/Motion for aligned annotations and overlays; D3 for chronology/relationships; maps only for genuine geographic context.

**Do not:** reduce interpretation to decorative style tags or an unsupported influence graph.

### AP World/US/European History and Cambridge histories — evidence over time and space

**Need:** reason about chronology, causal claims, movement, institutions, and conflicting sources without erasing uncertainty.

**Grammar:** `time-sequence` + `spatial-map` + `evidence-comparison` + `network-relation`.

**Bank route:** D3/Observable Plot for time/data; MapLibre for authentic geography; React Flow for explicit argument/evidence relationships when the graph itself supports reasoning.

**Do not:** encode a contested historical interpretation as if it were a deterministic causal network.

### Cambridge Computer Science / AP CS / AP Cybersecurity

**Need:** preserve object, variable, packet, node, or machine identity while state changes.

**Grammar:** `code-execution` + `state-process` + `network-relation` + `structure-anatomy`.

**Bank route:** React Flow for editable/stateful process views; G6/Cytoscape for networks; D3 for custom execution diagrams and quantitative behavior; tldraw only when an explorable canvas is itself useful.

**Do not:** animate arrows between boxes without representing the underlying state transition.

## Subject-family coverage

The current family layer covers:

- Mathematics
- Physics
- Chemistry
- Biology
- Earth, Environmental & Marine Science
- Geography
- Computer Science, IT & Cybersecurity
- Economics, Business, Accounting & Finance
- Psychology & Sociology
- History, Government & Politics
- Art, Design, Media & Drama
- Music
- Languages & Literature
- Law, Religion, Classics & Thinking Skills
- Sport & Physical Education
- Research, Seminar & Interdisciplinary Inquiry
- Travel & Tourism

Every subject in `registries/curriculum-subjects.yaml` points to one of these families. A subject-specific override should be introduced only when its visualization needs materially diverge from its family.

## Hard rules: when not to visualize

1. **Do not diagram prose just to create visual variety.** A visual must expose a relationship that is harder to reason about in prose/symbols alone.
2. **Simulation is not animation.** If behavior is claimed to arise from physics or a rule system, the state transition must be computed from that model.
3. **Maps must preserve authentic geography.** Schematic maps must be explicitly labelled as schematic and never silently replace geographic evidence.
4. **Chemistry must preserve chemical semantics.** Atom identity, connectivity, stereochemistry, electron movement, and domain conventions matter more than decorative molecular aesthetics.
5. **Biology must respect scale.** Cell, molecular, organ, organism, population, and ecosystem levels should not be visually collapsed without signalling the transition.
6. **Statistics must encode uncertainty.** Decorative bars or smooth curves are not substitutes for distributions, sample size, intervals, residuals, or variability when those affect the inference.
7. **History and social science must retain provenance and uncertainty.** A clean network must not falsely imply consensus or deterministic causality.
8. **Art/literature interpretation must keep the artifact primary.** Annotation and comparison can support interpretation; the diagram should not become evidence that the source itself does not provide.
9. **Music visuals must remain synchronized to musical time and notation.** Visual rhythm that is disconnected from actual meter/pitch/audio is decoration, not explanation.
10. **Use domain engines before generic rendering when semantics are hard.** The renderer is not the expertise.

## Implementation order: maximize cross-subject reuse

Do not now build one demo for every course. Build the mechanism clusters that unlock the largest number of topics:

1. **Fields, forces, motion, oscillation, waves** — Physics, mechanics in Mathematics, PE biomechanics, Earth/ocean flow.
2. **Function, curve, area, distribution, optimization** — Mathematics, Statistics, Economics, Finance, sciences, Psychology.
3. **Structure/anatomy and micro ↔ macro** — Chemistry, Biology, PE, Design & Technology.
4. **Maps, flows, terrain, scale, time-aware geography** — Geography, Environmental/Marine Science, History, Tourism, Human Geography.
5. **Algorithms, execution, networks, architecture, cybersecurity** — Computer Science, IT, AP CSP/CSA/Cybersecurity.
6. **Timeline, evidence, source comparison, causal claims with uncertainty** — History, Government, Research, Sociology, Art History.
7. **Audio, notation, harmony, rhythm, form** — Music first; language prosody later.
8. **Composition, material, camera, stage, edit, design process** — Art, Design, Media, Drama and the wider creative bank.

Each cluster should produce a small set of high-quality, framework-backed Resource Packages rather than a large set of subject-branded mockups.

## Capability gaps revealed by the curriculum scan

The existing bank is already strong in mathematical graphing, scientific charts, chemistry structure, physics engines, generic 2D/3D rendering, graphs, and geospatial work. The curriculum scan reveals several missing or underdeveloped areas:

### Music/audio

Research dedicated playback/scheduling, notation, waveform, and spectrum tools. Likely candidates include Web Audio/Tone.js, VexFlow/OpenSheetMusicDisplay, and wavesurfer-style tooling. Add only after checking current maintenance, licensing, accessibility, and browser behavior.

### Biology/anatomy

Mol* and 3Dmol.js cover molecular structure well, but cell/anatomy/genomics visualization remains weak. Research specialized viewers/data models before building anatomical systems in raw Three.js.

### Earth/climate fields

MapLibre/deck.gl/Cesium cover mapping and geospatial layers, but reusable vector-field, streamline, raster/time-series, terrain cross-section, and climate-anomaly mechanisms still need focused references and spikes.

### Computer science algorithms and layout

The bank has graph engines but should research algorithm-teaching references and mature automatic layout engines such as ELK.js/Dagre where deterministic graph arrangement is the hard problem.

### Shader/WebGPU scientific fields

Only add this layer when a topic genuinely needs dense fields, particles, volume-like effects, or GPU compute. Do not let high-end rendering become a default visual style.

## Research status

What is complete in this pass:

- current Cambridge AS/A Level public subject catalog captured;
- current AP catalog captured;
- every subject routed to a visualization family;
- reusable visualization grammars defined;
- family-level topic seeds derived from current official course/syllabus overviews and representative unit structures;
- routes to existing tools and mechanisms recorded;
- missing capability areas identified.

What is deliberately not complete yet:

- every Cambridge learning outcome and AP learning objective;
- every AQA/Pearson/OCR subject variant;
- a runnable demo for every topic;
- claims that a listed visualization route is already validated for teaching effectiveness.

Those deeper layers should be added as we actually build, test, compare, and bank mechanisms.
