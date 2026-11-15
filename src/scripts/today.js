// Today: readiness through the risk map, the work queue due today and the links its checks open.
// The page itself is Preact components under src/components/today/.
import "./immune.js";
import { intervalFor, isDue, daysSince, lastDoneFor } from "./missions.js";
import { lastResult as lastVisionResult } from "./vision.js";

// Which emergency card a finding's subject belongs to. The first match wins; card ids come from
// src/data/emergencies.js. A finding with no matching card still opens the guide without a card.
export const FINDING_CARDS = [
  { card: "self-harm", test: /thoughts of death or suicide|harming myself|self-harm/i },
  { card: "vision-change", test: /vision|blind spot|retina|\beye\b/i },
  { card: "storm", test: /solar particle|solar storm|storm shelter|dose rate is far above/i },
  { card: "cabin-air", test: /cabin temperature|cabin pressure|cabin air|carbon dioxide|co\u2082|\bco2\b|smoke|humidity|air is (extremely )?(dry|humid)/i },
  { card: "fever", test: /temperature|fever|infection|viral|bacterial/i },
  { card: "breath", test: /oxygen|breath|respiratory|short of breath|chest tight/i },
  { card: "gcs", test: /awake|confus|glasgow|\bgcs\b/i },
  { card: "belly", test: /belly|abdominal|appendix|gallbladder/i },
  { card: "back", test: /back pain|kidney stone/i },
  { card: "calf", test: /calf|clot|\bdvt\b|leg vein/i },
  { card: "fracture", test: /fracture|broken bone/i },
  { card: "bleeding", test: /bleed|wound/i }
];

export function cardForFinding(finding) {
  if (!finding) return null;
  const text = `${finding.title || ""} ${finding.saw || ""}`;
  const match = FINDING_CARDS.find((entry) => entry.test.test(text));
  return match ? match.card : null;
}

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

// Daily checkup findings live behind AstroMedData.analyze(); they are not exposed as their own global.
function checkupFindings() {
  const data = typeof window !== "undefined" ? window.AstroMedData : null;
  if (!data || typeof data.analyze !== "function") return [];
  try {
    const analysis = data.analyze();
    return [...(analysis.urgent || []), ...(analysis.checkup || [])];
  } catch (error) {
    console.error("today checkup findings", error);
    return [];
  }
}

export function urgentFindings() {
  const sources = [
    window.AstroMedMental, window.AstroMedReadiness && window.AstroMedReadiness.findings,
    window.AstroMedReadiness && window.AstroMedReadiness.immuneFindings,
    window.AstroMedRadiation, window.AstroMedEnv, window.AstroMedNutrition,
    window.AstroMedMissions, window.AstroMedVision, window.AstroMedEmergencies,
    checkupFindings
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

// The Vision results store a full timestamp; the queue works in local days like the other checks.
function localDay(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function lastVisionDay() {
  const last = lastVisionResult();
  return last && last.date ? localDay(last.date) : null;
}

export function buildQueue(readiness) {
  return readiness.areas.map((area) => {
    if (area.reference || !area.risk) return null;
    const check = checkFor(area);
    if (!check || !exists(check.section)) return null;
    const last = area.key === "vision" ? lastVisionDay() : lastDoneFor(area.key);
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
