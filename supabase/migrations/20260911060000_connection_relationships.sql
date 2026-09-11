-- Person-to-person connection lifecycle for the collaboration alpha.
-- Human social relationships do not grant agent authority.
-- Block state in either direction defeats discovery, requests, acceptance, and active relationship visibility.

create table public.connection_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled', 'blocked')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  check (requester_id <> recipient_id),
  check ((status = 'pending' and decided_at is null) or (status <> 'pending' and decided_at is not null))
);

create unique index connection_requests_active_pair_idx
  on public.connection_requests (
    least(requester_id, recipient_id),
    greatest(requester_id, recipient_id)
  )
  where status in ('pending', 'accepted');

create index connection_requests_requester_created_idx
  on public.connection_requests (requester_id, created_at desc);
create index connection_requests_recipient_created_idx
  on public.connection_requests (recipient_id, created_at desc);

alter table public.connection_requests enable row level security;

-- Security-definer helper exposes only the current user's own bilateral block state.
-- Callers cannot supply an arbitrary viewer identity.
create or replace function public.is_blocked_with_current_user(p_other_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when auth.uid() is null or p_other_id is null then true
    else exists (
      select 1
      from public.blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = p_other_id)
         or (b.blocker_id = p_other_id and b.blocked_id = auth.uid())
    )
  end;
$$;

revoke all on function public.is_blocked_with_current_user(uuid) from public, anon;
grant execute on function public.is_blocked_with_current_user(uuid) to authenticated;

-- Replace the original all-authenticated profile discovery policy. A user can
-- always read their own profile; a bilateral block hides the other profile at RLS.
drop policy if exists "profiles authenticated read" on public.profiles;
create policy "profiles block-aware read" on public.profiles
  for select to authenticated
  using (
    (select auth.uid()) = id
    or not public.is_blocked_with_current_user(id)
  );

-- Participants can inspect relationship rows only while no bilateral block is active.
create policy "connection participants read" on public.connection_requests
  for select to authenticated
  using (
    ((select auth.uid()) = requester_id and not public.is_blocked_with_current_user(recipient_id))
    or ((select auth.uid()) = recipient_id and not public.is_blocked_with_current_user(requester_id))
  );

create or replace function public.request_connection(p_recipient_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_requester_id uuid := auth.uid();
  v_request_id uuid;
begin
  if v_requester_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_recipient_id is null or p_recipient_id = v_requester_id then
    raise exception 'connection requires a different user' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.blocks b
    where (b.blocker_id = v_requester_id and b.blocked_id = p_recipient_id)
       or (b.blocker_id = p_recipient_id and b.blocked_id = v_requester_id)
  ) then
    raise exception 'connection unavailable' using errcode = '42501';
  end if;

  insert into public.connection_requests (requester_id, recipient_id)
  values (v_requester_id, p_recipient_id)
  returning id into v_request_id;

  return v_request_id;
end;
$$;

create or replace function public.decide_connection_request(p_request_id uuid, p_decision text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_requester_id uuid;
  v_recipient_id uuid;
  v_status text;
begin
  if v_actor_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if not (p_decision in ('accepted', 'declined', 'cancelled')) then
    raise exception 'invalid connection decision' using errcode = '22023';
  end if;

  select cr.requester_id, cr.recipient_id, cr.status
    into v_requester_id, v_recipient_id, v_status
  from public.connection_requests cr
  where cr.id = p_request_id
  for update;

  if not found then
    raise exception 'connection request not found' using errcode = 'P0002';
  end if;
  if v_status <> 'pending' then
    raise exception 'connection request is already finalized' using errcode = '55000';
  end if;

  if p_decision = 'cancelled' then
    if v_actor_id <> v_requester_id then
      raise exception 'only requester may cancel' using errcode = '42501';
    end if;
  elsif p_decision in ('accepted', 'declined') then
    if v_actor_id <> v_recipient_id then
      raise exception 'only recipient may accept or decline' using errcode = '42501';
    end if;
  end if;

  -- Re-check volatile safety state at acceptance, so a stale pending request
  -- cannot bypass a block created after the request was issued.
  if p_decision = 'accepted' and exists (
    select 1
    from public.blocks b
    where (b.blocker_id = v_requester_id and b.blocked_id = v_recipient_id)
       or (b.blocker_id = v_recipient_id and b.blocked_id = v_requester_id)
  ) then
    raise exception 'connection unavailable' using errcode = '42501';
  end if;

  update public.connection_requests
  set status = p_decision,
      decided_at = now()
  where id = p_request_id and status = 'pending';

  if not found then
    raise exception 'connection finalization race detected' using errcode = '40001';
  end if;
end;
$$;

-- Blocking becomes an atomic privacy/relationship action rather than merely a
-- presentation preference. It severs pending or accepted relationships and the
-- terminal `blocked` state prevents an unblock from silently resurrecting them.
create or replace function public.block_user(p_blocked_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_blocker_id uuid := auth.uid();
begin
  if v_blocker_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_blocked_id is null or p_blocked_id = v_blocker_id then
    raise exception 'cannot block this account' using errcode = '22023';
  end if;

  insert into public.blocks (blocker_id, blocked_id)
  values (v_blocker_id, p_blocked_id)
  on conflict (blocker_id, blocked_id) do nothing;

  update public.connection_requests
  set status = 'blocked',
      decided_at = now()
  where status in ('pending', 'accepted')
    and (
      (requester_id = v_blocker_id and recipient_id = p_blocked_id)
      or (requester_id = p_blocked_id and recipient_id = v_blocker_id)
    );
end;
$$;

-- Remove the old direct browser INSERT path so active relationships cannot be
-- left intact by bypassing block_user(). Existing owner-only read/delete policies
-- remain, allowing a blocker to inspect and later remove their own block.
drop policy if exists "blocks own insert" on public.blocks;

revoke all on function public.request_connection(uuid) from public, anon;
grant execute on function public.request_connection(uuid) to authenticated;

revoke all on function public.decide_connection_request(uuid, text) from public, anon;
grant execute on function public.decide_connection_request(uuid, text) to authenticated;

revoke all on function public.block_user(uuid) from public, anon;
grant execute on function public.block_user(uuid) to authenticated;
