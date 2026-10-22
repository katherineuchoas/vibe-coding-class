const config = window.VIBE_SUPABASE_CONFIG;
const supabaseLibrary = window.supabase;
const message = document.querySelector("#admin-message");
const loginPanel = document.querySelector("#login-panel");
const passwordPanel = document.querySelector("#password-panel");
const deniedPanel = document.querySelector("#denied-panel");
const editorPanel = document.querySelector("#editor-panel");
const loginForm = document.querySelector("#login-form");
const passwordForm = document.querySelector("#password-form");
const phaseForm = document.querySelector("#phase-form");
const phaseList = document.querySelector("#phase-list");
const phaseId = document.querySelector("#phase-id");
const phaseTitle = document.querySelector("#phase-title");
const phaseDescription = document.querySelector("#phase-description");
const cancelEdit = document.querySelector("#cancel-edit");
const currentUser = document.querySelector("#current-user");
let client;
let phases = [];
let passwordRecoveryActive = window.location.hash.includes("type=recovery");

function showMessage(text, state = "") {
  message.textContent = text;
  message.dataset.state = state;
}

function showPanel(panel) {
  [loginPanel, passwordPanel, deniedPanel, editorPanel].forEach((item) => {
    item.hidden = item !== panel;
  });
}

function startNewPhase() {
  phaseForm.reset();
  phaseId.value = "";
  cancelEdit.hidden = true;
  document.querySelector("#phase-form-title").textContent = "Adicionar etapa";
  phaseTitle.focus();
}

function editPhase(phase) {
  phaseId.value = String(phase.id);
  phaseTitle.value = phase.titulo;
  phaseDescription.value = phase.descricao;
  cancelEdit.hidden = false;
  document.querySelector("#phase-form-title").textContent = "Editar etapa";
  phaseTitle.focus();
}

function renderPhaseList() {
  phaseList.replaceChildren();
  if (phases.length === 0) {
    const empty = document.createElement("p");
    empty.className = "small-note";
    empty.textContent = "Ainda não há etapas cadastradas.";
    phaseList.append(empty);
    return;
  }

  phases.forEach((phase) => {
    const item = document.createElement("article");
    item.className = "admin-phase-item";
    const text = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = phase.titulo;
    const description = document.createElement("p");
    description.textContent = phase.descricao;
    const button = document.createElement("button");
    button.className = "admin-text-button";
    button.type = "button";
    button.textContent = "Editar";
    button.addEventListener("click", () => editPhase(phase));
    text.append(title, description);
    item.append(text, button);
    phaseList.append(item);
  });
}

async function loadPhases() {
  showMessage("Carregando as etapas…");
  const { data, error } = await client
    .from("fases")
    .select("id,titulo,descricao")
    .order("id", { ascending: true });

  if (error) {
    showMessage("Não consegui carregar as etapas. Confira se a migration da Fase 4 foi aplicada.", "error");
    return;
  }

  phases = data || [];
  renderPhaseList();
  showMessage("Etapas carregadas.", "success");
}

async function openWorkspace(session) {
  if (passwordRecoveryActive) {
    showPanel(passwordPanel);
    return;
  }
  if (!session?.user) {
    showPanel(loginPanel);
    return;
  }

  currentUser.textContent = session.user.email || "conta conectada";
  showMessage("Conferindo se esta conta pode editar…");
  const { data, error } = await client
    .from("admin_users")
    .select("user_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) {
    showPanel(deniedPanel);
    showMessage("Não consegui conferir a autorização. Confira a migration da Fase 4.", "error");
    return;
  }
  if (!data) {
    showPanel(deniedPanel);
    showMessage("Esta conta entrou, mas não está autorizada a editar.", "error");
    return;
  }

  showPanel(editorPanel);
  await loadPhases();
}

async function signOut() {
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) {
    showMessage("Não consegui sair agora. Tente de novo.", "error");
    return;
  }
  loginForm.reset();
  showPanel(loginPanel);
  showMessage("Você saiu da área de edição.");
}

if (!config?.url || !config?.publishableKey || !supabaseLibrary?.createClient) {
  showPanel(loginPanel);
  showMessage("A configuração do Supabase não está pronta nesta página.", "error");
} else {
  client = supabaseLibrary.createClient(config.url, config.publishableKey);

  // Keep this callback synchronous; other Supabase requests run outside it.
  client.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      passwordRecoveryActive = true;
      showPanel(passwordPanel);
      showMessage("Crie uma nova senha para sua conta.");
    }
    if (event === "SIGNED_OUT") {
      showPanel(loginPanel);
      showMessage("Você saiu da área de edição.");
    }
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    showMessage("Conferindo seu acesso…");

    const { data, error } = await client.auth.signInWithPassword({
      email: document.querySelector("#login-email").value.trim(),
      password: document.querySelector("#login-password").value
    });

    submitButton.disabled = false;
    if (error) {
      showMessage("E-mail ou senha não conferem. Confira os dados e tente de novo.", "error");
      return;
    }
    await openWorkspace(data.session);
  });

  document.querySelector("#request-reset").addEventListener("click", async () => {
    const email = document.querySelector("#login-email");
    if (!email.reportValidity()) return;
    showMessage("Enviando o pedido de recuperação…");
    const { error } = await client.auth.resetPasswordForEmail(email.value.trim(), {
      redirectTo: window.location.href
    });
    if (error) {
      showMessage("Não consegui enviar o pedido. Confira o e-mail e as URLs permitidas no Supabase.", "error");
      return;
    }
    showMessage("Se este e-mail tiver uma conta, chegará uma mensagem para criar outra senha.", "success");
  });

  passwordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = document.querySelector("#new-password").value;
    showMessage("Salvando sua nova senha…");
    const { error } = await client.auth.updateUser({ password });
    if (error) {
      showMessage("Não consegui atualizar a senha. Confira se o link ainda está válido.", "error");
      return;
    }
    passwordForm.reset();
    passwordRecoveryActive = false;
    window.history.replaceState({}, document.title, window.location.pathname);
    const { data } = await client.auth.getSession();
    showMessage("Senha atualizada.", "success");
    await openWorkspace(data.session);
  });

  document.querySelector("#new-phase").addEventListener("click", startNewPhase);
  document.querySelector("#cancel-edit").addEventListener("click", startNewPhase);
  document.querySelector("#sign-out").addEventListener("click", signOut);
  document.querySelector("#denied-sign-out").addEventListener("click", signOut);

  phaseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = phaseTitle.value.trim();
    const description = phaseDescription.value.trim();
    if (!title || !description) return;

    const saveButton = phaseForm.querySelector('button[type="submit"]');
    saveButton.disabled = true;
    showMessage("Salvando a etapa…");

    let result;
    if (phaseId.value) {
      result = await client
        .from("fases")
        .update({ titulo: title, descricao: description })
        .eq("id", Number(phaseId.value));
    } else {
      const lastId = phases.reduce((highest, phase) => Math.max(highest, Number(phase.id)), 0);
      result = await client
        .from("fases")
        .insert({ id: lastId + 1, titulo: title, descricao: description });
    }

    saveButton.disabled = false;
    if (result.error) {
      showMessage("Não consegui salvar. Confira a conexão e as regras de acesso no Supabase.", "error");
      return;
    }

    phaseForm.reset();
    phaseId.value = "";
    cancelEdit.hidden = true;
    document.querySelector("#phase-form-title").textContent = "Adicionar etapa";
    await loadPhases();
    showMessage("Etapa salva. A página pública mostrará a mudança ao atualizar.", "success");
  });

  client.auth.getSession().then(({ data, error }) => {
    if (error) {
      showPanel(loginPanel);
      showMessage("Não consegui conferir a sessão. Entre novamente.", "error");
      return;
    }
    openWorkspace(data.session);
  });
}
