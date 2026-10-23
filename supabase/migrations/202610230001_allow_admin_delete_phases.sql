-- Allow only registered admins to delete roadmap phases from the editor.
grant delete on public.fases to authenticated;

drop policy if exists fases_admin_delete on public.fases;
create policy fases_admin_delete
  on public.fases
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users
      where user_id = (select auth.uid())
    )
  );
