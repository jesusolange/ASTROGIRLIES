// Home: the work queue due today, the findings that need attention and the links their checks open.
// The page itself is Preact components under src/components/home/.
import { lastResult as lastVisionResult } from "./vision.js";
import { vo2Due, findings as vo2Findings } from "./fitness.js";
import { emergencyFor } from "../data/topics.js";

const rd = (k, fb) => globalThis.AstroMedStore.store.get(k, fb);
const DAYMS = 864e5;
const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const dayOfTime = (t) => (t ? isoDay(new Date(t)) : null);

/* ---------- when a check comes back ---------- */
// Design choice, not a NASA rule: a higher NASA rating brings the check back sooner.
export const CHECK_INTERVALS = [
  { min: 16, days: 1, label: "every day" },
  { min: 9, days: 2, label: "every 2 days" },
  { min: 0, days: 7, label: "every week" }
];
export function intervalFor(score) {
  return CHECK_INTERVALS.find((i) => score >= i.min) || CHECK_INTERVALS[CHECK_INTERVALS.length - 1];
}
export function daysSince(lastIso, now = new Date()) {
  if (!lastIso) return Infinity;
  const last = parseIso(lastIso);
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((current - last) / DAYMS);
}
export function isDue(lastIso, intervalDays, now = new Date()) {
  return daysSince(lastIso, now) >= intervalDays;
}

/* ---------- last completion per topic ---------- */
function latestDay(list, field) {
  const days = (Array.isArray(list) ? list : []).map((x) => (x ? dayOfTime(x[field]) : null)).filter(Boolean).sort();
  return days.pop() || null;
}
function lastMealsDay() {
  const entries = rd("astromed-nutrition", { entries: [] }).entries || [];
  const byDay = {};
  entries.forEach((e) => { const d = dayOfTime(e.time); if (d) (byDay[d] = byDay[d] || new Set()).add(e.meal); });
  return Object.keys(byDay).filter((d) => ["Breakfast", "Lunch", "Dinner"].every((m) => byDay[d].has(m))).sort().pop() || null;
}

// Last day a check was completed, as YYYY-MM-DD, or null.
export function lastDoneFor(key) {
  if (!key) return null;
  if (key.startsWith("overview:")) {
    const part = key.slice("overview:".length);
    const recs = rd("astrotwin-gui-v2-records", []);
    return latestDay((Array.isArray(recs) ? recs : []).filter((r) => r && r.part === part), "time");
  }
  switch (key) {
    case "nutrition": return lastMealsDay();
    case "twin": return latestDay(rd("astrotwin-exercise-sessions", []), "date");
    case "mental": {
      const m = rd("astromed-mental", {}) || {};
      return ["mood", "depression", "stress"].map((k) => (m[k] ? dayOfTime(m[k].date) : null)).filter(Boolean).sort().pop() || null;
    }
    case "environment": {
      const live = rd("astromed-env", null);
      return [latestDay(rd("astromed-env-log", []), "time"), live && live.time ? dayOfTime(live.time) : null].filter(Boolean).sort().pop() || null;
    }
    case "immune": {
      const immune = rd("astromed-immune", {});
      const logDay = Object.keys((immune && immune.log) || {}).sort().pop() || null;
      const testDay = latestDay((immune && immune.tests) || [], "time");
      return [logDay, testDay].filter(Boolean).sort().pop() || null;
    }
    case "radiation": {
      const entries = rd("astromed-radiation", { entries: [] }).entries || [];
      return (Array.isArray(entries) ? entries : []).map((e) => e && e.day).filter(Boolean).sort().pop() || null;
    }
    default: return null;
  }
}

const LAST_KEY = {
  bones: "overview:bones", kidneys: "overview:kidneys", sleep: "overview:brain", heart: "overview:heart",
  exercise: "twin", environment: "environment", immune: "immune", radiation: "radiation",
  mental: "mental", nutrition: "nutrition"
};

// The route is the topic id: the Check deck resolves a topic id to that topic's cards.
const TOPIC_LABEL = {
  bones: "Bone check",
  kidneys: "Kidney check",
  sleep: "Sleep check",
  heart: "Heart check",
  exercise: "Log an exercise session",
  environment: "Cabin conditions check",
  immune: "Immune watch check",
  radiation: "Log your radiation dose",
  mental: "Mental health check-in",
  nutrition: "Log breakfast, lunch and dinner",
  vision: "Vision self-check"
};

const VO2_CHECK = { label: "VO\u2082max test", route: "vo2max" };

// The Vision results store a full timestamp; the queue works in local days like the other checks.
function localDay(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return isoDay(date);
}
function lastVisionDay() {
  const last = lastVisionResult();
  return last && last.date ? localDay(last.date) : null;
}
function lastFor(area) {
  return area.key === "vision" ? lastVisionDay() : lastDoneFor(LAST_KEY[area.key]);
}

export const ratingOf = (area) => (area && area.risk && area.risk.ops ? `${area.risk.ops.l}\u00d7${area.risk.ops.c}` : "not rated");

export function checkForTopic(topicId) {
  const label = TOPIC_LABEL[topicId];
  return label ? { label, route: topicId } : null;
}

export function buildQueue(readiness) {
  const items = readiness.areas.map((area) => {
    const check = checkForTopic(area.key);
    if (!check) return null;
    const last = lastFor(area);
    const interval = intervalFor(area.score);
    // A missing area always belongs in the due list; a recorded area only when its interval has passed.
    if (area.data && !isDue(last, interval.days)) return null;
    return { area, check, last, interval };
  }).filter(Boolean);
  const vo2 = vo2Due();
  if (vo2.days <= 0) {
    const last = vo2.last ? dayOfTime(vo2.last.time) : null;
    items.push({ vo2: true, check: VO2_CHECK, last, interval: { days: 14, label: "every 2 weeks" } });
  }
  return items;
}

export function reasonFor(item) {
  let when;
  if (!item.last) when = "Not done yet";
  else {
    const days = daysSince(item.last);
    when = days <= 0 ? "Done today" : days === 1 ? "Last done yesterday" : `Last done ${days} days ago`;
  }
  if (item.vo2) return `${when}. The aerobic fitness test is repeated every 2 weeks (our design choice).`;
  return `${when}. NASA rates this risk ${ratingOf(item.area)} for this mission, so this check comes back ${item.interval.label} (our design choice).`;
}

/* ---------- needs attention ---------- */
// Which topic a finding belongs to. The first match wins; the emergency card comes from topics.js.
const FINDING_TOPICS = [
  { topic: "mental", test: /thoughts of death or suicide|harming myself|self-harm/i },
  { topic: "vision", test: /vision|blind spot|retina|\beye\b/i },
  { topic: "radiation", test: /solar particle|solar storm|storm shelter|dose rate is far above/i },
  { topic: "environment", test: /cabin temperature|cabin pressure|cabin air|carbon dioxide|co\u2082|\bco2\b|smoke|humidity|air is (extremely )?(dry|humid)/i },
  { topic: "immune", test: /temperature|fever|infection|viral|bacterial/i },
  { topic: "heart", test: /oxygen|breath|respiratory|short of breath|chest tight/i }
];

export function emergencyForFinding(finding) {
  if (!finding) return null;
  const text = `${finding.title || ""} ${finding.saw || ""}`;
  const match = FINDING_TOPICS.find((entry) => entry.test.test(text));
  return match ? emergencyFor(match.topic) : null;
}

// Daily checkup findings live behind AstroMedData.analyze(); they are not exposed as their own global.
function checkupFindings() {
  const data = typeof window !== "undefined" ? window.AstroMedData : null;
  if (!data || typeof data.analyze !== "function") return [];
  try {
    const analysis = data.analyze();
    return [...(analysis.urgent || []), ...(analysis.checkup || [])];
  } catch (error) {
    console.error("home checkup findings", error);
    return [];
  }
}

export function attentionFindings() {
  if (typeof window === "undefined") return [];
  const sources = [
    window.AstroMedMental, window.AstroMedImmune, window.AstroMedRadiation, window.AstroMedEnv,
    window.AstroMedNutrition, window.AstroMedVision, window.AstroMedEmergencies, vo2Findings, checkupFindings
  ];
  const out = [];
  sources.forEach((source) => {
    const fn = typeof source === "function" ? source : source && source.findings;
    if (typeof fn !== "function") return;
    try {
      (fn.call(source) || []).forEach((finding) => {
        if (!finding) return;
        const level = finding.level;
        if (!["urgent", "alert", "warn", "warning", "review"].includes(level)) return;
        if (!out.some((x) => x.title === finding.title && x.saw === finding.saw)) out.push(finding);
      });
    } catch (e) { console.error("home findings", e); }
  });
  return out;
}

export function isUrgent(finding) {
  return finding && (finding.level === "urgent" || finding.level === "alert");
}
