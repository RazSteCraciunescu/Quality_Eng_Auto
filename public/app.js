const state = {
  status: "all",
  query: "",
  sort: "targetDate",
  direction: "asc",
  releases: []
};

const elements = {
  list: document.querySelector("#release-list"),
  count: document.querySelector("#release-count"),
  search: document.querySelector("#search-input"),
  sort: document.querySelector("#sort-select"),
  refresh: document.querySelector("#refresh-button"),
  integrations: document.querySelector("#integration-list"),
  dialog: document.querySelector("#release-dialog"),
  dialogTitle: document.querySelector("#dialog-title"),
  dialogContent: document.querySelector("#dialog-content"),
  notification: document.querySelector("#notification")
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  return value;
}

function showNotification(message) {
  elements.notification.textContent = message;
  elements.notification.classList.add("visible");
  window.setTimeout(() => elements.notification.classList.remove("visible"), 2200);
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || `Request failed with ${response.status}`);
  return body;
}

function releaseCard(release) {
  return `
    <article class="release-card" data-release-id="${escapeHtml(release.id)}">
      <div class="release-name">
        <h3>${escapeHtml(release.name)}</h3>
        <p>${escapeHtml(release.version)} · ${escapeHtml(release.environment)}</p>
        <span class="status-pill ${escapeHtml(release.status)}">${escapeHtml(release.status)}</span>
      </div>
      <div><span class="metric-label">Target</span><strong class="metric-value">${formatDate(release.targetDate)}</strong></div>
      <div><span class="metric-label">Pass rate</span><strong class="metric-value">${release.metrics.passRate.toFixed(1)}%</strong></div>
      <div><span class="metric-label">Risk score</span><strong class="metric-value">${release.riskScore.toFixed(1)}</strong></div>
      <button class="release-action" type="button" data-action="details" data-release-id="${escapeHtml(release.id)}">View details</button>
    </article>`;
}

function renderReleases(releases) {
  state.releases = releases;
  elements.list.setAttribute("aria-busy", "false");
  elements.count.textContent = `${releases.length} release${releases.length === 1 ? "" : "s"} shown.`;
  elements.list.innerHTML = releases.length
    ? releases.map(releaseCard).join("")
    : '<div class="empty-state">No releases match the current filters.</div>';
}

function updateSummary(summary) {
  for (const name of ["total", "ready", "conditional", "blocked"]) {
    document.querySelector(`#summary-${name}`).textContent = summary[name];
  }
}

function queryString() {
  const parameters = new URLSearchParams();
  if (state.status !== "all") parameters.set("status", state.status);
  if (state.query) parameters.set("q", state.query);
  parameters.set("sort", state.sort);
  parameters.set("direction", state.direction);
  return parameters.toString();
}

async function loadReleases({ announce = false } = {}) {
  elements.list.setAttribute("aria-busy", "true");
  try {
    const body = await fetchJson(`/api/releases?${queryString()}`);
    renderReleases(body.data);
    updateSummary(body.meta.summary);
    if (announce) showNotification("Release evidence refreshed");
  } catch (error) {
    elements.list.setAttribute("aria-busy", "false");
    elements.list.innerHTML = `<div class="empty-state">Could not load release data. ${escapeHtml(error.message)}</div>`;
    elements.count.textContent = "Release data unavailable.";
  }
}

async function loadIntegrations() {
  try {
    const body = await fetchJson("/api/integrations");
    elements.integrations.innerHTML = body.data.map((item) => `
      <article class="integration-card">
        <div class="integration-title"><span>${escapeHtml(item.name)}</span><span class="integration-count">${item.recordCount} record${item.recordCount === 1 ? "" : "s"}</span></div>
        <p class="integration-path">${escapeHtml(item.status)} · ${escapeHtml(item.path.replace("data/integrations/", ""))}</p>
      </article>`).join("");
    elements.integrations.setAttribute("aria-busy", "false");
  } catch (error) {
    elements.integrations.innerHTML = `<p>Integration samples unavailable: ${escapeHtml(error.message)}</p>`;
    elements.integrations.setAttribute("aria-busy", "false");
  }
}

function renderDialog(release) {
  elements.dialogTitle.textContent = `${release.name} ${release.version}`;
  const reasons = release.gateReasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("");
  const requirements = release.requirements.map((requirement) => `
    <tr>
      <td>${escapeHtml(requirement.id)}</td>
      <td>${escapeHtml(requirement.title)}</td>
      <td>${escapeHtml(requirement.priority)}</td>
      <td>${requirement.coveredBy.map(escapeHtml).join(", ")}</td>
    </tr>`).join("");
  elements.dialogContent.innerHTML = `
    <p>${escapeHtml(release.description)}</p>
    <div class="detail-grid">
      <div class="detail-stat"><span>Gate</span><strong>${escapeHtml(release.status)}</strong></div>
      <div class="detail-stat"><span>Risk</span><strong>${release.riskScore.toFixed(1)}</strong></div>
      <div class="detail-stat"><span>Automated</span><strong>${release.execution.automated}/${release.execution.total}</strong></div>
      <div class="detail-stat"><span>Open defects</span><strong>${release.defects.open}</strong></div>
    </div>
    <section class="detail-section">
      <h3>Gate rationale</h3>
      <ul class="detail-list">${reasons}</ul>
    </section>
    <section class="detail-section">
      <h3>Requirement coverage</h3>
      <div class="table-scroll">
        <table class="requirement-table">
          <thead><tr><th>ID</th><th>Requirement</th><th>Priority</th><th>Covered by</th></tr></thead>
          <tbody>${requirements}</tbody>
        </table>
      </div>
    </section>`;
}

async function openRelease(id) {
  try {
    const body = await fetchJson(`/api/releases/${encodeURIComponent(id)}`);
    renderDialog(body.data);
    elements.dialog.showModal();
  } catch (error) {
    showNotification(`Could not open release: ${error.message}`);
  }
}

let searchTimer;
elements.search.addEventListener("input", (event) => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    state.query = event.target.value.trim();
    loadReleases();
  }, 180);
});

elements.sort.addEventListener("change", (event) => {
  const [sort, direction] = event.target.value.split("-");
  state.sort = sort;
  state.direction = direction || "asc";
  loadReleases();
});

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-button").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    state.status = button.dataset.status;
    loadReleases();
  });
});

elements.refresh.addEventListener("click", () => loadReleases({ announce: true }));
elements.list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action='details']");
  if (button) openRelease(button.dataset.releaseId);
});

await Promise.all([loadReleases(), loadIntegrations()]);
