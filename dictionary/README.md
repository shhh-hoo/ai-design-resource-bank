# Design Dictionary data

The Dictionary separates **term knowledge** from **teaching representation**.

- `index.yaml` — registry entrypoint and source list
- `terms/*.yaml` — vocabulary, recognition cues, examples, relations, and mnemonic type
- `representations.yaml` — the best medium for teaching each term (`diagram`, `live-demo`, `sequence`, `generated-study`, or `real-reference`)
- `artifacts/<term-id>/` — original teaching artefacts when a generated raster study is the best representation

Read `docs/DICTIONARY-ONTOLOGY.md` before changing terminology and `docs/DICTIONARY-REPRESENTATION.md` before choosing or changing learning media.

Do not turn `generated-study` into a default just because image generation is available. The representation must preserve the concept's defining signal better than the alternatives. Generated studies are labeled explanatory artefacts and remain separate from provenance-aware real examples.
