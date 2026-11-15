/* Vision (SANS) self-check: comparison against the astronaut's own baseline.
   Screening aid, not a diagnosis. Change thresholds and the grid are our design choice. */

import { rankedRisks, currentMission } from "./risks.js";

export const KEYS = { vision: "astromed-vision" };
export const PROGRESS_KEY = "astromed-vision-progress";
export const EMPTY_DATA = { ppmm: null, calibratedAt: null, results: [] };
export const EMPTY_PROGRESS = { day: null, left: null, right: null, symptoms: null };

export const CARD_MM = 85.6;
export const CALIBRATION = { minPx: 180, maxPx: 620, cardMm: CARD_MM };

// Left first: wherever both eyes are shown, the left eye is on the left and its card comes first.
export const EYES = [
  { id: "left", label: "Left eye" },
  { id: "right", label: "Right eye" }
];
export const EYE_LABEL = { right: "Right eye", left: "Left eye" };

export const VIEW = {
  gridCellMm: 5,
  gridCells: 20,
  gridDistanceCm: 30,
  nearDistanceCm: 40,
  minCellPx: 24
};

// Optotype height in millimetres at the stated distance. 20/20 subtends 5 minutes of arc
// at 40 cm, so the lines follow the standard Snellen definition; the card itself is our design.
export const NEAR_LINES = [
  { mm: 5.82, snellen: "20/200" },
  { mm: 2.91, snellen: "20/100" },
  { mm: 1.46, snellen: "20/50" },
  { mm: 1.16, snellen: "20/40" },
  { mm: 0.87, snellen: "20/30" },
  { mm: 0.73, snellen: "20/25" },
  { mm: 0.58, snellen: "20/20" },
  { mm: 0.44, snellen: "20/15" }
];

// Space a chart row needs: five optotypes, a gap of one optotype between them, the line label
// and the row padding. Rows wider than the card are not offered.
export const NEAR_ROW = { optotypes: 5, gapRatio: 1, labelPx: 88, paddingPx: 24 };

export const SYMPTOMS = [
  { id: "near-blur", label: "New blur when reading at near" },
  { id: "blind-spot", label: "A blind spot or dark patch in central vision" },
  { id: "headache", label: "Headache together with a change in vision" },
  { id: "double", label: "Double vision" },
  { id: "sudden-loss", label: "Sudden loss or sudden drop in vision" },
  { id: "flashes", label: "New flashes or a shower of floaters" }
];

export const RULES = {
  recheckDays: 7,
  nearLineLossForChange: 2,
  urgentSymptoms: ["blind-spot", "sudden-loss"],
  actions: {
    urgent: {
      level: "urgent",
      title: "Urgent vision change",
      todo: "Open Emergencies and follow the steps for a sudden change in vision now. Stop tasks that need sharp vision and do not wait for the next scheduled check."
    },
    change: {
      level: "warn",
      title: "Change against your own baseline",
      todo: "Repeat the check tomorrow and note what changed and in which eye. Keep tasks that need sharp vision light until it settles."
    },
    firstFinding: {
      level: "warn",
      title: "Finding on your first check",
      todo: "Repeat the check tomorrow and note what you saw so a change can be compared."
    },
    baseline: {
      level: "ok",
      title: "Baseline saved",
      todo: "Repeat the check in a week so a change can be seen against today's result."
    },
    stable: {
      level: "ok",
      title: "No change against your baseline",
      todo: "Repeat the check in a week, or sooner if your vision changes."
    }
  }
};

export function symptomLabel(id) {
  const s = SYMPTOMS.find((x) => x.id === id);
  return s ? s.label : id;
}

// Index into NEAR_LINES; -1 means the largest line could not be read.
export function lineIndex(result) {
  const line = result && result.near ? result.near.line : null;
  return Number.isInteger(line) && line >= 0 && line < NEAR_LINES.length ? line : -1;
}

export function lineFor(result) {
  const i = lineIndex(result);
  return i >= 0 ? NEAR_LINES[i] : null;
}

export function compare(result, reference, rules = RULES) {
  if (!reference) return null;
  const nearBefore = lineIndex(reference);
  const nearNow = lineIndex(result);
  const nearLoss = nearBefore - nearNow;
  const beforeMarks = new Set(((reference.grid && reference.grid.marks) || []).map((m) => `${m.row}-${m.col}`));
  const marks = (result.grid && result.grid.marks) || [];
  const newMarks = marks.filter((m) => !beforeMarks.has(`${m.row}-${m.col}`)).length;
  const distortion = Boolean(result.grid && result.grid.distortion);
  const newDistortion = distortion && (!(reference.grid && reference.grid.distortion) || newMarks > 0);
  const beforeSymptoms = new Set(reference.symptoms || []);
  const newSymptoms = (result.symptoms || []).filter((id) => !beforeSymptoms.has(id));
  return {
    nearBefore, nearNow, nearLoss, newMarks, newDistortion, newSymptoms,
    changed: newDistortion || nearLoss >= rules.nearLineLossForChange || newSymptoms.length > 0
  };
}

export function assess({ result, baseline = null, rules = RULES } = {}) {
  const urgent = ((result && result.symptoms) || []).filter((id) => rules.urgentSymptoms.includes(id));
  if (urgent.length) return { ...rules.actions.urgent, reason: "urgent", urgent };

  if (!baseline) {
    const concerning = Boolean(result && result.grid && result.grid.distortion) ||
      ((result && result.symptoms) || []).length > 0 || lineIndex(result) === -1;
    return {
      ...(concerning ? rules.actions.firstFinding : rules.actions.baseline),
      reason: concerning ? "first-finding" : "baseline",
      urgent: []
    };
  }

  const change = compare(result, baseline, rules);
  if (change.changed) return { ...rules.actions.change, reason: "change", change, urgent: [] };
  return { ...rules.actions.stable, reason: "stable", change, urgent: [] };
}

export function describeResult(result) {
  const line = lineFor(result);
  const near = line
    ? `Near vision: read ${line.snellen} (${line.mm.toFixed(2)} mm letter height).`
    : "Near vision: could not read the largest line.";
  const marks = ((result.grid && result.grid.marks) || []).length;
  const grid = result.grid && result.grid.distortion
    ? `Grid distortion reported${marks ? ` (${marks} marked ${marks === 1 ? "area" : "areas"})` : ""}.`
    : "Grid looked even.";
  const symptoms = (result.symptoms || []).length
    ? `Symptoms: ${result.symptoms.map(symptomLabel).join(", ")}.`
    : "No symptoms marked.";
  return `${grid} ${near} ${symptoms}`;
}

export function changeSummary(result, reference) {
  if (!reference) return "First result for this eye.";
  const c = compare(result, reference);
  const parts = [];
  if (c.nearLoss > 0) parts.push(`${c.nearLoss} line${c.nearLoss === 1 ? "" : "s"} worse`);
  else if (c.nearLoss < 0) parts.push(`${-c.nearLoss} line${-c.nearLoss === 1 ? "" : "s"} better`);
  else parts.push("near vision unchanged");
  if (c.newDistortion) parts.push("new grid distortion");
  else if (result.grid && result.grid.distortion) parts.push("grid distortion unchanged");
  if (c.newSymptoms.length) parts.push(`${c.newSymptoms.length} new symptom${c.newSymptoms.length === 1 ? "" : "s"}`);
  return parts.join(" \u00b7 ");
}

/* ---------- screen measurements ---------- */

export function nearLinesFor(ppmm, widthPx, row = NEAR_ROW) {
  const scale = Number(ppmm);
  const width = Number(widthPx);
  const all = NEAR_LINES.map((line, index) => ({ ...line, index }));
  if (!(scale > 0) || !(width > 0)) return { offered: all, skipped: [], calibrated: false };
  const offered = [];
  const skipped = [];
  all.forEach((line) => {
    const letter = line.mm * scale;
    const needed = letter * (row.optotypes + row.gapRatio * (row.optotypes - 1)) + row.labelPx + row.paddingPx;
    (needed <= width ? offered : skipped).push({ ...line, px: Math.max(1.5, letter), needed });
  });
  return { offered, skipped, calibrated: true };
}

export function nearRowsLabel(lines) {
  if (!lines || !lines.length) return "";
  const first = lines[0].snellen;
  const last = lines[lines.length - 1].snellen;
  return first === last ? first : `${first} to ${last}`;
}

export function gridMetrics(ppmm) {
  const scale = Number(ppmm) > 0 ? Number(ppmm) : 0;
  const calibrated = VIEW.gridCellMm * scale;
  const cell = Math.max(VIEW.minCellPx, calibrated);
  return { cell, size: cell * VIEW.gridCells, enlarged: scale > 0 && calibrated < VIEW.minCellPx };
}

/* ---------- stored data ---------- */

const store = () => (typeof window !== "undefined" && window.AstroMedStore && window.AstroMedStore.store) || null;
export const loadValue = (key, fallback) => { const s = store(); return s ? s.get(key, fallback) : fallback; };
export const writeValue = (key, value) => { const s = store(); return s ? s.set(key, value) : false; };

export function readData() {
  const data = loadValue(KEYS.vision, EMPTY_DATA) || EMPTY_DATA;
  return {
    ppmm: Number(data.ppmm) > 0 ? Number(data.ppmm) : null,
    calibratedAt: data.calibratedAt || null,
    results: Array.isArray(data.results) ? data.results.slice() : []
  };
}

export function calibrationOf(data) {
  const ppmm = Number(data && data.ppmm);
  return ppmm > 0 ? { ppmm, calibratedAt: (data && data.calibratedAt) || null } : null;
}

// Every saved result, oldest first.
export function resultsOf(data) {
  const rows = data && Array.isArray(data.results) ? data.results : [];
  return rows.filter((r) => r && r.eye && r.date).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function calibration() {
  return calibrationOf(readData());
}

export function saveCalibration(ppmm) {
  const data = readData();
  const value = Number(ppmm);
  if (!(value > 0)) return null;
  data.ppmm = value;
  data.calibratedAt = new Date().toISOString();
  writeValue(KEYS.vision, data);
  return value;
}

export function results() {
  return resultsOf(readData());
}

export function lastResultFrom(data, eye = null) {
  const rows = resultsOf(data).filter((r) => !eye || r.eye === eye);
  return rows[rows.length - 1] || null;
}

export function lastResult(eye = null) {
  return lastResultFrom(readData(), eye);
}

export function missionDayNow() {
  try {
    return typeof window !== "undefined" && window.AstroMedProfile && typeof window.AstroMedProfile.missionDay === "function"
      ? window.AstroMedProfile.missionDay()
      : null;
  } catch {
    return null;
  }
}

/* ---------- history and findings ---------- */

// Newest first, each entry with its own baseline (first result for that eye) and previous result.
export function historyFrom(data) {
  const all = resultsOf(data);
  const out = [];
  EYES.forEach(({ id }) => {
    const own = all.filter((r) => r.eye === id);
    own.forEach((r, i) => {
      const baseline = i > 0 ? own[0] : null;
      const previous = i > 0 ? own[i - 1] : null;
      out.push({
        ...r, baseline, previous,
        vsBaseline: baseline ? compare(r, baseline) : null,
        vsPrevious: previous ? compare(r, previous) : null,
        assessment: assess({ result: r, baseline })
      });
    });
  });
  return out.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function history() {
  return historyFrom(readData());
}

export function findingsFrom(data) {
  const all = resultsOf(data);
  const out = [];
  EYES.forEach(({ id, label }) => {
    const own = all.filter((r) => r.eye === id);
    if (!own.length) return;
    const newest = own[own.length - 1];
    const baseline = own.length > 1 ? own[0] : null;
    const a = assess({ result: newest, baseline });
    out.push({
      level: a.level,
      title: `${label}: ${a.title}`,
      saw: `${describeResult(newest)} ${baseline ? changeSummary(newest, baseline) : "First result for this eye."}`,
      todo: a.todo
    });
  });
  return out;
}

export function findings() {
  return findingsFrom(readData());
}

export function isDueFrom(iso, days = RULES.recheckDays, now = Date.now()) {
  if (!iso) return true;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return true;
  return now - t >= days * 864e5;
}

export function isDue(days = RULES.recheckDays, now = Date.now()) {
  const last = lastResult();
  return isDueFrom(last && last.date, days, now);
}

export function sansRisk() {
  const mission = currentMission();
  const risk = rankedRisks(mission.id).find((r) => r.id === 105) || null;
  return risk ? { ...risk, missionLabel: mission.label } : null;
}

if (typeof window !== "undefined") {
  window.AstroMedVision = {
    findings, history, lastResult, isDue, results,
    calibration, saveCalibration, assess, compare, KEYS, RULES
  };
}
