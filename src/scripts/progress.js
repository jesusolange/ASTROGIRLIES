/* Progress data: every stored record from every section, in one shape.
   Pure helpers and readers only; the interface lives under src/components/progress/. */
import { SYSTEMS, RECORDS_KEY } from "./checkup-flow.js";
import { bandFor, scaleFor } from "./health-indicators.js";
import { FIELDS as CABIN_FIELDS, KEYS as ENV_KEYS, evaluate, baselineFor } from "./environment.js";
import { KEY as NUTRITION_KEY, targets, totalsOf, parseIso } from "./nutrition.js";
import { KEYS as VISION_KEYS, EYES, NEAR_LINES, RULES, lineIndex, resultsOf } from "./vision.js";
import { KEYS as MENTAL_KEYS } from "./mental.js";
import { SYMPTOMS as IMMUNE_SYMPTOMS } from "./immune.js";
import { KEY as RADIATION_KEY, calc as radiationCalc, careerShare, levelForPct } from "./radiation.js";
import { KEY as EXERCISE_KEY } from "./exercise.js";
import { missionDayFor, totalFor } from "./profile.js";
export const KEY = "astromed-history";
export const DAY = 864e5;
const IMMUNE_KEY = "astromed-immune";
const MISSIONS_KEY = "astromed-missions";
const MOOD_SCORE = { down: 1, stressed: 2, unsure: 3, okay: 4, great: 5 };
const MOOD_LABEL = Object.fromEntries(Object.entries(MOOD_SCORE).map(([label, score]) => [score, label]));
export const FILTERS = [
  { id: "all", label: "All" }, { id: "body", label: "Body" }, { id: "vision", label: "Vision" },
  { id: "mind", label: "Mind" }, { id: "immune", label: "Immune" }, { id: "radiation", label: "Radiation" },
  { id: "cabin", label: "Cabin" }, { id: "nutrition", label: "Nutrition" }, { id: "exercise", label: "Exercise" }
];
const FI = Object.fromEntries(FILTERS.map((filter, index) => [filter.id, index]));
export const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dayOf = (iso) => (Number.isFinite(new Date(iso).getTime()) ? isoDay(new Date(iso)) : null);
const dayAt = (day) => { const date = parseIso(day); date.setHours(12, 0, 0, 0); return date.toISOString(); };
const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);
const mean = (list) => (list.length ? list.reduce((sum, value) => sum + value, 0) / list.length : null);
const bandLevel = (level) => (level === "normal" ? "ok" : level === "neutral" || !level ? "info" : level);
function bandFromScale(scale) {
  if (!scale || !Array.isArray(scale.zones)) return null;
  let from = scale.min;
  for (const zone of scale.zones) {
    if (zone.level === "normal") return [from, zone.to === Infinity ? scale.max : zone.to];
    from = zone.to;
  }
  return null;
}
let sequence = 0;
function makeRow(data) {
  sequence += 1;
  return { id: `${data.source}-${sequence}`, chart: true, history: true, level: "info", band: null, unit: "", agg: "mean", order: 0, ...data };
}
function bodyRows(api, profile) {
  const records = api.get(RECORDS_KEY, []);
  return (Array.isArray(records) ? records : []).flatMap((record) => {
    const system = record && SYSTEMS[record.part];
    if (!system || !record.values) return [];
    return system.fields.flatMap((field, fieldIndex) => {
      const value = num(record.values[field.key]);
      if (value == null) return [];
      const scale = scaleFor(field.key, profile);
      return [makeRow({
        source: "checkup", storeKey: RECORDS_KEY, part: record.part, time: record.time, measureKey: field.key,
        date: record.time, measure: `body.${record.part}.${field.key}`, filter: "body",
        label: field.label, check: `${system.label} · ${field.label}`, value, unit: field.unit,
        level: bandLevel(bandFor(scale, value).level), band: bandFromScale(scale), order: FI.body * 1000 + fieldIndex
      })];
    });
  });
}
function cabinRows(api) {
  const log = api.get(ENV_KEYS.log, []);
  const state = api.get(ENV_KEYS.state, null) || {};
  const place = state.place || "iss";
  const reduced = ["moon", "mars", "other"].includes(place);
  const bands = { temp: [18, 27], pressure: reduced ? [55, 105] : [95, 105], humidity: [30, 60], co2: [0, 3000], noise: [30, 60], radiation: null };
  return (Array.isArray(log) ? log : []).flatMap((entry) => {
    if (!entry || !entry.readings) return [];
    const atPlace = entry.place || place;
    const baseline = baselineFor(log, atPlace, entry.time);
    return CABIN_FIELDS.flatMap((field, fieldIndex) => {
      const value = num(entry.readings[field.key]);
      if (value == null) return [];
      const result = evaluate(field.key, value, atPlace, baseline);
      return [makeRow({
        source: "env", storeKey: ENV_KEYS.log, alsoKeys: [ENV_KEYS.state], time: entry.time, measureKey: field.key,
        date: entry.time, measure: `cabin.${field.key}`, filter: "cabin",
        label: field.label, check: `Cabin · ${field.label}`, value, unit: field.unit,
        level: result.level, band: bands[field.key], order: FI.cabin * 1000 + fieldIndex
      })];
    });
  });
}
function visionRows(api) {
  const data = api.get(VISION_KEYS.vision, { results: [] }) || { results: [] };
  return resultsOf(data).flatMap((result) => {
    const eye = EYES.find((item) => item.id === result.eye);
    if (!eye) return [];
    const line = lineIndex(result);
    const symptoms = Array.isArray(result.symptoms) ? result.symptoms : [];
    const marks = result.grid && Array.isArray(result.grid.marks) ? result.grid.marks.length : 0;
    const urgent = symptoms.some((id) => RULES.urgentSymptoms.includes(id));
    const level = urgent ? "urgent" : symptoms.length ? "review" : "info";
    const order = FI.vision * 1000 + EYES.indexOf(eye) * 10;
    const base = { source: "vision", storeKey: VISION_KEYS.vision, resultId: result.id, date: result.date, filter: "vision", level };
    return [
      makeRow({ ...base, measure: `vision.${result.eye}.line`, label: `${eye.label} near line`, kind: "vision-line",
        check: `Vision · ${eye.label}`, value: line >= 0 ? line : 0, order,
        display: line >= 0 ? NEAR_LINES[line].snellen : "No line read" }),
      makeRow({ ...base, measure: `vision.${result.eye}.symptoms`, label: `${eye.label} symptoms`, history: false, value: symptoms.length, order: order + 1 }),
      makeRow({ ...base, measure: `vision.${result.eye}.marks`, label: `${eye.label} marked areas`, history: false, value: marks, order: order + 2 })
    ];
  });
}
function mindRows(api) {
  const rows = api.get(MENTAL_KEYS.history, []);
  const out = (Array.isArray(rows) ? rows : []).flatMap((entry) => {
    if (!entry || !entry.type || !entry.date || num(entry.score) == null) return [];
    const depression = entry.type === "depression";
    return [makeRow({
      source: "mental-history", storeKey: MENTAL_KEYS.history, alsoKeys: [MENTAL_KEYS.mental], date: entry.date, type: entry.type,
      measure: `mind.${entry.type}`, filter: "mind", label: depression ? "Isolation & depression score" : "Stress & burn-out score",
      check: depression ? "Mind · Isolation & depression" : "Mind · Stress & burn-out",
      value: Number(entry.score), band: [0, 10], level: entry.level || "info",
      display: `${entry.score}${entry.max ? `/${entry.max}` : ""} · ${entry.label || ""}`.trim(), order: FI.mind * 1000 + (depression ? 1 : 2)
    })];
  });
  const latest = api.get(MENTAL_KEYS.mental, null) || {};
  if (latest.mood && latest.mood.date && MOOD_SCORE[latest.mood.value]) {
    const score = MOOD_SCORE[latest.mood.value];
    out.push(makeRow({
      source: "mood", storeKey: MENTAL_KEYS.mental, date: latest.mood.date, measure: "mind.mood", filter: "mind",
      label: "Mood", check: "Mind · Mood", value: score, kind: "mood",
      display: `${latest.mood.value} (${score}/5)`, order: FI.mind * 1000
    }));
  }
  return out;
}
function immuneRows(api) {
  const state = api.get(IMMUNE_KEY, { log: {}, tests: [] }) || {};
  const log = state.log && typeof state.log === "object" ? state.log : {};
  const labels = Object.fromEntries(IMMUNE_SYMPTOMS);
  const out = Object.keys(log).flatMap((day) => {
    const symptoms = Array.isArray(log[day]) ? log[day] : [];
    const level = symptoms.includes("fever") || symptoms.length >= 3 ? "alert" : symptoms.length ? "review" : "ok";
    return [makeRow({
      source: "immune-log", storeKey: IMMUNE_KEY, day, date: dayAt(day), measure: "immune.symptoms", filter: "immune",
      label: "Daily symptoms", check: "Immune · Daily symptoms", value: symptoms.length,
      display: symptoms.length ? symptoms.map((id) => labels[id] || id).join(", ") : "No symptoms", level, order: FI.immune * 1000
    })];
  });
  (Array.isArray(state.tests) ? state.tests : []).forEach((test, index) => {
    const value = num(test && test.value);
    if (!test || value == null || !test.time) return;
    const unit = String(test.unit || "");
    out.push(makeRow({
      source: "immune-test", storeKey: IMMUNE_KEY, testId: test.id, date: test.time, measure: `immune.test.${test.name}::${unit}`,
      filter: "immune", label: test.name || "Lab result", check: `Immune test · ${test.name || "Result"}`, value, unit,
      display: `${value} ${unit}`.trim(), order: FI.immune * 1000 + 1 + index
    }));
  });
  return out;
}
function radiationRows(api, profile) {
  const state = api.get(RADIATION_KEY, { prior: 0, entries: [] }) || {};
  const entries = (Array.isArray(state.entries) ? state.entries : [])
    .filter((entry) => entry && num(entry.dose) != null).slice()
    .sort((a, b) => new Date(a.day || a.time) - new Date(b.day || b.time));
  let total = Number(state.prior) || 0;
  const out = [];
  entries.forEach((entry) => {
    const dose = Number(entry.dose);
    total += dose;
    const date = entry.time || dayAt(entry.day);
    out.push(makeRow({
      source: "radiation", storeKey: RADIATION_KEY, entryId: entry.id, date, measure: "radiation.daily", filter: "radiation",
      label: "Daily dose", check: "Radiation · Daily dose", value: dose, unit: "mSv", agg: "sum", order: FI.radiation * 1000
    }));
    out.push(makeRow({
      source: "radiation", storeKey: RADIATION_KEY, entryId: entry.id, date, history: false, measure: "radiation.cumulative",
      filter: "radiation", label: "Cumulative dose", check: "Radiation · Cumulative dose", value: total, unit: "mSv",
      level: levelForPct(careerShare(total)), agg: "last", order: FI.radiation * 1000 + 1
    }));
  });
  const mission = { missionDay: profile && profile.startDate ? missionDayFor(profile) : null, total: totalFor(profile) };
  return { rows: out, projection: entries.length ? radiationCalc(state, mission).projected : null };
}
function nutritionRows(api, profile) {
  const state = api.get(NUTRITION_KEY, { entries: [], eva: {}, af: 1.11, lib: [] }) || {};
  const entries = Array.isArray(state.entries) ? state.entries : [];
  const out = [];
  entries.forEach((entry, index) => {
    if (!entry || !entry.time) return;
    const kcal = num(entry.kcal) || 0;
    const fluid = num(entry.fluid) || 0;
    out.push(makeRow({
      source: "nutrition", storeKey: NUTRITION_KEY, entryId: entry.id, date: entry.time, measure: "nutrition.meal",
      filter: "nutrition", chart: false, label: "Meal", check: `Nutrition · ${entry.meal || "Food"}`,
      value: kcal || fluid, unit: kcal ? "kcal" : "mL",
      display: `${entry.name || entry.meal || "Food"} · ${Math.round(kcal || fluid)} ${kcal ? "kcal" : "mL"}`,
      order: FI.nutrition * 1000 + index
    }));
  });
  const days = new Map();
  entries.forEach((entry) => {
    const day = dayOf(entry.time);
    if (!day) return;
    if (!days.has(day)) days.set(day, []);
    days.get(day).push(entry);
  });
  const fields = [
    { key: "kcal", unit: "kcal", label: "Calories" }, { key: "prot", unit: "g", label: "Protein" },
    { key: "fluid", unit: "mL", label: "Water" }
  ];
  days.forEach((list, day) => {
    const totals = totalsOf(list);
    const target = targets(profile, Number((state.eva || {})[day]) || 0, state.af || 1.11);
    fields.forEach((field, fieldIndex) => {
      const value = totals[field.key];
      if (value == null) return;
      const band = target ? (field.key === "kcal" ? [target.kcal * 0.95, target.kcal * 1.05]
        : field.key === "prot" ? target.protein : null) : null;
      out.push(makeRow({
        source: "nutrition", storeKey: NUTRITION_KEY, date: dayAt(day), measure: `nutrition.${field.key}`,
        filter: "nutrition", history: false, label: field.label, check: `Nutrition · ${field.label}`, value,
        unit: field.unit, band, order: FI.nutrition * 1000 + 10 + fieldIndex
      }));
    });
  });
  return out;
}
function exerciseRows(api) {
  const list = api.get(EXERCISE_KEY, []);
  const sessions = Array.isArray(list) ? list : [];
  const out = [];
  const byDay = new Map();
  sessions.forEach((session, index) => {
    const minutes = num(session && session.values && session.values.minutes);
    if (!session || !session.date || minutes == null) return;
    out.push(makeRow({
      source: "exercise", storeKey: EXERCISE_KEY, index, date: session.date, measure: "exercise.session",
      filter: "exercise", chart: false, label: "Session", check: `Exercise · ${session.title || session.type || "Session"}`,
      value: minutes, unit: "min", display: `${session.title || session.type || "Session"} · ${minutes} min`,
      order: FI.exercise * 1000
    }));
    const day = dayOf(session.date);
    if (!day) return;
    const bucket = byDay.get(day) || { minutes: 0, count: 0 };
    bucket.minutes += minutes;
    bucket.count += 1;
    byDay.set(day, bucket);
  });
  const days = [...byDay.keys()].sort();
  if (days.length) {
    const end = parseIso(days[days.length - 1]);
    for (const cursor = parseIso(days[0]); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      const day = isoDay(cursor);
      const today = byDay.get(day) || { minutes: 0 };
      const week = new Date(cursor.getTime() - 6 * DAY);
      const weekly = [...byDay.entries()].filter(([key]) => new Date(parseIso(key)) >= week && new Date(parseIso(key)) <= cursor)
        .reduce((sum, [, value]) => sum + value.minutes, 0);
      out.push(makeRow({
        source: "exercise", storeKey: EXERCISE_KEY, date: dayAt(day), measure: "exercise.minutes", filter: "exercise",
        history: false, label: "Training minutes", check: "Exercise · Minutes", value: today.minutes, unit: "min",
        band: [30, 180], agg: "sum", order: FI.exercise * 1000 + 10
      }));
      out.push(makeRow({
        source: "exercise", storeKey: EXERCISE_KEY, date: dayAt(day), measure: "exercise.weekly", filter: "exercise",
        history: false, label: "Weekly training", check: "Exercise · Weekly minutes", value: weekly, unit: "min",
        agg: "last", order: FI.exercise * 1000 + 11
      }));
    }
  }
  const missions = api.get(MISSIONS_KEY, null) || {};
  (Array.isArray(missions.vo2) ? missions.vo2 : []).forEach((test, index) => {
    if (!test || num(test.value) == null || !test.time) return;
    out.push(makeRow({
      source: "vo2", storeKey: MISSIONS_KEY, index, date: test.time, measure: "exercise.vo2", filter: "exercise",
      label: "VO₂max", check: "Exercise · VO₂max", value: Number(test.value), unit: "mL/kg/min", order: FI.exercise * 1000 + 20
    }));
  });
  return out;
}
export function readProgress(api, profile = null) {
  if (!api) return { rows: [], projection: null };
  const radiation = radiationRows(api, profile);
  const rows = [...bodyRows(api, profile), ...visionRows(api), ...mindRows(api), ...immuneRows(api), ...radiation.rows,
    ...cabinRows(api), ...nutritionRows(api, profile), ...exerciseRows(api)];
  rows.sort((a, b) => new Date(b.date) - new Date(a.date) || a.order - b.order);
  return { rows, projection: radiation.projection };
}
export function measuresOf(rows) {
  const map = new Map();
  rows.forEach((row) => {
    if (!row.chart || map.has(row.measure)) return;
    map.set(row.measure, { id: row.measure, filter: row.filter, label: row.label, unit: row.unit, band: row.band, agg: row.agg, order: row.order, kind: row.kind });
  });
  return [...map.values()].sort((a, b) => a.order - b.order);
}
export function seriesFor(rows, measure, fromDay = null) {
  const points = rows.filter((row) => row.chart && row.measure === measure.id)
    .filter((row) => !fromDay || dayOf(row.date) >= fromDay)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const days = new Map();
  points.forEach((row) => {
    const day = dayOf(row.date);
    if (!day) return;
    const bucket = days.get(day) || { values: [] };
    bucket.values.push(row.value);
    days.set(day, bucket);
  });
  const ordered = [...days.keys()].sort();
  return {
    labels: ordered.map((day) => dateLabel(dayAt(day))),
    dates: ordered.map((day) => dayAt(day)),
    values: ordered.map((day) => {
      const values = days.get(day).values;
      if (measure.agg === "last") return values[values.length - 1];
      if (measure.agg === "sum") return values.reduce((sum, value) => sum + value, 0);
      return mean(values);
    })
  };
}
export function statsFor(list, now = Date.now()) {
  const when = (entry) => new Date(entry.date || entry.time).getTime();
  const current = list.filter((entry) => now - when(entry) < 7 * DAY && when(entry) <= now);
  const previous = list.filter((entry) => now - when(entry) >= 7 * DAY && now - when(entry) < 14 * DAY);
  return { n: current.length, cur: mean(current.map((entry) => entry.value)), prev: mean(previous.map((entry) => entry.value)) };
}
export function arrow(cur, prev) {
  if (cur == null || prev == null || prev === 0) return { txt: "—", cls: "flat" };
  const delta = ((cur - prev) / Math.abs(prev)) * 100;
  return Math.abs(delta) < 1 ? { txt: "no change", cls: "flat" } : { txt: `${delta > 0 ? "+" : "-"}${Math.abs(delta).toFixed(1)}%`, cls: delta > 0 ? "up" : "down" };
}
export function weekComparison(rows, now = Date.now()) {
  return measuresOf(rows).map((measure) => ({ measure, ...statsFor(rows.filter((row) => row.chart && row.measure === measure.id), now), change: null }))
    .map((entry) => ({ ...entry, change: arrow(entry.cur, entry.prev) })).filter((entry) => entry.cur != null || entry.prev != null);
}
export function fmtNum(value) {
  return value == null || !Number.isFinite(value) ? "—" : (Math.abs(value) >= 100 ? String(Math.round(value)) : String(Math.round(value * 100) / 100));
}
export function formatValue(measure, value) {
  if (measure && measure.kind === "vision-line") { const line = NEAR_LINES[Math.round(value)]; return line ? line.snellen : "No line read"; }
  return measure && measure.kind === "mood" ? (MOOD_LABEL[Math.round(value)] || String(value)) : fmtNum(value);
}
export function dateLabel(iso) {
  const date = new Date(iso);
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}
export function missionLabel(iso, profile) {
  const day = profile ? missionDayFor(profile, new Date(iso)) : null;
  return day == null || day < 1 ? "" : `Mission day ${day}`;
}
export const fromDayFor = (days, now = new Date()) => (days ? isoDay(new Date(now.getTime() - (days - 1) * DAY)) : null);
const clone = (value) => { try { return JSON.parse(JSON.stringify(value)); } catch { return value; } }; const omit = (object, key) => { const next = { ...(object || {}) }; delete next[key]; return next; };
const withoutKey = (entry, key) => ({ ...entry, readings: omit(entry.readings, key) });
function nextValue(source, current, row) {
  if (source === "mental-history") return (Array.isArray(current) ? current : []).filter((entry) => !(entry && entry.date === row.date && entry.type === row.type));
  if (source === "checkup") {
    return (Array.isArray(current) ? current : []).map((record) => {
      if (!record || record.part !== row.part || record.time !== row.time || !record.values) return record;
      return { ...record, values: omit(record.values, row.measureKey) };
    }).filter((record) => record && record.part && Object.keys(record.values || {}).length);
  }
  if (source === "env") {
    return (Array.isArray(current) ? current : []).map((entry) => (entry && entry.time === row.time ? withoutKey(entry, row.measureKey) : entry))
      .filter((entry) => entry && entry.readings && Object.keys(entry.readings).length);
  }
  if (source === "vision") return { ...current, results: (current && Array.isArray(current.results) ? current.results : []).filter((result) => result.id !== row.resultId) };
  if (source === "mood") return omit(current, "mood");
  if (source === "immune-log") return { ...current, log: omit(current && current.log, row.day) };
  if (source === "immune-test") return { ...current, tests: ((current && current.tests) || []).filter((test) => test.id !== row.testId) };
  if (source === "radiation") return { ...current, entries: ((current && current.entries) || []).filter((entry) => entry.id !== row.entryId) };
  if (source === "nutrition") return { ...current, entries: ((current && current.entries) || []).filter((entry) => entry.id !== row.entryId) };
  if (source === "exercise") return (Array.isArray(current) ? current : []).filter((_, index) => index !== row.index);
  if (source === "vo2") return { ...current, vo2: ((current && current.vo2) || []).filter((_, index) => index !== row.index) };
  return current;
}
function envStateAfter(state, row) {
  if (!state || state.time !== row.time || !state.readings) return state;
  const readings = omit(state.readings, row.measureKey);
  return Object.keys(readings).length ? { ...state, readings } : { ...state, readings: null, time: null };
}
function mentalAfterLatest(current, row) {
  const latest = current && current[row.type];
  return !latest || latest.date !== row.date ? current : omit(current, row.type);
}
export function deleteRow(api, row) {
  if (!api || !row) return null;
  const keys = [row.storeKey, ...(row.alsoKeys || [])];
  const snapshot = keys.map((key) => [key, clone(api.get(key, null))]);
  const current = api.get(row.storeKey, null);
  const next = nextValue(row.source, current, row);
  if (next === current) return null;
  api.set(row.storeKey, next);
  if (row.source === "env") {
    const state = api.get(ENV_KEYS.state, null);
    const updated = envStateAfter(state, row);
    if (updated !== state) api.set(ENV_KEYS.state, updated);
  }
  if (row.source === "mental-history") {
    const latest = api.get(MENTAL_KEYS.mental, null);
    const updated = mentalAfterLatest(latest, row);
    if (updated !== latest) api.set(MENTAL_KEYS.mental, updated);
  }
  return () => snapshot.forEach(([key, value]) => api.set(key, clone(value)));
} export function syncProgress() {}
