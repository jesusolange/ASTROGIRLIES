import "../styles/emergencies.css";
import { SITUATIONS, situationById } from "../data/emergencies.js";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

let selectedId = null;
let openRequested = null;

function listHtml() {
  return `
    <div class="am-heading">
      <h2>Emergencies</h2>
      <p>Choose what is happening to you. Each situation shows what to do now, what to prepare, and when to wake the crew medical officer.</p>
    </div>

    <div class="am-panel em-intro">
      <p>This is first-response guidance for a crew member without immediate ground support. It is not a diagnosis.</p>
      <p class="am-small">If you are unsure, wake the crew medical officer. On a mission there is no emergency service to call.</p>
    </div>

    <div class="em-list" role="list">
      ${SITUATIONS.map((s) => `
        <button type="button" class="em-situation" role="listitem" data-emergency="${s.id}">
          <b>${esc(s.title)}</b>
          <span>${esc(s.hint)}</span>
        </button>`).join("")}
    </div>`;
}

function detailHtml(s) {
  const source = s.source
    ? `<p class="em-source">Source: <a href="${esc(s.source.url)}" target="_blank" rel="noopener noreferrer">${esc(s.source.name)}</a></p>`
    : `<p class="em-source em-design"><b>Design choice.</b> These are generic first-aid steps. They are not taken from a specific clinical guideline, so follow your mission protocol and the crew medical officer.</p>`;

  return `
    <div class="em-detail-head">
      <button type="button" class="em-back" data-emergency-back>All situations</button>
      <h2>${esc(s.title)}</h2>
      <p>${esc(s.hint)}</p>
    </div>

    <div class="am-panel em-now">
      <h3>Do this now</h3>
      <ol class="em-steps">
        ${s.steps.map((step) => `<li>${esc(step)}</li>`).join("")}
      </ol>
    </div>

    <div class="am-panel em-prepare">
      <h3>What to prepare</h3>
      <ul>
        ${s.prepare.map((item) => `<li>${esc(item)}</li>`).join("")}
      </ul>
    </div>

    <div class="am-panel em-escalate">
      <h3>Wake or call the crew medical officer if</h3>
      <ul>
        ${s.escalate.map((item) => `<li>${esc(item)}</li>`).join("")}
      </ul>
      <p class="am-small">When contact with Earth exists, the crew medical officer also informs the flight surgeon.</p>
    </div>

    ${source}
    <p class="em-disclaimer am-small">This is first-response guidance for a crew member without immediate ground support, not a diagnosis.</p>`;
}

function bind(page) {
  page.querySelectorAll("[data-emergency]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedId = button.dataset.emergency;
      render(page);
    });
  });
  page.querySelector("[data-emergency-back]")?.addEventListener("click", () => {
    selectedId = null;
    render(page);
  });
}

function render(page) {
  const target = page || document.getElementById("emergenciesPage");
  if (!target) return;
  const situation = selectedId ? situationById(selectedId) : null;
  target.innerHTML = situation ? detailHtml(situation) : listHtml();
  bind(target);
  window.scrollTo({ top: 0 });
}

function open(situationId) {
  if (!situationById(situationId)) return false;
  selectedId = situationId;
  openRequested = situationId;
  if (window.AstroMedNav) window.AstroMedNav.show("emergencies");
  else {
    openRequested = null;
    render(document.getElementById("emergenciesPage"));
  }
  return true;
}

function situations() {
  return SITUATIONS.map(({ id, title }) => ({ id, title }));
}

function findings() {
  return [];
}

document.addEventListener("DOMContentLoaded", () => {
  if (!window.AstroMedNav) return;
  window.AstroMedNav.register({
    id: "emergencies",
    label: "Emergencies",
    before: "environment",
    render: (page) => {
      // A sidebar or external show opens the list; open(id) asks for one situation.
      selectedId = openRequested;
      openRequested = null;
      render(page);
    },
  });
  window.AstroMedEmergencies = { open, situations, findings };
});
