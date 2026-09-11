-- Approved-action provenance receipt boundary.
-- Ordinary browser roles retain no direct INSERT policy on provenance_records.

create or replace function public.record_approved_action_provenance(
  p_action_id uuid,
  p_post_id uuid default null,
  p_source_refs jsonb default '[]'::jsonb,
  p_transformations jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_owner_id uuid;
  v_space_id uuid;
  v_record_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if jsonb_typeof(coalesce(p_source_refs, '[]'::jsonb)) <> 'array'
     or jsonb_typeof(coalesce(p_transformations, '[]'::jsonb)) <> 'array' then
    raise exception 'receipt arrays required' using errcode = '22023';
  end if;

  select aa.owner_id, aa.space_id
    into v_owner_id, v_space_id
  from public.agent_actions aa
  where aa.id = p_action_id
    and aa.approval_status = 'approved';

  if not found then
    raise exception 'approved governed action required' using errcode = '42501';
  end if;

  if v_user_id <> v_owner_id
     and (v_space_id is null or not public.is_space_moderator(v_space_id)) then
    raise exception 'owner or Space moderator required' using errcode = '42501';
  end if;

  if p_post_id is not null and not exists (
    select 1
    from public.posts p
    where p.id = p_post_id
      and p.space_id = v_space_id
  ) then
    raise exception 'post must belong to the governed action Space' using errcode = '42501';
  end if;

  insert into public.provenance_records (
    post_id,
    source_refs,
    transformations,
    generated_at
  )
  values (
    p_post_id,
    coalesce(p_source_refs, '[]'::jsonb),
    coalesce(p_transformations, '[]'::jsonb),
    now()
  )
  returning id into v_record_id;

  update public.agent_actions
  set output_refs = output_refs || jsonb_build_array(
    jsonb_build_object('provenance_record_id', v_record_id)
  )
  where id = p_action_id;

  return v_record_id;
end;
$$;

revoke all on function public.record_approved_action_provenance(uuid,uuid,jsonb,jsonb) from public;
revoke execute on function public.record_approved_action_provenance(uuid,uuid,jsonb,jsonb) from anon;
grant execute on function public.record_approved_action_provenance(uuid,uuid,jsonb,jsonb) to authenticated;
