# Governance UX Specification

## Design rule

> **Show the minimum governance context needed for trust. Expose the full record when the user asks for accountability.**

The MVP uses **contextual disclosure**: governance details appear when content is AI-assisted, source-linked, disputed, recommended, or moderated. Fully inspectable records remain available through progressive expansion.

## Trust states

### Human-authored
Minimal disclosure unless source/provenance context is otherwise relevant.

### AI-assisted
Show:

- tool/agent used
- assistance type
- human approval state

Use typed labels such as `AI summarized`, `AI extracted claims`, or `AI drafted · human approved`; avoid vague labels such as `AI enhanced`.

### Agent-generated
Show:

- agent identity
- accountable owner
- policy/capability scope
- approval state

### Source-linked
Show:

- source count
- source dates/types
- claim map availability
- correction history when applicable

### Community-disputed
Show:

- challenge count
- qualification count
- unresolved questions

### Moderator-reviewed
Show:

- review status
- policy version
- correction/appeal path

## Trust chip pattern

Default post presentation stays simple:

```text
Author · time
Post content...

[Source-linked] [AI-assisted] [View context]

Like  Comment  Challenge  Share  Save
```

`View context` should summarize:

- original author
- AI assistance and exact role
- human approval state
- source count
- current dispute state
- agent permissions used
- action-log availability

## Challenge / qualify interaction

Deep responses coexist with normal comments and reactions:

- Support
- Challenge
- Qualify
- Add evidence
- Share experience
- Ask a question
- Mark resolved
- Request moderator review

Challenges should be categorized to reduce adversarial ambiguity, for example:

- unsupported
- outdated
- misleading
- incomplete
- contradicted

## Three disclosure levels

1. **Badge/chip** — enough context for quick interpretation.
2. **Context card** — authorship, assistance, sources, permissions, approval, dispute status.
3. **Technical audit view** — identifiers, full policy version, event chain, provenance graph, model metadata where appropriate.

## UX invariants

- Provenance must never be presented as proof of truth.
- Identity verification, source verification, moderator review, and factual confidence must remain distinct concepts.
- Casual human posting must remain lightweight.
- Approval gates apply to agent actions and other high-impact flows, not every human expression.
- Governance cues must be discoverable at the moment of need rather than hidden exclusively in settings.

## Primary failure modes

### Decorative trust UI
Badges exist but do not explain what AI did.

**Mitigation:** typed assistance labels and an accessible context card.

### Context overload
Users see internal IDs and policy machinery before understanding the post.

**Mitigation:** progressive disclosure.

### Challenge as reputational attack
The mechanism becomes a negative reaction button.

**Mitigation:** evidence-oriented categories and structured response semantics.

### False certainty
`Source-linked` or `reviewed` is interpreted as `true`.

**Mitigation:** keep provenance, review, and confidence semantically separate.
