# AI Design Resource Bank

A reusable creative-resource bank optimized for **AI-assisted production and learning**, not passive bookmarking and not frontend alone.

The repository stores complementary layers:

1. **Design Dictionary** — cross-media vocabulary, recognition cues, natural-language retrieval phrases, examples, related terms, and visual teaching previews.
2. **Examples** — provenance-aware references showing terms or mechanisms in real work.
3. **Mechanisms** — human-facing explanations of how an effect, interaction, representation, or process works, sometimes with runnable proofs.
4. **Resource Packages** — concrete techniques distilled into reusable prompts, skills, code, SVG, PNG, shaders, tokens, motion specs, structured notes, examples, or tests.
5. **Capability registries** — mature libraries, engines, tools, APIs, and reference galleries used when choosing implementation infrastructure.

The bank spans art, graphic design, typography, print, photography, cinema, animation, games, HCI, UI, stage/spatial work, material, texture, lighting, and adjacent creative fields. Frontend is an important implementation domain, not the boundary of the repository.

## Design Dictionary

`dictionary.html` is the human learning / recognition surface.

The v0.1 Dictionary contains 40 cross-media seed terms chosen to stress-test the ontology. Each record can include:

- English and Chinese names;
- aliases and naming status;
- independent `domains` and `kinds` facets;
- concise definition;
- recognition cues;
- ordinary-language `looks_like` phrases for “I can describe it but I do not know the term” retrieval;
- confusing concepts;
- real-world textual example references;
- related in-bank vocabulary;
- an original visual mnemonic or, when the appearance itself is hard to teach through code/SVG, a clearly labeled **AI-generated teaching study**;
- optional Resource Package links.

Image generation is explicitly allowed for original teaching artefacts when that medium communicates the concept better than code: textures, materials, lighting, painterly treatment, cinematic atmosphere, complex surface qualities, and similar visual phenomena. Generated studies must be labeled as generated and kept separate from real example evidence. Temporal or interactive concepts should still prefer live/playable/sequence demonstrations when feasible.

The Dictionary is for learning, browsing, comparing, and selecting vocabulary. **My Selection** is a working tray for collecting terms and copying them into a creative brief; a collection of terms is not automatically a coherent style.

See `docs/DICTIONARY-ONTOLOGY.md` for the full entry contract and generated-artefact rules.

## Editorial Workbench

The repository root is a data-driven implementation workbench. It reads compiled data derived from:

- `registries/frontend-mechanisms.yaml`
- `registries/frontend-tools.yaml`
- `registries/reference-galleries.yaml`
- `catalog.yaml`

The default **Explore** view follows:

`subject → mechanism → live demo → recommended tool → technical detail`

Explore remains intentionally human-readable rather than metadata-heavy. Tool tiers, tags, ecosystems, rights/licensing, maintenance notes, and other machine-useful metadata stay in Search, Index, or progressive detail views.

The visual contract is defined in `docs/EDITORIAL-UI-CONTRACT.md`: black/white/neutral interface, editorial hierarchy, no rainbow domain system, and color reserved for restrained interaction/demo accents.

Current live mechanisms cover mathematics, physics, chemistry, motion, stage/typography/particles, 3D explanation, and graph/spatial interaction.

The site source is `index.html`, `dictionary.html`, and `web/`. `.github/workflows/deploy-board.yml` publishes the static workbench through GitHub Pages when Pages is configured for GitHub Actions.

## The ingestion workflow

```text
You find something worth keeping
        ↓
Send the file / screenshot / link / repo / prompt to an AI agent
        ↓
Agent inspects the source and identifies what is actually reusable
        ↓
Agent decides the correct bank layer(s)
        ↓
Dictionary entry / example / mechanism / Resource Package is created as appropriate
        ↓
Validation + catalog/index updates
```

You should **not** have to decide in advance whether the output should be a Dictionary term, prompt, skill, SVG, code demo, generated teaching artefact, token file, or something else. Representation choice is part of ingestion.

A minimal instruction can be as short as:

> Bank this resource: <link/file>. I care about <optional reason>.

Agents working in this repository should follow `skills/resource-ingest/SKILL.md` and `AGENTS.md`.

## Frontend capability selection

When the requested output actually involves frontend implementation, agents should inspect the bank in this order:

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

These registries are implementation discovery infrastructure, not a claim that every upstream tool has been locally validated and not the conceptual center of the bank. Concrete techniques become trusted bank assets only after ingestion/implementation evidence exists.

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
| texture / material / lighting vocabulary | Dictionary entry + visual study; generated image allowed when useful |
| useful prompting pattern | prompt template + examples |
| repeatable AI procedure | `SKILL.md` + acceptance checks |
| article / paper / talk | distilled mechanism notes + citations, optionally code/spec |
| visual reference with unclear reuse rights | URL + structured visual analysis + recreated/generalized primitives, not copied source assets |

## Retrieval principle

A Dictionary term should answer:

1. What is it called?
2. How do I recognize it?
3. What does it look/feel like?
4. What is it easy to confuse with?
5. What should I inspect next?

A Resource Package should answer without reopening the source:

1. What is it?
2. What exactly is worth reusing?
3. How do I instantiate that mechanism in a new design?
4. What constraints, fidelity limits, and rights issues apply?

Vague tags such as `premium`, `modern`, or `clean` are not enough. Geometry, hierarchy, spacing, typography behavior, compositing, camera behavior, material/process properties, state transitions, timing, implementation methods, prompt contracts, and failure modes are the useful layer.

## Repository contracts

- `AGENTS.md` — behavior expected from agents operating on the bank
- `docs/DICTIONARY-ONTOLOGY.md` — cross-media vocabulary model, rights rules, generated-teaching-artefact rules, and Dictionary UI contract
- `schemas/dictionary-term.schema.json` — machine-readable Dictionary record schema
- `docs/EDITORIAL-UI-CONTRACT.md` — human-facing workbench density and visual rules
- `skills/resource-ingest/SKILL.md` — end-to-end ingestion procedure
- `skills/select-frontend-resource/SKILL.md` — frontend capability/tool selection procedure
- `docs/RESOURCE-PACKAGE.md` — package structure and fidelity model
- `docs/FRONTEND-CAPABILITY-MAP.md` — frontend task/capability decision map
- `schemas/resource.schema.json` — machine-readable Resource Package manifest schema
- `templates/` — package starting templates
- `catalog.yaml` — lightweight Resource Package retrieval index
- `index.html` + `dictionary.html` + `web/` — navigable human-facing surfaces

## Status levels

Resource Packages use:

`raw` → `distilled` → `implemented` → `verified`

Dictionary records use:

`seed` → `reviewed` → `verified` → `deprecated`

Use the strongest status actually supported by evidence.

## Rights rule

Third-party sources are references, not an invitation to mirror their assets. Unless permission/license is clear, store provenance plus transformed analysis, textual references, generalized implementations, recreated primitives, original mnemonics, original generated teaching studies, or links rather than copying third-party binary assets into this public repository.

Generated teaching studies are **not evidence** and must never masquerade as sourced examples. Registry entries also record licensing/API/embed caveats where relevant. Always verify the specific tool/version/demo and third-party assets before redistribution or production use.
