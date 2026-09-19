# Candidate Inbox

This directory is non-canonical intake. See `docs/GATHERING-PROTOCOL.md`.

- `candidate.schema.json` defines the candidate record.
- `candidates/*.json` contains individual candidates.
- A scout may create `discovered` or `inspected` candidates only.
- Promotion requires a separate curation decision and canonical ingest PR.
- Candidate deletion is not required when rejected; rejected/deferred records are useful dedupe history.
- Do not put generated catalog files here.

Candidate metadata may contain hypotheses such as suspected novelty. Those hypotheses do not become canonical facts unless the promoted record is separately inspected and evidenced.
