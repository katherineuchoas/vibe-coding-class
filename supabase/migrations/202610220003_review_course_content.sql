-- Phase 5 follow-up: restore missing lesson steps and keep the course aligned
-- with Exercises 1 and 2 and the supporting lesson materials.
-- Apply after 202610220002_import_existing_lessons.sql.
-- This changes only course text; it does not change security rules or app data.

-- Lesson 1: preserve each track's planning and interface prompt as a separate step.
update public.aula_passos p
set titulo = 'O que é vibe coding?',
    conteudo = 'Vibe coding é criar com a ajuda de uma IA. Você explica sua ideia com palavras; a IA ajuda a transformar isso em um projeto. Você não precisa saber programar para começar.'
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-1' and p.ordem = 3;

update public.aula_passos p
set conteudo = 'Escolha uma trilha: presença digital, produtividade pessoal, recolocação profissional ou um projeto próprio. Cada uma percorre as mesmas quatro fases: primeira tela, banco de dados, melhoria e login.'
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-1' and p.ordem = 6;

update public.aula_passos p
set tipo = 'prompt',
    titulo = 'Planejamento · presença digital',
    conteudo = 'Você é minha parceira de produto. Vamos planejar meu linktree ou portfólio antes de escrever código.

Meus links reais: [cole aqui].
Meu estilo: [cores e referências].
Quero mostrar: [links simples ou blocos com imagem e descrição].

Quero um plano em quatro fases: página pública, banco de dados, área de edição e login.
Antes de escrever o plano, faça no máximo 5 perguntas.'
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-1' and p.ordem = 7;

update public.aula_passos p
set tipo = 'prompt',
    titulo = 'Planejamento · produtividade pessoal',
    conteudo = 'Você é minha parceira de produto. Vamos planejar um app de tarefas, hábitos, foco e materiais de estudo antes de escrever código.

Minha rotina: [conte como são seus dias].
Meu estilo: [cores e referências].
O que quero organizar: [tarefas, hábitos diários/semanais/mensais e estudos].

Quero um plano em quatro fases: tela com quatro abas, banco de dados, prioridades e resumo do dia, e login.
Antes de escrever o plano, faça no máximo 5 perguntas.'
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-1' and p.ordem = 8;

update public.aula_passos p
set tipo = 'prompt',
    titulo = 'Planejamento · recolocação profissional',
    conteudo = 'Você é minha parceira de produto. Vamos planejar uma ferramenta para buscar emprego com ajuda de IA.

Meu momento profissional: [conte como está sua busca].
A IA deve organizar meu currículo e comparar com vagas que eu mesma vou colar.
Não busque vagas automaticamente em sites como LinkedIn ou Gupy.

Quero um plano em quatro fases: tela e IA, banco de dados, currículo adaptado em PDF, e login.
Antes de escrever o plano, faça no máximo 5 perguntas.'
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-1' and p.ordem = 9;

update public.aula_passos p
set tipo = 'prompt',
    titulo = 'Planejamento · projeto próprio',
    conteudo = 'Você é minha parceira de produto. Vamos planejar uma primeira versão do meu projeto antes de escrever código.

Contexto real: [conte o que precisa].
Conteúdo que quero incluir: [liste].
Meu plano em quatro fases: [escreva ou cole as fases].

Antes de montar o plano, faça no máximo 5 perguntas.'
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-1' and p.ordem = 10;

update public.aula_passos p
set conteudo = 'Cole o plano em outro modelo de IA para pedir uma segunda opinião.

Revise este plano para que uma IA consiga executá-lo uma fase por vez. Não invente informações.

Responda em quatro tabelas simples:
1. O que está bom e deve continuar, e por quê.
2. O que está confuso ou incompleto, o problema que isso pode causar e como melhorar.
3. O que você faria diferente e por quê.
4. Melhorias por prioridade, com impacto, esforço e fase afetada.

PLANO:
[cole o plano aqui]'
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-1' and p.ordem = 11;

update public.aula_passos p
set titulo = 'Leve a revisão de volta para a IA',
    conteudo = 'Consultei outra IA sobre o plano. Ela tinha menos contexto do que você e sugeriu estas mudanças:

[cole a revisão aqui]

Analise cada sugestão. Diga o que faz sentido, o que não se aplica e por quê. Depois, atualize o plano sem mudar o objetivo do projeto.'
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-1' and p.ordem = 12;

-- Move the activity to the end, making room for four distinct Phase 1 prompts.
update public.aula_passos p
set ordem = 17
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-1' and p.ordem = 13;

insert into public.aula_passos (aula_id, tipo, titulo, conteudo, ordem)
select a.id, 'prompt', 'Fase 1 · presença digital',
$lesson$Implemente SOMENTE a Fase 1: uma página pública, feita primeiro para celular.

Inclua:
• Foto, nome e biografia de até duas linhas.
• Links simples com ícone e título.
• Blocos visuais com imagem, título e descrição.
• Meus links reais: [cole aqui].

Use tema claro ou escuro conforme a preferência do aparelho. Deixe a leitura dos dados em getPerfil/getBlocos.
Não crie área de edição nem login agora.

Pronto quando: abro no celular, vejo meu conteúdo real e todos os links funcionam.$lesson$, 13
from public.aulas a
where a.slug = 'aula-1'
  and not exists (select 1 from public.aula_passos p where p.aula_id = a.id and p.ordem = 13);

insert into public.aula_passos (aula_id, tipo, titulo, conteudo, ordem)
select a.id, 'prompt', 'Fase 1 · produtividade pessoal',
$lesson$Implemente SOMENTE a Fase 1 do meu app, seguindo o plano.

Crie quatro abas:
• Hoje: tarefas rápidas, hábitos do dia e timer de foco.
• Tarefas: quadro “A fazer”, “Fazendo” e “Feito”.
• Hábitos: hábitos diários, semanais ou mensais, com sequência e histórico.
• Biblioteca: cursos e livros com progresso.

Use meus dados reais: [cole aqui]. Guarde os dados no localStorage.
Não crie banco de dados nem login nesta fase.

Pronto quando: navego pelas quatro abas, fecho o navegador, abro de novo e encontro meus dados.$lesson$, 14
from public.aulas a
where a.slug = 'aula-1'
  and not exists (select 1 from public.aula_passos p where p.aula_id = a.id and p.ordem = 14);

insert into public.aula_passos (aula_id, tipo, titulo, conteudo, ordem)
select a.id, 'prompt', 'Fase 1 · recolocação profissional',
$lesson$Implemente SOMENTE a Fase 1 da minha ferramenta de busca de emprego.

1. Permita enviar um currículo em PDF/DOCX ou colar o texto.
2. A IA organiza meu perfil.
3. Permita colar a descrição de uma vaga e clicar em “Analisar”.
4. Mostre compatibilidade, explicação, pontos atendidos, diferenças e sugestões.
5. Use minha chave de IA, guardada apenas neste navegador nesta fase.

Não crie backend nem login agora. Não busque vagas automaticamente.

Pronto quando: envio meu currículo real, colo uma vaga real e recebo uma análise que entendo.$lesson$, 15
from public.aulas a
where a.slug = 'aula-1'
  and not exists (select 1 from public.aula_passos p where p.aula_id = a.id and p.ordem = 15);

insert into public.aula_passos (aula_id, tipo, titulo, conteudo, ordem)
select a.id, 'prompt', 'Fase 1 · projeto próprio',
$lesson$Antes de construir, crie um arquivo PLANO.md com o plano que recebi.

Implemente SOMENTE a Fase 1: [descreva a interface].
Siga a estrutura do plano. Guarde os dados no localStorage e deixe a leitura e a escrita de dados em uma parte separada do código.

Pronto quando: [escreva um teste simples que prove que a primeira versão funciona].$lesson$, 16
from public.aulas a
where a.slug = 'aula-1'
  and not exists (select 1 from public.aula_passos p where p.aula_id = a.id and p.ordem = 16);

-- Lesson 2: keep the five-step path visible and preserve the limits from Exercise 2.
update public.aula_passos p
set conteudo = 'Na Fase 2, os dados saem da memória temporária do navegador e passam a ser guardados no banco. A tela continua parecida; muda o lugar onde a informação fica.

1. Veja no plano quais informações precisam ser guardadas.
2. Configure o Supabase e conecte a ferramenta de IA pelo MCP.
3. Crie as tabelas por uma migration e coloque nelas o conteúdo real.
4. Troque a leitura e a gravação do app para usar o Supabase.
5. Confira o critério de pronto da sua trilha e se os dados continuam lá depois de fechar e abrir o app.'
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-2' and p.ordem = 3;

update public.aula_passos p
set titulo = 'Uma etapa por trilha',
    conteudo = 'Presença digital: tabelas de perfil e blocos. Troque getPerfil/getBlocos para buscar no Supabase e mostre carregamento, erro e lista vazia.

Produtividade: tabelas de tarefas, hábitos e periodicidade, registros de conclusão, sessões de foco e biblioteca. Leve os dados existentes para o banco. O histórico semanal e mensal deve usar os registros reais.

Recolocação: tabelas de currículo, vagas analisadas, resultados e candidaturas. A chave da IA sai do navegador e fica como segredo no servidor, em uma função segura. Crie uma tela para pesquisar o histórico de vagas.

Projeto próprio: leia o PLANO.md, confirme o custo antes de criar o projeto, crie as tabelas previstas e confira se elas aparecem no Supabase.

Nesta fase, não crie área de administração ou login. Não acrescente a priorização automática, o currículo adaptado em PDF nem outras etapas que o Exercício 2 deixou para depois.'
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-2' and p.ordem = 9;

-- Lesson 3: match the debugging guide, including the order and status examples.
update public.aula_passos p
set conteudo = 'Abra o Inspecionar antes de repetir o erro. No Linux ou Windows, aperte F12; no Mac, aperte Cmd + Option + I. Deixe o painel aberto e só então faça o erro acontecer de novo.

Na aba Console, procure a mensagem vermelha. Na aba Network, procure o pedido que falhou e anote o número de status. Tire uma captura de tela e copie a mensagem completa.'
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-3' and p.ordem = 2;

update public.aula_passos p
set titulo = 'O que os números querem dizer',
    conteudo = 'Console mostra mensagens do site. Network mostra os pedidos e as respostas.

200: deu certo.
400: o pedido chegou com algo errado.
401: falta entrar ou a sessão não vale mais.
403: você entrou, mas não tem permissão.
404: a página ou informação não foi encontrada.
429: foram feitos pedidos demais em pouco tempo.
500: houve um erro no servidor.
502 ou 503: o serviço está temporariamente indisponível.

Os números ajudam a investigar; não explicam sozinhos a causa. Copie também a mensagem completa do Console e conte o que você fez.'
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-3' and p.ordem = 3;

-- Lesson 4: restore the complete public/private exercise and practical sequence.
update public.aula_passos p
set titulo = 'O que vamos fazer nesta aula?',
    conteudo = 'Vamos escolher quais telas são públicas e quais são privadas, planejar como a pessoa entra e sai, e proteger tanto a tela quanto os dados no banco.'
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-4' and p.ordem = 3;

update public.aula_passos p
set conteudo = 'Pergunte: “Se uma pessoa desconhecida abrir esta tela, tudo bem?”

Presença digital: a página de links é pública; a área /admin é privada.

Produtividade: Hoje, tarefas, hábitos e biblioteca são privados.

Recolocação: currículo, vagas analisadas e versões adaptadas são privadas.

Projeto próprio: liste cada tela do seu projeto e marque como pública ou privada.'
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-4' and p.ordem = 5;

update public.aula_passos p
set conteudo = '1. Separe as telas públicas das privadas.
2. Desenhe o caminho: cadastro, login, recuperar senha, sair e o destino de quem não entrou.
3. Peça à IA para proteger a tela e também os dados no banco, sem mudar o que já funciona.
4. No Supabase, abra Authentication → Users, escolha Add user → Create new user, informe e-mail e senha e marque Auto Confirm User para pular a confirmação por e-mail durante o exercício.
5. Teste sem login, com e-mail errado e com uma segunda conta.'
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-4' and p.ordem = 11;

update public.aula_passos p
set titulo = 'Crie uma conta para testar',
    conteudo = 'No Supabase, abra Authentication → Users. Escolha Add user → Create new user, informe um e-mail e uma senha e marque Auto Confirm User. Essa opção pula a confirmação por e-mail durante o exercício. Clique em Create user. A conta aparecerá na lista e poderá entrar no seu app.'
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-4' and p.ordem = 12;

update public.aula_passos p
set conteudo = concat(
  p.conteudo,
  E'\n\nA publicação com endereço próprio e domínio fica para a Semana 14; aqui o objetivo é ter um protótipo completo e seguro.'
)
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-4' and p.ordem = 15
  and p.conteudo not like '%domínio fica para a Semana 14%';
