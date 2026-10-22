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
const connectionForm = document.querySelector("#supabase-config-form");
const clearConfigButton = document.querySelector("#clear-supabase-config");
const storageKey = "vibe-coding-supabase-public-config";
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

function confirmPublicKey(publicKey) {
  if (/^(sb_secret_|service_role)/i.test(publicKey)) {
    throw new Error("Essa parece ser uma chave secreta. Use apenas a chave pública.");
  }

  const jwtPayload = publicKey.split(".")[1];
  if (jwtPayload) {
    try {
      const base64 = jwtPayload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
      if (JSON.parse(atob(padded)).role === "service_role") {
        throw new Error("Essa é uma chave de serviço. Use apenas a chave pública.");
      }
    } catch (error) {
      if (error.message.includes("chave de serviço")) throw error;
    }
  }
}

async function loadPhases(urlValue, publicKey) {
  const url = new URL(urlValue);
  if (url.protocol !== "https:") {
    throw new Error("A URL do Supabase precisa começar com https://.");
  }
  confirmPublicKey(publicKey);

  setConnectionStatus("Carregando as etapas do Supabase…", "loading");
  const endpoint = new URL("/rest/v1/fases", url.origin);
  endpoint.search = new URLSearchParams({
    select: "id,titulo,descricao",
    order: "id.asc"
  });

  const headers = { apikey: publicKey };
  // New publishable keys are not JWTs; legacy anon keys are JWTs.
  if (!publicKey.startsWith("sb_publishable_")) {
    headers.Authorization = `Bearer ${publicKey}`;
  }

  const response = await fetch(endpoint, { headers });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`O Supabase respondeu ${response.status}. ${details.slice(0, 180)}`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error("A resposta do Supabase veio em um formato inesperado.");
  if (rows.length === 0) {
    setConnectionStatus("Conexão feita, mas a tabela fases está vazia. Aplique a migration do projeto e tente de novo.", "empty");
    return;
  }

  renderPhases(rows);
  setConnectionStatus(`Pronto! ${rows.length} etapa(s) carregada(s) do Supabase.`, "success");
}

function saveConfig(url, key) {
  localStorage.setItem(storageKey, JSON.stringify({ url, key }));
}

connectionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = document.querySelector("#supabase-url").value.trim();
  const key = document.querySelector("#supabase-key").value.trim();

  try {
    await loadPhases(url, key);
    saveConfig(url, key);
  } catch (error) {
    setConnectionStatus(`Não consegui conectar. ${error.message} As etapas do plano continuam visíveis.`, "error");
  }
});

clearConfigButton.addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  window.location.reload();
});

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
  if (saved?.url && saved?.key) {
    document.querySelector("#supabase-url").value = saved.url;
    document.querySelector("#supabase-key").value = saved.key;
    loadPhases(saved.url, saved.key).catch((error) => {
      setConnectionStatus(`Não consegui conectar. ${error.message} As etapas do plano continuam visíveis.`, "error");
    });
  }
} catch {
  localStorage.removeItem(storageKey);
}