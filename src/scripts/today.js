// Today: readiness through the risk map, the work queue due today and the links its checks open.
// The page itself is Preact components under src/components/today/.
import "./immune.js";
import { intervalFor, isDue, daysSince, lastDoneFor } from "./missions.js";

const CHECKS = {
  nutrition: { label: "Log breakfast, lunch and dinner", section: "nutrition" },
  twin: { label: "Log an exercise session", section: "twin" },
  mental: { label: "Mental health check-in", section: "mental" },
  environment: { label: "Save cabin readings", section: "environment" },
  immune: { label: "Immune watch check", section: "immune" },
  radiation: { label: "Log your radiation dose", section: "radiation" },
  vision: { label: "Vision self-check", section: "vision" }
};

export const exists = (section) => Boolean(section && window.AstroMedNav && window.AstroMedNav.has(section));

export function checkFor(area) {
  if (area.key.startsWith("overview:")) {
    return { label: `${area.area} check`, section: "overview", part: area.key.slice("overview:".length) };
  }
  return CHECKS[area.key] || null;
}

export function openCheck(area) {
  const check = area && checkFor(area);
  if (!check || !exists(check.section)) return;
  window.AstroMedNav.show(check.section);
  if (check.part) {
    const hotspot = document.querySelector(`.hotspot[data-part="${check.part}"]`);
    if (hotspot) hotspot.click();
  }
}

export const ratingOf = (area) => (area.risk && area.risk.ops ? `${area.risk.ops.l}\u00d7${area.risk.ops.c}` : "not rated");

export function urgentFindings() {
  const sources = [
    window.AstroMedMental, window.AstroMedReadiness && window.AstroMedReadiness.findings,
    window.AstroMedReadiness && window.AstroMedReadiness.immuneFindings,
    window.AstroMedRadiation, window.AstroMedEnv, window.AstroMedNutrition,
    window.AstroMedMissions, window.AstroMedVision, window.AstroMedEmergencies
  ];
  const out = [];
  sources.forEach((source) => {
    const fn = typeof source === "function" ? source : source && source.findings;
    if (typeof fn !== "function") return;
    try {
      (fn.call(source) || []).forEach((finding) => {
        if (finding && (finding.level === "urgent" || finding.level === "alert") && !out.some((x) => x.title === finding.title && x.saw === finding.saw)) out.push(finding);
      });
    } catch (e) { console.error("today findings", e); }
  });
  return out;
}

export function buildQueue(readiness) {
  return readiness.areas.map((area) => {
    if (area.reference || !area.risk) return null;
    const check = checkFor(area);
    if (!check || !exists(check.section)) return null;
    if (area.key === "vision" && window.AstroMedVision && typeof window.AstroMedVision.isDue === "function" && !window.AstroMedVision.isDue()) return null;
    const last = lastDoneFor(area.key);
    const interval = intervalFor(area.score);
    if (!isDue(last, interval.days)) return null;
    return { area, check, last, interval };
  }).filter(Boolean);
}

export function reasonFor(item) {
  let when;
  if (!item.last) when = "Not done yet";
  else {
    const days = daysSince(item.last);
    when = days <= 0 ? "Done today" : days === 1 ? "Last done yesterday" : `Last done ${days} days ago`;
  }
  return `${when}. NASA rates this risk ${ratingOf(item.area)} for this mission, so this check comes back ${item.interval.label} (our design choice).`;
}

function registerToday(attempt = 0) {
  if (!window.AstroMedNav) { setTimeout(() => registerToday(attempt), 20); return; }
  const emergencies = document.querySelector('.nav button[data-action="emergencies"]');
  if (!emergencies && attempt < 25) { setTimeout(() => registerToday(attempt + 1), 20); return; }
  window.AstroMedNav.register({ id: "today", label: "Today", icon: "ic-overview", before: "environment" });
  const announce = () => document.dispatchEvent(new CustomEvent("astromed-nav-changed"));
  setTimeout(() => { window.AstroMedNav.show("today"); announce(); }, 0);
  setTimeout(announce, 500);
}

document.addEventListener("DOMContentLoaded", () => registerToday());
