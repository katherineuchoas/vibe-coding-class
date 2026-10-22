const lessons = [...document.querySelectorAll(".lesson details")];

lessons.forEach((current) => {
  current.addEventListener("toggle", () => {
    if (!current.open) return;
    lessons.forEach((other) => {
      if (other !== current) other.open = false;
    });
  });
});

const toast = document.querySelector("#toast");
const statusMessage = document.querySelector("#connection-status");
let toastTimer;

function showMessage(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function setConnectionStatus(message, state = "") {
  statusMessage.textContent = message;
  statusMessage.dataset.state = state;
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

async function loadPhases() {
  const config = window.VIBE_SUPABASE_CONFIG;
  if (!config?.url || !config?.publishableKey) {
    setConnectionStatus("Configure o URL e a chave pública em supabase-config.js.", "empty");
    return;
  }

  let projectUrl;
  try {
    projectUrl = new URL(config.url);
  } catch {
    setConnectionStatus("O URL configurado para o Supabase não é válido.", "error");
    return;
  }
  if (projectUrl.protocol !== "https:" || !projectUrl.hostname.endsWith(".supabase.co")) {
    setConnectionStatus("Use o URL HTTPS do projeto Supabase configurado.", "error");
    return;
  }

  setConnectionStatus("Carregando as fases do Supabase…", "loading");
  const endpoint = new URL("/rest/v1/fases", projectUrl.origin);
  endpoint.search = new URLSearchParams({ select: "id,titulo,descricao", order: "id.asc" });

  try {
    const headers = { apikey: config.publishableKey };
    if (!config.publishableKey.startsWith("sb_publishable_")) {
      headers.Authorization = `Bearer ${config.publishableKey}`;
    }
    const response = await fetch(endpoint, { headers });
    if (!response.ok) {
      setConnectionStatus(
        response.status === 401 || response.status === 403
          ? "O Supabase recusou o acesso. Confira se o URL e a chave pública são do mesmo projeto."
          : `O Supabase respondeu ${response.status}. Confira a mensagem no Console (F12).`,
        "error"
      );
      return;
    }

    const rows = await response.json();
    if (!Array.isArray(rows)) {
      setConnectionStatus("A resposta do Supabase veio em um formato inesperado.", "error");
      return;
    }
    if (rows.length === 0) {
      setConnectionStatus("A consulta funcionou, mas não encontrou fases. Confira se a migration foi aplicada ao projeto configurado e se public.fases tem linhas.", "empty");
      return;
    }

    renderPhases(rows);
    setConnectionStatus(`${rows.length} fase(s) carregada(s) do Supabase.`, "success");
  } catch {
    setConnectionStatus("Não consegui conversar com o Supabase. Confira sua conexão e o URL do projeto.", "error");
  }
}

async function loadCourseLessons() {
  const config = window.VIBE_SUPABASE_CONFIG;
  if (!config?.url || !config?.publishableKey) return;
  const headers = { apikey: config.publishableKey };
  if (!config.publishableKey.startsWith("sb_publishable_")) {
    headers.Authorization = `Bearer ${config.publishableKey}`;
  }
  try {
    const lessonsUrl = new URL("/rest/v1/aulas", config.url);
    lessonsUrl.search = new URLSearchParams({
      select: "id,titulo,resumo,ordem,aula_passos(id,tipo,titulo,conteudo,ordem)",
      publicada: "eq.true",
      order: "ordem.asc"
    });
    const response = await fetch(lessonsUrl, { headers });
    if (!response.ok) return;
    const rows = await response.json();
    const container = document.querySelector("#extra-lessons");
    container.replaceChildren();
    rows.forEach((lesson, lessonIndex) => {
      const article = document.createElement("article");
      article.className = `lesson lesson-${["peach", "blue", "lilac", "green"][lessonIndex % 4]}`;
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      const tag = document.createElement("span");
      tag.className = "lesson-tag";
      tag.textContent = `AULA EXTRA · ${lesson.ordem}`;
      const title = document.createElement("span");
      title.className = "summary-title";
      title.textContent = lesson.titulo;
      const hint = document.createElement("span");
      hint.className = "summary-hint";
      hint.textContent = "Abrir ou fechar";
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
      steps.forEach((step, index) => {
        const card = document.createElement("div");
        card.className = "info-card";
        const heading = document.createElement("h3");
        heading.textContent = `${index + 1}. ${step.titulo}`;
        const content = document.createElement(step.tipo === "prompt" ? "pre" : "p");
        content.className = step.tipo === "prompt" ? "lesson-prompt" : "";
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
      container.append(article);
    });
    const dynamicLessons = [...container.querySelectorAll("details")];
    dynamicLessons.forEach((current) => {
      current.addEventListener("toggle", () => {
        if (!current.open) return;
        [...document.querySelectorAll(".lesson details")].forEach((other) => {
          if (other !== current) other.open = false;
        });
      });
    });
  } catch {
    // A página continua mostrando o conteúdo fixo se o Supabase estiver indisponível.
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
