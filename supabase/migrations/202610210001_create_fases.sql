-- Phase 2: store the four project phases in Supabase.
-- RLS is taught in a later phase, as directed by the course exercise.
-- This public course table is read-only for browser roles until then.
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

grant usage on schema public to anon, authenticated;
revoke all on table public.fases from public, anon, authenticated;
grant select on table public.fases to anon, authenticated;

-- Before publishing a connected site, add and verify RLS policies as taught
-- in the security phase. Never put a secret/service_role key in the browser.
