-- Persisted-alpha hardening for the social vertical slice.
-- This migration narrows human write authority; it does not grant agent write authority.

create or replace function public.is_space_member(p_space_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.space_memberships sm
    where sm.space_id = p_space_id
      and sm.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_space_moderator(p_space_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.space_memberships sm
    where sm.space_id = p_space_id
      and sm.user_id = (select auth.uid())
      and sm.role in ('moderator','admin')
  );
$$;

revoke all on function public.is_space_member(uuid) from public;
revoke all on function public.is_space_moderator(uuid) from public;
grant execute on function public.is_space_member(uuid) to authenticated;
grant execute on function public.is_space_moderator(uuid) to authenticated;

-- Space creation must be atomic with the creator's admin membership. Removing
-- the direct insert policy prevents orphan Spaces created without membership.
drop policy if exists "spaces creator insert" on public.spaces;

-- Posting and discussion require Space membership.
drop policy if exists "posts own insert" on public.posts;
create policy "posts member insert" on public.posts
  for insert to authenticated
  with check ((select auth.uid()) = author_id and public.is_space_member(space_id));

drop policy if exists "comments own insert" on public.comments;
create policy "comments member insert" on public.comments
  for insert to authenticated
  with check (
    (select auth.uid()) = author_id
    and exists (
      select 1 from public.posts p
      where p.id = post_id and public.is_space_member(p.space_id)
    )
  );

drop policy if exists "claim responses own insert" on public.claim_responses;
create policy "claim responses member insert" on public.claim_responses
  for insert to authenticated
  with check (
    (select auth.uid()) = author_id
    and exists (
      select 1 from public.posts p
      where p.id = post_id and public.is_space_member(p.space_id)
    )
  );

-- A post's direct source list is author-controlled. Other members contribute
-- evidence through contextual add_evidence responses instead of mutating authorship.
drop policy if exists "post sources own insert" on public.post_sources;
create policy "post sources author insert" on public.post_sources
  for insert to authenticated
  with check (
    (select auth.uid()) = added_by
    and exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = (select auth.uid())
    )
  );

-- Governed action visibility includes accountable owners and Space moderators,
-- but ordinary clients still have no insert/update policy on agent_actions.
drop policy if exists "agent actions owner read" on public.agent_actions;
create policy "agent actions governed read" on public.agent_actions
  for select to authenticated
  using (
    (select auth.uid()) = owner_id
    or (space_id is not null and public.is_space_moderator(space_id))
  );

drop policy if exists "approval action owner read" on public.approval_records;
create policy "approval participants read" on public.approval_records
  for select to authenticated
  using (
    (select auth.uid()) = approver_id
    or exists (
      select 1 from public.agent_actions aa
      where aa.id = action_id
        and (
          aa.owner_id = (select auth.uid())
          or (aa.space_id is not null and public.is_space_moderator(aa.space_id))
        )
    )
  );

drop policy if exists "approval human insert" on public.approval_records;
create policy "approval moderator insert" on public.approval_records
  for insert to authenticated
  with check (
    (select auth.uid()) = approver_id
    and exists (
      select 1 from public.agent_actions aa
      where aa.id = action_id
        and aa.space_id is not null
        and aa.approval_status = 'pending'
        and public.is_space_moderator(aa.space_id)
    )
  );

-- Space creation needs one controlled privilege boundary because the creator must
-- also become the initial admin. The function derives ownership only from auth.uid().
create or replace function public.create_space_with_owner(
  p_slug text,
  p_name text,
  p_description text default ''
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_space_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  insert into public.spaces (slug, name, description, created_by)
  values (p_slug, p_name, coalesce(p_description, ''), v_user_id)
  returning id into v_space_id;

  insert into public.space_memberships (space_id, user_id, role)
  values (v_space_id, v_user_id, 'admin');

  return v_space_id;
end;
$$;

revoke all on function public.create_space_with_owner(text,text,text) from public;
grant execute on function public.create_space_with_owner(text,text,text) to authenticated;

-- Source-linked post creation is atomic but remains SECURITY INVOKER so every
-- underlying insert is still subject to the caller's RLS policies.
create or replace function public.create_source_linked_post(
  p_space_id uuid,
  p_body text,
  p_source_url text,
  p_source_title text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_post_id uuid;
  v_source_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if not public.is_space_member(p_space_id) then
    raise exception 'Space membership required' using errcode = '42501';
  end if;

  insert into public.posts (space_id, author_id, body, kind, ai_assisted)
  values (p_space_id, v_user_id, p_body, 'source_linked', false)
  returning id into v_post_id;

  insert into public.sources (created_by, url, title)
  values (v_user_id, p_source_url, p_source_title)
  returning id into v_source_id;

  insert into public.post_sources (post_id, source_id, added_by)
  values (v_post_id, v_source_id, v_user_id);

  return v_post_id;
end;
$$;

revoke all on function public.create_source_linked_post(uuid,text,text,text) from public;
grant execute on function public.create_source_linked_post(uuid,text,text,text) to authenticated;
