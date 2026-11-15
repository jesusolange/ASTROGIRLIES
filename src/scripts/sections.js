/* ==============================================
   ASTROMED — SHARED ANALYSIS
   The metric rules and the saved-results model that the report and the
   Progress charts read through window.AstroMedData. Interface code lives
   in the Preact components under src/components/.
============================================== */

import { analyzeMental } from "./mental.js";
import { ntxRange } from "./health-indicators.js";
import { alsoTell } from "./mission.js";

const tell = (who) => {
  const sentence = alsoTell(who);
  return sentence ? ` ${sentence}` : "";
};

const KEYS = {
  mental: "astromed-mental",
  records: "astrotwin-gui-v2-records",
  exercise: "astrotwin-exercise-sessions"
};

const load = (k, fb) => window.AstroMedStore.store.get(k, fb);

/* ==========================================
   DAILY CHECKUP DATA (read from the checkup records)
========================================== */

const SYSTEM_META = {
  heart: { title: "Cardiovascular System", f: { hr: ["Heart rate", "bpm"], sys: ["Systolic BP", "mmHg"], dia: ["Diastolic BP", "mmHg"], hrv: ["HRV", "ms"] } },
  lungs: { title: "Respiratory System", f: { resp: ["Respiratory rate", "breaths/min"], spo2: ["SpO₂", "%"] } },
  bones: { title: "Bone & Skeletal System", f: { bmd: ["Reference BMD", "g/cm²"], exercise: ["Resistance exercise", "min"], ntx: ["N-telopeptide (urine)", "nmol/mmol creat."] } },
  kidneys: { title: "Renal & Urinary Health", f: { urineOutput: ["Urine output", "mL"], collectionHours: ["Collection period", "h"], weightKg: ["Body weight", "kg"], fluidIntake: ["Fluid intake", "mL"] } },
  brain: { title: "Sleep & Cognition", f: { sleep: ["Sleep duration", "h"], deepSleep: ["Deep sleep (1 to 4)", "/4"], reaction: ["Reaction time", "ms"], mood: ["Mood (self-report)", "/10"] } },
  hand: { title: "Temperature & Glucose", f: { skin: ["Skin temperature", "°C"], bodyTemp: ["Oral body temperature", "°C"], glucose: ["Blood glucose", "mg/dL"] } },
  env: { title: "Environment", f: { temp: ["Cabin temperature", "°C"], pressure: ["Cabin pressure", "kPa"], humidity: ["Humidity", "%"], co2: ["Carbon dioxide (CO₂)", "ppm"], noise: ["Noise level", "dB"], radiation: ["Radiation dose rate", "µSv/h"] } },
  muscles: { title: "Muscular System", f: { activity: ["Activity", "min"], strength: ["Training load", "kg"] } }
};

// Latest saved record per body system: { part: { title, date, values: { key: {label, unit, value} } } }
function getCheckups() {
  const recs = load(KEYS.records, []);
  const out = {};
  (Array.isArray(recs) ? recs : []).forEach(r => {
    if (!r || !r.part || out[r.part]) return;      // newest first
    const meta = SYSTEM_META[r.part] || { title: r.part, f: {} };
    const values = {};
    Object.entries(r.values || {}).forEach(([k, v]) => {
      if (!Number.isFinite(Number(v))) return;
      const [label, unit] = meta.f[k] || [k, ""];
      values[k] = { label, unit, value: Number(v) };
    });
    if (Object.keys(values).length) out[r.part] = { title: meta.title, date: r.time, values };
  });
  return out;
}

/* ==========================================
   ANALYSIS — shared by Today, Progress and the report
   Each item: { level, title, saw, todo }
========================================== */

const R = (level, saw, todo) => ({ level, saw, todo });

const METRIC_RULES = {
  hr: v => v < 60 ? R("review", "Heart rate below 60 bpm.", "Rest, hydrate and note any dizziness or fatigue. If you are not a trained athlete or feel unwell, measure again after 10 minutes and stay seated until you feel steady." + tell())
    : v > 100 ? R("review", "Heart rate above 100 bpm.", "Rest 5–10 minutes, breathe slowly and measure again. If it stays high or you have chest discomfort, sit down, avoid exertion and measure every 10 minutes." + tell())
    : R("ok", "Heart rate within the reference band.", "Keep your routine and measure at a similar time each day."),
  sys: v => v < 90 ? R("review", "Systolic pressure is low.", "Hydrate, stand up slowly and note any dizziness or fainting.")
    : v < 120 ? R("ok", "Systolic pressure within the reference band.", "Keep up exercise and hydration.")
    : v <= 180 ? R("review", "Systolic pressure above the reference.", "Re-measure after 5 minutes of rest, limit salt and keep a record of repeated high readings.")
    : R("alert", "Systolic pressure very high.", "Sit down, stay calm and re-measure after 5 minutes. Avoid exertion and note headache, vision changes or chest pain." + tell()),
  dia: v => v < 60 ? R("review", "Diastolic pressure is low.", "Hydrate and note any dizziness.")
    : v < 80 ? R("ok", "Diastolic pressure within the reference band.", "Keep up exercise and hydration.")
    : v <= 120 ? R("review", "Diastolic pressure above the reference.", "Re-measure after rest and keep a record of repeated high readings.")
    : R("alert", "Diastolic pressure very high.", "Sit down, stay calm and re-measure after 5 minutes. Avoid exertion and record the reading." + tell()),
  resp: v => v < 12 || v >= 19 ? R("review", "Breathing rate outside the reference band.", "Measure again at rest, check cabin air and CO₂ alerts, and report shortness of breath.")
    : R("ok", "Breathing rate within the reference band.", "Keep the routine."),
  spo2: v => v < 92 ? R("alert", "Oxygen saturation is low.", "Check your sensor, sit down and breathe slowly. Re-measure; if it stays low, stop activity and keep the cabin air clean." + tell())
    : v < 95 ? R("review", "Oxygen saturation slightly low.", "Re-measure at rest with warm hands and check cabin air quality.")
    : R("ok", "Oxygen saturation within the reference band.", "Keep the routine."),
  sleep: v => v < 6 ? R("review", "You slept less than 6 hours.", "Protect your sleep window, dim lights and limit screens and caffeine before bed.")
    : v > 9 ? R("review", "You slept more than 9 hours.", "Long sleep can signal fatigue or low mood. Watch the trend and mention it if it continues.")
    : R("ok", "Sleep duration looks healthy.", "Keep a steady schedule."),
  mood: v => v <= 4 ? R("review", "Your self-reported mood is low.", "Take the Mental Health check-in and write down what you notice." + tell())
    : R("ok", "Self-reported mood is fine.", "Keep tracking it."),
  fluidIntake: v => v < 1500 ? R("review", "Fluid intake is low.", "Drink regularly during the day and follow your hydration plan.")
    : R("ok", "Fluid intake looks fine.", "Keep following your hydration plan."),
  activity: v => v < 30 ? R("review", "Activity time is low.", "Crew members train about 2 hours a day to protect bones and muscles. Log a session in Exercise & Recovery.")
    : R("ok", "Activity time looks fine.", "Keep following your plan."),
  exercise: v => v < 30 ? R("review", "Exercise time is low.", "Crew members train about 2 hours a day to protect bones and muscles. Log a session in Exercise & Recovery.")
    : R("ok", "Exercise time looks fine.", "Keep following your plan.")
};
METRIC_RULES.glucose = v => v < 54 ? R("alert", "Blood glucose is very low.", "Eat or drink 15 g of fast carbohydrate now, re-measure in 15 minutes and stay still until it rises." + tell())
  : v < 70 ? R("review", "Blood glucose is low.", "Take 15 g of fast carbohydrate, re-measure in 15 minutes and note what you ate and when you trained.")
  : v <= 99 ? R("ok", "Blood glucose within the reference band.", "Keep regular meals and hydration.")
  : v <= 125 ? R("review", "Blood glucose above the fasting reference.", "Measure again fasting (8 hours without food). Review meals and training, and record it if it repeats.")
  : v <= 250 ? R("review", "Blood glucose is high.", "Re-measure, drink water and avoid sugary food. Keep a record of repeated high readings." + tell())
  : R("alert", "Blood glucose is very high.", "Drink water, avoid sugary food and re-measure. Keep a record of the readings." + tell());
METRIC_RULES.pulse = METRIC_RULES.hr;
METRIC_RULES.ntx = v => {
  const range = ntxRange((window.AstroMedProfile && window.AstroMedProfile.get()) || {});
  const r = [range.low, range.high];
  if (v > r[1]) return R("review", `N-telopeptide is above the usual range (${r[0]}–${r[1]}). Bone may be breaking down faster.`, "Take vitamin D and keep resistive exercise. Repeat the test and record the trend." + tell("the flight surgeon about a bisphosphonate"));
  if (v < r[0]) return R("review", `N-telopeptide is below the usual range (${r[0]}–${r[1]}).`, "Repeat the test and record the result." + tell());
  return R("ok", `N-telopeptide is in the usual range (${r[0]}–${r[1]}).`, "Keep your resistive exercise and vitamin D.");
};
METRIC_RULES.bodyTemp = v => v < 36 ? R("review", "Body temperature is low.", "Warm up, check your suit or cabin temperature and measure again.")
  : v <= 37.8 ? R("ok", "Body temperature within the reference band.", "Keep your routine.")
  : v <= 38.5 ? R("review", "Mild fever range.", "Rest, hydrate and re-measure in 1 hour. Record it if it persists or you have other symptoms.")
  : R("alert", "High temperature.", "Rest, drink water and cool the cabin. Re-measure in 15 minutes and avoid exertion." + tell());

const GENERIC = R("info", "Value saved.", "Compare it with your personal baseline and trend over the next days.");

function analyze() {
  const checkups = getCheckups();
  const sessions = load(KEYS.exercise, []);
  const out = { urgent: [], mental: [], checkup: [], exercise: [], hasData: false };

  /* ---- Mental health ---- */
  const mental = analyzeMental();
  if (mental.hasData) out.hasData = true;
  out.mental.push(...mental.mental);
  out.urgent.push(...mental.urgent);

  /* ---- Daily checkup ---- */
  Object.values(checkups).forEach(c => {
    out.hasData = true;
    Object.entries(c.values).forEach(([name, o]) => {
      const r = (METRIC_RULES[name] || (() => GENERIC))(o.value);
      if (r.level === "info") return;   // no reference range: shown in the report tables only
      out.checkup.push({
        level: r.level,
        title: `${c.title} · ${o.label}: ${o.value}`,
        saw: r.saw,
        todo: r.todo
      });
    });
  });

  /* ---- Environment ---- */
  if (window.AstroMedEnv) {
    window.AstroMedEnv.findings().forEach(f => {
      out.hasData = true;
      out.checkup.push({ level: f.level, title: f.title, saw: f.saw, todo: f.todo });
    });
  }

  /* ---- Radiation, immune, readiness, nutrition, fitness ---- */
  const extra = (obj, fn, cat) => { try { ((obj && obj[fn] && obj[fn]()) || []).forEach(f => { out.hasData = true; if (f.level === "info") return; out[cat].push({ level: f.level, title: f.title, saw: f.saw, todo: f.todo }); }); } catch (e) { console.error(fn, e); } };
  extra(window.AstroMedReadiness, "findings", "checkup");
  extra(window.AstroMedRadiation, "findings", "checkup");
  extra(window.AstroMedReadiness, "immuneFindings", "checkup");
  extra(window.AstroMedNutrition, "findings", "exercise");
  extra(window.AstroMedMissions, "findings", "exercise");

  /* ---- Exercise ---- */
  if (sessions.length) {
    out.hasData = true;
    const week = sessions.filter(s => Date.now() - new Date(s.date) < 7 * 864e5);
    const types = new Set(week.map(s => s.type));
    const missing = ["ared", "t2", "cevis"].filter(t => !types.has(t)).map(t => t.toUpperCase());
    out.exercise.push(week.length < 3
      ? { level: "review", title: "Training this week", saw: `${week.length} session(s) logged in the last 7 days.`,
          todo: "Try to train most days. Exercise protects bones and muscles and also helps mood and sleep." }
      : { level: "ok", title: "Training this week", saw: `${week.length} sessions logged in the last 7 days.`,
          todo: "Keep following your plan." });
    if (week.length && missing.length) out.exercise.push({
      level: "review", title: "Training variety",
      saw: `No ${missing.join(", ")} session in the last 7 days.`,
      todo: "Combine resistance (ARED) for bones and muscles with running (T2) or cycling (CEVIS) for the heart."
    });
  } else {
    out.exercise.push({
      level: "review", title: "Training",
      saw: "No exercise sessions logged yet.",
      todo: "Log your next session in Exercise & Recovery so your recovery can be followed."
    });
  }

  return out;
}

window.AstroMedData = { getCheckups, SYSTEM_META, rule: (k, v) => (window.AstroMedEnv && window.AstroMedEnv.rule(k, v)) || (METRIC_RULES[k] || (() => GENERIC))(v), analyze, KEYS, load };
