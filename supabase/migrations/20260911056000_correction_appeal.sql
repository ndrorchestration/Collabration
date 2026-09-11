-- Append-only correction / appeal boundary.
-- This path records disputes and human resolutions; it never rewrites the original post or governed action.

create table public.correction_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  action_id uuid references public.agent_actions(id) on delete cascade,
  request_kind text not null default 'correction' check (request_kind in ('correction','appeal')),
  request_text text not null check (char_length(request_text) between 1 and 10000),
  status text not null default 'open' check (status in ('open','accepted','rejected','resolved')),
  resolution_note text not null default '',
  resolved_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  check (((post_id is not null)::int + (action_id is not null)::int) = 1),
  check (
    (status = 'open' and resolved_by is null and resolved_at is null)
    or (status <> 'open' and resolved_by is not null and resolved_at is not null)
  )
);

create index correction_requests_post_created_idx
  on public.correction_requests (post_id, created_at desc)
  where post_id is not null;
create index correction_requests_action_created_idx
  on public.correction_requests (action_id, created_at desc)
  where action_id is not null;

alter table public.correction_requests enable row level security;

-- Requests are visible to their requester and to moderators responsible for the target Space.
create policy "correction participants read" on public.correction_requests
  for select to authenticated
  using (
    (select auth.uid()) = requester_id
    or (
      post_id is not null
      and exists (
        select 1 from public.posts p
        where p.id = post_id and public.is_space_moderator(p.space_id)
      )
    )
    or (
      action_id is not null
      and exists (
        select 1 from public.agent_actions aa
        where aa.id = action_id
          and aa.space_id is not null
          and public.is_space_moderator(aa.space_id)
      )
    )
  );

-- There is deliberately no ordinary authenticated INSERT or UPDATE policy.
-- Requester identity and target authority are derived inside narrow RPCs.
create or replace function public.request_correction_or_appeal(
  p_post_id uuid default null,
  p_action_id uuid default null,
  p_request_kind text default 'correction',
  p_request_text text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_space_id uuid;
  v_owner_id uuid;
  v_request_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if ((p_post_id is not null)::int + (p_action_id is not null)::int) <> 1 then
    raise exception 'exactly one correction target required' using errcode = '22023';
  end if;
  if p_request_kind not in ('correction','appeal') then
    raise exception 'unsupported correction request kind' using errcode = '22023';
  end if;
  if p_request_text is null or char_length(trim(p_request_text)) = 0 or char_length(p_request_text) > 10000 then
    raise exception 'correction request text required' using errcode = '22023';
  end if;

  if p_post_id is not null then
    select p.space_id into v_space_id
    from public.posts p
    where p.id = p_post_id;

    if not found then
      raise exception 'post correction target not found' using errcode = '22023';
    end if;
    if not public.is_space_member(v_space_id) then
      raise exception 'Space membership required' using errcode = '42501';
    end if;
  else
    select aa.space_id, aa.owner_id into v_space_id, v_owner_id
    from public.agent_actions aa
    where aa.id = p_action_id;

    if not found or v_space_id is null then
      raise exception 'governed action correction target not found' using errcode = '22023';
    end if;
    if v_user_id <> v_owner_id and not public.is_space_moderator(v_space_id) then
      raise exception 'action owner or Space moderator required' using errcode = '42501';
    end if;
  end if;

  insert into public.correction_requests (
    requester_id,
    post_id,
    action_id,
    request_kind,
    request_text
  ) values (
    v_user_id,
    p_post_id,
    p_action_id,
    p_request_kind,
    trim(p_request_text)
  ) returning id into v_request_id;

  return v_request_id;
end;
$$;

create or replace function public.resolve_correction_or_appeal(
  p_request_id uuid,
  p_status text,
  p_resolution_note text default ''
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_post_id uuid;
  v_action_id uuid;
  v_status text;
  v_space_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_status not in ('accepted','rejected','resolved') then
    raise exception 'unsupported correction resolution status' using errcode = '22023';
  end if;
  if char_length(coalesce(p_resolution_note, '')) > 10000 then
    raise exception 'resolution note too long' using errcode = '22023';
  end if;

  select cr.post_id, cr.action_id, cr.status
    into v_post_id, v_action_id, v_status
  from public.correction_requests cr
  where cr.id = p_request_id
  for update;

  if not found then
    raise exception 'correction request not found' using errcode = '22023';
  end if;
  if v_status <> 'open' then
    raise exception 'correction request is not open' using errcode = '42501';
  end if;

  if v_post_id is not null then
    select p.space_id into v_space_id from public.posts p where p.id = v_post_id;
  else
    select aa.space_id into v_space_id from public.agent_actions aa where aa.id = v_action_id;
  end if;

  if v_space_id is null or not public.is_space_moderator(v_space_id) then
    raise exception 'Space moderator required' using errcode = '42501';
  end if;

  update public.correction_requests
  set status = p_status,
      resolution_note = coalesce(p_resolution_note, ''),
      resolved_by = v_user_id,
      resolved_at = now()
  where id = p_request_id;

  return p_request_id;
end;
$$;

revoke all on function public.request_correction_or_appeal(uuid,uuid,text,text) from public;
revoke execute on function public.request_correction_or_appeal(uuid,uuid,text,text) from anon;
grant execute on function public.request_correction_or_appeal(uuid,uuid,text,text) to authenticated;

revoke all on function public.resolve_correction_or_appeal(uuid,text,text) from public;
revoke execute on function public.resolve_correction_or_appeal(uuid,text,text) from anon;
grant execute on function public.resolve_correction_or_appeal(uuid,text,text) to authenticated;
