# Pre-PR12 interactive example preservation audit

Baseline: `a6cbfc55d1c8facb69ccaf765fcc6d0159dfcc19` (main immediately before PR #12).

PR #12 preserved the mechanism registry and implementation files but removed the old workbench from the default deployment. The migration therefore retained Concept metadata while making several concrete interactive examples unreachable from the product. This correction restores them as canonical `Example` records and keeps the original implementation deployable during incremental migration.

| Preserved demo | Canonical Example | Concept | Implementation |
| --- | --- | --- | --- |
| Camera dolly | `ex:camera-dolly-interactive-study` | `concept:camera-dolly` | `legacy.html#mechanism:camera-dolly` |
| Orbital overlap | `ex:orbital-overlap-interactive-study` | `concept:orbital-overlap` | `legacy.html#mechanism:orbital-overlap` |
| Depth parallax | `ex:depth-parallax-interactive-study` | `concept:depth-parallax` | `legacy.html#mechanism:depth-parallax` |
| Split text reveal | `ex:split-text-reveal-interactive-study` | `concept:split-text-reveal` | `legacy.html#mechanism:split-text-reveal` |
| Particle attractor | `ex:particle-attractor-interactive-study` | `concept:particle-attractor` | `legacy.html#mechanism:particle-attractor` |
| Noise threshold wipe | `ex:noise-threshold-wipe-interactive-study` | `concept:noise-threshold-wipe` | `legacy.html#mechanism:noise-threshold-wipe` |
| Explode / assemble | `ex:explode-assemble-interactive-study` | `concept:explode-assemble` | `legacy.html#mechanism:explode-assemble` |
| Scroll scrub | `ex:scroll-scrub-interactive-study` | `concept:scroll-scrub` | `legacy.html#mechanism:scroll-scrub` |
| Stage spotlight | `ex:stage-spotlight-interactive-study` | `concept:stage-spotlight` | `legacy.html#mechanism:stage-spotlight` |
| Bond morph | `ex:bond-morph-interactive-study` | `concept:bond-morph` | `legacy.html#mechanism:bond-morph` |
| Graph relayout | `ex:graph-relayout-interactive-study` | `concept:graph-relayout` | `legacy.html#mechanism:graph-relayout` |
| Canvas focus lens | `ex:canvas-focus-lens-interactive-study` | `concept:canvas-focus-lens` | `legacy.html#mechanism:canvas-focus-lens` |
| Anchored callout | `ex:anchored-callout-interactive-study` | `concept:anchored-callout` | `legacy.html#mechanism:anchored-callout` |

## Invariant
Future architecture or UI migrations must compare the deployed Example inventory before and after the change. Existing showable Examples may only disappear through explicit deprecation with a documented replacement. “Still exists somewhere in Git” is not sufficient preservation.
