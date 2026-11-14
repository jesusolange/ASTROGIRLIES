/* Mental health page: forms, in-section results, history and the urgent response. */

import {
  CATS, DEP_OPTS, DEP_Q, STRESS_OPTS, STRESS_Q, SUICIDAL_RESPONSE,
  guideFor, history, resultLabel, resultLevel, saveMood, saveResult
} from "./mental.js";

const MOODS = [["Great", "great"], ["Okay", "okay"], ["Stressed", "stressed"], ["Down", "down"], ["Not sure", "unsure"]];

const MOOD_REPLIES = {
  great: ["dep", "Great to hear! A short check-in now and then still helps you notice trends. Choose either test."],
  okay: ["dep", "Thanks for sharing. Take the depression and isolation check-in, or switch to the stress test."],
  stressed: ["stress", "That sounds heavy. I opened the stress and burn-out test for you."],
  down: ["dep", "I'm sorry you feel that way, and I'm glad you're checking in. I opened the isolation and depression test for you."],
  unsure: ["dep", "That's fine. Start with this test, and try the stress one afterwards. Together they give a clearer picture."]
};

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (iso) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
const fmtDay = (iso) => new Date(iso).toLocaleDateString([], { dateStyle: "medium" });

let stylesRequested = false;
function loadStyles() {
  if (stylesRequested) return;
  stylesRequested = true;
  import("../styles/mental.css");
}

function hasEmergencies() {
  return !!(window.AstroMedNav && document.getElementById("emergenciesPage"));
}

function urgentHtml() {
  return `
    <div class="mh-urgent" role="alert">
      <p class="mh-urgent-kicker">Immediate response</p>
      <h3>${esc(SUICIDAL_RESPONSE.title)}</h3>
      <p>${esc(SUICIDAL_RESPONSE.text)}</p>
      ${hasEmergencies() ? `<button type="button" class="am-btn mh-urgent-btn" data-open-emergencies>${esc(SUICIDAL_RESPONSE.button)}</button>` : ""}
    </div>`;
}

function resultHtml(entry) {
  const g = guideFor(entry);
  return `
    ${entry.flagged ? urgentHtml() : ""}
    <div class="am-result am-${resultLevel(entry)} mh-result">
      <strong>${entry.score} / ${entry.max} · ${esc(resultLabel(entry))}</strong>
      <p class="mh-meaning">${esc(g.meaning)}</p>
      <h4 class="mh-todo-title">What to do</h4>
      <ul class="mh-todo">${g.todo.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      <p class="mh-fine">Screening aid, not a diagnosis. The score bands are this prototype's design choice.</p>
    </div>`;
}

function changeText(entry) {
  if (!entry.previous) return "First result";
  const d = entry.delta;
  if (d === 0) return `No change vs ${fmtDay(entry.previous.date)}`;
  return `${d > 0 ? "+" : ""}${d} vs ${fmtDay(entry.previous.date)}`;
}

function historyRow(entry) {
  return `
    <li class="mh-hist am-${resultLevel(entry)}${entry.flagged ? " mh-hist-flagged" : ""}">
      <span class="mh-hist-date">${esc(fmt(entry.date))}</span>
      <span class="mh-hist-name">${esc(entry.questionnaire)}</span>
      <span class="mh-hist-score">${entry.score} / ${entry.max} · ${esc(resultLabel(entry))}</span>
      <span class="mh-hist-change">${esc(changeText(entry))}</span>
      ${entry.flagged ? `<span class="mh-hist-flag">Flagged: thoughts of self-harm</span>` : ""}
    </li>`;
}

function renderHistory(page) {
  const box = $("#mhHistoryList", page);
  if (!box) return;
  const rows = history();
  box.innerHTML = rows.length
    ? `<ul class="mh-hist-list">${rows.map(historyRow).join("")}</ul>`
    : `<p class="mh-empty">No saved check-ins yet. Complete one of the questionnaires and it will appear here.</p>`;
}

function renderSaved(page) {
  const rows = history();
  ["depression", "stress"].forEach((type) => {
    const entry = rows.find((r) => r.type === type);
    const box = $(type === "depression" ? "#mhDepResult" : "#mhStressResult", page);
    if (box) box.innerHTML = entry ? resultHtml(entry) : "";
  });
  renderHistory(page);
}

function setTab(page, tab) {
  page.querySelectorAll("[data-mh-tab]").forEach((b) => {
    const on = b.dataset.mhTab === tab;
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", on ? "true" : "false");
  });
  [["dep", "#mhDep"], ["stress", "#mhStress"], ["history", "#mhHistory"]].forEach(([id, sel]) => {
    const panel = $(sel, page);
    if (panel) panel.hidden = id !== tab;
  });
}

function depFormHtml() {
  return DEP_Q.map((q, i) => `
    <div class="am-q">
      <p>${esc(q)}</p>
      <div class="am-opts am-opts-4">
        ${DEP_OPTS.map((o, v) => `
          <label><input type="radio" name="d${i}" value="${v}" required><span>${o}</span></label>`).join("")}
      </div>
    </div>`).join("");
}

function stressFormHtml() {
  return Object.keys(CATS).map((cat) => `
    <h4 class="am-cat">${CATS[cat]}</h4>
    ${STRESS_Q.map((q, i) => q[1] !== cat ? "" : `
      <div class="am-q am-q-row">
        <p>${esc(q[0])}</p>
        <div class="am-opts am-opts-3">
          ${STRESS_OPTS.map((o, v) => `
            <label><input type="radio" name="s${i}" value="${v}" ${v === 0 ? "checked" : ""}><span>${o}</span></label>`).join("")}
        </div>
      </div>`).join("")}`).join("");
}

function shell() {
  return `
    <div class="am-heading">
      <h2>Mental Health</h2>
      <p>Isolation and confinement are one of the five NASA human-spaceflight hazards. A quick check-in helps you spot changes early.</p>
    </div>

    <div class="am-panel">
      <h3>How are you feeling?</h3>
      <div class="am-moods">
        ${MOODS.map((m) => `<button type="button" class="am-mood" data-mh-mood="${m[1]}">${m[0]}</button>`).join("")}
      </div>
      <p id="mhMoodReply" class="am-reply" role="status" aria-live="polite"></p>
    </div>

    <div class="am-tabs" role="tablist" aria-label="Mental health views">
      <button type="button" class="am-tab active" role="tab" aria-selected="true" data-mh-tab="dep">Isolation &amp; depression</button>
      <button type="button" class="am-tab" role="tab" aria-selected="false" data-mh-tab="stress">Stress &amp; burn-out</button>
      <button type="button" class="am-tab" role="tab" aria-selected="false" data-mh-tab="history">History</button>
    </div>

    <div id="mhDep" class="am-panel" role="tabpanel">
      <h3>How often have you experienced any of the following symptoms?</h3>
      <form id="mhDepForm">${depFormHtml()}
        <button class="am-btn" type="submit">See my result</button>
      </form>
      <div id="mhDepResult"></div>
    </div>

    <div id="mhStress" class="am-panel" role="tabpanel" hidden>
      <h3>How strongly do you notice these signs?</h3>
      <form id="mhStressForm">${stressFormHtml()}
        <button class="am-btn" type="submit">See my result</button>
      </form>
      <div id="mhStressResult"></div>
    </div>

    <div id="mhHistory" class="am-panel" role="tabpanel" hidden>
      <h3>History</h3>
      <p>Every saved check-in, newest first. The change compares the score with the previous result of the same questionnaire.</p>
      <div id="mhHistoryList"></div>
    </div>`;
}

function submit(page, type) {
  const form = $(type === "depression" ? "#mhDepForm" : "#mhStressForm", page);
  const prefix = type === "depression" ? "d" : "s";
  const questions = type === "depression" ? DEP_Q : STRESS_Q;
  if (!form.reportValidity()) return;
  const answers = questions.map((_, i) => Number(form.elements[prefix + i].value));
  saveResult(type, answers);
  renderSaved(page);
  setTab(page, type === "depression" ? "dep" : "stress");
  const box = $(type === "depression" ? "#mhDepResult" : "#mhStressResult", page);
  if (box) box.scrollIntoView({ behavior: "smooth", block: "start" });
}

function wire(page) {
  page.querySelectorAll("[data-mh-tab]").forEach((b) => b.addEventListener("click", () => {
    setTab(page, b.dataset.mhTab);
    if (b.dataset.mhTab === "history") renderHistory(page);
  }));

  page.querySelectorAll("[data-mh-mood]").forEach((b) => b.addEventListener("click", () => {
    page.querySelectorAll("[data-mh-mood]").forEach((x) => x.classList.toggle("selected", x === b));
    const [tab, text] = MOOD_REPLIES[b.dataset.mhMood];
    $("#mhMoodReply", page).textContent = text;
    setTab(page, tab);
    saveMood(b.dataset.mhMood);
  }));

  $("#mhDepForm", page).addEventListener("submit", (e) => { e.preventDefault(); submit(page, "depression"); });
  $("#mhStressForm", page).addEventListener("submit", (e) => { e.preventDefault(); submit(page, "stress"); });

  page.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-emergencies]") && hasEmergencies()) window.AstroMedNav.show("emergencies");
  });
}

export function initMental() {
  const page = document.getElementById("mentalPage");
  if (!page || page.dataset.mhReady) return;
  page.dataset.mhReady = "1";
  loadStyles();
  page.innerHTML = shell();
  wire(page);
  renderSaved(page);
  // Emergencies registers after this module; refresh so its button appears if the page exists.
  setTimeout(() => { const p = document.getElementById("mentalPage"); if (p) renderSaved(p); }, 0);
}
