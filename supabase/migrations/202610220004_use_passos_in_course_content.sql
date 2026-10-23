-- Change learner-facing course language from "aula" to "passo".
-- Keep database table names and slugs unchanged because the app depends on them.
update public.aulas
set titulo = replace(replace(replace(replace(replace(replace(titulo,
      'AULAS', 'PASSOS'), 'Aula', 'Passo'), 'Aulas', 'Passos'),
      'aulas', 'passos'), 'aula', 'passo'), 'AULA', 'PASSO'),
    resumo = replace(replace(replace(replace(replace(replace(resumo,
      'AULAS', 'PASSOS'), 'Aula', 'Passo'), 'Aulas', 'Passos'),
      'aulas', 'passos'), 'aula', 'passo'), 'AULA', 'PASSO');

update public.aula_passos
set titulo = replace(replace(replace(replace(replace(replace(titulo,
      'AULAS', 'PASSOS'), 'Aula', 'Passo'), 'Aulas', 'Passos'),
      'aulas', 'passos'), 'aula', 'passo'), 'AULA', 'PASSO'),
    conteudo = replace(replace(replace(replace(replace(replace(conteudo,
      'AULAS', 'PASSOS'), 'Aula', 'Passo'), 'Aulas', 'Passos'),
      'aulas', 'passos'), 'aula', 'passo'), 'AULA', 'PASSO');
