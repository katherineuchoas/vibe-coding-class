const config = window.VIBE_SUPABASE_CONFIG;
const supabaseLibrary = window.supabase;
const loginPanel = document.querySelector("#login-panel");
const passwordPanel = document.querySelector("#password-panel");
const deniedPanel = document.querySelector("#denied-panel");
const editorPanel = document.querySelector("#editor-panel");
const loginForm = document.querySelector("#login-form");
const passwordForm = document.querySelector("#password-form");
const phaseForm = document.querySelector("#phase-form");
const phaseFormPanel = document.querySelector("#phase-form-panel");
const phaseList = document.querySelector("#phase-list");
const phaseId = document.querySelector("#phase-id");
const phaseTitle = document.querySelector("#phase-title");
const phaseDescription = document.querySelector("#phase-description");
const cancelEdit = document.querySelector("#cancel-edit");
const headerEmail = document.querySelector("#admin-header-email");
const returnLink = document.querySelector("#admin-return-link");
const adminSession = document.querySelector("#admin-session");
const courseManagement = document.querySelector("#course-management");
const phaseWorkspace = document.querySelector("#phase-workspace");
const modeLessons = document.querySelector("#mode-lessons");
const modePhases = document.querySelector("#mode-phases");
let client;
let phases = [];
const courseLessonList = document.querySelector("#course-lesson-list");
const courseBrowser = document.querySelector("#course-browser");
const courseDetailView = document.querySelector("#course-detail-view");
const courseDetailTitle = document.querySelector("#course-detail-title");
const courseDetailSummary = document.querySelector("#course-detail-summary");
const courseLessonForm = document.querySelector("#course-lesson-form");
const courseLessonId = document.querySelector("#course-lesson-id");
const courseLessonTitle = document.querySelector("#course-lesson-title");
const courseLessonSummary = document.querySelector("#course-lesson-summary");
const courseStepEditor = document.querySelector("#lesson-step-editor");
const courseStepList = document.querySelector("#lesson-step-list");
const courseStepForm = document.querySelector("#lesson-step-form");
const courseStepId = document.querySelector("#lesson-step-id");
const courseLessonOrder = document.querySelector("#course-lesson-order");
const courseLessonPublished = document.querySelector("#course-lesson-published");
const courseStepType = document.querySelector("#lesson-step-type");
const courseStepTitle = document.querySelector("#lesson-step-title");
const courseStepContent = document.querySelector("#lesson-step-content");
const courseStepContentLabel = document.querySelector("#lesson-step-content-label");
const courseStepOrder = document.querySelector("#lesson-step-order");
const courseStepFormTitle = document.querySelector("#lesson-step-form-title");
let courseLessonDirty = false;
let courseStepDirty = false;
let courseLessons = [];
let selectedCourseLessonId = null;
let courseSteps = [];

let passwordRecoveryActive = window.location.hash.includes("type=recovery");

const toast = document.querySelector("#toast");
const toastText = toast.querySelector(".toast-text");
const toastIcon = toast.querySelector(".toast-icon");
let toastTimer;

function hideToast() {
  window.clearTimeout(toastTimer);
  toast.classList.remove("show");
  toast.hidden = true;
}

function showMessage(text, state = "info", duration) {
  if (!text) {
    hideToast();
    return;
  }

  const kind = state || "info";
  toastText.textContent = text;
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

function showPanel(panel) {
  [loginPanel, passwordPanel, deniedPanel, editorPanel].forEach((item) => {
    item.hidden = item !== panel;
  });
  const isEditor = panel === editorPanel;
  adminSession.hidden = !isEditor;
  returnLink.hidden = isEditor;
  if (isEditor) setAdminMode("lessons");
}

function setAdminMode(mode) {
  const editingLessons = mode === "lessons";
  courseManagement.hidden = !editingLessons;
  phaseWorkspace.hidden = editingLessons;
  modeLessons.setAttribute("aria-pressed", String(editingLessons));
  modePhases.setAttribute("aria-pressed", String(!editingLessons));
}

function startNewPhase() {
  phaseForm.reset();
  phaseId.value = "";
  phaseFormPanel.hidden = false;
  cancelEdit.hidden = false;
  cancelEdit.textContent = "Cancelar";
  document.querySelector("#phase-form-title").textContent = "Adicionar etapa";
  phaseTitle.focus();
}

function editPhase(phase) {
  phaseId.value = String(phase.id);
  phaseTitle.value = phase.titulo;
  phaseDescription.value = phase.descricao;
  phaseFormPanel.hidden = false;
  cancelEdit.hidden = false;
  cancelEdit.textContent = "Cancelar edição";
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
    button.className = "admin-course-edit";
    button.type = "button";
    button.setAttribute("aria-label", `Editar a etapa: ${phase.titulo}`);
    button.append(document.createTextNode("Editar etapa"));
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    button.append(arrow);
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
  showMessage("");
}

function renderCourseLessons() {
  courseLessonList.replaceChildren();
  if (!courseLessons.length) {
    const empty = document.createElement("p");
    empty.className = "small-note";
    empty.textContent = "Ainda não há passos novos.";
    courseLessonList.append(empty);
    return;
  }

  courseLessons.forEach((lesson) => {
    const row = document.createElement("article");
    row.className = "admin-phase-item admin-course-item";

    const details = document.createElement("div");
    details.className = "admin-course-copy";
    const title = document.createElement("strong");
    title.textContent = lesson.titulo;
    const summary = document.createElement("p");
    summary.textContent = lesson.resumo || "Sem resumo por enquanto.";
    details.append(title, summary);

    const actions = document.createElement("div");
    actions.className = "admin-course-actions";

    const edit = document.createElement("button");
    edit.className = "admin-course-edit";
    edit.type = "button";
    edit.setAttribute("aria-label", `Editar o passo: ${lesson.titulo}`);
    edit.append(document.createTextNode("Editar conteúdo"));
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    edit.append(arrow);
    edit.addEventListener("click", () => selectCourseLesson(lesson));

    const visibility = document.createElement("label");
    visibility.className = "admin-visibility-toggle";
    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = Boolean(lesson.publicada);
    toggle.setAttribute("aria-label", `Mostrar “${lesson.titulo}” na página pública`);
    const track = document.createElement("span");
    track.className = "admin-toggle-track";
    track.setAttribute("aria-hidden", "true");
    const state = document.createElement("span");
    state.className = "admin-visibility-state";
    state.textContent = lesson.publicada ? "Visível" : "Oculto";

    toggle.addEventListener("change", async () => {
      const previous = !toggle.checked;
      toggle.disabled = true;
      try {
        const { error } = await client.from("aulas")
          .update({ publicada: toggle.checked })
          .eq("id", lesson.id);
        if (error) throw error;
        lesson.publicada = toggle.checked;
        state.textContent = lesson.publicada ? "Visível" : "Oculto";
        showMessage(
          lesson.publicada ? "Passo publicado na página pública." : "Passo ocultado da página pública.",
          "success"
        );
      } catch {
        toggle.checked = previous;
        state.textContent = previous ? "Visível" : "Oculto";
        showMessage("Não consegui mudar a visibilidade. Confira a conexão e as regras de acesso.", "error");
      } finally {
        toggle.disabled = false;
      }
    });

    visibility.append(toggle, track, state);
    actions.append(edit, visibility);
    row.append(details, actions);
    courseLessonList.append(row);
  });
}

async function loadCourseLessons() {
  const { data, error } = await client.from("aulas")
    .select("id,titulo,resumo,ordem,publicada")
    .order("ordem", { ascending: true });
  if (error) {
    showMessage("Não consegui carregar os passos novos. Aplique a migration da Fase 5.", "error");
    return;
  }
  courseLessons = data || [];
  renderCourseLessons();
  if (selectedCourseLessonId) {
    const lesson = courseLessons.find((item) => item.id === selectedCourseLessonId);
    if (lesson) await selectCourseLesson(lesson);
  }
}

async function selectCourseLesson(lesson) {
  selectedCourseLessonId = lesson.id;
  courseBrowser.hidden = true;
  courseDetailView.hidden = false;
  courseDetailTitle.textContent = lesson.titulo;
  courseDetailSummary.textContent = lesson.resumo || "Este passo ainda não tem um resumo.";
  courseLessonId.value = lesson.id;
  courseLessonTitle.value = lesson.titulo;
  courseLessonSummary.value = lesson.resumo || "";
  courseLessonOrder.value = lesson.ordem;
  courseLessonPublished.checked = lesson.publicada;
  courseLessonDirty = false;
  courseStepEditor.hidden = false;
  resetCourseStepForm();
  await loadCourseSteps();
}

function startNewCourseLesson() {
  selectedCourseLessonId = null;
  courseBrowser.hidden = true;
  courseDetailView.hidden = false;
  courseDetailTitle.textContent = "Novo passo";
  courseDetailSummary.textContent = "Preencha os dados e salve para começar a adicionar os passos.";
  courseLessonForm.reset();
  courseLessonId.value = "";
  courseLessonOrder.value = String(courseLessons.length + 1);
  courseLessonPublished.checked = true;
  courseLessonDirty = false;
  courseStepEditor.hidden = true;
  courseLessonTitle.focus();
}

function resetCourseStepForm() {
  courseStepForm.reset();
  courseStepId.value = "";
  courseStepOrder.value = String(courseSteps.length + 1);
  courseStepFormTitle.textContent = "Novo passo";
  courseStepForm.querySelector('button[type="submit"]').textContent = "Salvar passo";
  updateStepContentLabel();
  courseStepDirty = false;
}

function updateStepContentLabel() {
  courseStepContentLabel.textContent = {
    explicacao: "Texto da explicação",
    atividade: "Instruções da atividade",
    prompt: "Texto do prompt",
    dica: "Texto da dica"
  }[courseStepType.value] || "Conteúdo do passo";
}

function returnToCourseList() {
  if ((courseLessonDirty || courseStepDirty) && !window.confirm("Há mudanças que ainda não foram salvas. Quer descartá-las e voltar à lista?")) return;
  courseLessonDirty = false;
  courseStepDirty = false;
  courseBrowser.hidden = false;
  courseDetailView.hidden = true;
  courseStepEditor.hidden = true;
  selectedCourseLessonId = null;
}

function renderCourseSteps() {
  courseStepList.replaceChildren();
  if (!courseSteps.length) {
    const empty = document.createElement("p");
    empty.className = "small-note";
    empty.textContent = "Este passo ainda não tem blocos de conteúdo. Crie o primeiro abaixo.";
    courseStepList.append(empty);
    return;
  }
  courseSteps.forEach((step) => {
    const row = document.createElement("article");
    row.className = "admin-phase-item";
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = step.titulo;
    const kind = document.createElement("span");
    kind.className = "step-type-badge";
    kind.textContent = ({
      explicacao: "Explicação",
      atividade: "Atividade",
      prompt: "Prompt",
      dica: "Dica"
    })[step.tipo] || "Conteúdo";
    const body = document.createElement("p");
    const excerpt = step.conteudo.trim();
    body.textContent = excerpt.length > 180 ? excerpt.slice(0, 177) + "…" : excerpt;
    const edit = document.createElement("button");
    edit.className = "admin-text-button";
    edit.type = "button";
    edit.textContent = "Editar este passo";
    edit.setAttribute("aria-label", "Editar o passo: " + step.titulo);
    edit.addEventListener("click", () => {
      courseStepId.value = step.id;
      courseStepType.value = step.tipo;
      courseStepTitle.value = step.titulo;
      courseStepContent.value = step.conteudo;
      courseStepOrder.value = step.ordem;
      courseStepFormTitle.textContent = "Editar passo";
      courseStepForm.querySelector('button[type="submit"]').textContent = "Salvar alterações";
      updateStepContentLabel();
      courseStepDirty = false;
      courseStepTitle.focus();
    });
    copy.append(kind, title, body, edit);
    row.append(copy);
    courseStepList.append(row);
  });
}

async function loadCourseSteps() {
  const { data, error } = await client.from("aula_passos")
    .select("id,aula_id,tipo,titulo,conteudo,ordem")
    .eq("aula_id", selectedCourseLessonId)
    .order("ordem", { ascending: true });
  if (error) {
    showMessage("Não consegui carregar os blocos deste passo.", "error");
    return;
  }
  courseSteps = data || [];
  if (!courseStepDirty) courseStepOrder.value = String(courseSteps.length + 1);
  renderCourseSteps();
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

  headerEmail.textContent = session.user.email || "Conta conectada";
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
  await loadCourseLessons();
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

  document.querySelector("#new-course-lesson").addEventListener("click", startNewCourseLesson);
  document.querySelector("#back-to-course-list").addEventListener("click", returnToCourseList);
  courseLessonForm.addEventListener("input", () => { courseLessonDirty = true; });
  courseLessonForm.addEventListener("change", () => { courseLessonDirty = true; });
  courseStepForm.addEventListener("input", () => { courseStepDirty = true; });
  courseStepForm.addEventListener("change", () => { courseStepDirty = true; });
  courseStepType.addEventListener("change", updateStepContentLabel);
  courseLessonForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = {
      titulo: courseLessonTitle.value.trim(),
      resumo: courseLessonSummary.value.trim(),
      ordem: Number(courseLessonOrder.value),
      publicada: courseLessonPublished.checked
    };
    const result = courseLessonId.value
      ? await client.from("aulas").update(values).eq("id", courseLessonId.value)
      : await client.from("aulas").insert(values).select("id").single();
    if (result.error) {
      showMessage("Não consegui salvar o passo. Confira a conexão e as regras de acesso.", "error");
      return;
    }
    if (!courseLessonId.value) selectedCourseLessonId = result.data.id;
    courseLessonDirty = false;
    showMessage("Passo salvo.", "success");
    await loadCourseLessons();
  });

  document.querySelector("#new-lesson-step").addEventListener("click", () => {
    resetCourseStepForm();
    courseStepTitle.focus();
  });

  courseStepForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!selectedCourseLessonId) return;
    const values = {
      aula_id: selectedCourseLessonId,
      tipo: courseStepType.value,
      titulo: courseStepTitle.value.trim(),
      conteudo: courseStepContent.value.trim(),
      ordem: Number(courseStepOrder.value)
    };
    const result = courseStepId.value
      ? await client.from("aula_passos").update(values).eq("id", courseStepId.value)
      : await client.from("aula_passos").insert(values);
    if (result.error) {
      showMessage("Não consegui salvar o passo. Confira a conexão e as regras de acesso.", "error");
      return;
    }
    resetCourseStepForm();
    showMessage("Passo salvo.", "success");
    await loadCourseSteps();
  });

  modeLessons.addEventListener("click", () => setAdminMode("lessons"));
  modePhases.addEventListener("click", () => setAdminMode("phases"));
  document.querySelector("#new-phase").addEventListener("click", startNewPhase);
  document.querySelector("#cancel-edit").addEventListener("click", () => {
    phaseForm.reset();
    phaseId.value = "";
    cancelEdit.hidden = true;
    cancelEdit.textContent = "Cancelar edição";
    phaseFormPanel.hidden = true;
  });
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
    phaseFormPanel.hidden = true;
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
