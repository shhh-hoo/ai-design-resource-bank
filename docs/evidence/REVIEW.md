# Knowledge Example Atlas review evidence

## Starting state

Fresh clone of `shhh-hoo/ai-design-resource-bank`; no unpublished work imported. Remote `main` and `feat/knowledge-example-atlas` both resolved to `a6cbfc55d1c8facb69ccaf765fcc6d0159dfcc19`. `git rev-list --left-right --count origin/main...origin/feat/knowledge-example-atlas` returned `0 0`. The initial Resource catalog was empty. Work is on the requested feature branch for one PR to main; no merge or auto-merge.

Read the supplied [AIDRB — North Star](https://docs.google.com/document/d/1oFwGGkhMwVhMacZUzXdqhHyflb5DA3gQrRFn0iGw-CA/edit) through its Google Drive document before implementation. [The corrected v2.1 contract](../KNOWLEDGE-ATLAS-CONTRACT.md) was written first.

## Architecture and migration

Four canonical content types; three overlays; normalized non-content Sources. Method is generated from each Example's concepts/mechanism evidence, grammar, interaction, explicit state/equation model and constraints. Orthogonal lifecycle flags; Example/Resource extraction is optional. Typed relation endpoints and directed curriculum scope are validated. No generic related_to edges are generated. GAP concept links use intended_to_demonstrate so missing examples never assert observed demonstration.

Adapters preserve 24 mechanism IDs as Concepts, 47 original Tool IDs and their capability/use/avoid/rights fields, 99 curriculum entries, 17 subject family inputs, 20 grammar Concepts and 23 reference-gallery Sources. Existing registry files and all web/ assets are unchanged. There were no Resource Packages to migrate; one original reaction-profile package now promotes the existing shared-coordinate mechanism with corrected transition-state labeling. One native-SVG Tool supplements the existing tools. 125 Sources are normalized, with unverified legacy source checks explicitly null.

The root uses Atlas / Explore / Dictionary / Index. All generated files live in catalog/; legacy catalog.yaml is also generated. SQLite is rebuilt from generated FTS input. `build_catalog.py --check` rejects catalog drift and extra files. Human and machine discovery can run in parallel. Browser commit exports exactly the same contract consumed by CLI lock and deep fetch; no identity substitution.

## Chemistry inventory and provenance

12 major topics plus one Chemistry root. 48 concrete example slots: **6 LIVE / 16 REFERENCE / 26 GAP**. Each major topic has four explicit entries. REFERENCE entries are original bounded diagram studies, not copied external binary art. Only the reaction-profile Example/Resource is marked locally verified; verification scope excludes expert scientific review.

31 editorial crosswalks: **17 Cambridge / 14 AP**. Canonical topic → source-node relation direction is explicit, with scope and rationale. AP mappings do not imply NMR, organic synthesis or transition-element coverage. Crosswalks are at major-topic/section level, not an exhaustive objective certification.

Official inputs checked:

- [Cambridge Chemistry 9701, 2025–2027](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf): downloaded and inspected content overview p10 and relevant sections including 5.1/5.2, 7.2, 23, 25.1, 22/37. SHA-256 of inspected PDF: `bc40af1d0789b3217524f380337d3a36e49264f5f28ab991e3e85c9102d53ad2`.
- [AP Chemistry CED, effective Fall 2024](https://apcentral.collegeboard.org/media/pdf/ap-chemistry-course-and-exam-description.pdf): official AP Central link, unit scopes and [Course at a Glance](https://apcentral.collegeboard.org/media/pdf/ap-chemistry-course-at-a-glance.pdf) inspected.

## Retrieval proof

See [retrieval.json](retrieval.json) for actual outputs. `query 'reaction profile' --type Example` returned five compact candidates; **ex:chemistry-reaction-profile ranked first**. Its generated Method contains `concept:reaction-coordinate`; observed implementation is `tool:native-svg`, with `tool:svgjs` a proposed alternative. It yields `resource:reaction-profile`. After commit/lock, fetch returned resource.yaml, README.md and artifacts/profile.js with exact IDs and original aspect notes/constraints preserved.

- 332 stable-ID resolve records, including Sources and overlays.
- 207 AI-index/SQLite FTS rows (Sources are resolved by ID rather than indexed as content candidates).
- 368 typed relations; 0 generic related_to edges.
- All stable IDs and all legacy aliases resolve.
- Rejection tests cover modified IDs/notes, stale commit, duplicate IDs, wrong entity types, GAP substitution, uncommitted deep fetch and artifact path escape.

## Browser and startup

Actual Chrome browser automation at **1440×1000** and **390×844**, with screenshots visually inspected. Both complete flows pass: all four views, all 12 topic inventories, all six live control changes, GAP detail, collapsed AI Build/provenance, no document-wide horizontal overflow, and Web commit → CLI lock → full package fetch. Browser console/page errors and failed HTTP responses: **0**.

Final cold-load measurement, uncompressed local static server: **87,374 response-body bytes / 88,874 browser-reported transferred bytes, 5 requests**. Both viewport runs agree. Loaded: root HTML, atlas.css, atlas.js, visuals.js and web-index.json (46,868 bytes). No AI index, canonical resolve records, relation graph, SQLite, Resource artifacts or old board scripts at startup. Full browser request evidence: [desktop-browser.json](desktop-browser.json), [mobile-browser.json](mobile-browser.json).

Live preview runtime is lazy after opening an Example. Machine deep fetch of full Resource Packages requires a valid lock; this is workflow integrity, not a web access-control mechanism. Public catalog files are directly addressable.

Reviewed screenshots:

- [Desktop Atlas](desktop-atlas.png), [desktop Example](desktop-example.png)
- [Mobile Atlas](mobile-atlas.png), [mobile Example](mobile-example.png)
- [Desktop Explore GAP filter](desktop-explore-gap.png), [mobile Explore GAP filter](mobile-explore-gap.png)
- [Desktop Dictionary](desktop-dictionary.png), [mobile Dictionary](mobile-dictionary.png)
- [Desktop Index](desktop-index.png), [mobile Index](mobile-index.png)

## Local checks and CI contract

[local-validation.txt](local-validation.txt): canonical/schema/ID/source/crosswalk/topic validation, byte-reproducible generated text, Resource schema, all legacy **data** validators, 20 Python tests, 4 model tests, JS syntax and static publish artifact staging passed. Two full browser flows and two local-provenance browser regressions passed. Tests verify energy endpoints/maxima, Boyle invariance, first-order half-life, Hess closure, Gibbs crossover and dilution/water-equilibrium titration behavior.

Required CI now validates this architecture and runs fresh Chromium browser tests. It uploads screenshots, request measurements and selection artifacts. Old decision-board UI/route/performance validators are excluded from required workflows. Pages deploys the Atlas artifact only when main changes; this PR is not merged. Exact PR CI status is reported on GitHub and in the delivery response.

## Remaining limits

- 26 declared coverage gaps; no claim of complete visual or objective-by-objective syllabus coverage.
- Six live models and sixteen original schematics, with stated assumptions; not a validated general chemistry simulation system. No external chemistry expert has reviewed them.
- Chemistry is the only populated canonical Subject Pack; Explore's dimensions support additional packs/media but those inventories are not added here.
- Metadata/FTS retrieval uses lexical matching, not semantic embeddings or a broad recall benchmark. The reaction-profile path is a real successful smoke test, not a general precision guarantee.
- Browser review covers desktop Chrome and mobile viewport emulation, not physical phones, Safari/Firefox, or screen-reader user studies. Labels, keyboard controls and reduced-motion CSS are present.
- Startup numbers are cold local uncompressed bytes, not deployed CDN transfer/compression/latency. Production Pages deployment has not been exercised because the PR remains unmerged.
- Browser selection is tab-local; download before reloading. Locks detect contract/catalog changes but are not authentication signatures.
- Legacy demos are preserved as migration evidence and are not revalidated as the new Human experience. Existing upstream tool docs, licenses and every external link were not all freshly verified.

## PR #12 focused contract corrections (2026-09-11)

Review-fix starting HEAD: `9506274daec7c3dcfa7c9ecda2ecb5f7461d011c`; local worktree and remote were verified clean and identical. All changes remain in the same PR, without merge or auto-merge.

- Stable IDs now map through `record_path(id)` to filesystem-safe catalog subdirectories. All 332 records and every legacy alias resolve. Web/AI/index consumers follow generated `resolve_path` values. Windows reserved device names, path traversal and invalid namespaces have regression coverage. Git LF text normalization, UTF-8 reads and POSIX serialized paths keep catalog fingerprints portable.
- Canonical Sources retain `locator_type` + `locator`; all eight legacy manifest source types are exercised by real temporary Resource Packages through manifest validation → adapter → Core validation → build/drift check → stable-ID resolve. Unicode filenames, Windows screenshot paths, local repository paths, DOI and prompt text survive unchanged. These fixtures do not add production resources or Chemistry coverage. Captured dates and author/notes are retained; imported provenance stays unchecked. Old `Source.url` is explicitly rejected. The diagram-study Source now points to the immutable starting commit.
- Core required fields have concrete types and structured shapes, with format-checked dates and explicit nullability. Schema validation happens before semantic validation and generation. Negative cases cover malformed interaction/state containers and values, tool choices and evidence, ID/constraint arrays, artifact records, topic fields, numeric dates and invalid calendar dates. Resource structured fields are checked against the manifest schema to prevent contract drift.

Desktop/mobile screenshots were captured again and visually inspected, including Atlas, Example detail and expanded local provenance. [Desktop provenance fixture](desktop-provenance-fixture.png) and [mobile provenance fixture](mobile-provenance-fixture.png) show filenames and prompt text as escaped text, alongside working HTTP(S) source links. Mobile expanded provenance has no horizontal overflow. Original four primary views, collapsed initial details, six live controls and exact-ID selection workflow still pass. Console/page errors and failed responses remain zero. The 4,267-byte startup body increase is the compact per-Example resolve pointers plus source-rendering code/styles; no deep metadata is loaded initially.

Local checks: 20 Python tests, 4 model tests, 4 browser tests, all retained data validators, generated drift checks and publish staging pass. Windows CI now independently checks actual checkout, generation/reproducibility, all Python regressions and publish staging. Exact-HEAD CI results are recorded by GitHub after push.

Retrieval evidence was regenerated: `reaction profile` still ranks `ex:chemistry-reaction-profile` first and resolves Method `concept:reaction-coordinate`, observed Tool `tool:native-svg`, and Resource `resource:reaction-profile`; commit/lock/deep fetch succeeds. Counts remain 332 records / 207 AI and FTS rows / 368 typed relations, 12 major Chemistry topics / 48 examples / 31 crosswalks. Broad retrieval quality benchmarking remains unperformed and is not claimed.
