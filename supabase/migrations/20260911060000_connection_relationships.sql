-- Person-to-person connection lifecycle for the collaboration alpha.
-- Human social relationships do not grant agent authority.
-- Block state in either direction defeats new requests and acceptance.

create table public.connection_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
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

-- Participants can inspect their own relationship records, but mutation is RPC-only.
create policy "connection participants read" on public.connection_requests
  for select to authenticated
  using ((select auth.uid()) = requester_id or (select auth.uid()) = recipient_id);

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

revoke all on function public.request_connection(uuid) from public, anon;
grant execute on function public.request_connection(uuid) to authenticated;

revoke all on function public.decide_connection_request(uuid, text) from public, anon;
grant execute on function public.decide_connection_request(uuid, text) to authenticated;
