# Resource Package Specification

A **Resource Package** is the atomic unit of this repository. It converts a reference into something a future AI agent can retrieve, understand, adapt, and implement without rediscovering the source from scratch.

## 1. Package path

```text
resources/<domain>/<slug>/
├── resource.yaml
├── README.md
├── source/                 # optional; only when rights/permission allow
├── artifacts/              # zero or more derived reusable artifacts
│   ├── prompt.md
│   ├── SKILL.md
│   ├── demo.html
│   ├── component.tsx
│   ├── styles.css
│   ├── primitive.svg
│   ├── preview.png
│   ├── tokens.json
│   └── motion.json
├── examples/               # optional usage examples
└── tests/                  # optional validation/regression cases
```

Use a stable lowercase kebab-case slug. Domain should describe the reuse context rather than the source website, for example `motion`, `layout`, `typography`, `interaction`, `illustration`, `charts`, `3d`, `prompting`, `agent-skills`, `frontend`, or `brand`.

## 2. Ingestion pipeline

### Step A — Capture
Record the source, source type, author/project if known, capture date, and why it was selected. Preserve enough provenance to revisit the original.

### Step B — Diagnose
State the **specific reusable mechanism**. Avoid aesthetic-only summaries. Examples:

- “The hero feels cinematic” is weak.
- “Foreground title remains fixed for 420 ms while a masked background layer scales 1.00→1.08 with cubic-bezier(.22,.61,.36,1), creating apparent depth without moving the type” is useful.

For an interaction, identify trigger → state change → timing → visual feedback → exit/reversal. For a layout, identify hierarchy → geometry → spacing → responsive behavior. For a prompt/skill, identify inputs → reasoning/selection policy → output contract → failure handling.

### Step C — Decompose
Separate what is reusable from what is source-specific. Extract primitives such as:

- layout rules and ratios
- typography roles and scale relationships
- color/token relationships rather than copied brand colors
- masks, gradients, blend/compositing rules
- motion curves and durations
- interaction state machines
- SVG geometry
- shader/Canvas/Three.js techniques
- component API patterns
- prompt clauses, rubrics, decision rules, schemas
- test cases and known failure modes

### Step D — Select representations
Create only formats that improve future reuse.

| Resource characteristic | Preferred derived artifact |
| --- | --- |
| visual geometry / icon / ornamental shape | SVG + implementation notes |
| raster texture / composition reference | PNG only if rights allow; otherwise structured visual spec |
| UI component / layout pattern | HTML/CSS or TSX + tokens + README |
| motion / transition / stage effect | runnable HTML/TSX demo + `motion.json` or spec |
| 3D / shader technique | minimal runnable code + parameters + fallback |
| prompting pattern | `prompt.md` + input/output examples |
| repeatable agent procedure | `SKILL.md` + acceptance checks |
| design system / repeated values | `tokens.json` |
| article / talk / paper | distilled mechanism notes + citations; code/spec only when justified |

Do not create synthetic PNG/SVG/code simply to fill the package.

### Step E — Normalize
Write `resource.yaml` according to `schemas/resource.schema.json`. Make the README compact but sufficient for retrieval and use.

### Step F — Validate
At minimum check:

- source/provenance is present
- reusable mechanism is concrete
- artifact selection is justified
- generated code is runnable or explicitly marked as pseudocode
- SVG is valid and viewBox-based
- prompts/skills state inputs and outputs
- copied source assets have explicit rights information
- package can be used without reading the original source first

### Step G — Commit
Use a focused commit such as:

`resource: add masked depth-scroll transition`

Prefer one resource package per commit or PR when the package is substantial.

## 3. README contract

Each package README should answer, in this order:

1. **Use this when** — the concrete design problem it helps solve.
2. **Why it works** — the reusable mechanism.
3. **Implementation** — which included artifacts to use and how.
4. **Controls** — important parameters worth changing.
5. **Do not copy** — source-specific branding/content/assets and fidelity limits.
6. **Source** — provenance and attribution.

## 4. Resource status

- `raw` — captured but not decomposed; should be temporary.
- `distilled` — mechanism is extracted and README/manifest are complete.
- `implemented` — includes a reusable implementation artifact.
- `verified` — implementation/examples have been tested or visually reviewed.
- `deprecated` — retained for provenance but should not be reused.

The normal target is `distilled`; use `implemented` or `verified` only when evidence supports it.

## 5. Fidelity model

Use the manifest to state what the package preserves:

- `concept` — underlying idea only
- `behavior` — interaction/motion semantics
- `geometry` — spatial structure or shape
- `visual` — close appearance reproduction where rights permit
- `implementation` — transferable technical method

A package may preserve multiple fidelity dimensions. Do not claim visual fidelity when the output is merely stylistically inspired.
