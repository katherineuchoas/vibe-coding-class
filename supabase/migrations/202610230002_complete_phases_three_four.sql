-- Complete Phase 3 and 4 track requirements from Exercises 3 and 4.
-- Safe to run more than once; updates only the intended lesson text.

update public.aula_passos p
set titulo = 'O que construir em cada trilha',
    conteudo = $content$
PRESENÇA DIGITAL
• Perfil editável: foto, nome e biografia.
• Blocos: links com ícone escolhido em uma biblioteca com busca e blocos visuais com imagem enviada.
• Reordene arrastando; alterne entre grade e lista; ative ou oculte cada bloco.
• Confira a prévia no celular.
Pronto quando: adiciono um link e um bloco visual, reordeno tudo e confiro a prévia sem abrir o código.

PRODUTIVIDADE PESSOAL
• Ordene as tarefas de hoje por prazo, importância e esforço; explique por que cada uma ficou naquela posição.
• Sugira uma única tarefa para começar.
• Mostre concluídas e total, hábitos cumpridos e tempo em foco.
• Apresente padrões somente quando os dados existentes sustentarem a observação. Nunca invente um insight.
Pronto quando: abro o app pela manhã e vejo as tarefas ordenadas com explicação.

RECOLOCAÇÃO PROFISSIONAL
• Adapte o currículo à vaga usando somente experiências e informações já existentes. Não invente qualificações.
• Compare original e versão adaptada lado a lado; permita revisão e edição manual antes de aprovar.
• Exporte o currículo aprovado em PDF e guarde a versão no histórico ligado à vaga.
Pronto quando: adapto, comparo, edito, aprovo e baixo o PDF.

PROJETO PRÓPRIO
Implemente apenas a função da Fase 3 descrita no PLANO.md. Preserve as Fases 1 e 2 e use o critério de pronto definido no plano.

Nesta fase, ainda sem login.
$content$
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-3' and p.ordem = 6;

update public.aula_passos p
set titulo = 'Presença digital · proteger somente a edição',
    conteudo = $content$
• Use Supabase Auth com e-mail e senha.
• Mantenha a página pública acessível sem login e proteja a rota /admin.
• Configure RLS para leitura pública e escrita somente por uma conta autenticada e autorizada.
• Inclua sair da conta.
Pronto quando: deslogada, a página pública funciona e /admin não abre; com a conta correta, a edição funciona.
$content$
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-4' and p.ordem = 6;

update public.aula_passos p
set titulo = 'Produtividade · dados de cada pessoa',
    conteudo = $content$
• Exija login antes de abrir qualquer parte do app.
• Configure RLS para cada pessoa ler e alterar somente os próprios registros, usando o identificador da conta.
• Migre o histórico existente para a conta da dona dos dados.
Pronto quando: sem sessão nenhuma aba abre; uma segunda conta não vê os dados da primeira; o histórico da conta correta continua disponível.
$content$
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-4' and p.ordem = 7;

update public.aula_passos p
set titulo = 'Recolocação · proteger dados e análise',
    conteudo = $content$
• Ofereça cadastro e login; proteja o app inteiro, sem leitura pública de currículo, vagas ou análises.
• Use RLS estrita para que cada pessoa acesse somente os próprios dados.
• Faça a função que chama o modelo de IA aceitar análises somente de uma sessão autenticada.
• Permita apagar a conta e os dados pessoais associados.
Pronto quando: currículo, vagas e versões só aparecem com a sessão válida da própria pessoa.
$content$
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-4' and p.ordem = 8;

update public.aula_passos p
set titulo = 'Projeto próprio · login e RLS',
    conteudo = $content$
Leia o PLANO.md. Proteja as telas previstas e configure RLS para cada registro pertencer à conta correta. Faça uma lista do que fica público e privado e teste com uma segunda conta. Não exponha dados nem permita escrita sem autorização.
Pronto quando: os caminhos de login e logout funcionam e uma segunda conta não consegue ler nem alterar os dados da primeira.
$content$
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-4' and p.ordem = 9;

update public.aula_passos p
set titulo = 'Teste manualmente cada acesso',
    conteudo = $content$
Duração sugerida: 40 min.

• Desmarque a sessão: confirme quais páginas públicas continuam abertas e quais redirecionam ou bloqueiam.
• Tente entrar com e-mail inexistente e senha incorreta.
• Entre com a conta autorizada e teste sair.
• Use uma segunda conta e tente ler ou alterar dados da primeira.
• Confirme que o histórico da conta correta permanece disponível.
• Para recolocação, confirme que uma pessoa sem sessão não consegue disparar a análise por IA.
• Confira que as partes das Fases 1, 2 e 3 continuam funcionando.

A página pública da trilha de presença digital continua aberta; a área /admin fica protegida.
$content$
from public.aulas a
where p.aula_id = a.id and a.slug = 'aula-4' and p.ordem = 15;
