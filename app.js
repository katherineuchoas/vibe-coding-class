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
  hint.textContent = details.open ? "Fechar passo" : "Abrir passo";
  summary.append(tag, title, hint);

  const body = document.createElement("div");
  body.className = "lesson-body";
  if (lesson.resumo) {
    const intro = document.createElement("p");
    intro.className = "plain-intro";
    intro.textContent = lesson.resumo;
    body.append(intro);
  }
  const steps = (lesson.aula_passos || []).sort((a, b) => a.ordem - b.ordem);
  steps.forEach((step, stepIndex) => {
    const card = document.createElement("div");
    card.className = step.tipo === "prompt" ? "prompt-card" : "info-card";
    const heading = document.createElement(step.tipo === "prompt" ? "h3" : "h3");
    heading.textContent = `${stepIndex + 1}. ${step.titulo}`;
    const content = document.createElement(step.tipo === "prompt" ? "pre" : "p");
    content.className = step.tipo === "prompt" ? "lesson-prompt" : "lesson-step-content";
    content.textContent = step.conteudo;
    card.append(heading, content);
    if (step.tipo === "prompt") {
      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "admin-text-button";
      copyButton.textContent = "Copiar prompt";
      copyButton.addEventListener("click", async () => {
        try {
          await copyText(step.conteudo);
          showMessage("Prompt copiado. Agora é só colar na sua IA.");
        } catch {
          showMessage("Selecione o texto e copie.");
        }
      });
      card.append(copyButton);
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
