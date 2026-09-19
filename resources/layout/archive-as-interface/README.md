# Archive as interface

## Use this when
A large body of work, publications, references or records must stay legible as a corpus instead of being flattened into a card grid.

## Why it works
The archive remains visible while the user filters it. Group headings establish scope, compact metadata rows make comparison cheap, and the same DOM structure supports overview and filtered states.

## Implementation
Use `artifacts/archive-index.js`. `groupArchive()` and `filterArchive()` are pure functions; `renderArchive()` creates semantic sections and rows without injecting source HTML. `demo.html` is a runnable reference with no dependencies.

## Controls
Change `groupBy` for year, category or another stable corpus dimension. Keep only metadata that improves scanning. Search is intentionally in-place: it reduces visible rows without replacing the archive with a different UI.

## Do not copy
Do not copy Whole Earth or Fiona Vilmer content, typography, imagery, project names or branding. Do not assume that high density means minimal hierarchy.

## Source
Generalized from `ex:whole-earth-index` and `ex:fiona-vilmer`; provenance is recorded in `source:whole-earth-index` and `source:fiona-vilmer`.
