# AI Design Resource Bank

A reusable creative-resource bank optimized for **AI-assisted production and human learning**, not passive bookmarking.

The repository separates four complementary knowledge layers:

1. **Dictionary** — cross-media vocabulary for naming, recognizing, comparing, and selecting creative techniques across art, graphic design, typography, print, photography, cinema, animation, games, HCI, stage/spatial work, material, texture, lighting, and adjacent disciplines.
2. **Examples** — real works, shots, materials, products, interactions, or playable references that show a term or mechanism in practice. Third-party examples remain references unless reuse rights are clear.
3. **Mechanisms** — reusable explanations of how an effect, behavior, interaction, or representational technique works, optionally with small runnable proofs.
4. **Resource Packages** — concrete techniques distilled into reusable prompts, skills, code, SVG, PNG, shaders, tokens, motion specs, structured notes, examples, or tests.

Capability/tool registries sit alongside these layers as implementation infrastructure. They help an agent choose mature libraries and engines rather than reinventing them.

The intended path is:

`learn / identify → inspect examples → understand mechanism → choose whether to instantiate`

Not every Dictionary term needs to become code or a Resource Package.

## Human-facing workbench

The site has three primary surfaces:

- **Explore** — mechanism-first browsing with runnable proofs and implementation guidance;
- **Dictionary** — visual vocabulary browsing, recognition cues, related concepts, and a persistent selection tray;
- **Index** — terse retrieval of mechanisms, tools, references, and Resource Packages.

The default **Explore** view is intentionally human-readable rather than metadata-heavy. It follows:

`subject → mechanism → live demo → recommended tool → technical detail`

The **Dictionary** follows:

`term → mnemonic → recognition → examples → related vocabulary → selection`

Dictionary v0.1 is deliberately cross-media rather than frontend-centric. Its initial 40 seed terms stress-test the ontology from Chiaroscuro and Impasto through Dolly Zoom and Match Cut to Hit Stop, Coyote Time, Direct Manipulation, Risograph, Foil Stamping, and Variable Font.

The visual contract is defined in `docs/EDITORIAL-UI-CONTRACT.md`: black/white/neutral interface, editorial hierarchy, no rainbow domain system, and color reserved for restrained interaction/demo accents. Dictionary-specific semantics are defined in `docs/DICTIONARY-ONTOLOGY.md`.

The site source is `index.html`, `dictionary.html`, and `web/`. `.github/workflows/deploy-board.yml` is prepared to publish the workbench through GitHub Pages after the repository's Pages source is set to **GitHub Actions**.

## Design Dictionary

Dictionary data is split into small YAML registries under `dictionary/terms/` and indexed by `dictionary/index.yaml`.

Each term records enough information for both human learning and future AI retrieval:

- stable English/Chinese name and aliases;
- `domains` (where it appears) independently from `kinds` (what kind of knowledge it is);
- concise definition and concrete recognition cues;
- `looks_like` phrases written in ordinary language so a future search system can resolve descriptions such as “人物没怎么变大，但背景突然被吸近了” to `Dolly Zoom`;
- concepts it is easy to confuse with;
- real-world example references;
- related in-bank vocabulary;
- an original diagrammatic mnemonic;
- optional links to Resource Packages.

The public repository does not copy third-party imagery merely to make the Dictionary attractive. v0.1 uses original mnemonic diagrams plus textual references to real works/products. Later entries may add external links, owned screenshots, licensed assets, or original recreations when rights allow.

The browser supports English/Chinese/natural-language search, domain and kind filters, related-term navigation, and a local persistent **My Selection** tray. The tray is creative working memory: copied selections are vocabulary for downstream reasoning, not an assertion that every selected term forms one coherent style.

Validation is defined by `schemas/dictionary-term.schema.json` and `scripts/validate_dictionary.py`.

## The ingestion workflow

```text
You find something worth keeping
        ↓
Send the file / screenshot / link / repo / prompt to an AI agent
        ↓
Agent inspects the source and identifies what is actually worth retaining
        ↓
If it adds vocabulary → connect/create Dictionary knowledge
If it contains a reusable production technique → extract the transferable mechanism
        ↓
Agent chooses the best representation(s)
        ↓
Resource Package is created when useful and validated
        ↓
Dictionary / mechanism / package links + catalog are updated as appropriate
```

You should **not** have to decide in advance whether the output should be a prompt, skill, SVG, code demo, token file, shader, visual reference, or vocabulary entry. Representation choice is part of ingestion.

A minimal instruction can be as short as:

> Bank this resource: <link/file>. I care about <optional reason>.

Agents working in this repository should follow `skills/resource-ingest/SKILL.md` and `AGENTS.md`.

## Frontend capability selection

Frontend is one implementation domain in the broader bank. Before hand-building a frontend visual or interaction, agents should inspect the bank in this order:

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
| painting / visual technique | Dictionary entry + recognition notes; optional lighting/prompt/process resource |
| cinematic shot/editing technique | Dictionary entry + shot/mechanism notes; optional motion/camera spec |
| game-feel technique | Dictionary entry + timing/state mechanism + optional playable demo |
| material / print process | Dictionary entry + process/material notes; code only when useful |
| striking UI interaction | runnable HTML/TSX + state/timing spec |
| stage transition / motion effect | minimal demo + motion parameters |
| icon / geometric visual primitive | clean SVG + usage notes |
| useful prompting pattern | prompt template + examples |
| repeatable AI procedure | `SKILL.md` + acceptance checks |
| article / paper / talk | distilled mechanism notes + citations, optionally code/spec |
| visual reference with unclear reuse rights | URL + structured visual analysis + recreated/generalized primitives, not copied source assets |

## Retrieval principle

A saved **Dictionary term** should answer: what is it called, how do I recognize it, what might I confuse it with, and where should I look next?

A saved **Resource Package** should answer four questions without reopening the original source:

1. What is the resource?
2. What exactly is worth reusing?
3. How do I instantiate that mechanism in a new design?
4. What constraints, fidelity limits, and rights issues apply?

Vague tags such as `premium`, `modern`, or `clean` are not enough. Geometry, hierarchy, spacing, typography behavior, compositing, state transitions, timing, camera behavior, material/process properties, interaction rules, prompt contracts, and failure modes are the useful layer.

## Repository contracts

- `AGENTS.md` — behavior expected from agents operating on the bank
- `docs/DICTIONARY-ONTOLOGY.md` — Dictionary knowledge model, rights rules, and browser contract
- `schemas/dictionary-term.schema.json` — machine-readable Dictionary schema
- `dictionary/index.yaml` + `dictionary/terms/` — cross-media vocabulary registry
- `docs/EDITORIAL-UI-CONTRACT.md` — human-facing workbench density and visual rules
- `skills/resource-ingest/SKILL.md` — end-to-end ingestion procedure
- `skills/select-frontend-resource/SKILL.md` — frontend capability/tool selection procedure
- `docs/RESOURCE-PACKAGE.md` — package structure and fidelity model
- `docs/FRONTEND-CAPABILITY-MAP.md` — frontend task/capability decision map
- `schemas/resource.schema.json` — machine-readable Resource Package manifest schema
- `templates/` — package starting templates
- `catalog.yaml` — lightweight Resource Package retrieval index
- `index.html` + `dictionary.html` + `web/` — navigable human-facing workbench

## Status levels

Resource Packages use:

`raw` → `distilled` → `implemented` → `verified`

Dictionary records use:

`seed` → `reviewed` → `verified` → `deprecated`

Use the strongest status actually supported by evidence.

## Rights rule

Third-party sources are references, not an invitation to mirror their assets. Unless permission/license is clear, store provenance plus transformed analysis, generalized implementations, recreated primitives, original diagrams, or textual references rather than copying third-party binary assets into this public repository.

Registry entries also record licensing/API/embed caveats where relevant. Always verify the specific tool/version/demo and third-party assets before redistribution or production use.
