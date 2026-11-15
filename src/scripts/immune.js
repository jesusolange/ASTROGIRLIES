// Immune watch logic: the daily symptom check, saliva and blood results, findings and the stored records.
// No reference range is applied to the test values: they are shown against your own earlier results.
// The symptom thresholds and the lab return interval are our design choices. This is a self-monitoring aid, not a diagnosis.
import { alsoTell } from "./mission.js";
import { daysSince, intervalFor } from "./home.js";
import { currentMission, rankedRisks } from "./risks.js";
import { TOPIC_BY_ID } from "../data/topics.js";

export const KEY = "astromed-immune";
const read = (key, fallback) => globalThis.AstroMedStore?.store ? globalThis.AstroMedStore.store.get(key, fallback) : fallback;
const write = (key, value) => {
  if (globalThis.AstroMedStore?.store) globalThis.AstroMedStore.store.set(key, value);
  return value;
};
const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const ageDays = (iso) => (Date.now() - new Date(iso).getTime()) / 864e5;

export const SYMPTOMS = [
  ["fever", "Fever or chills"], ["throat", "Sore throat"], ["cough", "Cough or runny nose"],
  ["rash", "Skin rash or itching"], ["sores", "Cold sores or mouth sores"], ["tired", "Very tired, more than usual"], ["heal", "Cuts or sores heal slowly"]
];
export const EMPTY_IMMUNE = { log: {}, tests: [] };
const tell = () => {
  const sentence = alsoTell();
  return sentence ? ` ${sentence}` : "";
};

export const ACTIONS = {
  get ok() { return "No warning signs today. Keep sleeping, eating and training well to support your defenses."; },
  get review() { return "Rest more, drink water and watch for changes, and repeat this check tomorrow. If symptoms last more than 2 days, keep resting and drinking and follow your emergency plan if breathing or chest symptoms start." + tell(); },
  get alert() { return "Rest, drink water and measure your temperature again after 30 minutes; keep your tasks light and follow your emergency plan if breathing or chest symptoms start." + tell(); }
};
const LABEL = Object.fromEntries(SYMPTOMS);

export function immuneState() {
  const value = read(KEY, {}) || {};
  return { log: value.log && typeof value.log === "object" ? value.log : {}, tests: Array.isArray(value.tests) ? value.tests : [] };
}

export function riskFactors() {
  const out = [];
  const mental = read("astromed-mental", {}) || {};
  if (mental.stress && ageDays(mental.stress.date) < 14 && mental.stress.level !== "ok") out.push("High stress");
  const recs = read("astrotwin-gui-v2-records", []);
  const brain = (Array.isArray(recs) ? recs : []).find((x) => x && x.part === "brain" && x.values && Number.isFinite(Number(x.values.sleep)) && ageDays(x.time) < 4);
  if (brain && Number(brain.values.sleep) < 6) out.push("Little sleep");
  const R = typeof window !== "undefined" && window.AstroMedRadiation ? window.AstroMedRadiation.status() : null;
  if (R && R.hasData && R.level !== "ok") out.push("High radiation dose");
  const N = typeof window !== "undefined" && window.AstroMedNutrition ? window.AstroMedNutrition.summary() : null;
  if (N && N.ratio < 0.8) out.push("Eating too little");
  const sessions = read("astrotwin-exercise-sessions", []);
  const exercise = (Array.isArray(sessions) ? sessions : []).filter((s) => s && ageDays(s.date) < 7).length;
  if (exercise < 2) out.push("Little exercise");
  return out;
}

// Symptoms as selected now. Used both for the live card and for the stored day.
export function assess(sym, risks = []) {
  const list = Array.isArray(sym) ? sym.filter((id) => LABEL[id]) : [];
  let level = "ok";
  if (list.includes("fever") || list.length >= 3) level = "alert";
  else if (list.length >= 1 || risks.length >= 3) level = "review";
  return { sym: list, risks, level, saved: false };
}

export function status(now = new Date()) {
  const day = isoDay(now);
  const log = immuneState().log;
  const sym = log[day] || [];
  return { ...assess(sym, riskFactors()), saved: day in log };
}

export function saveSymptoms(sym, now = new Date()) {
  const day = isoDay(now);
  const state = immuneState();
  const before = state.log[day] || null;
  const log = { ...state.log, [day]: sym };
  write(KEY, { ...state, log });
  return () => {
    const current = immuneState();
    const nextLog = { ...current.log };
    if (before) nextLog[day] = before;
    else delete nextLog[day];
    write(KEY, { ...current, log: nextLog });
  };
}

export function symptomRows(state = immuneState()) {
  return Object.keys(state.log || {}).sort().reverse().map((day) => ({ day, symptoms: state.log[day] || [] }));
}

export function addTest(entry, now = new Date().toISOString()) {
  const state = immuneState();
  const test = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    time: now,
    kind: entry.kind === "blood" ? "blood" : "saliva",
    name: entry.name,
    value: Number(entry.value),
    unit: entry.unit,
    note: entry.note || ""
  };
  write(KEY, { ...state, tests: [...state.tests, test] });
  return { test, undo: () => removeTest(test.id) };
}

export function removeTest(id) {
  const state = immuneState();
  const before = state.tests;
  write(KEY, { ...state, tests: state.tests.filter((test) => test.id !== id) });
  return () => write(KEY, { ...immuneState(), tests: before });
}

export function latestTest(state = immuneState()) {
  return state.tests.slice().sort((a, b) => new Date(b.time) - new Date(a.time))[0] || null;
}

// The immune topic's return interval, from the mission's NASA rating (our design choice).
export function immuneIntervalDays() {
  const topic = TOPIC_BY_ID.get("immune");
  if (!topic) return 7;
  const score = rankedRisks(currentMission().id)
    .reduce((max, risk) => (topic.riskIds.includes(risk.id) ? Math.max(max, risk.score || 0) : max), 0);
  return intervalFor(score).days;
}

export function labDue(now = new Date()) {
  const test = latestTest();
  if (!test || !test.time) return true;
  return daysSince(isoDay(new Date(test.time)), now) >= immuneIntervalDays();
}

export function findings() {
  const s = status();
  if (s.level === "ok" && !s.saved) return [];
  const saw = s.sym.length
    ? `Today you marked: ${s.sym.map((id) => (LABEL[id] || id).toLowerCase()).join(", ")}.`
    : s.risks.length ? `Risk factors now: ${s.risks.join(", ")}.` : "No symptoms today.";
  return [{ level: s.level, title: "Immune watch", saw, todo: ACTIONS[s.level] }];
}

export function testRows(tests) {
  const sorted = tests.slice().sort((a, b) => new Date(a.time) - new Date(b.time));
  const previous = {};
  return sorted.map((test) => {
    const key = `${test.name}|${test.unit}`;
    const before = previous[key] ? previous[key].value : null;
    previous[key] = test;
    return { ...test, before };
  }).reverse();
}

export { LABEL as SYMPTOM_LABEL };

if (typeof window !== "undefined") window.AstroMedImmune = { status, findings };
