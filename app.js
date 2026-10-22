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
  rows.forEach((phase) => {
    const card = document.querySelector(`[data-phase-id="${Number(phase.id)}"]`);
    if (!card) return;
    const title = card.querySelector("h3");
    const description = card.querySelector("p");
    if (title) title.textContent = phase.titulo;
    if (description) description.textContent = phase.descricao;
  });
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
