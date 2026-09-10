# Dictionary Artefacts

This directory stores original teaching artefacts used by Dictionary entries when a diagrammatic mnemonic is not the best representation.

Generated image studies use:

`dictionary/artifacts/<term-id>/<descriptive-file>.webp`

or another web-safe raster format allowed by the representation schema.

Each available generated study must also be declared in `dictionary/representations.yaml` with:

- `status: available`
- `asset`
- useful `alt` text
- the existing `target` and `avoid` constraints

The UI labels generated imagery **GENERATED STUDY**. Do not place third-party artwork, film stills, game screenshots, scans, or other copyrighted binary references here unless redistribution rights are explicit.

A generated study is an explanatory artefact, not provenance or evidence. Real-world references remain in each term's `examples` field.
