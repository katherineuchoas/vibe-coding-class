-- Phase 5: store every course lesson and each editable content step in Supabase.
create table if not exists public.aulas (
  id uuid primary key default gen_random_uuid(),
  slug text,
  titulo text not null,
  resumo text not null default '',
  ordem integer not null default 1,
  cor text not null default 'peach',
  publicada boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.aulas add column if not exists slug text;
alter table public.aulas add column if not exists resumo text not null default '';
alter table public.aulas add column if not exists ordem integer not null default 1;
alter table public.aulas add column if not exists cor text not null default 'peach';
alter table public.aulas add column if not exists publicada boolean not null default true;
create unique index if not exists aulas_slug_idx on public.aulas (slug) where slug is not null;

create table if not exists public.aula_passos (
  id uuid primary key default gen_random_uuid(),
  aula_id uuid not null references public.aulas(id) on delete cascade,
  tipo text not null default 'explicacao'
    check (tipo in ('explicacao','atividade','prompt','dica')),
  titulo text not null,
  conteudo text not null default '',
  ordem integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists aula_passos_aula_ordem_idx on public.aula_passos (aula_id, ordem);
alter table public.aulas enable row level security;
alter table public.aula_passos enable row level security;

grant select on public.aulas, public.aula_passos to anon, authenticated;
grant insert, update, delete on public.aulas, public.aula_passos to authenticated;

create policy "Public can read published lessons" on public.aulas
  for select to anon, authenticated
  using (publicada or auth.uid() in (select user_id from public.admin_users));
create policy "Admins can manage lessons" on public.aulas
  for all to authenticated
  using (auth.uid() in (select user_id from public.admin_users))
  with check (auth.uid() in (select user_id from public.admin_users));
create policy "Public can read steps of published lessons" on public.aula_passos
  for select to anon, authenticated
  using (exists (
    select 1 from public.aulas
    where aulas.id = aula_passos.aula_id
      and (aulas.publicada or auth.uid() in (select user_id from public.admin_users))
  ));
create policy "Admins can manage lesson steps" on public.aula_passos
  for all to authenticated
  using (auth.uid() in (select user_id from public.admin_users))
  with check (auth.uid() in (select user_id from public.admin_users));

-- Import all four existing lessons and their source text as separate editable steps.
insert into public.aulas (slug,titulo,resumo,ordem,cor,publicada)
values
  ('aula-1','Diga à IA o que você imagina','Vibe coding é criar com a ajuda de uma IA. Você explica sua ideia com palavras; a IA ajuda a transformar isso em um projeto. Quanto mais claro o pedido, mais perto o resultado fica do que você imaginou.',1,'peach',true),
  ('aula-2','Ajude seu projeto a lembrar','Uma tela bonita pode esquecer tudo quando você fecha a aba. O banco de dados é como um caderno organizado: guarda as informações para o projeto encontrar depois.',2,'blue',true),
  ('aula-3','Mude uma coisa por vez','Depois de ver o projeto funcionando, novas ideias aparecem. Escolha uma de cada vez. Se algo quebrar, investigue o que aconteceu antes de pedir para a IA consertar.',3,'lilac',true),
  ('aula-4','Escolha quem pode entrar','O login é a última fechadura do projeto. Primeiro, decidimos quais telas podem ser vistas por qualquer pessoa e quais precisam de uma conta. Depois, protegemos a tela e os dados guardados.',4,'green',true)
on conflict (slug) do nothing;

-- aula-1: 13 steps.
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Um bom pedido conta…','• Contexto:  quem vai usar e por quê.
• Referências:  exemplos, links ou imagens.
• Visual:  cores, estilo e como a tela deve parecer.
• Clareza:  o que fazer agora e o que deixar para depois.',1
from public.aulas where slug='aula-1'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=1);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','O caminho em 5 passos','• Conte sua ideia com detalhes.
• Peça à IA para fazer perguntas.
• Monte um plano em etapas.
• Peça a outra IA para revisar o plano.
• Construa uma etapa por vez e confira o resultado.',2
from public.aulas where slug='aula-1'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=2);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Palavras sem susto','',3
from public.aulas where slug='aula-1'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=3);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Palavras importantes','Prompt
O pedido que você escreve para a IA.
Frontend
A parte que aparece na tela e onde você clica.
Protótipo
Uma primeira versão para testar a ideia.
MVP
A menor versão que já dá para alguém usar.
Claude Code
Uma ferramenta de IA que trabalha nos arquivos do projeto. Você também pode usar outras IAs.
Repositório
A pasta do projeto na internet, com o histórico de mudanças.',4
from public.aulas where slug='aula-1'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=4);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'prompt','Prompt para planejar sua ideia','Troque os trechos entre colchetes pelos seus detalhes.

Quero criar [explique sua ideia] para ajudar [quem vai usar].

O que a pessoa precisa fazer no projeto: [tarefas principais].
Quero um visual [cores, estilo e referências].
Por enquanto, quero construir só a primeira parte: [o que deve aparecer na tela].

Antes de montar o plano, faça até 5 perguntas para entender melhor.
Depois, crie um plano em 4 etapas: tela, dados, melhorias e login.
Não escreva código ainda. Use palavras simples e diga como vou saber se cada etapa ficou pronta.',5
from public.aulas where slug='aula-1'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=5);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Escolha uma trilha','',6
from public.aulas where slug='aula-1'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=6);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Presença digital','Presença digital Uma página com seu nome, uma bio curta e seus links reais.',7
from public.aulas where slug='aula-1'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=7);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Produtividade','Produtividade Um app para tarefas, hábitos, foco e materiais de estudo.',8
from public.aulas where slug='aula-1'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=8);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Recolocação','Recolocação Uma ferramenta para comparar seu currículo com vagas coladas por você. Sem buscar vagas automaticamente.',9
from public.aulas where slug='aula-1'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=9);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Ideia própria','Ideia própria Seu projeto, com uma primeira tela simples para testar a ideia.',10
from public.aulas where slug='aula-1'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=10);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'prompt','Prompt para pedir uma segunda opinião','Cole o plano em outro modelo de IA.

Revise este plano de projeto com cuidado.

O que está claro e deve continuar?
O que está confuso ou faltando?
Que risco ou etapa foi esquecida?
As instruções são específicas o bastante para uma IA seguir uma fase por vez?

Responda em tabelas simples: pontos fortes, melhorias, outras opções e sugestões por prioridade.
Não invente detalhes sobre o projeto.
PLANO:
[cole o plano aqui]',11
from public.aulas where slug='aula-1'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=11);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'prompt','Prompt para construir a primeira tela','Use depois de revisar o plano.

Leia meu plano. Construa SOMENTE a primeira etapa: [descreva a tela].

Use estes conteúdos reais: [cole textos, links ou tarefas].
Quero um visual [descreva cores e referências].
Quando terminar, explique como posso abrir a tela e conferir se [critério de pronto].
Não crie banco de dados, área de edição ou login nesta etapa.
Se faltar uma informação, pergunte antes de inventar.',12
from public.aulas where slug='aula-1'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=12);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'atividade','Planeje e mostre a primeira tela','Duração sugerida: 50 min.\n\n• Escolha uma ideia e conte o contexto.
• Peça um plano. Responda às perguntas da IA.
• Peça a outra IA uma revisão e ajuste o plano.
• Construa só a primeira tela.
• Teste no celular e anote o que quer mudar.
As trilhas do material: presença digital, produtividade pessoal, recolocação profissional ou uma ideia sua.',13
from public.aulas where slug='aula-1'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=13);

-- aula-2: 9 steps.
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Pense num restaurante:','Pense num restaurante:  a tela recebe o pedido, o backend leva para a cozinha, o banco guarda a informação e a tela mostra o resultado.',1
from public.aulas where slug='aula-2'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=1);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Palavras importantes','Tabela
Como uma planilha: colunas são tipos de informação; linhas são itens.
Backend
A cozinha que organiza pedidos e regras por trás da tela.
Supabase
Um serviço que oferece banco de dados, login e espaço para arquivos.
localStorage
Memória que fica só neste navegador e aparelho.
Migration
Um registro das mudanças feitas no banco.
MCP
Um conector que permite uma IA conversar com uma ferramenta.',2
from public.aulas where slug='aula-2'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=2);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','O passo a passo da Fase 2','',3
from public.aulas where slug='aula-2'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=3);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Passo 4','• Veja no plano quais informações precisam ficar guardadas.
• Escolha e configure o banco de dados.
• Crie as tabelas e coloque os dados do projeto.
• Troque a memória do navegador pelo banco, sem mudar a tela.
• Feche e abra de novo para conferir se os dados continuam lá.',4
from public.aulas where slug='aula-2'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=4);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'prompt','Prompt para entender o caminho dos dados','Use antes de conectar o banco.

Explique em passos simples como uma informação sai da tela, chega ao Supabase e fica guardada.

Use como exemplo [marcar um hábito / editar um perfil / salvar uma tarefa].
Diga quais tabelas seriam necessárias e como posso conferir se funcionou.
Não crie login nem mude a tela nesta etapa.
Avise se faltar alguma informação. Não invente dados.',5
from public.aulas where slug='aula-2'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=5);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Conecte seu projeto ao Supabase','Há duas conexões diferentes: o MCP permite que a IA trabalhe com seu banco; a configuração do app permite que a página busque os dados. Este site usa apenas o projeto definido no código. Visitantes não podem escolher outro banco.

• Antes de criar o projeto, confirme o custo. No exercício, escolha a organização pessoal e o plano gratuito.

• Na ferramenta de IA, abra as conexões, escolha Supabase e autorize somente o projeto desta atividade.

• Copie do seu projeto o URL e a chave pública (publishable ou anon) para supabase-config.js.

• Use o MCP para criar as tabelas conforme o PLANO.md e confirme que elas aparecem no Supabase.

• Troque a leitura do app para buscar esses dados e faça o teste definido no plano.',6
from public.aulas where slug='aula-2'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=6);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','🔐 Cuide das chaves.','🔐 Cuide das chaves.  A chave pública pode aparecer no navegador, mas nunca use senha nem chave secret ou service_role. Nesta fase, siga o exercício: não crie login nem regras de acesso antes da aula correspondente.',7
from public.aulas where slug='aula-2'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=7);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Se as fases não aparecerem:','Se as fases não aparecerem:  confira se o URL e a chave são do mesmo projeto, se a migration foi aplicada nele e se a tabela public.fases tem linhas. Se precisar investigar, abra o Console (F12) e siga a atividade da Aula 3.',8
from public.aulas where slug='aula-2'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=8);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'atividade','Faça seu projeto lembrar','Duração sugerida: 40 min.\n\n• Crie ou acesse sua conta do Supabase.
• Conecte o banco à ferramenta de IA escolhida.
• Siga o plano e mova os dados para as tabelas.
• Feche a aba, abra de novo e confira os dados.
Exercício 2: cada trilha tem suas tabelas e seu próprio critério de pronto. Nesta fase, o material orienta não criar login nem área de administração.

Exercício 2 · o que muda em cada trilha?

Presença digital Tabelas:  perfil e blocos. Troque a leitura dos dados para buscar no Supabase. Confira carregamento, erro e lista vazia.
Pronto quando:  você muda um título na tabela, recarrega e vê a tela atualizada.

Produtividade Tabelas:  tarefas, hábitos, registros, sessões de foco e biblioteca. Leve para o banco os dados que já existiam.
Pronto quando:  marca um hábito no celular e vê a mudança no computador.

Recolocação Tabelas:  currículo, vagas, resultados e candidaturas. A chave de IA deve ficar no servidor, como segredo.
Pronto quando:  analisa três vagas, fecha o app e depois encontra o histórico.

Ideia própria Leia o plano, confirme qualquer custo antes de criar o projeto, crie as tabelas previstas e peça à IA para confirmar os nomes.
Pronto quando:  o teste definido no seu plano funciona.

Nesta etapa:  não crie login nem área de edição. O material também deixa a priorização inteligente para depois. A chave pública e a chave secreta são coisas diferentes: nunca coloque a chave secreta no navegador ou em um repositório público.',9
from public.aulas where slug='aula-2'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=9);

-- aula-3: 5 steps.
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Quero acrescentar algo?','• Liste as ideias e escolha a de maior impacto com menos esforço.
• Explique a função, os dados e o caminho na tela.
• Peça uma revisão do plano.
• Construa só essa função.
• Teste a função nova e as telas antigas.',1
from public.aulas where slug='aula-3'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=1);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Algo parou de funcionar?','• Abra o Inspecionar (F12) antes de repetir o erro.
• Faça o erro acontecer de novo.
• Anote o que fez, o que aconteceu e o que esperava.
• Copie o erro vermelho do Console e veja o status no Network.
• Peça para a IA explicar a causa antes de corrigir.',2
from public.aulas where slug='aula-3'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=2);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Console:','Console:  mostra mensagens de erro. Network:  mostra pedidos e respostas. O número 200 costuma indicar sucesso; 401 pode indicar que falta login; 403 indica falta de permissão; 404 indica endereço não encontrado; 500 aponta um erro no servidor.',3
from public.aulas where slug='aula-3'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=3);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'prompt','Prompt para relatar um bug','Preencha os espaços com o que você observou.

Quero entender este problema antes de mudar qualquer coisa.

O que eu fiz: [passos que segui].
O que aconteceu: [resultado que vi].
O que eu esperava: [resultado esperado].
Mensagem do Console: [cole a linha vermelha].
Pedido com erro no Network e status: [se aparecer].

Primeiro, explique a causa provável em palavras simples.
Não altere outras partes do projeto.
Depois, sugira a menor correção e diga como conferir se as telas antigas continuam funcionando.',4
from public.aulas where slug='aula-3'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=4);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'atividade','Expanda ou investigue','Duração sugerida: 40 min.\n\n• Se o app funciona, escolha uma ideia e priorize por impacto e esforço.
• Escreva um plano curto e peça uma revisão.
• Construa uma função por vez.
• Teste a função nova, as antigas, os dados e o Console.
• Se havia um bug, anote os passos e a mensagem antes de pedir ajuda.',5
from public.aulas where slug='aula-3'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=5);

-- aula-4: 15 steps.
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Duas perguntas diferentes','Autenticação:  confirma quem é você, como conferir o ingresso na entrada.
Permissão:  define o que você pode fazer depois de entrar, como escolher em qual área pode circular.',1
from public.aulas where slug='aula-4'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=1);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Duas fechaduras','A porta:  a tela manda quem não entrou para a página pública.
O cofre:  o banco de dados também confere a permissão, mesmo se alguém tentar pular a tela.',2
from public.aulas where slug='aula-4'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=2);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Palavras sem susto','',3
from public.aulas where slug='aula-4'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=3);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Palavras importantes','Sessão
O navegador lembra que você já entrou.

Rota
O endereço de uma parte do site, como uma área de edição.

Redirecionar
Levar a pessoa para outra página, por exemplo, quando ela não entrou.

Supabase Auth
O serviço do Supabase que cuida de contas e login.

RLS
Regras no banco que limitam quais dados cada pessoa pode ver ou mudar.

Conta de teste
Uma segunda conta para conferir se os dados ficam separados.',4
from public.aulas where slug='aula-4'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=4);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Primeiro, separe as telas','',5
from public.aulas where slug='aula-4'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=5);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Presença digital','Presença digital A página pública pode ser vista por todas as pessoas. A área de edição é só para você.',6
from public.aulas where slug='aula-4'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=6);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Produtividade','Produtividade Tarefas e hábitos são privados: cada pessoa vê e muda os próprios dados.',7
from public.aulas where slug='aula-4'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=7);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Recolocação','Recolocação Currículo, vagas e análises são privados e ficam ligados à conta da pessoa.',8
from public.aulas where slug='aula-4'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=8);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Ideia própria','Ideia própria Liste suas telas e marque cada uma como pública ou privada.',9
from public.aulas where slug='aula-4'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=9);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Passo 10','Pergunta para decidir: “Se uma pessoa desconhecida abrir esta tela, tudo bem?” Para este material de aulas, a leitura das fases é pública; uma futura área de edição deve ser privada.',10
from public.aulas where slug='aula-4'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=10);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','O passo a passo da Fase 4','',11
from public.aulas where slug='aula-4'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=11);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Authentication → Users','• Leia o plano e marque o que é público e o que é privado.

• Desenhe o caminho: entrar, recuperar a senha, sair e decidir para onde vai quem não entrou.

• Peça à IA para proteger a tela e os dados no banco, sem mexer no que já funciona.

• No Supabase, crie uma conta de teste em Authentication → Users . Para o exercício, o material orienta ativar a confirmação automática da conta de teste.

• Teste manualmente cada caminho: sem login, senha errada e uma segunda conta.',12
from public.aulas where slug='aula-4'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=12);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'explicacao','Segurança não é só esconder a tela.','Segurança não é só esconder a tela.  A regra do banco também precisa impedir que alguém leia ou altere dados sem permissão. Nunca coloque uma chave secret ou service_role no navegador.',13
from public.aulas where slug='aula-4'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=13);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'prompt','Prompt para planejar o login','Complete os colchetes com o seu plano antes de pedir mudanças.


Leia meu PLANO.md. Vamos implementar SOMENTE a Fase 4: login e segurança.

Telas públicas: [liste].
Telas privadas: [liste].
Quem pode ver e mudar cada tipo de dado: [explique].
Caminhos necessários: entrar, sair, recuperar senha e o que acontece sem login.

Proteja a tela e também os dados no Supabase com as regras de acesso do projeto.
Não altere as Fases 1, 2 e 3 que já funcionam.
Vou testar manualmente; não precisa executar testes.
Antes de mudar o banco ou inventar uma regra, explique o plano e me pergunte se algo estiver faltando.
Quando terminar, diga como posso testar cada caminho.',14
from public.aulas where slug='aula-4'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=14);
insert into public.aula_passos (aula_id,tipo,titulo,conteudo,ordem)
select id,'atividade','Instale e teste a fechadura','Duração sugerida: 40 min.\n\n• Marque cada tela como pública ou privada.
• Revise o plano e construa só a Fase 4.
• Crie uma conta de teste no Supabase.
• Tente entrar sem conta e com e-mail ou senha errados.
• Use uma segunda conta para conferir que ela não vê os dados da primeira.
• Confira se o que já funcionava antes continua funcionando.
Na trilha de presença digital, a página pública continua aberta; sem login, a área de edição fica bloqueada.',15
from public.aulas where slug='aula-4'
and not exists (select 1 from public.aula_passos p where p.aula_id=public.aulas.id and p.ordem=15);

