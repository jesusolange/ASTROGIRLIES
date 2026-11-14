// Cover shown on every start: what the app is for, where the mission stands, and one action to enter.
import "../styles/cover.css";
import { currentMission, rankedRisks } from "./risks.js";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const el = document.createElement("div");
el.className = "amc";
el.setAttribute("role", "dialog");
el.setAttribute("aria-modal", "true");
el.setAttribute("aria-labelledby", "amcTitle");
el.innerHTML = `<div class="amc-limb" aria-hidden="true"></div>
  <div class="amc-in">
    <h1 id="amcTitle">AstroMed</h1>
    <p class="amc-purpose">Check your own health each day, and know what to do next, when Earth cannot answer in time.</p>
    <dl class="amc-facts" id="amcFacts"></dl>
    <button type="button" class="amc-go" id="amcGo">Start today's check <kbd>Enter</kbd></button>
    <p class="amc-note">Your records stay on this device unless you choose to sign in. A self-monitoring aid, not a medical device. Team AstroGirlies, NASA Space Apps 2026.</p>
  </div>`;
window.__amCoverOpen = true;
document.body.appendChild(el);

function renderFacts() {
  const mission = currentMission();
  const profile = window.AstroMedProfile && window.AstroMedProfile.get();
  const day = profile && window.AstroMedProfile.missionDay() != null ? window.AstroMedProfile.dayLabel() : "Not set yet";
  const first = rankedRisks(mission.id).find((r) => r.monitored && r.ops);
  const rows = [["Mission", esc(mission.label)], ["Day", esc(day)]];
  if (first) {
    rows.push(["Watch first", `${esc(first.area)}: NASA rates this risk ${first.ops.l} x ${first.ops.c} for your mission ` +
      `(<a href="${esc(first.url)}" target="_blank" rel="noopener noreferrer">source</a>)`]);
  }
  el.querySelector("#amcFacts").innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
}

function close() {
  if (!window.__amCoverOpen) return;
  window.__amCoverOpen = false;
  el.classList.add("out");
  document.removeEventListener("keydown", onKey);
  setTimeout(() => el.remove(), 600);
  document.dispatchEvent(new CustomEvent("astromed-cover-closed"));
}

function onKey(e) {
  if (e.target.closest && e.target.closest(".amc-facts a")) return;
  if (e.key === "Enter" || e.key === " " || e.key === "Escape") { e.preventDefault(); close(); }
}

el.addEventListener("click", (e) => { if (!e.target.closest(".amc-facts a")) close(); });
document.addEventListener("keydown", onKey);
document.addEventListener("DOMContentLoaded", () => {
  renderFacts();
  el.querySelector("#amcGo").focus();
});
