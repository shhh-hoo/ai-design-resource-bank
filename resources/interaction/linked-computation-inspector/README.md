# Linked computation inspector

## Use this when
A user needs to understand how one output value was produced from a local set of inputs: image kernels, grid rules, node metrics, formula substitutions, or similar computations.

## Why it works
Selection is the shared key. Input neighborhood, operation, intermediate products and output are derived together from that key, so the explanation cannot silently drift away from the computed result.

## Implementation
Use `inspectKernel()` in `artifacts/linked-inspector.js` for the included matrix example, or reuse the same shape—`selection / input / operation / output`—for a different computation. The functions are pure and dependency-free.

## Controls
Expose padding behavior and kernel values. Keep the selected row/column visible. If adapting the pattern, make every linked view read from the same selected key and model revision.

## Do not copy
Do not copy Setosa's illustrations, prose, example images, page layout or code. This resource only implements the generalized linked-inspection mechanism.

## Source
Generalized from `ex:setosa-image-kernels`; provenance is `source:setosa-image-kernels`.
