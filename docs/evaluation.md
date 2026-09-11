# Alpha Evaluation Plan

## Primary metric: Contextual Trust Comprehension

The central alpha question is whether users can correctly identify:

1. who authored the original content;
2. whether AI was involved;
3. what the AI was allowed to do;
4. who approved the public version;
5. what sources support the claim;
6. whether the community is in agreement or dispute;
7. how the user could challenge or correct the result.

The goal is **understanding**, not maximizing action-log visits.

## Secondary metrics

- percentage noticing trust chips
- correct interpretation of AI-assistance labels
- time to obtain needed provenance context
- challenge-to-comment ratio
- moderator approval latency
- unsupported-claim detection rate
- correction resolution time
- summary faithfulness
- user-reported governance burden
- return rate after encountering governed AI interactions
- percentage of agent actions with valid owner/policy/scope/timestamp/provenance fields

## Vertical-slice experiment

Test this end-to-end path:

```text
Human joins Space
→ posts a source-linked claim
→ Claim Agent extracts/annotates claims
→ another human challenges or qualifies the claim
→ Community Agent drafts a summary of the disagreement
→ moderator reviews and approves/rejects/edits
→ system records provenance, policy version, approval, and action events
```

## Initial governance tests

### Permission test
The Community Agent cannot delete, ban, change policy, or publish where approval is required.

### Attribution test
Every agent action contains an accountable owner, policy version, scope, and timestamp.

### Rate-limit test
An agent exceeding its action quota is denied and a corresponding audit event is produced.

## Product-quality guardrails

A technically correct governance system still fails if:

- users cannot interpret its labels;
- users confuse provenance with truth;
- users feel ordinary conversation is bureaucratic;
- the Community Agent appears to be the final authority;
- challenges become a harassment/reputation mechanic;
- the social experience stops feeling socially alive.
