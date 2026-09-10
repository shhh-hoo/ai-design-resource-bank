# Dictionary Representation Routing

The Dictionary stores vocabulary separately from the medium used to teach it. A term should be shown through the representation that preserves its defining signal with the least distortion.

The routing registry is `dictionary/representations.yaml` and is validated by `schemas/dictionary-representation.schema.json` through `scripts/validate_dictionary.py`.

## Representation types

- `diagram` — deterministic schematic or mnemonic; best for geometry, comparison, topology, and compositional relations.
- `live-demo` — runnable or interactive behavior; best when timing, input, camera, interpolation, or feedback is the concept.
- `sequence` — two or more ordered states/frames; best when a cut, transition, preparation, discontinuity, or staging change is the concept.
- `generated-study` — original generated raster artefact; best when material, lighting, surface, atmosphere, or whole-scene perception would be materially weakened by code/SVG simplification.
- `real-reference` — provenance-aware external example; best for historical movements, real physical affordances, and concepts whose context is part of the meaning.

A preferred medium is not exclusive. `fallbacks` describe useful secondary representations.

## Generated studies

Generated studies are allowed as first-class teaching artefacts when they communicate the concept better than code or a mnemonic.

They are not source evidence. They must never be presented as a real artwork, film frame, game screenshot, physical specimen, or historical example.

Every generated-study route records:

- `status`: `planned`, `available`, or `retired`;
- `priority`: `first-wave` or `later`;
- `target`: visual/material properties that must be legible;
- `avoid`: common failure modes or misleading substitutions;
- when available, `asset` and `alt`.

Available assets live under:

`dictionary/artifacts/<term-id>/`

and the public UI labels them **GENERATED STUDY**. The real example section stays separate.

## First generated-study wave

The first wave intentionally spans different visual problems:

1. `chiaroscuro` — directional light and sculptural tonal volume;
2. `impasto` — physical paint relief under raking light;
3. `risograph` — spot-colour overprint, ink grain, and registration drift;
4. `paper-grain` — fiber, roughness, and shallow paper relief;
5. `embossing` — blind raised relief read through light/shadow;
6. `foil-stamping` — angle-dependent metallic reflection on a substrate;
7. `diegetic-ui` — original world-integrated interface in a fictional scene;
8. `environmental-guidance` — light/landmark/path cues working together without explicit arrows.

Later generated candidates include `trompe-loeil`, `collage`, and `film-grain`.

## Routing examples

| Term | Preferred | Why |
| --- | --- | --- |
| Halftone | diagram | dot size/density is deterministic and benefits from exact comparison |
| Variable Font | live-demo | continuous axes are the mechanism |
| Match Cut | sequence | the relationship exists across the cut |
| Impasto | generated-study | physical surface relief is the signal |
| Art Nouveau | real-reference | historical context and authentic integrated ornament matter |
| Coyote Time | live-demo | the user must experience the forgiveness window |

## Quality rule

Do not choose image generation simply because it looks richer. Use it only when the image model can preserve a defining perceptual property that a diagram/demo cannot express efficiently.

Conversely, do not force a concept into code just because the repository can run code. If the learning target is material, cinematic, painterly, or scene-level, a well-scoped generated study may be the more truthful representation.
