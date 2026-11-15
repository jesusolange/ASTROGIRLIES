// Readiness from the NASA risk map. Each topic carries the weight of its highest in-mission NASA
// rating for the chosen mission; the app's own data turns each topic into a 0-100 result.
// The NASA ratings are NASA's. The coverage rule, the formula and the bands are our design choice.
import { currentMission, rankedRisks, SOURCE } from "./risks.js";
import { TOPICS } from "../data/topics.js";

export const COVERAGE_MIN = 0.5; // design choice: fewer recorded due areas than this share means no score
export const RECENT_DAYS = 7; // design choice: daily data is "recent" for a week
export const MENTAL_DAYS = 14;
export const SCORE_LEVEL = { ok: 100, review: 55, alert: 15 };
export const BANDS = [
  { min: 80, key: "ready", title: "Ready", advice: "You are in good shape for today's work." },
  { min: 60, key: "almost", title: "Almost ready", advice: "Fine for normal work. Work on the lowest checks below." },
  { min: 40, key: "easy", title: "Take it easy", advice: "Keep tasks light and work on the lowest checks below." },
  { min: 0, key: "rest", title: "Rest today", advice: "Rest today and keep your tasks light." }
];

const DAY = 864e5;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const ageDays = (iso) => (Date.now() - new Date(iso).getTime()) / DAY;
const avg = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : null);

/* ---------- pure scoring ---------- */

const isReference = (area) => Boolean(area && area.reference);

// The share of due areas that have a current record. Reference areas are shown but never due.
// This is the one coverage rule the score and the due list read.
export function coverageOf(areas, scores) {
  const list = Array.isArray(areas) ? areas : [];
  const due = list.filter((area) => area && !isReference(area));
  const done = due.filter((area) => scores && scores[area.key]);
  const missing = due.filter((area) => !(scores && scores[area.key]));
  return { done: done.length, due: due.length, share: due.length ? done.length / due.length : 0, missing };
}

export function weightedScore(weights, scores) {
  const covered = weights.filter((w) => scores[w.key]);
  const weight = covered.reduce((sum, w) => sum + w.weight, 0);
  if (!weight) return null;
  return covered.reduce((sum, w) => sum + scores[w.key].score * w.weight, 0) / weight;
}

export function bandFor(value) {
  return BANDS.find((b) => value >= b.min) || BANDS[BANDS.length - 1];
}

// weights: [{ key, weight, ... }], scores: { [key]: { score, note } }.
// Missing areas are pulled toward the middle by the share of due areas covered, so missing checks
// cannot look healthy. Below the coverage share there is no score at all.
export function evaluateReadiness(weights, scores, options = {}) {
  const minCoverage = options.minCoverage ?? COVERAGE_MIN;
  const coverage = coverageOf(weights, scores);
  const reference = (Array.isArray(weights) ? weights : []).filter(isReference);
  if (!coverage.due || coverage.share + 1e-9 < minCoverage) {
    return {
      status: "insufficient", coverage: coverage.share, covered: coverage.done, due: coverage.due,
      missing: coverage.missing, reference, raw: null, total: null, band: null
    };
  }
  const raw = weightedScore(weights, scores);
  const total = Math.round(clamp(50 + (raw - 50) * coverage.share, 0, 100));
  return {
    status: "scored", coverage: coverage.share, covered: coverage.done, due: coverage.due,
    missing: coverage.missing, reference, raw: Math.round(raw), total, band: bandFor(total)
  };
}

/* ---------- reading the app's data ---------- */

const read = (key, fallback) => {
  const store = typeof window !== "undefined" && window.AstroMedStore && window.AstroMedStore.store;
  return store ? store.get(key, fallback) : fallback;
};

function levelList(entries) {
  return entries.map((r) => (r && SCORE_LEVEL[r.level] != null ? SCORE_LEVEL[r.level] : null)).filter((v) => v != null);
}

function checkupScore(part) {
  const data = typeof window !== "undefined" ? window.AstroMedData : null;
  if (!data || typeof data.getCheckups !== "function") return null;
  const checkup = data.getCheckups()[part];
  if (!checkup || ageDays(checkup.date) > RECENT_DAYS) return null;
  const values = Object.entries(checkup.values).map(([key, o]) => data.rule(key, o.value));
  const scores = levelList(values);
  if (!scores.length) return null;
  return { score: avg(scores), note: `${scores.length} reading${scores.length === 1 ? "" : "s"} in the last ${RECENT_DAYS} days` };
}

function nutritionScore() {
  const N = typeof window !== "undefined" && window.AstroMedNutrition ? window.AstroMedNutrition.summary() : null;
  if (!N || !Number.isFinite(N.ratio)) return null;
  const deviation = Math.max(0, Math.abs(N.ratio - 1) - 0.1);
  return {
    score: clamp(100 - (deviation / 0.4) * 100, 0, 100),
    note: `${Math.round(N.ratio * 100)}% of the calorie goal, last logged days`
  };
}

function exerciseScore() {
  const sessions = read("astrotwin-exercise-sessions", []);
  const recent = (Array.isArray(sessions) ? sessions : []).filter((s) => s && ageDays(s.date) < RECENT_DAYS).length;
  if (!recent) return null;
  return { score: clamp((recent / 4) * 100, 0, 100), note: `${recent} session${recent === 1 ? "" : "s"} in ${RECENT_DAYS} days` };
}

function mentalScore() {
  const m = read("astromed-mental", {}) || {};
  const scores = levelList(["depression", "stress"].map((k) => (m[k] && ageDays(m[k].date) < MENTAL_DAYS ? m[k] : null)));
  if (!scores.length) return null;
  return { score: avg(scores), note: `check-ins in the last ${MENTAL_DAYS} days` };
}

function environmentScore() {
  const state = read("astromed-env", null);
  if (!state || !state.readings || !window.AstroMedEnv) return null;
  const findings = window.AstroMedEnv.findings();
  const alerts = findings.filter((f) => f.level === "alert").length;
  const reviews = findings.filter((f) => f.level === "review").length;
  return { score: clamp(100 - alerts * 25 - reviews * 10, 0, 100), note: findings.length ? `${findings.length} reading(s) to review` : "all cabin readings fine" };
}

function immuneScore() {
  const immune = typeof window !== "undefined" ? window.AstroMedImmune : null;
  if (!immune || typeof immune.status !== "function") return null;
  const status = immune.status();
  if (!status.saved) return null;
  return {
    score: SCORE_LEVEL[status.level] ?? null,
    note: status.sym.length ? `${status.sym.length} symptom(s) today` : `${status.risks.length} risk factor(s)`
  };
}

function radiationScore() {
  const R = typeof window !== "undefined" && window.AstroMedRadiation ? window.AstroMedRadiation.status() : null;
  if (!R || !R.hasData) return null;
  return { score: SCORE_LEVEL[R.level] ?? null, note: `${R.pct.toFixed(1)}% of the career limit` };
}

function visionScore() {
  const V = typeof window !== "undefined" ? window.AstroMedVision : null;
  if (!V) return null;
  if (typeof V.score === "function") {
    const value = Number(V.score());
    if (Number.isFinite(value)) return { score: clamp(value, 0, 100), note: "latest vision self-check" };
  }
  if (typeof V.latest === "function") {
    const latest = V.latest();
    if (latest && Number.isFinite(Number(latest.score))) return { score: clamp(Number(latest.score), 0, 100), note: "latest vision self-check" };
  }
  return null;
}

export function scoreArea(key) {
  switch (key) {
    case "bones": return checkupScore("bones");
    case "kidneys": return checkupScore("kidneys");
    case "sleep": return checkupScore("brain");
    case "heart": return checkupScore("heart");
    case "nutrition": return nutritionScore();
    case "exercise": return exerciseScore();
    case "mental": return mentalScore();
    case "environment": return environmentScore();
    case "immune": return immuneScore();
    case "radiation": return radiationScore();
    case "vision": return visionScore();
    default: return null;
  }
}

export function collectScores(areas) {
  const scores = {};
  areas.forEach((area) => { scores[area.key] = scoreArea(area.key); });
  return scores;
}

// One area per topic; its weight is the topic's highest in-mission NASA rating for the mission.
export function areasFor(missionId) {
  const byId = new Map(rankedRisks(missionId).map((r) => [r.id, r]));
  const areas = TOPICS.map((topic) => {
    const risk = topic.riskIds.map((id) => byId.get(id)).filter(Boolean).sort((a, b) => b.score - a.score)[0] || null;
    return { key: topic.id, topicId: topic.id, area: topic.label, score: risk ? risk.score : 0, risk, riskId: risk ? risk.id : null };
  });
  const total = areas.reduce((sum, area) => sum + area.score, 0) || 1;
  return areas.map((area) => ({ ...area, weight: area.score / total })).sort((a, b) => b.weight - a.weight);
}

/* ---------- public computation ---------- */

export function compute() {
  const mission = currentMission();
  const areas = areasFor(mission.id);
  const scores = collectScores(areas);
  const result = evaluateReadiness(areas, scores);
  return {
    mission,
    areas: areas.map((a) => ({ ...a, data: scores[a.key] || null, reference: false })),
    ...result,
    coveragePct: Math.round(result.coverage * 100)
  };
}

export { SOURCE };

if (typeof window !== "undefined") {
  window.AstroMedReadiness = { compute, evaluateReadiness, coverageOf, COVERAGE_MIN, SOURCE };
}
