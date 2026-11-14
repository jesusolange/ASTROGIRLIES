// Immune watch logic: daily symptom check, saliva and blood test notes, findings and section registration.
// No reference range is applied to the test values: the page shows them against your own earlier results.
// This is a self-monitoring aid, not a diagnosis.
const KEY = "astromed-immune";
const read = (key, fallback) => globalThis.AstroMedStore.store.get(key, fallback);
const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const ageDays = (iso) => (Date.now() - new Date(iso).getTime()) / 864e5;

export const SYMPTOMS = [
  ["fever", "Fever or chills"], ["throat", "Sore throat"], ["cough", "Cough or runny nose"],
  ["rash", "Skin rash or itching"], ["sores", "Cold sores or mouth sores"], ["tired", "Very tired, more than usual"], ["heal", "Cuts or sores heal slowly"]
];
export const EMPTY_IMMUNE = { log: {}, tests: [] };
export const ACTIONS = {
  ok: "No warning signs today. Keep sleeping, eating and training well to support your defenses.",
  review: "Rest more, drink water and watch for changes, and repeat this check tomorrow. If symptoms last more than 2 days, keep resting and drinking and follow your emergency plan if breathing or chest symptoms start. If Earth contact exists, also tell the flight surgeon.",
  alert: "Rest, drink water and measure your temperature again after 30 minutes; keep your tasks light and follow your emergency plan if breathing or chest symptoms start. If Earth contact exists, also tell the flight surgeon."
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
  const R = window.AstroMedRadiation && window.AstroMedRadiation.status();
  if (R && R.hasData && R.level !== "ok") out.push("High radiation dose");
  const N = window.AstroMedNutrition && window.AstroMedNutrition.summary();
  if (N && N.ratio < 0.8) out.push("Eating too little");
  const sessions = read("astrotwin-exercise-sessions", []);
  const exercise = (Array.isArray(sessions) ? sessions : []).filter((s) => s && ageDays(s.date) < 7).length;
  if (exercise < 2) out.push("Little exercise");
  return out;
}

export function status() {
  const day = isoDay(new Date());
  const log = immuneState().log;
  const sym = log[day] || [];
  const risks = riskFactors();
  let level = "ok";
  if (sym.includes("fever") || sym.length >= 3) level = "alert";
  else if (sym.length >= 1 || risks.length >= 3) level = "review";
  return { sym, risks, level, saved: day in log };
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

if (typeof window !== "undefined") window.AstroMedImmune = { status, findings };

function registerImmune() {
  if (!window.AstroMedNav) { setTimeout(registerImmune, 20); return; }
  window.AstroMedNav.register({ id: "immune", label: "Immune watch", icon: "ic-mental", before: "radiation" });
}

document.addEventListener("DOMContentLoaded", registerImmune);
