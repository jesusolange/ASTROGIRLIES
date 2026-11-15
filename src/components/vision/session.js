// The day's run of Vision cards: the draft for each eye, what is done, and the result the run ends with.
// Stored records keep the shape Progress reads: one complete result per eye for the day.
import {
  EMPTY_PROGRESS, EYES, KEYS, PROGRESS_KEY, assess, calibration, changeSummary, describeResult,
  loadValue, missionDayNow, readData, resultsOf, writeValue
} from "../../scripts/vision.js";

export function dayKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const blankProgress = (day) => ({ day, left: null, right: null, symptoms: null });

export function readProgress(now = new Date()) {
  const day = dayKey(now);
  const stored = loadValue(PROGRESS_KEY, null);
  if (!stored || stored.day !== day) return blankProgress(day);
  return {
    day,
    left: stored.left || null,
    right: stored.right || null,
    symptoms: Array.isArray(stored.symptoms) ? stored.symptoms : null
  };
}

export function savePart(eye, patch, now = new Date()) {
  const progress = readProgress(now);
  const id = eye === "left" ? "left" : "right";
  const next = { ...progress, [id]: { ...(progress[id] || {}), ...patch } };
  writeValue(PROGRESS_KEY, next);
  return next;
}

export function saveSymptoms(ids, now = new Date()) {
  const next = { ...readProgress(now), symptoms: Array.isArray(ids) ? ids : [] };
  writeValue(PROGRESS_KEY, next);
  return next;
}

// Both eyes have a grid answer and a near line. The day's result is combined only when that is true.
export function partsReady(progress = readProgress()) {
  const ready = (part) => Boolean(part && part.grid && Number.isInteger(part.near));
  return ready(progress.left) && ready(progress.right);
}

// The last card that completes the day writes the combined result, whichever part it was.
export function finishIfComplete(now = new Date()) {
  const progress = readProgress(now);
  return partsReady(progress) && progress.symptoms !== null ? finish(now) : null;
}

// Both eyes are written together as one result per eye for the day, in the stored record shape.
export function finish(now = new Date()) {
  const progress = readProgress(now);
  const data = readData();
  const day = dayKey(now);
  const kept = data.results.filter((r) => !(r && r.date && dayKey(r.date) === day));
  const stamp = now.toISOString();
  const entries = EYES.map(({ id }) => {
    const part = progress[id] || {};
    return {
      id: `${id}-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
      eye: id,
      date: stamp,
      missionDay: missionDayNow(),
      grid: {
        distortion: Boolean(part.grid && part.grid.distortion),
        marks: Array.isArray(part.grid && part.grid.marks) ? part.grid.marks : []
      },
      near: { line: Number.isInteger(part.near) ? part.near : null },
      symptoms: progress.symptoms || []
    };
  });
  writeValue(KEYS.vision, { ...data, results: [...kept, ...entries] });
  writeValue(PROGRESS_KEY, blankProgress(day));
  return entries;
}

export function doneToday(now = new Date()) {
  const day = dayKey(now);
  const rows = resultsOf(readData());
  return EYES.every(({ id }) => rows.some((r) => r.eye === id && dayKey(r.date) === day));
}

export function cardDone(id, now = new Date()) {
  if (id === "vision-calibrate") return Boolean(calibration());
  if (doneToday(now)) return true;
  const progress = readProgress(now);
  switch (id) {
    case "vision-grid-left": return Boolean(progress.left && progress.left.grid);
    case "vision-grid-right": return Boolean(progress.right && progress.right.grid);
    case "vision-near-left": return Number.isInteger(progress.left && progress.left.near);
    case "vision-near-right": return Number.isInteger(progress.right && progress.right.near);
    case "vision-symptoms": return progress.symptoms !== null;
    default: return false;
  }
}

export function snapshot() {
  return { data: readData(), progress: loadValue(PROGRESS_KEY, null) };
}

export function restore(saved) {
  if (!saved) return;
  writeValue(KEYS.vision, saved.data);
  writeValue(PROGRESS_KEY, saved.progress || EMPTY_PROGRESS);
}

// Today's result for both eyes; the level is the worse eye, the eyes are listed left first.
export function assessmentToday(data, now = new Date()) {
  const day = dayKey(now);
  const rows = resultsOf(data);
  const eyes = [];
  EYES.forEach(({ id, label }) => {
    const own = rows.filter((r) => r.eye === id);
    const index = own.map((r) => dayKey(r.date)).lastIndexOf(day);
    if (index < 0) return;
    const result = own[index];
    const baseline = own.length > 1 && own[0] !== result ? own[0] : null;
    eyes.push({ eye: id, label, result, baseline, assessment: assess({ result, baseline }) });
  });
  if (!eyes.length) return null;
  const rank = { ok: 0, info: 1, warn: 2, urgent: 3 };
  const worst = eyes.reduce((a, b) => (rank[b.assessment.level] > rank[a.assessment.level] ? b : a));
  return {
    level: worst.assessment.level,
    title: worst.assessment.title,
    reason: worst.assessment.reason,
    todo: worst.assessment.todo,
    urgent: eyes.flatMap((entry) => entry.assessment.urgent || []),
    eyes
  };
}

export function assessmentSummary(assessment) {
  if (!assessment) return "";
  return assessment.eyes
    .map(({ label, result, baseline, assessment: a }) =>
      `${label}: ${a.title}. ${describeResult(result)}${baseline ? ` ${changeSummary(result, baseline)}` : ""}`)
    .join(" ");
}
