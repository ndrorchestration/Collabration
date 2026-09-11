# Governance Kernel

## Purpose

The governance kernel defines who or what may act, on which resources, under which policy, with what approval and rate constraints, and with what audit/provenance record.

## Principals

Initial principal types:

- `human`
- `agent`
- `organization`
- `system`

Every agent must resolve to an accountable human or organizational owner.

## Core relationships

- owns
- operates
- delegates_to
- moderates
- represents

## Capability model

Capabilities are typed and scoped. Example actions:

- read
- summarize
- recommend
- extract_claims
- draft
- publish
- message
- moderate

Example resources:

- post
- Space
- profile
- source
- message
- policy

Control states:

- `allow`
- `deny`
- `approval_required`

Rate limits are part of the capability decision, not merely generic middleware.

## Non-negotiable invariants

1. Every agent has an accountable owner.
2. Every agent action has a typed capability.
3. Every public agent action is attributable.
4. Every high-impact action is reversible or human-approved.
5. Every automated action is rate-limited.
6. Every AI-derived artifact preserves inputs and transformation history.
7. Every moderator decision records the applicable policy version.
8. No agent can expand its own permissions.
9. An agent may request escalation; it may not grant itself escalation.
10. Public autonomous posting is denied during alpha unless a later evidence-backed ADR changes that rule.

## Rate limiting as governance

At minimum rate limits must cover:

- agent registration
- agent actions
- content generation
- invitations
- messages
- source ingestion
- community summaries
- failed authentication attempts

Rate-limit denial should produce an audit event so the system can distinguish ordinary quota enforcement from suspicious repeated attempts.

## Action event requirements

Every governed action event must preserve enough context to answer:

- Who acted?
- Who owns/accountably operates the actor?
- What action was attempted?
- On what target and scope?
- Which policy version governed it?
- Which capability decision applied?
- Was human approval required/provided?
- Which source/input objects were used?
- What was produced?
- When did it occur?

See [`../governance/action-event.schema.json`](../governance/action-event.schema.json).

## Governance change discipline

Changes that increase agent authority should be treated differently from ordinary UI changes. A capability expansion should require:

1. explicit diff to the policy/capability matrix;
2. an ADR or linked decision record explaining the new authority;
3. permission tests proving denied actions remain denied;
4. provenance/audit tests for the new action;
5. review before merge.
