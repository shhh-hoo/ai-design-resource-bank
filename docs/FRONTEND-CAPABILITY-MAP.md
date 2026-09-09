# Frontend Capability Map

This document answers one operational question:

> **Before hand-building a visual or interaction, what mature capability should an AI agent inspect first?**

The bank has two layers:

1. **Capability registries** — upstream engines, libraries, editors, APIs, and high-signal galleries. They answer _what should I use or inspect?_
2. **Resource Packages** — mechanisms we have actually distilled, reproduced, or validated. They answer _how exactly do we reuse this mechanism?_

A registry entry is not automatically a trusted Resource Package. When a useful technique survives implementation, promote the technique into `resources/<domain>/<slug>/`.

## Default selection rule

Use the narrowest mature abstraction that already understands the hard part of the problem.

```text
subject/domain semantics
        ↓
existing domain engine? ── yes ──> use/inspect it first
        │
        no
        ↓
structured/declarative representation available?
        │ yes
        ├──────────────> use a spec/grammar library
        │
        no
        ↓
interaction/rendering engine matches the workload?
        │ yes
        ├──────────────> use it
        │
        no
        ↓
hand-build with SVG / Canvas / WebGL
```

Do not start from raw Canvas/WebGL merely because it is flexible. Flexibility is not domain correctness.

## Fast decision table

| Need | First check | Strong alternatives | Why |
| --- | --- | --- | --- |
| Interactive 2D function/coordinate explanation in React | **Mafs** | JSXGraph, function-plot | Math-native primitives and manipulable coordinates without writing a graph engine |
| Dynamic Euclidean/analytic geometry | **JSXGraph** | GeoGebra, CindyJS | Geometric dependency/construction semantics |
| Full graphing-calculator UX | **Desmos API** | GeoGebra | Mature expression/graph interaction; external terms apply |
| Presentation-style animated 3D math | **Three.js/R3F** + inspect MathBox | Plotly.js | Modern 3D ecosystem; MathBox remains a strong expression reference |
| Static math typesetting | **KaTeX** | MathJax | Small, fast TeX renderer |
| Editable math input | **MathLive** | custom editor only with strong reason | Mathfield, virtual keyboard, LaTeX/MathJSON semantics |
| Accessibility/MathML-heavy math rendering | **MathJax** | KaTeX | Broader input/output/accessibility model |
| Standard scientific/statistical chart | **Observable Plot** | Vega-Lite, ECharts | High-level expression without hand-written D3 |
| AI-generated serializable chart specification | **Vega-Lite** | ECharts option, Plotly figure | Structured declarative spec is easy to generate, validate, diff, and store |
| Engineering/scientific 3D chart, contour, heatmap, ternary | **Plotly.js** | ECharts | Rich scientific chart vocabulary already exists |
| Product dashboard / broad chart catalogue | **ECharts** | Plotly.js | Large polished chart/interaction surface |
| Bespoke data-driven visual encoding/layout | **D3** | SVG.js | Low-level data/scale/layout control |
| Chemically correct 2D structures / SMILES / substructure | **RDKit.js** | Ketcher for editing | Use chemistry semantics rather than drawing bonds manually |
| User edits molecular structures/reactions | **Ketcher** | custom editor only with strong reason | Domain-specific chemical editor |
| Interactive macromolecule / molecular 3D | **Mol\*** | 3Dmol.js | Molecular structure semantics and specialized viewing |
| Simple 2D rigid-body interaction | **Matter.js** | Rapier | Collision/constraints without custom physics |
| High-performance 3D physics | **Rapier** | Three.js alone only for deterministic fake motion | Physics engine rather than animation masquerading as simulation |
| Explain/prototype a visual algorithm or simulation | **p5.js examples** | Canvas/SVG.js | Readable algorithmic reference surface |
| Circuit behavior | **CircuitJS/Falstad** | custom solver only if requirements demand it | Do not fake circuit simulation with animated wires |
| Explanatory vector diagram with DOM-accessible shapes | **SVG.js** | native SVG, D3 | Direct vector geometry without data-viz overhead |
| Interactive 2D editor / draggable canvas | **Konva** | tldraw, React Flow | Scene graph, hit testing, transforms, selection |
| GPU-heavy 2D sprites/particles/filter effects | **PixiJS** | custom WebGL/WebGPU | Purpose-built high-throughput 2D renderer |
| Custom 3D/WebGL/WebGPU scene | **Three.js** | R3F in React | Canonical web 3D ecosystem |
| Three.js inside a React product | **React Three Fiber** | imperative Three.js | Declarative React composition around Three.js |
| Component-level UI motion / spring / gesture / layout | **Motion** | CSS, Anime.js | Product UI motion primitives and React integration |
| Complex timeline / scroll choreography | **GSAP** | Anime.js, Motion | Timeline and ScrollTrigger-style orchestration |
| Framework-agnostic SVG/text/timeline animation | **Anime.js** | GSAP | Compact general animation API |
| Visually tuned multi-object 3D/web sequence | **Theatre.js** | GSAP | Visual keyframe authoring linked to code |
| Programmatic explanatory animation | **Motion Canvas** | Remotion | Scene/timeline/audio workflow optimized for coded animation |
| Rendered React video | **Remotion** | Motion Canvas | Video is the product; licensing terms must be checked |
| AI-generated static/process diagram | **Mermaid** | custom SVG | Text grammar is deterministic and cheap to regenerate |
| Editable node/workflow/concept canvas | **React Flow** | tldraw | Product interaction around nodes/edges/handles |
| Large relationship/network visualization | **AntV G6** | Cytoscape.js | Graph layouts/behaviors/performance rather than editor semantics |
| Network analysis + graph-theoretic semantics | **Cytoscape.js** | G6 | Graph analysis and scientific network workflows |
| Infinite whiteboard is the product surface | **tldraw** | Konva | Mature canvas SDK; verify current production licensing |
| Conventional modern vector map | **MapLibre GL JS** | Leaflet | WebGL vector-map styling/layers/camera |
| Very large geospatial data layers | **deck.gl** + MapLibre | custom WebGL | GPU data-layer model |
| 3D globe / terrain / 3D Tiles / Earth trajectories | **CesiumJS** | Globe.GL for decorative data globe | Geospatial semantics rather than generic 3D |
| Visually expressive data globe without GIS complexity | **Globe.GL** | CesiumJS | Thin Three.js globe abstraction |

## Subject-first lookup

### Mathematics

Start with the semantic object, not the desired screenshot.

- **Function + draggable parameter/point:** Mafs.
- **Construction/dependency geometry:** JSXGraph.
- **Calculator-style exploratory environment:** Desmos API / GeoGebra.
- **Scientific surface/contour/ternary:** Plotly.js.
- **3D explanatory geometry:** Three.js/R3F; inspect MathBox patterns.
- **Formula output:** KaTeX; **formula input:** MathLive.

A line graph drawn in generic SVG may look correct while lacking the coordinate transformations, constraint behavior, expression semantics, zoom rules, and accessibility expected from a mathematical object.

### Chemistry

Treat chemical structures as data, not decorative geometry.

- **2D molecule generation/highlighting:** RDKit.js.
- **Structure/reaction editing:** Ketcher.
- **3D molecules/proteins:** Mol*; compare 3Dmol.js for a narrower viewer.
- **General explanatory arrows/energy diagrams/mechanism staging:** use SVG.js/Mafs/Three.js only around domain-correct chemical representations.

For teaching products, it is valid to combine engines: RDKit.js can generate chemically meaningful 2D depictions while SVG/Motion handles explanatory overlays and progressive emphasis.

### Physics and engineering

Separate **simulation** from **animation**.

- If outcomes depend on collision, constraints, gravity, or rigid bodies, use Matter.js/Rapier.
- If motion is an authored explanation rather than a solver result, use Motion/GSAP/Motion Canvas.
- For electronic circuits, inspect CircuitJS/Falstad before writing a solver.
- Use PhET as a benchmark for learner-visible variables, manipulation, feedback, and representational coupling.

Never claim physical correctness merely because a physics engine produced plausible motion. Validate the numerical/model assumptions required by the lesson.

### Graphs, knowledge structures, and process diagrams

Choose by **interaction semantics**:

- Mermaid: generated document diagram.
- React Flow: user manipulates nodes/edges as product objects.
- G6: user explores a relationship network.
- Cytoscape.js: graph analysis semantics matter.
- tldraw/Konva: freeform canvas interaction dominates.

Do not use React Flow merely to render a static flowchart, and do not use Mermaid when nodes need arbitrary direct manipulation.

### Maps and spatial interfaces

- MapLibre GL JS: normal interactive vector map.
- deck.gl: large data layers on/around maps.
- CesiumJS: globe, terrain, 3D Tiles, time-dependent Earth scenes.
- Globe.GL: expressive globe with lighter geospatial semantics.
- Leaflet: lightweight conventional 2D map when its mature plugin model is enough.

### Animation and visual storytelling

Classify the time model before choosing a library:

```text
state transition / gesture / component layout → Motion
precise multi-object timeline / scroll scrub   → GSAP
framework-neutral timeline/SVG/text            → Anime.js
visual keyframe authoring                      → Theatre.js
coded explanatory scene/video                  → Motion Canvas
React-rendered video                           → Remotion
raw 3D scene animation                         → Three.js / R3F
```

A visually impressive effect is not automatically a useful reusable mechanism. The bank should retain timing/state/compositing rules, not only screenshots.

## Reference galleries: where to study before inventing

Use `registries/reference-galleries.yaml` as a deliberate search surface.

High-value defaults:

- **Codrops Demos / Playground** — creative-web mechanisms, scroll, typography, SVG, Three.js, WebGPU, GSAP.
- **Motion Examples** — compact UI animation patterns.
- **Three.js / PixiJS / p5.js official examples** — renderer and algorithm capability maps.
- **G6 / React Flow examples** — graph/network/editor interaction patterns.
- **ECharts / Vega-Lite galleries** — chart vocabulary and live specifications.
- **Cesium Sandcastle / MapLibre examples** — spatial implementation patterns.
- **PhET / Mathigon** — subject-learning interaction benchmarks.
- **Bartosz Ciechanowski / Distill** — interactive explanatory composition and sequencing.
- **React Bits / Aceternity / Magic UI / Uiverse / Animista** — UI-effect pattern mines; quality/licensing must be evaluated item-by-item.

## Agent execution protocol

When asked to build or bank a frontend visual capability:

1. **Name the semantic requirement.** Example: `draggable function parameter`, not `cool graph`.
2. **Query `registries/frontend-tools.yaml`** by domain/capability.
3. **Check the first-party docs/examples** for the top 1–3 candidates.
4. **Check `reference-galleries.yaml`** only when interaction/art direction remains unresolved.
5. **Select the narrowest sufficient tool.** Record why alternatives were rejected.
6. **Build a minimal spike** proving the hard behavior before styling a full product.
7. **Validate semantics, accessibility, performance, and rights** appropriate to the use case.
8. **Promote durable mechanisms into a Resource Package** with concrete code/spec/examples/tests.

## Anti-patterns

- Choosing D3 for every chart.
- Choosing Three.js for every science visual.
- Implementing mathematical coordinates manually before checking a math library.
- Drawing chemical structures as generic SVG paths when chemical semantics matter.
- Animating a fake simulation and describing it as physics.
- Copying a beautiful component without recording its state model/timing/layout mechanism.
- Treating a gallery's existence as permission to redistribute its code/assets.
- Installing five overlapping libraries because the agent did not make a selection.
- Generating a full application before proving the difficult visual mechanism in isolation.
