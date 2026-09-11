# Product Thesis

## Canonical thesis

> **Intellectro is an accountable collaboration network: a social environment where people form relationships and communities, each person can have a personal AI teammate, and consequential human-agent collaboration remains inspectable, bounded, reversible, and challengeable.**

Short positioning:

> **Intellectro is where people and their AI teammates work together in communities without making agency invisible.**

The foreground product is people working together. Governance, provenance, verification, and correction are trust infrastructure underneath that experience rather than a dashboard users must operate for routine social interaction.

This framing supersedes earlier descriptions that centered autonomous agents as co-equal social actors. It also sharpens the original governed-social-network thesis without changing the alpha's fail-closed authority posture.

## User problem

Intellectro is designed around three related failures in contemporary online interaction:

1. **Authorship opacity** — users often cannot tell who or what produced, transformed, recommended, or moderated content.
2. **AI authority opacity** — AI participation can be difficult to inspect, constrain, challenge, or attribute.
3. **Coordination failure** — discussion often produces engagement without producing shared understanding, accountable decisions, or useful outcomes.

## Product promise

Intellectro should feel:

- **Socially familiar** — participation should resemble ordinary community interaction.
- **Outcome-oriented** — discussion can become research packets, resolved questions, projects, tasks, artifacts, and completed collaborative work.
- **Epistemically inspectable** — source, claim, disagreement, correction, currentness, and uncertainty can be inspected when relevant.
- **Agentically accountable** — delegated AI actions have owners, capabilities, scopes, policies, approvals, revocation paths, and durable records.
- **Community-governed** — personal and community agents assist under explicit human-defined constraints.
- **Progressively disclosed** — ordinary interaction stays lightweight; deeper authority/provenance detail appears when the decision requires it.

## Differentiation

The defensible design is the intersection of four linked but non-substitutable graphs:

- **Social graph:** people, follows/connections, memberships, relationships, Spaces.
- **Knowledge graph:** sources, claims, revisions, topics, evidence, corrections.
- **Agent graph:** owners, personal/community/claim agents, tools, delegated tasks.
- **Governance graph:** policies, capabilities, scopes, approvals, revocations, escalations, audits.

The graphs may reference one another but must never silently collapse:

- friendship does not authorize an agent;
- agent ownership does not grant community permission;
- provenance does not establish truth;
- approval does not establish correctness;
- implementation does not establish runtime verification.

A useful social action may traverse all four:

`person raises question → sources attached → Personal Agent researches/drafts → human reviews → artifact shared → community supports/challenges/qualifies → Community Agent synthesizes → humans approve consequential outcome → project/task/result recorded`

## Core interaction model

Keep familiar primitives: profile, connect/follow, Space, post, comment, share, save, react, invite.

Add deeper interactions only when trust or collaboration requires them:

- Support
- Challenge
- Qualify
- Add evidence
- Share experience
- Ask a question
- Mark resolved
- Turn into project/task/artifact
- Request moderator review
- Request correction/appeal

The mature loop is:

`connect → Space → discuss → ask my Personal Agent → research/draft/organize → human review → share → collaborate/challenge → produce outcome → preserve correction history`

The near-term alpha remains narrower and must not imply that Personal Agent or project workflows are already implemented.

## Personal Agent product posture

The Personal Agent is a **teammate/copilot before it is an actor**.

Initial unapproved capabilities should be limited to permitted-context retrieval, research, organization, summarization, comparison, drafting, and private notes.

Consequential shared-state changes should progress capability-by-capability:

`private suggestion → private draft → user-approved share → user-approved shared-state action → narrowly preauthorized reversible action → carefully released automation`

The agent must not gain ambient authority merely because it belongs to a user. Shared Spaces and affected collaborators retain their own permission and privacy boundaries.

## Accountability objects

Do not collapse accountability into one generic trust record or score. The target architecture distinguishes:

1. **Content Passport** — where an artifact came from, source/revision lineage, and which humans/agents transformed it. It does not establish truth.
2. **Action Receipt** — who requested a consequential action, what capability/scope/policy applied, who approved when required, and what executed. It does not establish correctness.
3. **Verification Result** — what a verifier checked, against which exact expectations, with what result. It does not imply certification beyond that check.

These are future/expanding product contracts; their existence must be established by implementation and evidence before claims are promoted.

## Governance as product behavior

Governance is not successful merely because a backend audit table exists. It must help answer, in context:

- Who created this?
- Was AI involved, and what did it do?
- What was the AI allowed to do here?
- Which exact version/sources informed the result?
- Who approved a consequential public/shared action?
- Have relevant inputs changed since generation?
- Is the claim disputed, unresolved, corrected, or superseded?
- How can I challenge, correct, revoke, or appeal it?

The UI should answer these progressively: lightweight state first, contextual detail second, technical evidence/audit only when requested.

## Initial market wedge hypothesis

Do not begin by solving the cold-start problem of a universal consumer social network. Validate first with existing groups that already collaborate and care about evidence/accountability, such as research/study groups, technical/open-source communities, project teams, and professional interest communities.

This is a product hypothesis to test, not a market-size or product-market-fit claim.

## Alpha anti-goals

Do **not** make the alpha a feature-for-feature Facebook, Instagram, Reddit, Discord, or LinkedIn clone.

Do **not** make autonomous public agent posting central to the product.

Do **not** make governance vocabulary dominate the ordinary social UX.

Do **not** require evidence workflows for casual human expression.

Do **not** market the Claim Agent as an autonomous fact-checker.

Do **not** reduce expertise, truth, factuality, confidence, review, provenance, or trust to one global score.

Do **not** let agents grant themselves additional authority or launder authority through another agent.

Do **not** turn private Personal Agent memory into ambient community context or an advertising/training asset without explicit product policy and consent.

## Success condition

The alpha must answer two linked questions:

> **Can users enjoy participating in a familiar social community while correctly understanding how humans and AI created, transformed, recommended, or moderated what they see?**

> **Can that discussion repeatedly produce useful collaborative outcomes without the accountability layer becoming prohibitive friction?**

A future north-star candidate is **Weekly Collaborative Outcomes**: shared artifacts, resolved research questions, accepted project outputs, or completed collaborative tasks involving meaningful human participation, measured separately from comprehension, safety, reliability, and economics.
