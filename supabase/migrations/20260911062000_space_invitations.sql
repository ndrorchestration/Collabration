-- Controlled Space join and invitation lifecycle.
-- Human Space membership does not grant agent capability or governance authority.

alter table public.spaces
  add column join_policy text not null default 'open'
  check (join_policy in ('open', 'invite_only'));

create table public.space_invitations (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  inviter_id uuid not null references auth.users(id) on delete cascade,
  invitee_id uuid not null references auth.users(id) on delete cascade,
  granted_role text not null default 'member' check (granted_role = 'member'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'revoked', 'blocked')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  check (inviter_id <> invitee_id),
  check (
    (status = 'pending' and decided_at is null)
    or (status <> 'pending' and decided_at is not null)
  )
);

create unique index space_invitations_pending_invitee_idx
  on public.space_invitations (space_id, invitee_id)
  where status = 'pending';
create index space_invitations_inviter_created_idx
  on public.space_invitations (inviter_id, created_at desc);
create index space_invitations_invitee_created_idx
  on public.space_invitations (invitee_id, created_at desc);

alter table public.space_invitations enable row level security;

create policy "space invitation participants read" on public.space_invitations
  for select to authenticated
  using (
    (select auth.uid()) = inviter_id
    or (select auth.uid()) = invitee_id
  );

create or replace function public.is_space_admin(p_space_id uuid)
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
      and sm.role = 'admin'
  );
$$;

revoke all on function public.is_space_admin(uuid) from public, anon;
grant execute on function public.is_space_admin(uuid) to authenticated;

-- Direct membership insertion is no longer a public join path. Open Spaces use
-- a controlled RPC; invite-only Spaces require an accepted invitation.
drop policy if exists "memberships self join" on public.space_memberships;

create or replace function public.join_open_space(p_space_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_join_policy text;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select s.join_policy into v_join_policy
  from public.spaces s
  where s.id = p_space_id;

  if not found then
    raise exception 'Space not found' using errcode = 'P0002';
  end if;
  if v_join_policy <> 'open' then
    raise exception 'Space requires an invitation' using errcode = '42501';
  end if;

  insert into public.space_memberships (space_id, user_id, role)
  values (p_space_id, v_user_id, 'member')
  on conflict (space_id, user_id) do nothing;
end;
$$;

create or replace function public.set_space_join_policy(p_space_id uuid, p_join_policy text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if not (p_join_policy in ('open', 'invite_only')) then
    raise exception 'invalid Space join policy' using errcode = '22023';
  end if;
  if not public.is_space_admin(p_space_id) then
    raise exception 'only Space admin may change join policy' using errcode = '42501';
  end if;

  update public.spaces
  set join_policy = p_join_policy
  where id = p_space_id;

  if not found then
    raise exception 'Space not found' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.invite_to_space(p_space_id uuid, p_invitee_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inviter_id uuid := auth.uid();
  v_invitation_id uuid;
  v_join_policy text;
begin
  if v_inviter_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_invitee_id is null or p_invitee_id = v_inviter_id then
    raise exception 'invitation requires a different user' using errcode = '22023';
  end if;
  if not public.is_space_admin(p_space_id) then
    raise exception 'only Space admin may invite' using errcode = '42501';
  end if;

  select s.join_policy into v_join_policy
  from public.spaces s
  where s.id = p_space_id;

  if not found then
    raise exception 'Space not found' using errcode = 'P0002';
  end if;
  if v_join_policy <> 'invite_only' then
    raise exception 'Space does not require invitations' using errcode = '55000';
  end if;

  if exists (
    select 1 from public.space_memberships sm
    where sm.space_id = p_space_id and sm.user_id = p_invitee_id
  ) then
    raise exception 'user is already a Space member' using errcode = '55000';
  end if;
  if exists (
    select 1
    from public.blocks b
    where (b.blocker_id = v_inviter_id and b.blocked_id = p_invitee_id)
       or (b.blocker_id = p_invitee_id and b.blocked_id = v_inviter_id)
  ) then
    raise exception 'Space invitation unavailable' using errcode = '42501';
  end if;

  insert into public.space_invitations (space_id, inviter_id, invitee_id, granted_role)
  values (p_space_id, v_inviter_id, p_invitee_id, 'member')
  returning id into v_invitation_id;

  return v_invitation_id;
end;
$$;

create or replace function public.decide_space_invitation(p_invitation_id uuid, p_decision text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_space_id uuid;
  v_inviter_id uuid;
  v_invitee_id uuid;
  v_status text;
  v_join_policy text;
begin
  if v_actor_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if not (p_decision in ('accepted', 'declined')) then
    raise exception 'invalid Space invitation decision' using errcode = '22023';
  end if;

  select si.space_id, si.inviter_id, si.invitee_id, si.status
    into v_space_id, v_inviter_id, v_invitee_id, v_status
  from public.space_invitations si
  where si.id = p_invitation_id
  for update;

  if not found then
    raise exception 'Space invitation not found' using errcode = 'P0002';
  end if;
  if v_status <> 'pending' then
    raise exception 'Space invitation is already finalized' using errcode = '55000';
  end if;
  if v_actor_id <> v_invitee_id then
    raise exception 'only invitee may accept or decline' using errcode = '42501';
  end if;

  select s.join_policy into v_join_policy
  from public.spaces s
  where s.id = v_space_id;

  if not found then
    raise exception 'Space not found' using errcode = 'P0002';
  end if;
  if p_decision = 'accepted' and v_join_policy <> 'invite_only' then
    raise exception 'Space no longer requires an invitation' using errcode = '55000';
  end if;

  if p_decision = 'accepted' and exists (
    select 1
    from public.blocks b
    where (b.blocker_id = v_inviter_id and b.blocked_id = v_invitee_id)
       or (b.blocker_id = v_invitee_id and b.blocked_id = v_inviter_id)
  ) then
    raise exception 'Space invitation unavailable' using errcode = '42501';
  end if;

  if p_decision = 'accepted' and exists (
    select 1
    from public.space_memberships sm
    where sm.space_id = v_space_id
      and sm.user_id = v_invitee_id
  ) then
    raise exception 'user is already a Space member' using errcode = '55000';
  end if;

  update public.space_invitations
  set status = p_decision,
      decided_at = now()
  where id = p_invitation_id and status = 'pending';

  if not found then
    raise exception 'Space invitation finalization race detected' using errcode = '40001';
  end if;

  if p_decision = 'accepted' then
    insert into public.space_memberships (space_id, user_id, role)
    values (v_space_id, v_invitee_id, 'member');
  end if;
end;
$$;

create or replace function public.revoke_space_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_space_id uuid;
  v_status text;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select si.space_id, si.status
    into v_space_id, v_status
  from public.space_invitations si
  where si.id = p_invitation_id
  for update;

  if not found then
    raise exception 'Space invitation not found' using errcode = 'P0002';
  end if;
  if not public.is_space_admin(v_space_id) then
    raise exception 'only Space admin may revoke invitation' using errcode = '42501';
  end if;
  if v_status <> 'pending' then
    raise exception 'Space invitation is already finalized' using errcode = '55000';
  end if;

  update public.space_invitations
  set status = 'revoked',
      decided_at = now()
  where id = p_invitation_id and status = 'pending';
end;
$$;

-- Extend the existing atomic block boundary: preserve connection termination and
-- additionally terminalize pending invitations between the two affected users.
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
      ended_at = now()
  where status in ('pending', 'accepted')
    and (
      (requester_id = v_blocker_id and recipient_id = p_blocked_id)
      or (requester_id = p_blocked_id and recipient_id = v_blocker_id)
    );

  update public.space_invitations
  set status = 'blocked',
      decided_at = now()
  where status = 'pending'
    and (
      (inviter_id = v_blocker_id and invitee_id = p_blocked_id)
      or (inviter_id = p_blocked_id and invitee_id = v_blocker_id)
    );
end;
$$;

revoke all on function public.join_open_space(uuid) from public, anon;
grant execute on function public.join_open_space(uuid) to authenticated;

revoke all on function public.invite_to_space(uuid, uuid) from public, anon;
grant execute on function public.invite_to_space(uuid, uuid) to authenticated;

revoke all on function public.decide_space_invitation(uuid, text) from public, anon;
grant execute on function public.decide_space_invitation(uuid, text) to authenticated;

revoke all on function public.revoke_space_invitation(uuid) from public, anon;
grant execute on function public.revoke_space_invitation(uuid) to authenticated;

revoke all on function public.set_space_join_policy(uuid, text) from public, anon;
grant execute on function public.set_space_join_policy(uuid, text) to authenticated;
