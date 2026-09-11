# ADR-0003: Deny-by-default agent capabilities

- **Status:** Accepted
- **Date:** 2026-09-10

## Context

Agent authority is a security and governance boundary. Implicit or self-expanding capability models risk hidden authority, spam, unauthorized moderation, and ambiguous accountability.

## Decision

Agent capabilities are deny-by-default, typed, scoped, rate-limited, attributable, and subject to human approval where required.

An agent may request capability escalation but may not grant itself additional capability.

## Consequences

- Capability changes are reviewed as authority changes, not routine configuration changes.
- Public agent output is approval-gated in alpha.
- Permission tests are required for prohibited actions.
- Rate-limit enforcement creates auditable denial events.
