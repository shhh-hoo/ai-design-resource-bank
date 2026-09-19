# AIDRB Gathering Protocol v1

## Purpose

AIDRB should grow only when new material improves discovery, comparison, selection, implementation, or transfer. Gathering is not an inventory race.

Creative World remains the primary target for expansion. Academic and Representation / Implementation coverage remain required, but they should attach to Creative objects rather than drive unlimited curriculum or tool enumeration.

Current baseline: 332 canonical records, including 92 Concepts, 48 Examples, 48 Tools and 1 Resource. The immediate imbalance is therefore not a shortage of labels or tools. It is a shortage of diverse high-quality Examples and reusable Resources, especially outside the current Chemistry-heavy Example set.

## Pipeline

Discovery never writes directly to canonical data.

source / scout / manual find
→ Candidate Inbox
→ inspect + dedupe + classify
→ promotion decision
→ canonical ingest PR
→ CI / projection / retrieval checks
→ promoted record

Candidate records are non-canonical. They can be incomplete, subjective, or speculative as long as those qualities remain explicit.

Automated scouts may create or update candidates in status `discovered` or `inspected`. They must not create canonical records, mark a candidate `promote`, or alter accepted canonical records without a separate curation step.

## Promotion test

A candidate is eligible for promotion only when its source is inspectable and it contributes at least one meaningful marginal value:

1. a genuinely new Concept or representation mechanism;
2. a substantially stronger or more canonical Example for an existing Concept;
3. a new medium or cross-media transfer that changes how a Concept can be understood;
4. a new interaction or state model;
5. a new implementation path, capability, primitive, or verified Resource;
6. a direct fill for a retrieval benchmark gap;
7. a materially better provenance/evidence basis for an existing record.

A candidate is normally rejected or deferred when it is merely another visually similar instance with no additional mechanism, medium, implementation, or benchmark value.

## Priority order for the current phase

1. Example
2. Resource
3. Concept
4. Tool

Concepts and Tools still enter when a real Example or Resource requires them. They are not targets for quantity expansion by themselves.

## Saturation rules

There is no global record cap. Saturation is local and evidence-driven.

A Concept becomes low-priority for scouting when it has:
- 3–5 genuinely differentiated strong Examples;
- coverage across the relevant major medium / interaction variants;
- at least one credible implementation path when implementation is relevant;
- no active retrieval benchmark miss.

After saturation, a new candidate should normally be promoted only when it adds a new medium, interaction model, implementation path, unusually strong canonical reference, or fills a benchmark gap.

A source feed or domain should be down-ranked when, across three consecutive sweeps:
- at least 80% of inspected candidates are duplicates, near-duplicates, or low marginal value; and
- retrieval benchmark quality does not improve.

A feed with a sustained promotion rate below 5% across three sweeps should be paused unless it covers a known gap.

A saturated area is not closed forever. A new real project, failed retrieval query, new medium, or new implementation need can reopen it.

## Dedupe rules

Deduplicate at four levels:

- Source duplicate: same versioned source / locator.
- Example duplicate: same concrete work or materially identical capture.
- Mechanism duplicate: a new Example repeats an already well-covered mechanism without a new axis.
- Implementation duplicate: same implementation route with no meaningful capability, primitive, fidelity, or platform difference.

Do not merge two Examples solely because they demonstrate the same Concept. Distinct medium, interaction, staging, material, or context can justify separate records.

## Candidate states

`discovered` — found but not inspected deeply.

`inspected` — source checked enough to describe what is actually there.

`promote` — curation decision says it should enter canonical ingest.

`rejected` — insufficient marginal value, bad provenance, duplicate, or otherwise unsuitable.

`deferred` — potentially useful but not currently worth promotion.

`promoted` — canonical record(s) created and linked.

Promotion is a curation decision, not a scout decision.

## First gathering wave

Wave 01 is deliberately Creative-first. The target is approximately 24–32 anchor candidates, not a quota.

Primary clusters:
- editorial web / information density;
- typography / motion identity;
- stage / cinema / title design;
- HCI / direct manipulation / spatial interaction;
- 3D / material / lighting / depth;
- information and scientific visualization.

At least half of inspected candidates should originate outside conventional websites so cross-media transfer remains real rather than rhetorical.

Wave 01 should prefer a small number of strong anchors per cluster over a large number of visually adjacent examples.

## Inspection output

Inspection should answer:

- What is the concrete thing?
- What is observable rather than inferred?
- Which Concept(s) does it demonstrate or challenge?
- What is the medium and presentation format?
- What interaction/state/motion logic is materially reusable?
- Is the original implementation known, unknown, or only hypothesized?
- What should not be copied?
- Does it add marginal value relative to what is already banked?
- Is a Resource extraction justified, optional, or unnecessary?

Unknown implementation remains unknown. Visual resemblance is not evidence of technology.

## Resource extraction boundary

A strong Example can remain Example-only indefinitely.

Extract a Resource only when reusable implementation material can be stated and validated independently from the source reference. Resource extraction should increase reuse or implementation reliability, not satisfy a completeness checkbox.

## Retrieval-driven growth

Maintain a benchmark set of real requests. Each gathering cycle should record whether new material improves candidate retrieval, transfer, or implementation.

Examples:
- theatrical transition without card-based UI;
- high-density editorial layout with strong hierarchy;
- title-sequence-like typography and motion;
- pointer-driven distortion without unnecessary WebGL;
- a subject concept represented spatially rather than as a static summary.

When a real query fails, gathering should target that gap before broadening an already saturated area.

## Future automation

Future scheduled scouts should:
- search only configured feeds / queries;
- dedupe before creating a candidate;
- attach source provenance and discovery reason;
- observe per-domain saturation and feed down-ranking;
- stop or reduce cadence when marginal value falls;
- never auto-promote to canonical content.

The automation objective is to reduce repeated manual discovery, not to maximize ingest volume.
