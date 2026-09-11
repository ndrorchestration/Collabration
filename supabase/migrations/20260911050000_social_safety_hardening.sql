-- Social-safety hardening for the governed alpha.
-- These policies constrain human safety/reporting writes; they grant no agent authority.

-- Reactions are available only to members of the post's Space.
drop policy if exists "reactions own insert" on public.reactions;
create policy "reactions member insert" on public.reactions
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.posts p
      where p.id = post_id
        and public.is_space_member(p.space_id)
    )
  );

-- Reports are attributable and limited to content in a Space the reporter has joined.
drop policy if exists "reports own insert" on public.reports;
create policy "reports member insert" on public.reports
  for insert to authenticated
  with check (
    (select auth.uid()) = reporter_id
    and (
      (
        post_id is not null
        and exists (
          select 1
          from public.posts p
          where p.id = post_id
            and public.is_space_member(p.space_id)
        )
      )
      or
      (
        comment_id is not null
        and exists (
          select 1
          from public.comments c
          join public.posts p on p.id = c.post_id
          where c.id = comment_id
            and public.is_space_member(p.space_id)
        )
      )
    )
  );

create index if not exists blocks_blocked_id_idx on public.blocks (blocked_id);
create index if not exists mutes_muted_id_idx on public.mutes (muted_id);
