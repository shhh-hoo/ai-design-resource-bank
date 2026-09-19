# Editable model sandbox

## Use this when
A user should change a model and immediately see simulation, derived values and explanatory views respond to the same underlying state.

## Why it works
Controls never own hidden copies of the model. Every edit passes through one store, validation runs before publication, and all derived output is recomputed from the accepted state.

## Implementation
Import `createModelStore()` from `artifacts/model-store.js`. Supply `initial`, `validate(state)`, and `derive(state)`. Subscribe each view to the same snapshot. The demo uses a tiny two-variable model only to show the contract.

## Controls
Choose whether invalid edits are rejected or surfaced through returned errors before calling `set()`. Keep reset tied to the exact initial state. Derived values should remain pure functions of model state.

## Do not copy
Do not copy the simulations, illustrations, prose, examples or domain assumptions from Parable of the Polygons, Seeing Theory or Setosa. The package contains only the generalized state/derivation mechanism.

## Source
Generalized from `ex:parable-of-polygons`, `ex:seeing-theory-basic-probability` and `ex:setosa-markov-chains`.
