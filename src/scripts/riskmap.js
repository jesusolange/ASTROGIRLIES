import "../styles/riskmap.css";
import { MISSION_TYPES, DEFAULT_MISSION, currentMission, rankedRisks, SOURCE } from "./risks.js";

const PROFILE_KEY = "astromed-profile";
const PAGE_FOR_SECTION = { overview: "checkupPage", twin: "exercisePage" };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function missionOptions(selectedId) {
  const chosen = selectedId || DEFAULT_MISSION;
  return MISSION_TYPES.map((m) => `<option value="${m.id}"${m.id === chosen ? " selected" : ""}>${esc(m.label)}</option>`).join("");
}

export function missionField(selectedId) {
  return `<label class="pg-field rk-mission"><span>Mission type</span><select data-mission-select>${missionOptions(selectedId)}</select></label>`;
}

export function setMissionType(id, silent) {
  const store = window.AstroMedStore && window.AstroMedStore.store;
  if (!store) return;
  const profile = store.get(PROFILE_KEY, null) || {};
  store.set(PROFILE_KEY, { ...profile, missionType: id });
  if (!silent) document.dispatchEvent(new CustomEvent("astromed-profile-changed"));
}

function sectionExists(section) {
  if (!section) return false;
  return Boolean(document.getElementById(PAGE_FOR_SECTION[section] || `${section}Page`));
}

function ratingHtml(label, side, missing) {
  if (!side) return `<div class="rk-rate"><span>${esc(label)}</span><b class="rk-chip none">${esc(missing)}</b></div>`;
  return `<div class="rk-rate">
    <span>${esc(label)}</span>
    <b class="rk-chip ${side.colour || "none"}">${side.l} × ${side.c}</b>
    <em>${esc(side.disposition || "")}</em>
  </div>`;
}

function watchHtml(risk) {
  if (!risk.monitored) return `<span class="rk-unwatched">Not monitored yet</span>`;
  const area = esc(risk.area || risk.section);
  if (sectionExists(risk.section)) {
    return `<button type="button" class="am-btn am-btn-soft rk-open" data-risk-section="${esc(risk.section)}">${area}</button>`;
  }
  return `<span class="rk-area">${area}</span>`;
}

function rowHtml(risk, rank) {
  const tone = risk.ops ? risk.ops.colour || "none" : "none";
  return `<article class="rk-row ${esc(tone)}">
    <div class="rk-rank" aria-hidden="true">${rank}</div>
    <div class="rk-main">
      <h3>${esc(risk.short)}</h3>
      <p class="rk-title">${esc(risk.title)}</p>
      <div class="rk-meta">
        <a href="${esc(risk.url)}" target="_blank" rel="noopener noreferrer">NASA source</a>
        <span>last published ${esc(risk.published || "date not given")}</span>
      </div>
    </div>
    <div class="rk-ratings">
      ${ratingHtml("In mission", risk.ops, "Not rated for this mission")}
      ${ratingHtml("Long-term health", risk.lth, "Not rated")}
    </div>
    <div class="rk-watch">${watchHtml(risk)}</div>
  </article>`;
}

function render(page) {
  const target = page || document.getElementById("riskmapPage");
  if (!target) return;
  const mission = currentMission();
  const risks = rankedRisks(mission.id);
  target.innerHTML = `
    <div class="am-heading">
      <h2>Mission risks</h2>
      <p>NASA's Human Research Roadmap rates 22 human health risks for each mission type. This map shows them for the mission you chose, highest in-mission rating first.</p>
    </div>

    <div class="am-panel rk-panel">
      <div class="rk-controls">
        ${missionField(mission.id)}
        <div class="rk-now"><small>Showing</small><b>${esc(mission.label)}</b></div>
      </div>
    </div>

    <div class="am-panel rk-about">
      <p><a href="${esc(SOURCE)}" target="_blank" rel="noopener noreferrer">NASA's Human Research Roadmap</a> rates each risk on the Human System Risk Board's scale. In-mission and long-term ratings are likelihood × consequence. The ratings are NASA's; the order of this list and the choice of which app section watches each risk are ours.</p>
      <p class="rk-note">This is a planning and self-monitoring aid, not a medical device and not a diagnosis. A rating is not a prediction for you.</p>
    </div>

    <div class="rk-list">${risks.map((r, i) => rowHtml(r, i + 1)).join("")}</div>`;

  const select = target.querySelector("[data-mission-select]");
  if (select) select.addEventListener("change", () => setMissionType(select.value));
  target.querySelectorAll("[data-risk-section]").forEach((button) => {
    button.addEventListener("click", () => window.AstroMedNav.show(button.dataset.riskSection));
  });
}

document.addEventListener("astromed-profile-changed", () => {
  const page = document.getElementById("riskmapPage");
  if (page && !page.hidden) render(page);
});

document.addEventListener("DOMContentLoaded", () => {
  if (!window.AstroMedNav) return;
  window.AstroMedNav.register({
    id: "riskmap",
    label: "Mission risks",
    icon: "ic-report",
    before: "radiation",
    render,
  });
});
