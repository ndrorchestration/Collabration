-- Performance-only hardening for currently admitted Supabase advisor findings.
-- This migration intentionally changes no roles, grants, capability semantics,
-- policy membership, or data. RLS predicates remain semantically identical;
-- auth.uid() is wrapped in SELECT so PostgreSQL can initialize it once per query.

-- Cover foreign-key columns that currently have no usable leading-column index.
create index if not exists agent_actions_owner_id_idx
  on public.agent_actions (owner_id);
create index if not exists approval_records_approver_id_idx
  on public.approval_records (approver_id);
create index if not exists claim_responses_author_id_idx
  on public.claim_responses (author_id);
create index if not exists comments_author_id_idx
  on public.comments (author_id);
create index if not exists correction_requests_requester_id_idx
  on public.correction_requests (requester_id);
create index if not exists correction_requests_resolved_by_idx
  on public.correction_requests (resolved_by);
create index if not exists post_sources_added_by_idx
  on public.post_sources (added_by);
create index if not exists post_sources_source_id_idx
  on public.post_sources (source_id);
create index if not exists posts_author_id_idx
  on public.posts (author_id);
create index if not exists provenance_records_post_id_idx
  on public.provenance_records (post_id);
create index if not exists reactions_user_id_idx
  on public.reactions (user_id);
create index if not exists reports_comment_id_idx
  on public.reports (comment_id);
create index if not exists reports_post_id_idx
  on public.reports (post_id);
create index if not exists reports_reporter_id_idx
  on public.reports (reporter_id);
create index if not exists sources_created_by_idx
  on public.sources (created_by);
create index if not exists space_memberships_user_id_idx
  on public.space_memberships (user_id);
create index if not exists spaces_created_by_idx
  on public.spaces (created_by);

-- Preserve existing ownership/self-service semantics while converting auth.uid()
-- calls to init-plan-safe selectors.
alter policy "profiles own insert" on public.profiles
  with check ((select auth.uid()) = id);

alter policy "profiles own update" on public.profiles
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

alter policy "memberships self leave" on public.space_memberships
  using (((select auth.uid()) = user_id) and (role = 'member'::text));

alter policy "posts own update" on public.posts
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

alter policy "posts own delete" on public.posts
  using ((select auth.uid()) = author_id);

alter policy "comments own update" on public.comments
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

alter policy "comments own delete" on public.comments
  using ((select auth.uid()) = author_id);

alter policy "reactions own delete" on public.reactions
  using ((select auth.uid()) = user_id);

alter policy "claim responses own delete" on public.claim_responses
  using ((select auth.uid()) = author_id);

alter policy "sources own insert" on public.sources
  with check ((select auth.uid()) = created_by);

alter policy "sources own update" on public.sources
  using ((select auth.uid()) = created_by)
  with check ((select auth.uid()) = created_by);

alter policy "sources own delete" on public.sources
  using ((select auth.uid()) = created_by);

alter policy "post sources own delete" on public.post_sources
  using ((select auth.uid()) = added_by);

alter policy "reports own read" on public.reports
  using ((select auth.uid()) = reporter_id);

alter policy "blocks own read" on public.blocks
  using ((select auth.uid()) = blocker_id);

alter policy "blocks own delete" on public.blocks
  using ((select auth.uid()) = blocker_id);

alter policy "mutes own read" on public.mutes
  using ((select auth.uid()) = muter_id);

alter policy "mutes own insert" on public.mutes
  with check ((select auth.uid()) = muter_id);

alter policy "mutes own delete" on public.mutes
  using ((select auth.uid()) = muter_id);
