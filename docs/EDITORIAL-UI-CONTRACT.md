# Editorial UI Contract

The web board is for humans first. Machine-readable density belongs in registries, manifests, and detail views—not on the browsing surface.

## Default visual language

- Black, white, off-white, and neutral grey are the interface palette.
- Do not assign rainbow colors to domains.
- Color is an accent for interactive state, live demos, or one genuinely meaningful semantic distinction.
- Prefer editorial typography, rules, spacing, and hierarchy over dashboard cards, pills, shadows, gradients, and ornamental chrome.
- The interface should feel readable as a publication/index even before any interaction occurs.

## Visible information budget

On the default Explore surface, a mechanism may show only:

1. sequence number;
2. title;
3. one sentence explaining the behavior;
4. one quiet action cue.

Do not show licenses, ecosystems, tags, tool tiers, status, rights notes, long descriptions, or multiple badges on the default card. These remain searchable and available through progressive disclosure.

Chapter headers contain a subject name and at most one short sentence.

Do not show totals or vanity statistics unless they help a real decision.

## Progressive disclosure

Use this order:

`subject → mechanism → live demo → recommended tool → technical detail`

The first click should answer: *what does this mechanism do?*

The live demo should be visible before implementation metadata. Recommended tools come next. License, rights, avoid-when, ecosystem, primitives, maintenance notes, and agent notes belong under a secondary details control.

Search and Index may expose more material because the user has explicitly asked to retrieve rather than browse.

## Interaction

- Keep the primary navigation small: Explore, Index, repository link.
- Search is the main retrieval control. Avoid persistent stacks of filters on the Explore surface.
- Deep links must continue to work for mechanisms, tools, references, and packages.
- Every live demo should teach one behavior only; it is a mechanism proof, not a miniature product.
- Prefer direct manipulation when the concept is spatial; prefer a single slider when the mechanism is one-dimensional.
- Respect reduced-motion preferences.

## Writing

Use short, concrete descriptions. Name the behavior and the learning/design job it does. Avoid adjectives such as “premium”, “beautiful”, “clean”, or “modern” unless a measurable property follows.
