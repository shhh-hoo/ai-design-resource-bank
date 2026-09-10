# Knowledge Example Atlas — corrected North Star v2.1

Governing baseline: [AIDRB — North Star, Architecture v2](https://docs.google.com/document/d/1oFwGGkhMwVhMacZUzXdqhHyflb5DA3gQrRFn0iGw-CA/edit), read 2026-09-10. This contract applies the requested v2.1 corrections and supersedes the old board navigation contract and curriculum-first routing in AGENTS.md.

## Core and ownership

Only Concept, Example, Tool and Resource are canonical **content** types. Intent, Collection and SubjectTopic are organization overlays. Source is non-content provenance. Grammar is structured descriptive metadata. Method is never a canonical entity: it is generated for an Example from its Concepts/mechanism evidence, grammar, interaction/state model, transfer/fidelity constraints and failure modes.

Example means a perceivable/inspectable/tryable/comparable reference or instance. Resource means implementation material intended for reuse elsewhere. Example → yields → Resource is zero-to-many; Resource → implements → Concept and Example → yields may be many-to-many. A reference does not require extraction into a Resource Package.

Example kinds: LIVE (local runnable instance), REFERENCE (specific inspectable diagram or external reference), GAP (a named missing instance with a reason). GAP has no fabricated preview or implementation claim. `collected`, `showable`, `reusable`, `verified` are independent boolean lifecycle properties. Verification must carry evidence and scope; local behavior verification is not external chemistry peer review.

Hand-edit knowledge/, subjects/ and resources/. Existing registries remain authoritative compatibility inputs until explicitly migrated; adapters do not copy them into a second editable record set. knowledge/tools/adapter.json declares normalization, not duplicate tool content. Existing resource.yaml manifests remain authoritative. catalog/ and the legacy catalog.yaml compatibility export are generated only. A deterministic build and byte drift check protect all generated text; SQLite is rebuilt from generated FTS input and checked logically because SQLite bytes vary by version.

## Two parallel projections and selection

Web and machine retrieval are actor-neutral and can independently discover/compare candidates in parallel. Default navigation: **Atlas | Explore | Dictionary | Index**. Atlas starts at subject → canonical knowledge point → concrete examples. Explore filters examples by medium, interaction, intent and collection. Dictionary explains Concepts through examples. Index is the exhaustive compact entity browser. No primary Examples or curriculum-board navigation.

Example detail displays its visual first, brief identification second, and collapsed AI Build, implementation and provenance afterward. Opening an Example may fetch its compact resolve record, but never full Resource artifacts. Initial startup loads only app HTML/CSS/JS and web-index; AI index, relations, canonical records and build data are lazy.

Candidate query → stable-ID resolve/compare → explicit selection commit → AI lock → deep fetch. Selectors are human, agent or mixed. Commit carries exact Example IDs, per-ID aspect notes and constraints. Lock preserves them verbatim, records the catalog fingerprint and refuses changed IDs, changed notes, uncommitted input, stale catalogs or GAP substitution. A lock is a local integrity contract, not an authentication signature. Deep fetch requires a validated lock, reads only declared package artifacts, and does not fetch arbitrary URLs. Catalog edits after lock require an explicit new commit/lock.

## Provenance and crosswalk direction

Source records retain stable ID, title, publisher/authority, document/URL or repository locator, captured date, checked date (null when not checked), and checking scope. Claims/mappings reference Source IDs and explicit section/objective locators. Legacy mini-source objects are normalized by adapters, preserving the original record inside the legacy input only.

Every crosswalk reads **canonical SubjectTopic RELATION curriculum node**:

- exact: the stated scopes are coextensive, not merely similarly named.
- narrower: the canonical topic scope is a proper subset of the curriculum node.
- broader: the canonical topic scope contains the curriculum node's scope.
- partial: meaningful overlap exists but neither whole scope contains the other.

Mappings require a rationale and checked Source. Curriculum nodes are embedded within crosswalk provenance, not a new canonical content type. No inferred AP coverage of Cambridge-only organic synthesis or NMR. Pack coverage means an explicit example inventory for every major canonical topic, not certification of every syllabus objective.

Typed relations have declared source/target types: demonstrates, intended_to_demonstrate (GAP only; never an observed coverage claim), implemented_with (observed or proposed evidence), yields, implements, requires, has_example, part_of, prerequisite, supports_intent, in_collection, derived_from. related_to is reserved for an explicit rationale where no typed edge fits; no default fallback. Provenance is expressed through source_refs and crosswalks, not content-to-content related_to.

## Migration

| Existing authoritative input | Generated Core/projection |
| --- | --- |
| frontend-mechanisms.yaml | concept:<existing-id>, subtype mechanism; primitives/notes become Method evidence; raw IDs resolve through aliases |
| frontend-tools.yaml | tool:<existing-id>; normalized subtypes, original use/avoid/capabilities/rights preserved |
| subject-visualization-families.yaml grammars | Concept grammar inputs; family/topic seeds remain migration evidence, never automatic Human taxonomy |
| curriculum-subjects.yaml | provenance inventory with original subject IDs, program, family and Source links; not canonical topic names |
| curriculum-research-sources.yaml, reference-galleries.yaml | normalized reusable Sources; checked state is inherited conservatively |
| resources/**/resource.yaml | resource:<existing-id>, preserving manifest ID as alias and path; source_ref normalization |
| old board assets | retained under web/ and legacy entry point; absent from default startup |

Tool subtypes normalize to library, renderer, framework, domain-viewer, simulation-engine, declarative-grammar, embed-api, web-component, authoring-editor. Domain toolkits remain library with domain capabilities; physics engines/simulators → simulation-engine; editors → authoring-editor. Unknown kinds fail validation.

## First implementation decision

Reuse reaction-coordinate mechanism's shared progress/marker state. The legacy source contains a behavior seed, not a verified chemistry Resource. Promote a constrained original reaction-profile package with tests. For small qualitative instructional diagrams, native SVG and form controls are the narrowest sufficient mature platform primitives; add one native-svg Tool, retain registry Plotly/D3/SVG.js alternatives as proposals. No molecular solver or arbitrary plotting engine is recreated. Quantitative demos document equations, units and applicability. Molecule/mechanism examples requiring unimplemented chemistry semantics are GAP, never generic particles. No third-party binary assets are copied.

## Validation contract

Validate schemas/IDs, type-directed relations, provenance, topic cycles and inventory, crosswalk scope/rationale, adapter completeness, resource paths, generated drift, FTS retrieval and identity-preserving lock/deep fetch (including rejection tests). Browser tests exercise all four views, actual interactions, mobile overflow, collapsed details, explicit GAPs, startup requests and console errors. Capture and visually inspect desktop/mobile screenshots. CI validates this contract and retains legacy **data** validators; old board UI/route validators are retired from required CI.
