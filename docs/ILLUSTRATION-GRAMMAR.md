# Illustration Grammar

The Illustration Grammar is the bank's **composable model for illustration**, not a catalogue of named presets.

It exists because "hand-drawn", "editorial", "storybook", "comic", "ink", "gouache", or a numbered style reference each collapse several independent decisions into one label. Those labels remain useful for browsing and historical vocabulary, but production and learning need the underlying parts.

The working rule is:

> **Reference broadly; decompose aggressively; recombine intentionally.**

A source repository can contribute one useful mechanism without defining the bank's scope. See `registries/illustration-sources.yaml` for provenance, license notes, what to borrow, and what not to inherit.

## 1. The composable axes

An illustration can be described as a combination of the following axes. Not every work needs every field.

### A. Mark / line

How marks are physically or visually constructed.

Examples:

- monoline contour
- pressure-sensitive contour
- broken ink line
- continuous line
- scratchy pencil
- dry-brush edge
- double-pass sketch line
- wobbled geometric line
- scribble
- hatching / cross-hatching
- stippling
- crayon drag
- marker bleed

Useful machine parameters may include:

`stroke_width`, `pressure/thinning`, `roughness`, `bowing`, `n_passes`, `line_break_frequency`, `seed`.

Rough.js is useful for parameterized geometric irregularity; Perfect Freehand is useful for pressure-sensitive freehand stroke geometry. They model different things and should not be collapsed into one "hand-drawn" switch.

### B. Shape language

How forms are simplified and proportioned.

Examples:

- geometric block construction
- rounded organic masses
- elongated figures
- naive childlike proportion
- silhouette-first character design
- cut-paper shape
- blob character
- angular caricature
- highly reduced icon-like figure
- anatomical / observational drawing

Record silhouette, head/body ratio, limb treatment, facial abstraction, corner softness, and shape repetition separately when they matter.

### C. Fill / value construction

How areas receive tone or color.

Examples:

- flat fill
- transparent wash
- opaque gouache block
- hachure
- cross-hatch
- scribble fill
- stipple
- dry brush
- graphite shading
- crayon wax fill
- spot-color overprint
- collage fill

Do not describe all non-solid fill as "texture". Fill grammar and surface texture are related but different axes.

### D. Edge behavior

The boundary quality of marks and fills.

Examples:

- crisp cut edge
- feathered watercolor edge
- dry broken edge
- ink bleed
- soft pastel edge
- misregistered print edge
- torn-paper edge
- scissor-cut edge
- hard vector-like edge

This is often more diagnostic than generic style adjectives.

### E. Medium / material simulation

What physical or production medium the image claims or suggests.

Examples:

- graphite
- ballpoint pen
- fountain/brush ink
- watercolor
- gouache
- acrylic / impasto
- crayon / wax pastel
- colored pencil
- marker
- risograph
- screen print
- linocut / woodcut
- collage
- paper cut / paper sculpture
- digital paint
- 3D clay / vinyl-like render

For generated imagery, distinguish **medium appearance** from evidence of a real physical artefact. A generated "risograph-like" study is not a real Riso print.

### F. Palette logic

Color organization rather than a list of fashionable hex values.

Examples:

- monochrome
- black + one spot color
- two/three spot colors
- muted analogous palette
- complementary pair
- warm/cool split
- jewel tones
- pastel high-key
- earth pigments
- high-saturation flat palette
- value-first near-monochrome

Store the role of accent colors where possible: focal, annotation, depth separation, emotional cue, print plate, etc.

### G. Light / value strategy

Especially important for painterly, cinematic, material, and spatial illustration.

Examples:

- flat ambient
- chiaroscuro
- rim light
- backlight silhouette
- raking material light
- soft diffuse daylight
- spotlight vignette
- colored bounce
- high-key / low-key

Light is not interchangeable with palette. It changes form, depth, hierarchy, and material readability.

### H. Space / perspective

How the world is organized spatially.

Examples:

- flat orthographic
- naive perspective
- one-point / two-point perspective
- axonometric / isometric
- compressed telephoto-like space
- cutaway
- exploded view
- layered paper depth
- deep cinematic staging
- large-empty-space miniature figure

### I. Composition role

What the illustration is doing on the page or screen.

Examples:

- spot illustration
- editorial vignette
- full bleed
- poster composition
- hero image
- marginal doodle
- annotated field sketch
- before / after
- route / map
- local system view
- cutaway
- sequential vignette
- comic panel/page
- storyboard frame
- decorative border/frame

A visual style does not determine composition role. The same ink language can serve a spot illustration, comic, map, or full-page scene.

### J. Narrative mechanism

How the image turns an idea into a scene.

Examples:

- literal depiction
- conceptual metaphor
- visual pun
- anthropomorphism
- scale inversion
- impossible but legible physical action
- before/after state change
- cause/effect chain
- process embodied as machine/object
- environmental storytelling
- character reaction
- symbolic object

For editorial illustration, this axis often contributes more value than surface style.

### K. Character system

When recurring people/creatures matter, record them independently from style.

Useful fields:

- silhouette
- head/body proportion
- facial abstraction
- eye/mouth grammar
- anatomy exaggeration
- gesture vocabulary
- wardrobe logic
- recurring props
- emotional range
- turnaround/continuity references

A character reference and a style reference are different inputs. Never use one as a silent substitute for the other.

### L. Annotation / text relationship

Examples:

- no text
- caption outside image
- sparse handwritten labels
- callouts
- arrows
- integrated diegetic text
- speech balloon
- sound effect lettering
- marginal notes
- diagram labels

Text should be treated as content and hierarchy, not merely another texture. For generated images with exact copy requirements, consider generating a text-safe art layer and typesetting afterward.

### M. Imperfection model

"Handmade" is not one kind of error.

Possible controlled imperfections:

- line wobble
- bowing
- pressure variation
- overdraw / repeated passes
- registration drift
- paint outside contour
- dry gaps
- fiber/grain visibility
- uneven opacity
- torn/cut variance
- asymmetry
- naive perspective
- inconsistent but intentional spacing

Name the imperfection you want. Do not add random noise everywhere.

### N. Temporal behavior

For illustrated motion, whiteboard animation, animated diagrams, and game-like explanatory visuals.

Examples:

- stroke draw-on
- write-on
- sequential reveal
- smear
- squash/stretch
- secondary motion
- loop
- stagger
- camera pan/zoom
- page/panel transition

A still-image prompt is not enough when timing is the concept. Use a sequence, live demo, or explicit animation representation.

## 2. Style recipes are combinations, not ontology

Named styles and presets may be stored as **recipes over the axes**.

Example, not a canonical preset:

```yaml
recipe: sparse-editorial-ink
mark:
  family: pressure-contour
  line_weight: thin
  wobble: low
shape:
  abstraction: simplified-observational
fill:
  mode: transparent-wash
palette:
  logic: black-plus-one-spot
composition:
  role: editorial-vignette
  whitespace: high
narrative:
  mechanism: conceptual-metaphor
annotation:
  mode: sparse-handwritten
imperfection:
  pressure_variation: medium
  registration_drift: none
```

This recipe could be changed without inventing a new named style. It also makes AI generation, code rendering, and human comparison easier because the intended mechanism is explicit.

## 3. What we borrow from current GitHub references

The current source set is deliberately heterogeneous.

### `yang0/handraw-style`

Borrow:

- visual gallery + stable identifiers;
- generated style names plus concise visible traits;
- reference-image isolation from subject/content;
- capability-aware escalation from name → traits → image reference.

Do not inherit:

- a numbered style menu as the illustration ontology;
- author-linked presets as our primary vocabulary;
- source images or prompt text without clear reuse rights.

### `threerocks/hand-drawn-styles`

Borrow:

- reusable recipe files separate from project content;
- deterministic prompt rendering;
- explicit style-only anchors;
- staged correction for visual properties that are unstable in one pass;
- validation of production invariants.

Do not inherit its fixed family of styles as our limits.

### `Yuvakunaal/kunaal-illustrations`

Borrow:

- illustration placement based on cognitive anchors;
- separate style DNA / composition / character / prompt / QA documents;
- physical-metaphor generation;
- anti-repetition rules;
- post-generation QA based on actual failure modes.

Do not inherit its one house style, mascot system, white background, or annotation palette as defaults.

### `ToBeWin/HandDraw-Skill`

Borrow:

- scene DSL thinking;
- one visual concept per short scene;
- explicit timing/object animations;
- editable source → validation → render pipeline.

This informs animated illustration and explainer motion, not painterly stills.

### `rough-stuff/rough` + `steveruizok/perfect-freehand`

Borrow:

- parameterized mark construction;
- seeded reproducibility;
- independent roughness, bowing, fill pattern, pressure, and stroke width;
- code-native rendering when the concept is geometric/diagrammatic rather than painterly.

Do not claim these procedural marks are equivalent to real ink, graphite, crayon, or paint.

### `baoyu-comic`

Borrow:

- art technique, tone, layout, aspect, and language as separable dimensions;
- explicit reference roles (style / palette / scene);
- storyboard and character-bible continuity;
- targeted regeneration.

Do not inherit the comic format or its small art-style menu as the default for illustration.

## 4. Reference roles

When using reference images, declare what each one is allowed to influence.

Recommended roles:

- `style`: line, fill, edge, medium, abstraction
- `palette`: color relationships only
- `character`: identity/proportion/wardrobe/prop continuity
- `composition`: spatial organization/crop only
- `material`: surface/reflectance/texture only
- `lighting`: illumination/value structure only
- `scene`: environment/setting/prop relationships

A reference can have multiple explicit roles, but do not silently copy subject, composition, or story from a style-only reference.

## 5. Representation routing for illustration

Prefer the representation that teaches or produces the actual property:

- line geometry / hatching / layout → SVG or code demo may be best;
- pressure/freehand input → interactive stroke demo;
- watercolor, gouache, paper, print, painterly surface → generated/owned/real raster study;
- historical style/movement → real references plus vocabulary;
- character continuity → character sheet + textual bible;
- sequential action / comic pacing → storyboard or panel sequence;
- animated hand-drawing → explicit animation DSL / live demo;
- exact data or geometry → deterministic diagram/plot first, optional hand-drawn rendering second.

Never choose image generation simply because an illustration request contains the word "hand-drawn".

## 6. QA: judge the intended axis, not generic prettiness

A study passes only if the property it is meant to teach is actually visible.

Examples:

- a `paper-grain` study fails if the result is just random digital noise;
- `impasto` fails if the brushstroke is visually flat;
- a line-style study fails if all apparent hand quality comes from paper texture;
- a conceptual editorial illustration fails if it is attractive but says nothing about the idea;
- a sequence fails if adjacent frames do not make the temporal mechanism legible;
- a character series fails if silhouette, proportions, or recurring props drift.

General QA questions:

1. Which axes are intentional?
2. Can a viewer identify those properties without reading the label?
3. Are unrelated axes accidentally dominating the result?
4. Is the image teaching a concept, providing evidence, or serving as a production artefact? Is that role labeled honestly?
5. Does the result depend too heavily on one source reference or named artist?
6. Would a different representation teach the concept more truthfully?

## 7. How this enters the Dictionary

Do not add every recipe as a term.

Dictionary entries should primarily represent **established or useful vocabulary**, for example:

- contour drawing
- continuous line
- hatching
- cross-hatching
- stippling
- dry brush
- ink wash
- watercolor wash
- gouache
- linocut
- collage
- cut-paper illustration
- spot illustration
- editorial illustration
- caricature
- visual metaphor
- visual pun
- character sheet
- turnaround
- model sheet
- sequential art
- ligne claire
- naive perspective
- limited palette
- spot color

Recipes then point to those terms and combine them.

This keeps the Dictionary useful for learning while leaving the production system open-ended.
