# Human Visual / Interactive Projection — V1 contract

The Human projection and the machine retrieval projection are two views over the same canonical Core. The governing architecture remains [the corrected North Star](KNOWLEDGE-ATLAS-CONTRACT.md): Concept, Example, Tool and Resource are canonical content types; stable IDs are shared; commit/lock semantics belong to machine retrieval; Source remains provenance; Method remains generated.

This document governs **presentation only**. It does not introduce a new canonical world, Example identity, Resource identity or Human selection format. `app/media.json` is a Human-only presentation/provenance audit keyed by stable Example ID; it is not canonical content and does not create new identity.

## Product role

The Human projection is a cross-media creative reference atlas for four linked activities:

1. recognize a visual / interactive mechanism;
2. learn the Concept name for it;
3. compare the mechanism across real Examples and media;
4. inspect the implementation path when a generalized Resource or Tool path exists.

Creative World is the default Human surface because it is the broadest reference corpus. Academic packs remain first-class and continue to expose canonical subject/topic inventories, LIVE studies, local REFERENCE studies and explicit GAPs.

Default navigation remains **Atlas | Explore | Dictionary | Index**. Human browsing ends at understanding, comparison and exact reference identity; there is no selection, cart, commit or download workflow in the Human projection.

### Content-first interface rule

The Human surface is a reference library, not an explanation of AIDRB. Default-visible copy should describe the current reference, Concept, Resource, medium, interaction, mechanism or navigation state. Product architecture belongs in repository documentation, not in the browsing experience.

Do not place onboarding or self-explanatory prose such as “one bank / two projections”, “Human projection”, “canonical Core”, machine workflow explanations, rights-policy explanations or implementation-boundary disclaimers in primary page hierarchy. When a safety or provenance distinction is required, express it through structure, restrained labels, source links and collapsed provenance rather than repeated instructional copy.

Treat every default-visible sentence as suspect unless it helps the user understand the content itself. Prefer names, concise metadata, references, examples and working demos over slogans or explanatory paragraphs.

## Presentation model

Presentation is derived from canonical Example identity plus the Human-only media audit in `app/media.json`. Media audit entries may select one of four display strategies without changing the Example:

| Situation | Human renderer | Rule |
| --- | --- | --- |
| `LIVE` Example with local preview runtime | local live renderer | This is the Example itself. Preserve its stable ID and model constraints. |
| Local `REFERENCE` with an authored AIDRB preview | local study renderer | Render the declared local study. |
| External reference with open-license media or explicit upstream embed support | original source embed / official preview | Prefer the actual reference over an abstract representation. Keep attribution and evidence in the media audit. |
| External reference without explicit redistribution rights | on-demand remote source-page frame + source link | Do not copy third-party binary assets. Let the publisher control framing via its own headers; retain a direct source link. |
| External reference that cannot be shown | medium-aware reference plate | Final fallback only; never a synthetic reconstruction. |
| `Resource` with a declared local HTML demo | sandboxed local demo iframe | Original generalized AIDRB implementation, distinct from the source Example. |
| `GAP` | explicit coverage-gap renderer | Never fabricate media to hide missing coverage. |

The display priority is: **real original media first, fallback plate last**. Public availability alone is not permission to copy bytes into the repository. Local copies require a clear redistribution basis; remote official previews and embeds remain source-attributed and are recorded separately from canonical content.

## Atlas

The default Atlas opens directly into concrete Examples grouped by useful cross-media domains such as editorial/web, cinema/title, identity/motion, spatial/stage and interactive/HCI. These are Human presentation groupings derived from `medium`; they are not new canonical worlds or taxonomies.

The surface should read as an editorial index rather than an equal-weight card wall. Tile width and rhythm may vary by medium, but every tile resolves to the same canonical Example ID.

Academic packs remain reachable directly from the Atlas. Their subject → topic → Example inventory and GAP semantics remain unchanged.

## Explore

Explore is the discovery surface, not an admin query form or onboarding page.

The default stream is Creative-first and presents full-width editorial rows with enough medium / interaction / Concept context to compare references before opening them. It starts with search and references immediately; no manifesto, slogan or product-description hero precedes the content. Search is primary; refinement is secondary and progressively disclosed.

Supported refinement may include world, creative domain, Concept, medium, interaction, visual trait, Resource availability and LIVE / REFERENCE / GAP coverage. Resource availability is derived from existing `Example -> yields -> Resource` relations; it is not copied into another editable field.

Explore must remain usable without opening filters. On mobile, refinement must not create document-wide horizontal overflow.

## Dictionary and Concept detail

Dictionary is a terminology index. A useful Concept path is:

`Concept name → concise definition → demonstrated Examples → cross-media comparison → related Concepts → Resource / Tool implementation path`

Concept detail should expose when to use the mechanism when canonical guidance exists. For Concepts learned from Examples, it may summarize existing transfer constraints and failure modes from those Examples, clearly as derived Human guidance rather than new canonical facts.

A Concept with no Resource remains valid. “No Resource extracted yet” is preferable to inventing implementation material.

## Example detail

Example detail is content-first. The preferred hierarchy is:

1. title, medium, interaction and stable ID;
2. local visual / live demo / medium-aware external reference plate;
3. concise reference summary and demonstrated Concepts;
4. reuse notes and failure modes;
5. related Examples for comparison;
6. yielded Resources, if any;
7. collapsed technical notes and provenance.

Machine/build projection data is not a Human UI section. For an external REFERENCE, provide a compact path to the original source without reproducing unlicensed source assets. For a Resource-bearing Example, distinguish the Resource structurally and with a light “AIDRB implementation” label rather than repeated warning copy.

## Resource detail

Resource detail opens with the Resource name and runnable demo when available. If the package declares a runnable `artifacts/*.html` example, render it in a sandboxed same-origin iframe and provide a compact “open” path.

The page should make the implementation mechanism legible: summary, primitives, states, parameters, failure modes, artifacts and related Examples. A single restrained “AIDRB implementation” label is sufficient to distinguish it from a source reference; repeated explanatory warnings are not. Rights / fidelity / provenance remain collapsed and secondary.

The four Wave 01 Resources — archive-as-interface, editable-model-sandbox, linked-computation-inspector and semantic-zoom-levels — are V1 browser fixtures. The existing reaction-profile Resource remains supported through the same generic Resource route even though it is not one of those four Wave 01 packages.

## Human / machine handoff

The Human projection exposes stable URLs and stable IDs so a person can identify an exact Example, Concept or Resource without entering a workflow state. It must not add `Add to selection`, selection trays, notes forms, commit buttons, downloadable selection JSON or any equivalent cart metaphor.

Machine retrieval keeps its existing selection → commit → lock → deep-fetch protocol. An agent may translate a person's natural-language instruction such as “use this Example” into that machine protocol internally. Human presentation groupings, reference plates and Resource demo routes must never alter canonical IDs.

## Accessibility, performance and evidence

Use semantic links/buttons, visible focus, keyboard-operable LIVE/Resource controls, responsive layouts, reduced-motion support and no document-wide mobile overflow. Typography should prioritize sustained reading: avoid oversized display text, repeated eyebrow/hero stacks and low-contrast explanatory copy when ordinary metadata or a short sentence is enough.

Initial Atlas startup loads the Human shell and generated web index only. Canonical resolve records, relation graph, Dictionary index, media audit and Resource artifacts remain lazy. External source pages are never loaded on the Atlas grid; original media is resolved only after opening an Example, and publisher-controlled source-page embeds are user-triggered unless open-license/explicit embed evidence supports automatic display.

Browser validation must cover desktop and mobile Creative Atlas, academic handoff, Explore, website / cinema / installation / LIVE Example details, automatic original-media rendering, on-demand source-page embedding, representative Concept details, all four Wave 01 Resource demos, absence of Human selection/commit UI, safe provenance rendering, request failures and console errors. Screenshots are evidence and must be visually reviewed; green automated checks alone are insufficient.