# ADR 0004 — Pattern transfer without authority transfer

**Status:** Accepted for Intellectro architecture direction

## Context

Intellectro and DGAF are separate projects with different purposes, evidence models, and authorization states.

DGAF develops and tests governance patterns for agentic systems. Intellectro is a governed social product where humans and bounded AI agents collaborate inside visible community rules.

Some DGAF patterns are useful design inputs for Intellectro, but importing DGAF state, evidence, terminology, or authorization would create false assurance. Intellectro must independently implement, test, and verify every adopted control in its own repository and runtime.

## Decision

Intellectro may adopt DGAF-informed patterns only through an Intellectro-native implementation and evidence path.

The preferred transfer set is:

1. **Fail-closed capability governance** — unknown, malformed, stale, or unauthorized capabilities deny by default.
2. **Decision and provenance receipts** — consequential governed actions retain actor, agent, capability, policy version, approval state, relevant source/provenance context, and outcome identifiers.
3. **Explicit evidence states** — implementation, authorization, runtime verification, provenance, and truth/effectiveness claims remain separate predicates.
4. **Independent review for high-impact actions** — the component proposing an action should not be the sole authority validating that same action when a separate verifier or human reviewer is practical.
5. **Claim hygiene** — content, claims about content, supporting evidence, moderation judgments, and system actions remain distinguishable objects.
6. **Capability release gates** — new autonomous authority requires a versioned policy change, adversarial tests, approval-path evidence, rollback/revocation behavior, and an explicit release decision.
7. **Failure-oriented verification** — privilege escalation, forged identity, stale approval, replay, cross-Space leakage, provenance tampering, and fail-open dependency behavior are tested before authority expands.

## Product-native control flow

For consequential AI activity, the target Intellectro path is:

`request → typed capability → policy decision → approval/verifier when required → execution → durable receipt → challenge/correction path`

No step implies the next one occurred. Permission does not prove execution; execution does not prove correctness; provenance does not prove truth; implementation does not grant authority.

## Independence boundary

The following do **not** transfer from DGAF into Intellectro:

- DGAF authorization or freeze state;
- DGAF PASS/VERIFIED evidence as proof of Intellectro behavior;
- DGAF scientific efficacy claims or experimental results;
- PDMAL topology results or sample-size conclusions;
- DGAF preregistration, custody, or independent-verification artifacts unless Intellectro separately establishes a concrete product need for an equivalent control;
- any assumption that matching terminology means matching implementation strength.

When a DGAF-derived idea is adopted, Intellectro owns its own specification, implementation, test evidence, runtime evidence, and user-facing semantics.

## Current implementation mapping

### Already established in Intellectro

- deny-by-default capability matrix;
- accountable agent ownership;
- approval-required capability states;
- agent self-escalation denial;
- policy versioning;
- provenance as origin/transformation history rather than truth;
- action/audit records;
- adversarial governance tests;
- separation of repository, deployment, database, and browser verification claims.

### Being completed in the current governed-alpha work

- trusted governed-action lifecycle;
- provenance receipt boundary;
- moderator review surface;
- permission inspection;
- correction and appeal flow;
- additional adversarial tests around social and governance boundaries.

### Later, before broader autonomous authority

- explicit verifier separation for selected high-impact actions;
- replay/staleness semantics for approvals and receipts;
- capability-release decision records with rollback/revocation proof;
- user-facing evidence-state vocabulary where it improves comprehension;
- tamper-evidence or cryptographic receipt strengthening if the threat model justifies it.

## Consequences

Intellectro gains a stronger governance trajectory without becoming a DGAF subsystem. The product can reuse proven design lessons while keeping its claims honest: each control must earn its own evidence in the environment where Intellectro actually runs.
