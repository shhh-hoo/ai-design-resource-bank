# AI Design Resource Bank

A reusable design-resource bank optimized for **AI-assisted production**, not passive bookmarking.

The repository stores two complementary layers:

1. **Capability registries** — curated upstream libraries, engines, tools, APIs, and reference galleries that tell an AI agent what mature capability to inspect before reinventing it.
2. **Resource Packages** — mechanisms that have actually been distilled into reusable prompts, skills, code, SVG, PNG, tokens, motion specs, structured notes, examples, or tests.

## The workflow

The intended interaction is deliberately simple:

```text
You find something worth keeping
        ↓
Send the file / screenshot / link / repo / prompt to an AI agent
        ↓
Agent inspects the source and identifies the transferable mechanism
        ↓
Agent chooses the best representation(s)
        ↓
Resource Package is created and validated
        ↓
Package + catalog entry are committed here
```

You should **not** have to decide in advance whether the output should be a prompt, skill, SVG, code demo, token file, or something else. Representation choice is part of ingestion.

A minimal instruction can be as short as:

> Bank this resource: <link/file>. I care about <optional reason>.

Agents working in this repository should follow `skills/resource-ingest/SKILL.md` and `AGENTS.md`.

## Frontend capability discovery

Before hand-building a visual or interaction, agents should first inspect the bank's capability layer:

- `registries/frontend-tools.yaml` — machine-readable selection registry across mathematics, data visualization, chemistry, physics/simulation, SVG/Canvas, 2D GPU, 3D, animation, diagrams/graphs, and maps.
- `registries/reference-galleries.yaml` — high-signal official example galleries, interactive-science references, and UI-effect pattern sources.
- `docs/FRONTEND-CAPABILITY-MAP.md` — task → default tool decision map and domain-first selection rules.
- `skills/select-frontend-resource/SKILL.md` — procedure for turning a visual request into capabilities, comparing candidates, proving the hard behavior, and promoting durable techniques into Resource Packages.

The intended selection loop is:

```text
request/reference
      ↓
name the semantic capability
      ↓
check verified Resource Packages
      ↓
check frontend capability registry
      ↓
inspect first-party examples + selected references
      ↓
choose narrowest sufficient engine/library
      ↓
prove hard behavior in a minimal spike
      ↓
implement
      ↓
if reusable → bank the mechanism as a Resource Package
```

The registry is intentionally **not** a claim that every listed tool has been locally validated. It is a curated upstream capability map. Concrete techniques become trusted bank assets only after ingestion/implementation evidence exists.

## What gets stored

```text
resources/<domain>/<slug>/
├── resource.yaml            # machine-readable provenance + mechanism + artifact index
├── README.md                # compact usage guide
├── source/                  # optional; only when rights allow
├── artifacts/               # selected derived assets/code/prompts/skills/specs
├── examples/                # optional
└── tests/                   # optional
```

Typical transformations:

| Input worth saving | Useful bank output |
| --- | --- |
| striking UI interaction | runnable HTML/TSX + state/timing spec |
| stage transition / motion effect | minimal demo + motion parameters |
| icon / geometric visual primitive | clean SVG + usage notes |
| layout / component pattern | component code + CSS/tokens |
| useful prompting pattern | prompt template + examples |
| repeatable AI procedure | `SKILL.md` + acceptance checks |
| article / paper / talk | distilled mechanism notes + citations, optionally code/spec |
| visual reference with unclear reuse rights | URL + structured visual analysis + recreated/generalized primitives, not copied source assets |

## Retrieval principle

A saved resource should answer four questions without reopening the original source:

1. What is it?
2. What exactly is worth reusing?
3. How do I instantiate that mechanism in a new design?
4. What constraints, fidelity limits, and rights issues apply?

Vague tags such as `premium`, `modern`, or `clean` are not enough. Geometry, hierarchy, spacing, typography behavior, compositing, state transitions, timing, implementation methods, prompt contracts, and failure modes are the useful layer.

## Repository contracts

- `AGENTS.md` — behavior expected from agents operating on the bank
- `skills/resource-ingest/SKILL.md` — end-to-end ingestion procedure
- `skills/select-frontend-resource/SKILL.md` — frontend capability/tool selection procedure
- `docs/RESOURCE-PACKAGE.md` — package structure and fidelity model
- `docs/FRONTEND-CAPABILITY-MAP.md` — frontend task/capability decision map
- `schemas/resource.schema.json` — machine-readable Resource Package manifest schema
- `templates/` — package starting templates
- `registries/frontend-tools.yaml` — curated implementation capability registry
- `registries/reference-galleries.yaml` — curated example/reference surfaces
- `catalog.yaml` — lightweight Resource Package retrieval index

## Status levels

`raw` → `distilled` → `implemented` → `verified`

Use the strongest status actually supported by evidence. `deprecated` resources remain searchable for provenance but should not be reused.

## Rights rule

Third-party sources are references, not an invitation to mirror their assets. Unless permission/license is clear, store provenance plus transformed analysis, generalized implementations, recreated primitives, or original diagrams rather than copying third-party binary assets into this public repository.

Registry entries also record licensing/API/embed caveats where relevant. Always verify the specific tool/version/demo and third-party assets before redistribution or production use.
