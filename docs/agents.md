# Agent Model

## Sequencing rule

The alpha proves bounded community/evidence assistance before expanding toward personal or autonomous agency.

## Community Agent — alpha

Purpose: governance infrastructure for a Space.

May:

- read permitted Space posts
- welcome new members through approved templates/workflows
- summarize discussions
- detect duplicate questions
- build draft FAQs
- surface unresolved issues
- flag possible policy violations for human review
- recommend moderator attention
- request capability escalation

May not:

- delete content
- ban users
- change policies
- publish publicly without required approval
- invite or create additional agents
- grant itself new capabilities

The Community Agent should be replaceable, policy-bound, moderator-overridable, and unable to become a hidden authority.

## Claim Agent — alpha

Purpose: epistemic assistance for source-linked content.

May:

- extract claims
- distinguish source statements from author interpretation
- identify unsupported assertions
- surface relevant supporting/conflicting evidence when available
- mark uncertainty
- track corrections
- generate claim maps

The Claim Agent is **not** an autonomous fact-checker. Its output is evidence assistance that can be challenged, qualified, corrected, or rejected.

## Personal Agent — later

Deferred until the governance kernel and UX are validated.

Potential future functions:

- private interest/expertise profile
- personalized digests
- Space/people recommendations
- drafting assistance
- open-conversation tracking
- collaborator suggestions

Initial public actions would still require explicit user approval.

## Longer-term taxonomy

Possible later agent classes:

- Personal Agent — private discovery, drafting, memory, relationship support
- Community Agent — onboarding, digests, FAQ, moderation assistance
- Source Agent — ingestion, metadata, deduplication, provenance
- Conversation Agent — summaries, claims, counterarguments, questions
- Professional Agent — portfolio/opportunity/project matching
- Safety Agent — spam, abuse, manipulation, coordinated-behavior detection
- Orchestrator — policy-controlled routing among agents

This taxonomy is a roadmap, not an MVP commitment.

## Agent action contract

Every agent action should bind:

- agent identity
- accountable owner
- Space/resource scope
- action type
- capabilities used
- policy version
- source/input objects
- model/configuration metadata as appropriate
- publication/approval status
- output/provenance record
- timestamp

The machine-readable minimum is defined by the governance action-event schema.
