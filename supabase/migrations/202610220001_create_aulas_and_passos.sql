-- Phase 5: editable course sessions and small, reorderable lesson steps.
create table if not exists public.aulas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  resumo text not null default '',
  ordem integer not null default 1,
  publicada boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aula_passos (
  id uuid primary key default gen_random_uuid(),
  aula_id uuid not null references public.aulas(id) on delete cascade,
  tipo text not null default 'explicacao'
    check (tipo in ('explicacao', 'atividade', 'prompt', 'dica')),
  titulo text not null,
  conteudo text not null default '',
  ordem integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aula_passos_aula_ordem_idx
  on public.aula_passos (aula_id, ordem);

alter table public.aulas enable row level security;
alter table public.aula_passos enable row level security;

grant select on public.aulas, public.aula_passos to anon, authenticated;
grant insert, update, delete on public.aulas, public.aula_passos to authenticated;

create policy "Public can read published lessons"
  on public.aulas for select
  to anon, authenticated
  using (publicada or auth.uid() in (select user_id from public.admin_users));

create policy "Admins can manage lessons"
  on public.aulas for all
  to authenticated
  using (auth.uid() in (select user_id from public.admin_users))
  with check (auth.uid() in (select user_id from public.admin_users));

create policy "Public can read steps of published lessons"
  on public.aula_passos for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.aulas
      where aulas.id = aula_passos.aula_id
        and (aulas.publicada or auth.uid() in (select user_id from public.admin_users))
    )
  );

create policy "Admins can manage lesson steps"
  on public.aula_passos for all
  to authenticated
  using (auth.uid() in (select user_id from public.admin_users))
  with check (auth.uid() in (select user_id from public.admin_users));
