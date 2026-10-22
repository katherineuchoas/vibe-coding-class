-- Phase 2: store the four project phases in Supabase.
-- The phase names are public course content; browser access stays read-only.
create table if not exists public.fases (
  id integer primary key,
  titulo text not null,
  descricao text not null
);

insert into public.fases (id, titulo, descricao)
values
  (1, 'A Fachada', 'A tela que a pessoa vê e usa.'),
  (2, 'O Caderno', 'Onde os dados ficam guardados.'),
  (3, 'A Reforma', 'Como melhorar e encontrar erros.'),
  (4, 'A Fechadura', 'Uma entrada protegida por login.')
on conflict (id) do nothing;

alter table public.fases enable row level security;

grant usage on schema public to anon, authenticated;
revoke all on table public.fases from public, anon, authenticated;
grant select on table public.fases to anon, authenticated;

do $
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'fases'
      and policyname = 'Permitir leitura publica das fases'
  ) then
    create policy "Permitir leitura publica das fases"
      on public.fases
      for select
      to anon, authenticated
      using (true);
  end if;
end
$;

-- Never put a secret/service_role key in the browser.
