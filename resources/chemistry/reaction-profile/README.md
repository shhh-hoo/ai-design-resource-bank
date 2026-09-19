# Reaction profile

## Use this when
Connect activation energy, reaction progress and reaction enthalpy without claiming a kinetic simulation.

## Why it works
The marker and labels read one state. Smooth monotonic halves meet at the only maximum at coordinate 0.5. The endpoints are explicit: 20 and −20 kJ mol⁻¹; peak 90 kJ mol⁻¹. ΔH = −40 and forward Ea = 70 kJ mol⁻¹. These are illustrative values, not a named measured reaction.

## Implementation
Import `profile` and `profileState` from `artifacts/profile.js`. SVG screen coordinates must be derived from returned energy. The Atlas loads this small preview runtime when showing the live instance; machine Resource Package deep fetch still requires a committed lock. No plotting or molecular solver is implied. Tests live in `tests/models.test.mjs` and browser interaction tests.

## Controls
Progress is a normalized reaction coordinate in [0, 1], not elapsed time. At 0: reactants; at 0.5: transition state; at 1: products. All other positions read reaction path.

## Do not copy
Do not copy an entire broad transition-state region from the legacy demo. Do not infer chemical intermediates, rates or a real pathway from this schematic. Preserve enthalpy endpoints when making catalyst comparisons.

## Source
`registries/frontend-mechanisms.yaml#reaction-coordinate`; original implementation uses its shared progress/marker rule. Curriculum support: Cambridge 9701 sections 5.1 and 8; AP Chemistry units 5 and 6. Source records live under `knowledge/provenance/` and normalized adapters.
