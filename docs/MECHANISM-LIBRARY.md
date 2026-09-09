# Mechanism Library

The human-facing layer of this repository is organized around **mechanisms**, not libraries.

A mechanism is a reusable behavior or explanatory move that can be recognized before an implementation stack is chosen: movable tangent, scroll-scrub, camera dolly, bond morph, graph re-layout continuity, and so on.

## Retrieval order

```text
subject / intent
      ↓
mechanism
      ↓
live proof
      ↓
production tool
      ↓
verified Resource Package when available
```

The live proof is deliberately small. It proves the behavior, not the production architecture. A native SVG/DOM proof may therefore recommend Three.js, GSAP, G6, RDKit.js, PixiJS, or another mature tool for real use.

## Editorial chapters

Chapters are declared in `registries/frontend-mechanisms.yaml` rather than hard-coded into the page. The current set is:

- Mathematics
- Physics
- Chemistry
- Motion
- Stage & camera
- Typography
- Rendering & particles
- 3D explanation
- Graphs & space

A chapter should describe a coherent human browsing question. Do not create a chapter merely because a library has a category with the same name.

## What qualifies as a mechanism

Keep an entry when all of these are true:

1. it solves a recurring expressive or explanatory problem;
2. the behavior can be stated without naming a specific library;
3. a small interactive proof can demonstrate the hard part;
4. there is a plausible production implementation path;
5. the pattern is meaningfully different from an existing entry.

Do not bank visual adjectives, one-off art direction, or a vendor feature name as mechanisms.

## Batch 2 research signals

The second expansion was informed by current official/example surfaces rather than by inventing effects from scratch:

- Motion examples — scroll, text, layout, page transitions, Three.js and particle patterns: https://motion.dev/examples
- Motion text examples: https://motion.dev/examples?category=text
- Motion scroll examples: https://motion.dev/examples?category=scroll
- GSAP ScrollTrigger — deterministic scrub/pin/snap behavior: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Codrops 2026 tutorial hub — recent SVG mask, sticky scroll, fluid reveal, WebGL and scene-transition work: https://tympanus.net/codrops/hub/tutorials/
- Codrops scroll-driven 3D case study — full-screen shader/ink-bleed transition as a useful noise-threshold reference: https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/

These sources are discovery and reference surfaces. Their presence here is not a blanket license to copy third-party assets or whole designs.

## Demo rule

One demo should prove one mechanism.

Good:

- camera dolly → relative foreground/background change;
- particle attractor → visible field from particle motion;
- bond morph → atom identity persists while bond state changes;
- graph re-layout → nodes preserve identity through position changes.

Bad:

- a polished hero combining camera, particles, shader wipe, typography, sound and scroll into one demo;
- a screenshot with no manipulable state;
- a fake simulation whose motion is unrelated to the underlying model.

## Human-facing constraint

Explore stays terse: number, title, one sentence, quiet action. Technical data remains searchable and available behind progressive disclosure. The bank may grow substantially without making the browsing surface feel like a dashboard.
