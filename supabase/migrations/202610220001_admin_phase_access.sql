-- Phase 4: allow only explicitly registered admins to add or edit phases.
-- Public visitors can still read the course roadmap.
-- Bootstrap an admin only after creating that user in Supabase Auth.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.fases enable row level security;
alter table public.admin_users enable row level security;

-- Replace any earlier phase policies with the intended public-read/admin-write rules.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'fases'
  loop
    execute format('drop policy if exists %I on public.fases', existing_policy.policyname);
  end loop;
end
$$;

drop policy if exists admin_users_read_own_membership on public.admin_users;
create policy admin_users_read_own_membership
  on public.admin_users
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy fases_public_read
  on public.fases
  for select
  to anon, authenticated
  using (true);

create policy fases_admin_insert
  on public.fases
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admin_users
      where user_id = (select auth.uid())
    )
  );

create policy fases_admin_update
  on public.fases
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users
      where user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users
      where user_id = (select auth.uid())
    )
  );

grant usage on schema public to anon, authenticated;
revoke all on table public.fases from public, anon, authenticated;
grant select on table public.fases to anon, authenticated;
grant insert, update on table public.fases to authenticated;

revoke all on table public.admin_users from public, anon, authenticated;
grant select on table public.admin_users to authenticated;

-- Deliberately no DELETE permission or policy: this phase supports adding and editing,
-- while removing course phases remains outside this first admin screen.
