-- Governed pending-action lifecycle.
-- This creates review records only. It does not execute a model or publish content.

-- Approval decisions must flow through the atomic decision RPC so the action
-- status and immutable human decision record cannot diverge.
drop policy if exists "approval moderator insert" on public.approval_records;

create or replace function public.request_governed_agent_action(
  p_space_id uuid,
  p_agent_id text,
  p_capability text,
  p_input_refs jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_action_id uuid;
  v_allowed boolean := false;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if not public.is_space_member(p_space_id) then
    raise exception 'Space membership required' using errcode = '42501';
  end if;
  if jsonb_typeof(coalesce(p_input_refs, '[]'::jsonb)) <> 'array' then
    raise exception 'input refs must be an array' using errcode = '22023';
  end if;

  v_allowed :=
    (p_agent_id = 'community_agent' and p_capability in ('draft_public_content', 'publish_public_content'))
    or
    (p_agent_id = 'claim_agent' and p_capability in ('draft_annotation', 'publish_annotation'));

  if not v_allowed then
    raise exception 'capability is not approval-required for this alpha agent' using errcode = '42501';
  end if;

  insert into public.agent_actions (
    agent_id,
    owner_id,
    space_id,
    action,
    capability,
    policy_version,
    approval_status,
    input_refs,
    output_refs
  )
  values (
    p_agent_id,
    v_user_id,
    p_space_id,
    'request:' || p_capability,
    p_capability,
    '0.1.0-alpha',
    'pending',
    coalesce(p_input_refs, '[]'::jsonb),
    '[]'::jsonb
  )
  returning id into v_action_id;

  return v_action_id;
end;
$$;

create or replace function public.decide_governed_agent_action(
  p_action_id uuid,
  p_decision text,
  p_note text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_space_id uuid;
  v_status text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_decision not in ('approved', 'rejected') then
    raise exception 'invalid decision' using errcode = '22023';
  end if;

  select aa.space_id, aa.approval_status
    into v_space_id, v_status
  from public.agent_actions aa
  where aa.id = p_action_id
  for update;

  if not found then
    raise exception 'governed action not found' using errcode = 'P0002';
  end if;
  if v_space_id is null or not public.is_space_moderator(v_space_id) then
    raise exception 'moderator authority required' using errcode = '42501';
  end if;
  if v_status <> 'pending' then
    raise exception 'action is already finalized' using errcode = '55000';
  end if;

  insert into public.approval_records (action_id, approver_id, decision, note)
  values (p_action_id, v_user_id, p_decision, coalesce(p_note, ''));

  update public.agent_actions
  set approval_status = p_decision
  where id = p_action_id and approval_status = 'pending';

  if not found then
    raise exception 'action finalization race detected' using errcode = '40001';
  end if;
end;
$$;

revoke all on function public.request_governed_agent_action(uuid,text,text,jsonb) from public;
revoke execute on function public.request_governed_agent_action(uuid,text,text,jsonb) from anon;
grant execute on function public.request_governed_agent_action(uuid,text,text,jsonb) to authenticated;

revoke all on function public.decide_governed_agent_action(uuid,text,text) from public;
revoke execute on function public.decide_governed_agent_action(uuid,text,text) from anon;
grant execute on function public.decide_governed_agent_action(uuid,text,text) to authenticated;
