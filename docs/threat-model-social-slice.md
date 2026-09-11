# Social Vertical Slice Threat Model

## Scope

This threat model covers the first Intellectro social vertical slice: one Space, profiles/membership, chronological posts and comments, source-linked claims, contextual responses, trust/context disclosure, Supabase-ready authentication/persistence, and bounded Community/Claim agents.

It does **not** authorize autonomous public posting, policy mutation by agents, algorithmic ranking, federation, an agent marketplace, or production deployment.

## Protected properties

1. **Human attribution** — users can tell who authored the underlying social object.
2. **Agent accountability** — every agent resolves to an accountable owner and typed capability.
3. **Approval integrity** — approval-required output cannot silently become public.
4. **Provenance integrity** — source/transformation records cannot be presented as proof of truth.
5. **Community agency** — contextual challenge and moderation remain reversible and human-governed.
6. **Data isolation** — users cannot mutate other users' content through ordinary client credentials.
7. **Ranking legibility** — the alpha feed remains chronological and cannot silently optimize engagement.

## Threats and controls

### T1 — Agent output masquerades as human-authored content

**Failure:** an automated draft is displayed without disclosing the agent or approval state.

**Controls:** typed AI-assistance fields; visible trust chips; agent owner/action event; human approval state; no autonomous public-post capability in the alpha policy.

### T2 — Provenance badge becomes a truth badge

**Failure:** users interpret “source-linked” as “verified true.”

**Controls:** UI language states that provenance records origin/transformation, not truth; support/challenge/qualify remain open; no `truth` or `verified` field is synthesized by provenance code.

### T3 — RLS bypass permits cross-user mutation

**Failure:** a client writes a post, comment, response, source, block, or mute on behalf of another user.

**Controls:** RLS on every runtime table; `auth.uid()` bound write policies; agent-action and provenance writes have no ordinary client insertion policy; production readiness requires applying and testing migrations against a Supabase project.

### T4 — Approval spoofing

**Failure:** an agent approves itself or a client fabricates an approval for someone else.

**Controls:** governance kernel rejects agent self-escalation; Claim Agent accepts only human approval metadata; approval rows bind `approver_id` to `auth.uid()`; public execution remains a separate governed action.

### T5 — Challenge mechanics become harassment or reputation attacks

**Failure:** “Challenge” is used as a social downvote rather than an evidence/context interaction.

**Controls:** challenge/qualify are typed contextual actions, coexist with ordinary reactions, and do not alter feed rank. Future persisted challenges must carry a reason/category before alpha study.

### T6 — Hidden engagement ranking appears in the feed

**Failure:** implementation introduces relevance or engagement sorting while UI still claims user control.

**Controls:** `chronologicalFeed` has tests; UI explicitly says “Chronological feed / No ranking model”; no ranking dependency exists in the alpha slice.

### T7 — Demo state is mistaken for live persistence or authentication

**Failure:** a user believes local interactions or demo identities are stored/real.

**Controls:** visible Demo mode; interaction controls say they are not persisted; login is disabled without Supabase public configuration; no fabricated authenticated session.

### T8 — Public Supabase configuration is confused with privileged credentials

**Failure:** service-role/secret keys are exposed to the browser or repository.

**Controls:** only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are referenced by the web app; `.env.example` contains no values; `SECURITY.md` forbids production credentials and service-role secrets.

### T9 — Community Agent becomes an invisible moderator authority

**Failure:** automated flags or summaries silently delete, ban, publish, or alter policy.

**Controls:** existing permission tests deny publish/delete/ban/change-policy; Community Agent only plans actions; human moderator remains the escalation boundary.

### T10 — Schema exists but is treated as production-safe without integration testing

**Failure:** structural migration checks are mistaken for proof that RLS behaves correctly in a live Supabase project.

**Controls:** documentation distinguishes structural CI validation from live database verification. A future gate must apply migrations in an isolated Supabase environment and run positive/negative RLS tests before production data is admitted.

## Residual risk / next required evidence

Before a live alpha with user data:

- apply migrations to an isolated Supabase project;
- add executable RLS positive/negative tests using multiple users;
- add auth callback/session-refresh handling;
- persist and inspect agent action/approval records;
- add moderator review queue and appeal/correction workflow;
- abuse-test challenge/report/block/mute paths;
- review rate limits using realistic multi-account behavior;
- verify backups, logging, secret management, and incident response.
