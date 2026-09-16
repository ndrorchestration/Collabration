# Contributing to Collabration

Collabration treats changes to agent authority as governance changes, not ordinary refactors.

The product was formerly named **Intellectro**. Preserve that name only where historical evidence, provider identifiers, old URLs, or chronology require it; use **Collabration** for current product/source documentation.

## Development

```bash
npm ci
npm run check
npm test
```

Node.js 22 or newer is required. CI verifies maintained Node 22 and Node 24 lines.

## Pull requests

Every change should be narrow, reviewable, and accompanied by tests when behavior changes.

Changes that increase agent authority must include:

1. an explicit diff to the applicable capability policy;
2. an ADR or linked decision record explaining why the new authority is needed;
3. permission tests proving unrelated denied actions remain denied;
4. audit/provenance tests for the new action;
5. human review before merge.

Public autonomous posting remains denied during alpha unless an evidence-backed ADR changes that rule.

## Test discipline

Behavior changes use red-green-refactor: write a failing test, confirm the expected failure, implement the smallest change, then rerun the full suite.

## Data and secrets

Do not commit production secrets, access tokens, private prompts containing operational secrets, private user data, or production abuse-detection thresholds.

Repository CI and structural RLS tests do not authorize use of real user data. Live database claims require the isolated Supabase verification gate in `docs/supabase-live-verification.md`.
