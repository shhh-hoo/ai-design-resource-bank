# Design Dictionary Ontology

The Design Dictionary is the **human learning and recognition layer** of the AI Design Resource Bank.

It is intentionally broader than frontend/UI. It may describe vocabulary from art, graphic design, typography, print, photography, cinema, animation, games, HCI, stage, spatial design, architecture, material, texture, lighting, sound, and adjacent creative disciplines.

The Dictionary answers:

1. **What is this called?**
2. **How do I recognize it?**
3. **What does it look/feel like in practice?**
4. **What is it easy to confuse with?**
5. **What related vocabulary should I learn next?**
6. **If I want to use it, what mechanisms or Resource Packages are available?**

It is not a replacement for Resource Packages. A term can be worth learning even when it never becomes code, a prompt, a shader, or a reusable package.

## Knowledge layers

```text
DICTIONARY
name + recognition + vocabulary
        ↓
EXAMPLES
works / shots / materials / playable or interactive references
        ↓
MECHANISMS
how the effect or behavior works
        ↓
RESOURCE PACKAGES
how to instantiate it: code / prompt / SVG / shader / motion spec / workflow
```

Tool registries remain implementation infrastructure alongside these layers.

## Faceted model: domain is not kind

Do not force a term into one mutually exclusive discipline folder.

A term has two independent facets:

- `domains`: where the term appears or is useful;
- `kinds`: what kind of knowledge the term represents.

Example:

```yaml
id: dolly-zoom
domains: [cinema, photography, game]
kinds: [camera, motion]
```

This allows vocabulary to move across media without duplicating the concept.

### Domain vocabulary

The registry is extensible. Prefer existing values before creating near-duplicates.

Current seed domains include:

`art`, `graphic-design`, `typography`, `illustration`, `print`, `photography`, `cinema`, `video`, `animation`, `motion-design`, `game`, `hci`, `ui`, `interaction`, `product-design`, `stage`, `spatial`, `architecture`, `material`, `texture`, `lighting`.

### Kind vocabulary

Current seed kinds include:

`style`, `movement`, `composition`, `technique`, `material`, `texture`, `printing`, `typography`, `camera`, `focus`, `editing`, `transition`, `blocking`, `motion`, `animation-principle`, `rendering`, `game-feel`, `feedback`, `interaction`, `hci-principle`, `ui-pattern`, `navigation`, `narrative-device`, `lighting`.

Do not use vague adjectives such as `premium`, `cool`, `modern`, or `cinematic` as kinds.

## Entry contract

Each term needs:

- stable `id`;
- English and Chinese names;
- aliases where useful;
- naming status;
- one or more domains and kinds;
- concise definition;
- concrete recognition cues;
- `looks_like` phrases written in ordinary language;
- concepts it is easy to confuse with;
- at least one example reference;
- related in-bank vocabulary;
- a teaching preview: usually an original diagrammatic mnemonic, but optionally an original generated visual study when that medium explains the concept better;
- optional links to Resource Packages.

`looks_like` is critical. It exists so a person or future semantic search system can retrieve a term from descriptions such as:

> 人物没怎么变大，但背景突然被吸近了。

rather than requiring the user to already know the phrase “Dolly Zoom”.

## Naming status

`naming` describes confidence in the **term**, not the quality of the entry.

- `established`: commonly used disciplinary term.
- `descriptive`: useful normalized phrase, but not a single canonical disciplinary label.
- `vernacular`: common practitioner/community language that may be informal.

`entry_status` describes the **dictionary record**:

`seed → reviewed → verified → deprecated`

The initial 40 terms are seeds chosen to stress-test the ontology across very different media. They are not intended to be a canon or a complete design curriculum.

## Examples, generated teaching artefacts, and rights

The public repository must not mirror copyrighted third-party imagery merely to make the dictionary visually attractive.

For v0.1:

- term cards use **original diagrammatic mnemonics** by default, not reproductions;
- well-known works/products may be named as text references;
- third-party binary assets are not copied into the repository;
- later entries may add external links, licensed media, owned screenshots, original recreations, or **original AI-generated teaching artefacts** when those improve understanding.

Image generation is explicitly allowed when the concept is difficult to teach through code/SVG alone. Good candidates include:

- material and texture qualities such as paper grain, impasto, patina, translucency, or embossed/foiled surfaces;
- lighting conditions such as chiaroscuro, rim light, volumetric haze, or complex mixed-light scenes;
- painterly, photographic, cinematic, or atmospheric treatments where the appearance itself is the learning target;
- complex composition or surface treatment where a minimal diagram would remove the very property being taught.

Do **not** use a generated still as a substitute when the concept is fundamentally temporal, interactive, spatial, or behavioral. Hit Stop, Coyote Time, Match Cut, drag resistance, direct manipulation, and similar concepts should prefer a playable/live/sequence demonstration when feasible.

Generated artefacts are explanatory studies, not external evidence. They must:

1. be clearly labeled on the human-facing page, e.g. `GENERATED STUDY`;
2. never be described as a real artwork, historical reference, film frame, product screenshot, physical material sample, or source asset;
3. live under a term-scoped location such as `dictionary/artifacts/<term-id>/`;
4. preserve a short purpose/generation note sufficient for a later agent to understand what property the artefact is teaching;
5. avoid claiming that a cited real-world example looks exactly like the generated artefact.

`asset_policy` communicates rights for **example references**. Generated teaching artefacts should keep their own provenance separate from those example references so the page never collapses “study” and “evidence” into one thing.

A real example, an original mnemonic, and a generated teaching study serve different jobs:

- **example**: proves where the term is seen in practice;
- **mnemonic**: isolates a mechanism or recognition cue;
- **generated study**: renders a visual/material/lighting quality that is hard to communicate through simplified code or geometry.

Do not present a mnemonic or generated study as if it were a canonical work.

## Relationship to mechanisms and Resource Packages

Dictionary terms can remain pure vocabulary.

When a term has a reusable production mechanism, it may link to one or more Resource Packages through `resource_refs`.

Examples:

- `halftone` could later link to print notes, a shader, or image-processing code;
- `hit-stop` could link to a timing spec and playable demo;
- `foil-stamping` may remain primarily a material/process reference and use a generated surface study for recognition;
- `chiaroscuro` may link to lighting diagrams or prompting guidance and may also benefit from a generated lighting study, without requiring frontend code.

The direction is:

`learn / identify → inspect examples/studies → understand mechanism → choose whether to instantiate`.

Not every term must reach the last step.

## Dictionary UI contract

The Dictionary is for **learning, browsing, comparing, and selecting vocabulary**.

Default term cards should show only:

1. original visual mnemonic **or clearly labeled generated teaching study**;
2. English term;
3. Chinese name;
4. primary kind;
5. one short definition.

Details may reveal recognition cues, natural-language descriptions, example references, confusing concepts, related terms, generated-study provenance, and Resource Package links.

Filtering may use domain and kind because the user has explicitly entered a vocabulary browsing surface. Avoid turning the page into a taxonomy dashboard.

The selection tray is a creative working memory: users can collect terms, then copy the vocabulary as a compact creative brief. Selection is not evidence that the terms form a coherent style; combinations still require design judgment.

## v0.1 acceptance

Dictionary v0.1 should make it possible to:

1. browse at least 40 cross-media seed terms;
2. search by English name, Chinese name, alias, definition, recognition cue, or `looks_like` phrase;
3. filter by domain and kind;
4. open a term and learn how to recognize it;
5. see an original visual mnemonic plus a real-world textual example, with generated teaching studies allowed for terms that need them;
6. navigate to related terms;
7. add/remove terms from a persistent local selection tray;
8. copy selected vocabulary for downstream creative work;
9. validate the registry structure and internal related-term links in CI.

The v0.1 goal is to validate the ontology and browsing behavior, not to claim exhaustive coverage.
