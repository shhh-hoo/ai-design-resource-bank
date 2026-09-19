---
name: aidrb-retrieve
description: Retrieve candidates, resolve exact references, commit and lock selected stable IDs, then fetch reusable implementation context.
---

Read docs/KNOWLEDGE-ATLAS-CONTRACT.md. The Visual / Interactive and Machine Retrieval projections may discover and compare independently in parallel.

1. Build/check catalogs: `python3 scripts/build_catalog.py --check` (also creates SQLite FTS).
2. Retrieve up to eight candidates: `python3 scripts/retrieve.py query "reaction profile" --type Example`.
3. Resolve a stable ID: `python3 scripts/retrieve.py resolve ex:chemistry-reaction-profile`. It returns the canonical record, preview, typed relations, generated Method, tool evidence, resource hints and provenance. This is not a lock.
4. Form a selection JSON with `selector` (human/agent/mixed) and `selections` containing exact Example `id`, optional `aspect_notes` and string-array `constraints`. Never replace an identity without explicit selector selection. GAP cannot be used as an available implementation.
5. Commit with `python3 scripts/retrieve.py commit selection.json > committed.json`. A Web-downloaded committed selection starts here already committed.
6. Lock with `python3 scripts/retrieve.py lock committed.json > locked.json`.
7. Deep fetch with `python3 scripts/retrieve.py fetch locked.json`. Only declared package artifacts for the exact locked references are fetched. Preserve aspect notes and constraints in build context.

A changed catalog, modified commit, altered IDs/notes, duplicate selection or uncommitted deep fetch is an error, not permission to choose another reference. Regenerate and request an explicit new selection commit when stale. Locks provide local integrity, not authentication against an actor who can rewrite all files. No embeddings/vector DB are involved.
