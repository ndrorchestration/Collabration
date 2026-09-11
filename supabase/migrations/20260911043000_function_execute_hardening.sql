-- Live Supabase admission found direct EXECUTE grants to API roles on newly
-- created functions. REVOKE FROM PUBLIC alone does not remove a direct anon
-- grant, so governed functions must explicitly remove anonymous execution.

revoke execute on function public.create_space_with_owner(text,text,text) from anon;
revoke execute on function public.create_source_linked_post(uuid,text,text,text) from anon;
revoke execute on function public.is_space_member(uuid) from anon;
revoke execute on function public.is_space_moderator(uuid) from anon;

-- Preserve the intended signed-in boundary explicitly.
grant execute on function public.create_space_with_owner(text,text,text) to authenticated;
grant execute on function public.create_source_linked_post(uuid,text,text,text) to authenticated;
grant execute on function public.is_space_member(uuid) to authenticated;
grant execute on function public.is_space_moderator(uuid) to authenticated;
