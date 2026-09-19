# Semantic zoom levels

## Use this when
Zoom should reveal a different level of meaning—overview, context, detail—instead of merely enlarging the same labels and geometry.

## Why it works
Information density is controlled by explicit semantic thresholds. Hysteresis prevents rapid level changes around a boundary, and each level declares the fields it is allowed to reveal.

## Implementation
Use `levelForScale()` for stateless lookup or `createSemanticZoom()` when the interface needs stable transitions near thresholds. Keep geometry rendering separate; the returned level should decide labels, aggregation and detail.

## Controls
Define ordered levels with `minScale` and `fields`. Adjust hysteresis in the same units as scale. Thresholds should correspond to genuine information levels, not arbitrary visual breakpoints.

## Do not copy
Do not copy the 100,000 Stars dataset, rendering, tour, labels or Google identity. Do not present ordinary camera zoom as semantic zoom if the information layer never changes.

## Source
Generalized from `ex:google-100000-stars` and the existing `concept:semantic-zoom`; provenance includes `source:google-100000-stars` and `source:legacy-mechanisms`.
