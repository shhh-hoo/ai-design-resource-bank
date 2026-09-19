# Human Visual / Interactive Projection — V1 contract

The Human projection and the machine retrieval projection are two views over the same canonical Core. The governing architecture remains [the corrected North Star](KNOWLEDGE-ATLAS-CONTRACT.md): Concept, Example, Tool and Resource are canonical content types; stable IDs and commit/lock semantics are shared; Source remains provenance; Method remains generated.

This document governs **presentation only**. It does not introduce a new canonical world, media-asset registry, Example identity, Resource identity or selection format.

## Product role

The Human projection is a cross-media creative reference atlas for four linked activities:

1. recognize a visual / interactive mechanism;
2. learn the Concept name for it;
3. compare the mechanism across real Examples and media;
4. select exact Examples and, where available, inspect a generalized Resource implementation.

Creative World is the default Human surface because it is the broadest reference corpus. Academic packs remain first-class and continue to expose canonical subject/topic inventories, LIVE studies, local REFERENCE studies and explicit GAPs.

Default navigation remains **Atlas | Explore | Dictionary | Index**. Selection is shared with machine retrieval and remains accessible globally.

## Presentation model

Presentation is derived in the Human client from existing Example fields (`kind`, `medium`, `preview`, lifecycle and relations). It is not persisted as canonical identity.

| Canonical situation | Human renderer | Rights / semantic rule |
| --- | --- | --- |
| `LIVE` Example with local preview runtime | local live renderer | This is the Example itself. Preserve its stable ID and model constraints. |
| Local `REFERENCE` with an existing AIDRB schematic preview | local study renderer | Render only the authored AIDRB study declared by the Example. Do not imply it is source media. |
| External editorial / web reference | editorial reference plate + original-source link | No copied site screenshot or remote page is required. The plate communicates medium and interaction, not source appearance. |
| External film / title sequence | moving-image reference plate + original-source link | Do not copy frames, posters or video unless a later canonical media contract explicitly establishes display rights. |
| External identity / motion system | identity reference plate + original-source link | The plate is an AIDRB navigation primitive, not a reconstruction of the identity. |
| External stage / installation / spatial work | spatial reference plate + original-source link | Do not fake installation imagery or spatial documentation. |
| External interactive / HCI / data work | interactive reference plate + original-source link | Do not iframe the source merely because it is technically embeddable. Source interaction remains external unless explicitly allowed. |
| `Resource` with a declared local HTML demo | sandboxed local demo iframe | This is an original generalized implementation and must be labelled as a Resource, never as an Example preview. |
| `GAP` | explicit coverage-gap renderer | Never generate a plausible visual to hide missing coverage. |

A reference plate is deliberately **not** a synthetic screenshot. It uses AIDRB typography, layout and abstract medium cues only. The detail view states that source media is external.

V1 intentionally does not infer remote-embed rights from `Source.locator`. A future image / gallery / video / iframe renderer may be added only when canonical provenance can explicitly distinguish: locally displayable asset, permitted remote embed, external-link-only reference, and no lawful visual asset. Until then, external-link fallback is the correct renderer.

## Atlas

The default Atlas opens the Creative World and groups concrete Examples by useful cross-media domains such as editorial/web, cinema/title, identity/motion, spatial/stage and interactive/HCI. These are Human presentation groupings derived from `medium`; they are not new canonical worlds or taxonomies.

The surface should read as an editorial index rather than an equal-weight card wall. Tile width and rhythm may vary by medium, but every tile resolves to the same canonical Example ID.

Academic packs remain reachable directly from the Atlas. Their subject → topic → Example inventory and GAP semantics remain unchanged.

## Explore

Explore is the discovery surface, not an admin query form.

The default stream is Creative-first and presents full-width editorial rows with enough medium / interaction / Concept context to compare references before opening them. Search is primary; refinement is secondary and progressively disclosed.

Supported refinement may include world, creative domain, Concept, medium, interaction, visual trait, Resource availability and LIVE / REFERENCE / GAP coverage. Resource availability is derived from existing `Example -> yields -> Resource` relations; it is not copied into another editable field.

Explore must remain usable without opening filters. On mobile, refinement must not create document-wide horizontal overflow.

## Dictionary and Concept detail

Dictionary is a terminology index. A useful Concept path is:

`Concept name → concise definition → demonstrated Examples → cross-media comparison → related Concepts → Resource / Tool implementation path`

Concept detail should expose when to use the mechanism when canonical guidance exists. For Concepts learned from Examples, it may summarize existing transfer constraints and failure modes from those Examples, clearly as derived Human guidance rather than new canonical facts.

A Concept with no Resource remains valid. “No Resource extracted yet” is preferable to inventing implementation material.

## Example detail

Example detail is visual-first. The preferred hierarchy is:

1. local visual / live demo / medium-aware external reference plate;
2. title, medium, interaction and stable ID;
3. why the Example is banked;
4. demonstrated Concepts;
5. reusable observations;
6. transfer constraints / failure modes;
7. related Examples for comparison;
8. yielded Resources, if any;
9. collapsed machine/build projection, state/model limits and provenance.

For an external REFERENCE, the first screen must provide a clear path to the original source without reproducing unlicensed source assets. For a Resource-bearing Example, the Resource callout must explicitly say that the generalized Resource is not the source Example preview.

## Resource detail

Resource detail is a Human view over an existing Resource Package. If the package declares a runnable `artifacts/*.html` example, render it in a sandboxed same-origin iframe and provide an “open demo alone” path.

The page should make the implementation mechanism legible: summary, primitives, states, parameters, failure modes, artifacts and the Examples from which the mechanism was generalized. Rights / fidelity / provenance remain visible but secondary.

The four Wave 01 Resources — archive-as-interface, editable-model-sandbox, linked-computation-inspector and semantic-zoom-levels — are V1 browser fixtures. The existing reaction-profile Resource remains supported through the same generic Resource route even though it is not one of those four Wave 01 packages.

## Selection and machine compatibility

Human selection does not create a second selection model. It continues to commit exact Example stable IDs with per-ID aspect notes and constraints, the catalog fingerprint and canonical digest. Editing after commit invalidates the downloadable committed state. Machine lock and deep Resource fetch continue to consume that committed format without substitution.

Human presentation groupings, reference plates and Resource demo routes must never alter canonical IDs.

## Accessibility, performance and evidence

Use semantic links/buttons, visible focus, keyboard-operable LIVE/Resource controls, responsive layouts, reduced-motion support and no document-wide mobile overflow.

Initial Atlas startup loads the Human shell and generated web index only. Canonical resolve records, relation graph, Dictionary index and Resource artifacts remain lazy. External reference pages are not fetched or executed as part of rendering a reference plate.

Browser validation must cover desktop and mobile Creative Atlas, academic handoff, Explore, website / cinema / installation / LIVE Example details, representative Concept details, all four Wave 01 Resource demos, shared selection commit → CLI lock/fetch, safe provenance rendering, request failures and console errors. Screenshots are evidence and must be visually reviewed; green automated checks alone are insufficient.