# AI Design Resource Bank

A reusable design-resource bank optimized for **AI-assisted production**, not passive bookmarking.

The repository stores three complementary layers:

1. **Capability registries** — mature libraries, engines, tools, APIs, and reference galleries worth checking before reinventing a frontend capability.
2. **Mechanisms** — human-facing interaction/explanation patterns with small runnable proofs and recommended production tools.
3. **Resource Packages** — concrete techniques that have actually been distilled into reusable prompts, skills, code, SVG, PNG, tokens, motion specs, structured notes, examples, or tests.

## Editorial Workbench

The repository root is a data-driven web workbench. It reads:

- `registries/frontend-mechanisms.yaml`
- `registries/frontend-tools.yaml`
- `registries/reference-galleries.yaml`
- `catalog.yaml`

The default **Explore** view is intentionally human-readable rather than metadata-heavy. It follows:

`subject → mechanism → live demo → recommended tool → technical detail`

Explore shows only a mechanism title, one sentence, and a quiet action. Tool tiers, tags, ecosystems, rights/licensing, maintenance notes, and other machine-useful metadata stay in Search, Index, or progressive detail views.

The visual contract is defined in `docs/EDITORIAL-UI-CONTRACT.md`: black/white/neutral interface, editorial hierarchy, no rainbow domain system, and color reserved for restrained interaction/demo accents.

Current first-pass live mechanisms cover mathematics, physics, chemistry, motion, and graph/spatial interaction.

The site source is `index.html` + `web/`. `.github/workflows/deploy-board.yml` is prepared to publish the workbench through GitHub Pages after the repository's Pages source is set to **GitHub Actions**.

## The ingestion workflow

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

## Frontend capability selection

Before hand-building a visual or interaction, agents should inspect the bank in this order:

```text
request/reference
      ↓
name the semantic capability
      ↓
check verified Resource Packages
      ↓
check existing mechanism patterns
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

Key files:

- `registries/frontend-mechanisms.yaml` — reusable human-facing mechanisms and their recommended tools.
- `registries/frontend-tools.yaml` — implementation capability registry across mathematics, data visualization, chemistry, physics/simulation, SVG/Canvas, 2D GPU, 3D, animation, diagrams/graphs, and maps.
- `registries/reference-galleries.yaml` — high-signal official example galleries, interactive-science references, and UI-effect pattern sources.
- `docs/FRONTEND-CAPABILITY-MAP.md` — task → default tool decision map and domain-first selection rules.
- `skills/select-frontend-resource/SKILL.md` — frontend capability/tool selection procedure.

The registries are discovery infrastructure, not a claim that every upstream tool has been locally validated. Concrete techniques become trusted bank assets only after ingestion/implementation evidence exists.

## Resource Packages

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
- `docs/EDITORIAL-UI-CONTRACT.md` — human-facing workbench density and visual rules
- `skills/resource-ingest/SKILL.md` — end-to-end ingestion procedure
- `skills/select-frontend-resource/SKILL.md` — frontend capability/tool selection procedure
- `docs/RESOURCE-PACKAGE.md` — package structure and fidelity model
- `docs/FRONTEND-CAPABILITY-MAP.md` — frontend task/capability decision map
- `schemas/resource.schema.json` — machine-readable Resource Package manifest schema
- `templates/` — package starting templates
- `catalog.yaml` — lightweight Resource Package retrieval index
- `index.html` + `web/` — navigable editorial workbench

## Status levels

`raw` → `distilled` → `implemented` → `verified`

Use the strongest status actually supported by evidence. `deprecated` resources remain searchable for provenance but should not be reused.

## Rights rule

Third-party sources are references, not an invitation to mirror their assets. Unless permission/license is clear, store provenance plus transformed analysis, generalized implementations, recreated primitives, or original diagrams rather than copying third-party binary assets into this public repository.

Registry entries also record licensing/API/embed caveats where relevant. Always verify the specific tool/version/demo and third-party assets before redistribution or production use.
