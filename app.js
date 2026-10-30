function updateLessonDisclosureLabel(details) {
  const hint = details.querySelector(".summary-hint");
  if (hint) hint.textContent = details.open ? "Fechar passo" : "Abrir passo";
}

function bindLessonDisclosures() {
  const lessons = [...document.querySelectorAll(".lesson details")];
  lessons.forEach((current) => {
    updateLessonDisclosureLabel(current);
    if (current.dataset.disclosureBound === "true") return;
    current.dataset.disclosureBound = "true";
    current.addEventListener("toggle", () => {
      if (current.open) {
        lessons.forEach((other) => {
          if (other !== current && other.open) {
            other.open = false;
            updateLessonDisclosureLabel(other);
          }
        });
      }
      updateLessonDisclosureLabel(current);
    });
  });
}

bindLessonDisclosures();

const toast = document.querySelector("#toast");
const toastText = toast.querySelector(".toast-text");
const toastIcon = toast.querySelector(".toast-icon");
let toastTimer;

function hideToast() {
  window.clearTimeout(toastTimer);
  toast.classList.remove("show");
  toast.hidden = true;
}

function showMessage(message, state = "success", duration) {
  if (!message) {
    hideToast();
    return;
  }

  const kind = state || "info";
  toastText.textContent = message;
  toast.dataset.state = kind;
  toastIcon.textContent = kind === "error" ? "!" : kind === "success" ? "✓" : "i";
  toast.setAttribute("role", kind === "error" ? "alert" : "status");
  toast.setAttribute("aria-live", kind === "error" ? "assertive" : "polite");
  toast.hidden = false;
  window.requestAnimationFrame(() => toast.classList.add("show"));
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(hideToast, duration || (kind === "error" ? 7000 : 4200));
}

toast.querySelector(".toast-close").addEventListener("click", hideToast);

function setConnectionStatus(message, state = "") {
  if (state === "loading") return;
  showMessage(message, state || "info");
}

function renderPhases(rows) {
  const grid = document.querySelector(".phase-grid");
  const colors = ["peach", "blue", "lilac", "green"];
  const icons = ["☀", "▤", "✎", "⌑"];
  const existingCards = new Map(
    [...grid.querySelectorAll(".phase-card")].map((card) => [card.dataset.phaseId, card])
  );

  const cards = rows.map((phase, index) => {
    const id = String(Number(phase.id));
    let card = existingCards.get(id);

    if (!card) {
      card = document.createElement("a");
      card.className = `phase-card phase-${colors[index % colors.length]}`;
      card.href = "#aulas";
      card.dataset.phaseId = id;

      const number = document.createElement("span");
      number.className = "phase-number";
      const icon = document.createElement("span");
      icon.className = "phase-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = icons[index % icons.length];
      const title = document.createElement("h3");
      const description = document.createElement("p");
      const meta = document.createElement("span");
      meta.className = "phase-meta";
      meta.textContent = `Etapa ${id.padStart(2, "0")}`;
      card.append(number, icon, title, description, meta);
    }

    card.querySelector(".phase-number").textContent = id.padStart(2, "0");
    card.querySelector("h3").textContent = phase.titulo;
    card.querySelector("p").textContent = phase.descricao;
    return card;
  });

  grid.replaceChildren(...cards);
}

let sharedSupabaseClient;

function getSupabaseClient() {
  if (sharedSupabaseClient) return sharedSupabaseClient;
  const config = window.VIBE_SUPABASE_CONFIG;
  if (!config?.url || !config?.publishableKey || !window.supabase?.createClient) return null;
  try {
    sharedSupabaseClient = window.supabase.createClient(config.url, config.publishableKey);
    return sharedSupabaseClient;
  } catch (error) {
    console.error("[Vibe em Etapas] Configuração do Supabase inválida:", error);
    return null;
  }
}

function integrationErrorMessage(error) {
  const message = error?.message || "";
  if (/invalid api key/i.test(message)) {
    return "O Supabase recusou a chave pública. Confira a chave Publishable e o URL do mesmo projeto.";
  }
  if (error?.status === 401 || error?.status === 403) {
    return "O Supabase bloqueou o acesso. Confira as permissões e regras RLS.";
  }
  return "Não consegui carregar os dados do Supabase. Confira o Console (F12).";
}

async function loadPhases() {
  const config = window.VIBE_SUPABASE_CONFIG;
  if (!config?.url || !config?.publishableKey || !window.supabase?.createClient) {
    setConnectionStatus("Confira o URL, a chave pública e a biblioteca do Supabase.", "error");
    return;
  }

  setConnectionStatus("Carregando as fases do Supabase…", "loading");
  const client = getSupabaseClient();
  if (!client) {
    setConnectionStatus("Não consegui iniciar a conexão com o Supabase.", "error");
    return;
  }

  try {
    const { data: rows, error } = await client
      .from("fases")
      .select("id,titulo,descricao")
      .order("id", { ascending: true });

    if (error) {
      console.error("[Vibe em Etapas] Falha ao carregar fases:", error);
      setConnectionStatus(integrationErrorMessage(error), "error");
      return;
    }
    if (!Array.isArray(rows)) {
      setConnectionStatus("A resposta do Supabase veio em um formato inesperado.", "error");
      return;
    }
    if (rows.length === 0) {
      setConnectionStatus("A conexão funcionou, mas não há fases cadastradas.", "empty");
      return;
    }

    renderPhases(rows);
    setConnectionStatus(`${rows.length} ${rows.length === 1 ? "etapa carregada" : "etapas carregadas"} do Supabase.`, "success");
  } catch (error) {
    console.error("[Vibe em Etapas] Erro ao carregar fases:", error);
    setConnectionStatus(integrationErrorMessage(error), "error");
  }
}

function createCourseLesson(lesson, index) {
  const article = document.createElement("article");
  article.className = `lesson lesson-${lesson.cor || ["peach", "blue", "lilac", "green"][index % 4]}`;
  article.id = lesson.slug || `aula-extra-${lesson.id}`;

  const details = document.createElement("details");
  details.open = false;
  const summary = document.createElement("summary");
  const tag = document.createElement("span");
  tag.className = "lesson-tag";
  tag.textContent = `PASSO ${String(lesson.ordem).padStart(2, "0")}`;
  const title = document.createElement("span");
  title.className = "summary-title";
  title.textContent = lesson.titulo;
  const hint = document.createElement("span");
  hint.className = "summary-hint";
  hint.textContent = "Abrir passo";
  summary.append(tag, title, hint);

  const body = document.createElement("div");
  body.className = "lesson-body";
  if (lesson.resumo) {
    const intro = document.createElement("p");
    intro.className = "plain-intro";
    intro.textContent = lesson.resumo;
    body.append(intro);
  }

  const steps = [...(lesson.aula_passos || [])].sort((a, b) => a.ordem - b.ordem);
  steps.forEach((step) => {
    const card = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = step.titulo;

    if (step.tipo === "prompt") {
      card.className = "prompt-card";
      const header = document.createElement("div");
      header.className = "prompt-heading";
      const spark = document.createElement("span");
      spark.setAttribute("aria-hidden", "true");
      spark.textContent = "✦";
      const promptTitle = document.createElement("h3");
      promptTitle.textContent = step.titulo;
      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "copy-button";
      copyButton.textContent = "Copiar prompt";
      copyButton.setAttribute("aria-label", `Copiar prompt: ${step.titulo}`);
      copyButton.addEventListener("click", async () => {
        try {
          await copyText(step.conteudo);
          showMessage("Prompt copiado. Agora é só colar na sua IA.");
        } catch {
          showMessage("Selecione o texto e copie.");
        }
      });
      header.append(spark, promptTitle, copyButton);
      const content = document.createElement("pre");
      content.className = "lesson-prompt";
      content.textContent = step.conteudo;
      card.append(header, content);
    } else {
      const content = document.createElement("div");
      content.className = "lesson-step-content";
      content.textContent = step.conteudo;
      if (step.tipo === "atividade") {
        card.className = "exercise-box";
        const label = document.createElement("span");
        label.className = "exercise-label";
        label.textContent = "ATIVIDADE";
        card.append(label, heading, content);
      } else if (step.tipo === "dica") {
        card.className = "callout";
        heading.className = "subheading";
        card.append(heading, content);
      } else {
        card.className = "info-card";
        card.append(heading, content);
      }
    }
    body.append(card);
  });

  details.append(summary, body);
  article.append(details);
  return article;
}
async function loadCourseLessons() {
  const client = getSupabaseClient();
  if (!client) {
    showMessage("Confira a configuração e a biblioteca do Supabase.", "error");
    return;
  }

  try {
    const { data: rows, error } = await client
      .from("aulas")
      .select("id,slug,titulo,resumo,ordem,cor,aula_passos(id,tipo,titulo,conteudo,ordem)")
      .eq("publicada", true)
      .order("ordem", { ascending: true });

    if (error) {
      console.error("[Vibe em Etapas] Falha ao carregar passos:", error);
      showMessage(integrationErrorMessage(error), "error");
      return;
    }
    if (!Array.isArray(rows)) {
      showMessage("A lista de passos veio em um formato inesperado.", "error");
      return;
    }

    const container = document.querySelector("#extra-lessons");
    const cards = rows.map(createCourseLesson);
    document.querySelectorAll(".learning > article.lesson").forEach((lesson) => lesson.remove());

    if (cards.length) {
      container.replaceChildren(...cards);
    } else {
      const empty = document.createElement("p");
      empty.className = "public-empty-state";
      empty.textContent = "Ainda não há passos publicados. Volte em breve!";
      container.replaceChildren(empty);
      showMessage("Não há passos publicados no momento.", "info", 6000);
    }

    bindLessonDisclosures();
  } catch (error) {
    console.error("[Vibe em Etapas] Erro ao buscar passos:", error);
    showMessage(integrationErrorMessage(error), "error");
  }
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  document.body.append(helper);
  helper.select();
  const copied = document.execCommand("copy");
  helper.remove();
  if (!copied) throw new Error("Não foi possível copiar.");
}

// The guide only searches lesson content rendered on this page. Source text is
// displayed as text, never interpreted as instructions or executable markup.
const helpPanel = document.querySelector("#help-panel");
const helpLauncher = document.querySelector("#help-launcher");
const helpMessages = document.querySelector("#help-messages");
const helpForm = document.querySelector("#help-form");
const helpInput = document.querySelector("#help-input");
const helpStopWords = new Set("a ao aos as o os um uma umas uns de da das do dos e ou para por com sem em no nos na nas que qual quais como onde quando porque porquê é são foi ser ter tem isso esta esse essa este minha meu seu sua sobre me minha eu voce você está estou fica fazer faz devo posso gostaria quero explica explique entender saber ajuda dúvida duvida passo passos aula aulas site material materiais".split(" "));
const helpAliases = {
  prompt: ["pedido", "instrução", "instrucoes", "comando", "mensagem"],
  frontend: ["tela", "interface", "visual", "pagina", "página"],
  prototipo: ["primeira versao", "teste da ideia"],
  mvp: ["versao minima", "menor versao"],
  repositorio: ["github", "historico", "pasta do projeto"],
  backend: ["por tras", "cozinha", "servidor"],
  supabase: ["banco", "database", "dados"],
  tabela: ["coluna", "linha", "planilha"],
  localstorage: ["memoria do navegador", "navegador", "aparelho"],
  migration: ["migracao", "mudancas no banco"],
  mcp: ["conector", "conexao da ia"],
  autenticacao: ["login", "entrar", "conta"],
  permissao: ["autorizacao", "acesso", "rls", "seguranca"],
  sessao: ["logado", "lembra que entrou"],
  rota: ["endereco", "url", "pagina"],
  console: ["f12", "erro vermelho", "mensagem de erro"],
  network: ["rede", "pedido", "resposta", "status"],
  bug: ["erro", "quebrou", "parou de funcionar", "problema"]
};

const helpGeneralConcepts = [
  { terms: ["html"], answer: "HTML é a estrutura da página: organiza títulos, textos, botões e campos. Ao criar uma tela com IA, você pode descrever quais partes precisam aparecer e como a pessoa vai usá-las." },
  { terms: ["css"], answer: "CSS define a aparência da página, como cores, tamanhos, espaços e adaptação para celular. No seu projeto, descreva o visual que quer e peça mudanças em partes pequenas." },
  { terms: ["javascript", "js"], answer: "JavaScript dá comportamento à página: por exemplo, o que acontece quando alguém clica, envia um formulário ou salva algo. No vibe coding, você pode explicar o resultado esperado sem precisar escrever o código." },
  { terms: ["variavel", "variáveis"], answer: "Uma variável é um nome que o programa usa para guardar um valor enquanto trabalha, como o título de uma tarefa. No projeto, pense nela como uma etiqueta para uma informação." },
  { terms: ["funcao", "funcoes"], answer: "Uma função é um conjunto de instruções que o projeto pode executar quando necessário, como validar um formulário ao clicar em Enviar. Você pode explicar à IA o que deve acontecer e em que momento." },
  { terms: ["api"], answer: "Uma API é uma forma combinada de um sistema pedir ou oferecer informações a outro. No projeto, pense nela como um balcão de atendimento entre a página e um serviço, como um banco de dados." },
  { terms: ["frontend"], answer: "Frontend é a parte do projeto que a pessoa vê e usa: telas, textos, botões e formulários. No site, isso corresponde à interface." },
  { terms: ["backend"], answer: "Backend é a parte que trabalha nos bastidores, cuidando de dados e regras que não ficam visíveis na tela. No material, ele aparece como a cozinha que organiza os pedidos." },
  { terms: ["banco de dados", "database"], answer: "Um banco de dados guarda informações de forma organizada para o projeto encontrá-las depois. No Passo 2, o material compara tabelas a planilhas e explica como os dados chegam ao Supabase." },
  { terms: ["github", "repositorio", "repositório"], answer: "GitHub é um serviço para guardar o projeto e acompanhar suas mudanças. O repositório é como a pasta do projeto na nuvem, com o histórico das versões." },
  { terms: ["branch", "ramificacao", "ramificação"], answer: "Uma branch é uma linha de trabalho separada dentro do repositório. Ela permite preparar uma mudança sem misturá-la imediatamente à versão principal." },
  { terms: ["deploy", "publicar site", "colocar no ar"], answer: "Deploy é publicar uma versão do projeto para que outras pessoas possam acessá-la. Antes, confira a mudança no próprio projeto e siga o fluxo de publicação que você já usa." }
];

function findGeneralConcept(question) {
  const normalized = normalizeHelpText(question);
  return helpGeneralConcepts
    .flatMap((concept) => concept.terms.map((term) => ({ ...concept, term })))
    .filter(({ term }) => normalized.includes(normalizeHelpText(term)))
    .sort((a, b) => b.term.length - a.term.length)[0] || null;
}

const HELP_NOT_FOUND = "Não encontrei essa informação nos materiais do Vibe em Etapas.";
const HELP_OUT_OF_SCOPE = "Posso ajudar com o site, as aulas e dúvidas de programação ligadas ao vibe coding. Para outros assuntos, não consigo ajudar por aqui.";


function normalizeHelpText(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function tokenizeHelpQuestion(value) {
  return [...new Set(normalizeHelpText(value).match(/[a-z0-9]+/g) || [])]
    .filter((token) => token.length > 2 && !helpStopWords.has(token));
}

function getHelpLessons() {
  return [...document.querySelectorAll(".learning article.lesson")].map((article, index) => {
    const summary = article.querySelector("summary");
    const step = Number(summary?.querySelector(".lesson-tag")?.textContent.match(/\d+/)?.[0]) || index + 1;
    const title = summary?.querySelector(".summary-title")?.textContent.trim() || `Passo ${step}`;
    const sections = [...article.querySelectorAll(".lesson-body p, .lesson-body li, .lesson-body .lesson-step-content, .lesson-body pre")]
      .map((element) => ({
        title: element.closest(".info-card, .exercise-box, .callout, .track-card")?.querySelector("h3, strong")?.textContent.trim() || "",
        text: element.innerText.trim()
      }))
      .filter((section) => section.text.length > 20);
    return { article, step, title, summary: article.querySelector(".plain-intro")?.textContent.trim() || "", sections };
  });
}

function scoreHelpText(tokens, value) {
  const normalized = normalizeHelpText(value);
  let score = 0;
  tokens.forEach((token) => {
    if (normalized.includes(token)) score += token.length > 6 ? 3 : 2;
    if ((helpAliases[token] || []).some((alias) => normalized.includes(normalizeHelpText(alias)))) score += 2;
  });
  return score;
}

function appendHelpMessage(text, type = "assistant-message", lesson = null) {
  const message = document.createElement("div");
  message.className = `help-message ${type}`;
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  message.append(paragraph);

  if (lesson?.article?.id) {
    const link = document.createElement("a");
    link.className = "help-step-link";
    link.href = `#${lesson.article.id}`;
    link.textContent = `Ver o Passo ${lesson.step}: ${lesson.title} →`;
    link.addEventListener("click", () => {
      const details = lesson.article.querySelector("details");
      if (details) details.open = true;
    });
    message.append(link);
  }

  helpMessages.append(message);
  helpMessages.scrollTop = helpMessages.scrollHeight;
}

function askWhichStep(lessons) {
  if (!lessons.length) return;
  const choices = document.createElement("div");
  choices.className = "help-choice-list";
  lessons.forEach((lesson) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `Passo ${lesson.step}: ${lesson.title}`;
    button.addEventListener("click", () => {
      appendHelpMessage(button.textContent, "user-message");
      const source = lesson.bestSection?.text || lesson.summary;
      const excerpt = source.length > 580 ? `${source.slice(0, 577).trimEnd()}…` : source;
      appendHelpMessage(excerpt ? `Neste passo, o material explica: ${excerpt}` : "Não encontrei essa informação nos materiais do Vibe em Etapas.", "assistant-message", lesson);
      choices.remove();
    });
    choices.append(button);
  });
  helpMessages.append(choices);
  helpMessages.scrollTop = helpMessages.scrollHeight;
}

function answerHelpQuestion(question) {
  const tokens = tokenizeHelpQuestion(question);
  const lessons = getHelpLessons();
  const requestedStep = Number(normalizeHelpText(question).match(/\b(?:passo|aula|fase)\s*(\d+)\b/)?.[1]);
  const explicitLesson = requestedStep ? lessons.find((lesson) => lesson.step === requestedStep) : null;
  if (explicitLesson) {
    const lesson = { ...explicitLesson, bestSection: null };
    const bestSection = lesson.sections
      .map((section) => ({ ...section, score: scoreHelpText(tokens, `${section.title} ${section.text}`) }))
      .sort((a, b) => b.score - a.score)[0];
    if (tokens.length && (!bestSection || bestSection.score < 2)) {
      appendHelpMessage(HELP_NOT_FOUND, "assistant-message", lesson);
      return;
    }
    lesson.bestSection = bestSection || null;
    const source = bestSection?.text || lesson.summary;
    const excerpt = source.length > 620 ? `${source.slice(0, 617).trimEnd()}…` : source;
    appendHelpMessage(excerpt ? `No Passo ${lesson.step}, “${lesson.title}”, o material explica: ${excerpt}` : HELP_NOT_FOUND, "assistant-message", lesson);
    return;
  }
  if (!tokens.length) {
    appendHelpMessage("Qual assunto você quer entender? Você pode perguntar sobre uma aula, um passo ou uma dúvida de programação ligada ao seu projeto.");
    return;
  }

  const ranked = lessons.map((lesson) => {
    const bestSection = lesson.sections
      .map((section) => ({ ...section, score: scoreHelpText(tokens, `${section.title} ${section.text}`) }))
      .sort((a, b) => b.score - a.score)[0];
    const titleScore = scoreHelpText(tokens, `${lesson.title} ${lesson.summary}`) * 2;
    return { ...lesson, bestSection, score: Math.max(titleScore, bestSection?.score || 0) };
  }).sort((a, b) => b.score - a.score);

  if (!ranked.length || ranked[0].score < 2) {
    const concept = findGeneralConcept(question);
    if (concept) {
      appendHelpMessage(concept.answer);
      return;
    }
    const normalizedQuestion = normalizeHelpText(question);
    const related = /\b(vibe|aula|passo|site|projeto|prompt|supabase|github|banco|codigo|programacao|programar|html|css|javascript|frontend|backend)\b/.test(normalizedQuestion);
    appendHelpMessage(related ? HELP_NOT_FOUND : HELP_OUT_OF_SCOPE);
    return;
  }
  if (ranked[1] && ranked[0].score - ranked[1].score < 2 && ranked[1].score > 0) {
    appendHelpMessage("Encontrei mais de um passo que pode ajudar. Qual deles se aproxima da sua dúvida?");
    askWhichStep(ranked.slice(0, 3));
    return;
  }

  const lesson = ranked[0];
  const source = lesson.bestSection?.text || lesson.summary;
  const excerpt = source.length > 620 ? `${source.slice(0, 617).trimEnd()}…` : source;
  appendHelpMessage(excerpt ? `No material, ${lesson.bestSection?.title ? `“${lesson.bestSection.title}” explica que ` : ""}${excerpt}` : "Não encontrei essa informação nos materiais do Vibe em Etapas.", "assistant-message", lesson);
}

helpForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = helpInput.value.trim();
  if (!question) return;
  appendHelpMessage(question, "user-message");
  helpInput.value = "";
  answerHelpQuestion(question);
  helpInput.focus();
});

document.querySelectorAll("#help-suggestions button").forEach((button) => {
  button.addEventListener("click", () => {
    helpInput.value = button.textContent;
    helpForm.requestSubmit();
  });
});

function setHelpPanelOpen(open) {
  helpPanel.hidden = !open;
  helpLauncher.setAttribute("aria-expanded", String(open));
  if (open) helpInput.focus();
  else helpLauncher.focus();
}

helpLauncher.addEventListener("click", () => setHelpPanelOpen(helpPanel.hidden));
document.querySelector("#help-close").addEventListener("click", () => setHelpPanelOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !helpPanel.hidden) setHelpPanelOpen(false);
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const prompt = document.getElementById(button.dataset.copy);
    if (!prompt) return;
    try {
      await copyText(prompt.textContent.trim());
      showMessage("Prompt copiado. Agora é só colar na sua IA.");
    } catch {
      showMessage("Selecione o texto do prompt e copie.");
    }
  });
});

loadPhases();
loadCourseLessons();
