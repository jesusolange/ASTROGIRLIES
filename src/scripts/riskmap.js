// Mission risk map: the sidebar registration, plus the mission-type helpers the legacy Environment page still uses.
import "../styles/riskmap.css";
import { MISSION_TYPES, DEFAULT_MISSION } from "./risks.js";

const PROFILE_KEY = "astromed-profile";
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function missionOptions(selectedId) {
  const chosen = selectedId || DEFAULT_MISSION;
  return MISSION_TYPES.map((m) => `<option value="${m.id}"${m.id === chosen ? " selected" : ""}>${esc(m.label)}</option>`).join("");
}

// Legacy: only the Environment page uses this HTML string until Environment is converted.
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

document.addEventListener("DOMContentLoaded", () => {
  if (!window.AstroMedNav) return;
  window.AstroMedNav.register({
    id: "riskmap",
    label: "Mission risks",
    icon: "ic-report",
    before: "radiation",
  });
});
