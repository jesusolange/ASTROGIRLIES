/* The body checks: one system per card, its fields and the stored record shape.
   Records keep { part, values, time, source } so Progress, the report and the CSV export read the
   same data. Only values the astronaut enters are saved. */

import { bandFor, scaleFor } from "./health-indicators.js";

export const RECORDS_KEY = "astrotwin-gui-v2-records";
export const MAX_RECORDS = 1000;

export const SYSTEMS = {
  brain: {
    label: "Brain",
    title: "Sleep & Cognition",
    sub: "Sleep duration · Mood · Reaction test",
    description:
      "Sleep and task-performance trends can inform crew wellness monitoring, but do not establish a mental-health diagnosis.",
    fields: [
      { key: "sleep", label: "Sleep duration", unit: "h", typical: 7.2, min: 0, max: 24, step: 0.1 },
      { key: "deepSleep", label: "Deep sleep (1 to 4)", unit: "/4", typical: 3, min: 1, max: 4, step: 1 },
      { key: "reaction", label: "Reaction time", unit: "ms", typical: 285, min: 0, max: 3000, step: 1 },
      { key: "mood", label: "Mood (self-report)", unit: "/10", typical: 7, min: 1, max: 10, step: 1 }
    ]
  },
  lungs: {
    label: "Lungs",
    title: "Respiratory System",
    sub: "Respiratory rate · Oxygen saturation",
    description:
      "Respiratory measures help a health assessment when they are read with symptoms, context and validated instruments.",
    fields: [
      { key: "resp", label: "Respiratory rate", unit: "breaths/min", typical: 16, min: 0, max: 80, step: 1 },
      { key: "spo2", label: "SpO₂", unit: "%", typical: 98, min: 0, max: 100, step: 1 }
    ]
  },
  heart: {
    label: "Heart",
    title: "Cardiovascular System",
    sub: "Heart rate · Blood pressure · HRV",
    description:
      "Monitor heart activity and compare changes over time. A reading by itself does not establish the cause of a physiological change.",
    fields: [
      { key: "hr", label: "Heart rate", unit: "bpm", typical: 76, min: 0, max: 250, step: 1 },
      { key: "sys", label: "Systolic BP", unit: "mmHg", typical: 118, min: 0, max: 300, step: 1 },
      { key: "dia", label: "Diastolic BP", unit: "mmHg", typical: 76, min: 0, max: 220, step: 1 },
      { key: "hrv", label: "HRV", unit: "ms", typical: 42, min: 0, max: 400, step: 1 }
    ]
  },
  kidneys: {
    label: "Kidneys",
    title: "Renal & Urinary Health",
    sub: "Urine output · Fluid intake · Output rate",
    description:
      "Record urine volume with a measurement period and body weight. The average urine output rate is a calculated observation, not a diagnosis of kidney disease or dehydration.",
    fields: [
      { key: "urineOutput", label: "Urine output", unit: "mL", typical: 1500, min: 0, max: 10000, step: 10 },
      { key: "collectionHours", label: "Collection period", unit: "h", typical: 24, min: 1, max: 24, step: 1 },
      { key: "weightKg", label: "Body weight", unit: "kg", typical: 65, min: 20, max: 250, step: 0.1 },
      { key: "fluidIntake", label: "Fluid intake", unit: "mL", typical: 2000, min: 0, max: 10000, step: 10 }
    ]
  },
  hand: {
    label: "Temp & glucose",
    title: "Temperature & Glucose",
    sub: "Skin temperature · Body temperature · Blood glucose",
    description:
      "Potential data from hand or finger wearables, subject to sensor availability and verification. Pulse is measured in the heart step.",
    fields: [
      { key: "skin", label: "Skin temperature", unit: "°C", typical: 33.1, min: 0, max: 50, step: 0.1 },
      { key: "bodyTemp", label: "Oral body temperature", unit: "°C", typical: 36.8, min: 32, max: 43, step: 0.1 },
      { key: "glucose", label: "Blood glucose", unit: "mg/dL", typical: 92, min: 20, max: 600, step: 1 }
    ]
  },
  bones: {
    label: "Bones",
    title: "Bone & Skeletal System",
    sub: "Bone density · Physical activity",
    description:
      "Bone mineral density is generally determined using medical imaging. Exercise minutes do not directly measure bone density.",
    fields: [
      { key: "bmd", label: "Reference BMD", unit: "g/cm²", typical: 1.12, min: 0, max: 3, step: 0.01 },
      { key: "exercise", label: "Resistance exercise", unit: "min", typical: 45, min: 0, max: 240, step: 1 },
      { key: "ntx", label: "N-telopeptide (urine)", unit: "nmol/mmol creat.", typical: 50, min: 0, max: 400, step: 1 }
    ]
  },
  muscles: {
    label: "Muscles",
    title: "Muscular System",
    sub: "Exercise · Functional performance",
    description:
      "An activity log can support muscular-health monitoring; it is not a direct measurement of muscle mass or strength.",
    fields: [
      { key: "activity", label: "Activity", unit: "min", typical: 65, min: 0, max: 300, step: 1 },
      { key: "strength", label: "Training load", unit: "kg", typical: 25, min: 0, max: 500, step: 0.5 }
    ]
  }
};

export const STEP_IDS = ["brain", "lungs", "heart", "kidneys", "hand", "bones", "muscles"];

export function systemFor(part) {
  return SYSTEMS[part] || null;
}

// The profile holds the body weight, so the kidneys card does not ask for it again.
export function profileWeight(profile) {
  const kg = Number(profile && profile.weightKg);
  return Number.isFinite(kg) && kg > 0 ? kg : null;
}

export function fieldsFor(part, profile) {
  const system = SYSTEMS[part];
  if (!system) return [];
  if (part === "kidneys" && profileWeight(profile) != null) {
    return system.fields.filter((field) => field.key !== "weightKg");
  }
  return system.fields;
}

export function withProfileWeight(part, values, profile) {
  const draft = { ...(values || {}) };
  const weight = profileWeight(profile);
  if (part !== "kidneys" || weight == null) return draft;
  const entered = draft.weightKg == null ? "" : String(draft.weightKg).trim();
  if (entered === "") draft.weightKg = weight;
  return draft;
}

function defaultStore() {
  const root = typeof window !== "undefined" ? window : globalThis;
  return root.AstroMedStore && root.AstroMedStore.store ? root.AstroMedStore.store : null;
}

function keepRecord(record) {
  return Boolean(record && record.part && record.values);
}

export function readRecords(store = defaultStore()) {
  try {
    const saved = store ? store.get(RECORDS_KEY, []) : [];
    return Array.isArray(saved) ? saved.filter(keepRecord) : [];
  } catch (error) {
    console.warn("Local storage unavailable", error);
    return [];
  }
}

export function writeRecords(records, store = defaultStore()) {
  if (!store) return false;
  const list = (Array.isArray(records) ? records : []).filter(keepRecord);
  store.set(RECORDS_KEY, list);
  return true;
}

export function minuteKey(time) {
  const ms = new Date(time).getTime();
  return Number.isFinite(ms) ? Math.floor(ms / 60000) : null;
}

export function upsertRecord(records, record) {
  const list = (Array.isArray(records) ? records : []).filter((item) => item && item.part);
  const key = minuteKey(record.time);
  const index = list.findIndex((item) => item.part === record.part && minuteKey(item.time) === key);
  const nextList = list.slice();
  if (index >= 0) nextList.splice(index, 1);
  return [record, ...nextList].slice(0, MAX_RECORDS);
}

export function latestFor(records, part) {
  return (Array.isArray(records) ? records : []).find((record) => record && record.part === part) || null;
}

export function recordsFor(records, part) {
  return (Array.isArray(records) ? records : []).filter((record) => record && record.part === part);
}

function sameDay(time, now) {
  return new Date(time).toDateString() === new Date(now).toDateString();
}

export function latestToday(records, part, now = new Date()) {
  return (Array.isArray(records) ? records : []).find((record) => (
    record && record.part === part && record.time && sameDay(record.time, now)
  )) || null;
}

export function doneToday(part, records = readRecords(), now = new Date()) {
  return Boolean(latestToday(records, part, now));
}

// Every field starts empty. Only what the astronaut enters this time is saved.
export function emptyDraft(part) {
  const system = SYSTEMS[part];
  const values = {};
  if (system) system.fields.forEach((field) => { values[field.key] = ""; });
  return { values };
}

export function draftFor(part) {
  return emptyDraft(part);
}

export function describeValues(system, values = {}) {
  if (!system) return "";
  return system.fields
    .filter((field) => values[field.key] != null && values[field.key] !== "")
    .map((field) => `${field.label} ${values[field.key]} ${field.unit}`)
    .join(" · ");
}

export function summaryFor(part, records = readRecords(), now = new Date()) {
  const system = SYSTEMS[part];
  const latest = latestToday(records, part, now);
  if (!system || !latest) return "";
  return describeValues(system, latest.values);
}

// Check every non-empty field against the accepted range of its input. An empty field is skipped,
// but at least one measurement is needed before the card can be saved.
export function validateValues(fields, draft = {}) {
  const values = {};
  for (const field of fields) {
    const raw = draft[field.key];
    const text = raw == null ? "" : String(raw).trim();
    if (text === "") continue;
    const value = Number(text);
    if (!Number.isFinite(value) || value < field.min || value > field.max) {
      return { error: { field: field.key, message: `Enter a value from ${field.min} to ${field.max} ${field.unit}.` } };
    }
    values[field.key] = value;
  }
  if (Object.keys(values).length === 0) {
    const first = fields[0];
    return { error: { field: first.key, message: "Enter at least one measurement." } };
  }
  return { values };
}

export function readValues(fields, draft) {
  return validateValues(fields, draft);
}

export function bandForField(key, value) {
  return bandFor(scaleFor(key), value);
}

const LEVEL_ORDER = { alert: 3, review: 2, ok: 1, info: 0 };
const CARD_LEVEL = { alert: "urgent", review: "warn", ok: "ok", info: null };

function levelOf(entry) {
  if (entry.rule && entry.rule.level) return entry.rule.level;
  const band = entry.band.level;
  if (band === "alert") return "alert";
  if (band === "review") return "review";
  if (band === "normal") return "ok";
  return "info";
}

// The card's result: the recorded values, the highest level among them, and one action.
// A value without a reference band is recorded but never called normal.
export function resultFor(part, values, ruleFor = null) {
  const system = SYSTEMS[part];
  if (!system) return { level: null, saw: "", todo: "" };
  const entries = system.fields
    .filter((field) => values[field.key] != null)
    .map((field) => {
      const rule = typeof ruleFor === "function" ? ruleFor(field.key, values[field.key]) : null;
      return { field, value: values[field.key], rule, band: bandForField(field.key, values[field.key]) };
    });

  const ranked = entries.map((entry) => ({ ...entry, level: levelOf(entry) }))
    .sort((a, b) => (LEVEL_ORDER[b.level] || 0) - (LEVEL_ORDER[a.level] || 0));
  const worst = ranked[0] || null;
  const abnormal = worst && (worst.level === "alert" || worst.level === "review");
  const recorded = describeValues(system, values);

  let saw = recorded ? `${recorded}.` : "";
  if (abnormal && worst.rule && worst.rule.saw) saw = `${saw} ${worst.rule.saw}`.trim();

  let todo;
  if (abnormal) {
    todo = (worst.rule && worst.rule.todo)
      || "Repeat the measurement after a few minutes of rest and compare it with your baseline.";
  } else if (worst && worst.level === "ok") {
    todo = (worst.rule && worst.rule.todo) || "Keep your routine and repeat this check tomorrow.";
  } else {
    todo = (worst && worst.rule && worst.rule.todo)
      || "Compare it with your personal baseline and the trend over the next days.";
  }

  return { level: worst ? CARD_LEVEL[worst.level] : null, saw, todo };
}

// Validate, store and return the result plus an undo that removes exactly the record just written.
export function saveCard(part, draft, options = {}) {
  const system = SYSTEMS[part];
  if (!system) {
    return { error: { field: undefined, message: "This check is not available." } };
  }
  const checked = validateValues(system.fields, draft || {});
  if (checked.error) return { error: checked.error };

  const store = options.store || defaultStore();
  const now = options.now ? new Date(options.now) : new Date();
  const records = readRecords(store);
  const record = { part, values: checked.values, time: now.toISOString(), source: "manual" };
  const key = minuteKey(record.time);
  const replaced = records.find((item) => item && item.part === part && minuteKey(item.time) === key) || null;
  writeRecords(upsertRecord(records, record), store);

  const undo = () => {
    const current = readRecords(store);
    const cleaned = current.filter((item) => !(item && item.part === part && item.time === record.time));
    writeRecords(replaced ? upsertRecord(cleaned, replaced) : cleaned, store);
  };

  return { result: resultFor(part, checked.values, options.ruleFor), undo };
}

export function findingsFromRecords(records, ruleFor) {
  const out = [];
  STEP_IDS.forEach((part) => {
    const latest = latestFor(records, part);
    if (!latest || !SYSTEMS[part]) return;
    SYSTEMS[part].fields.forEach((field) => {
      const value = latest.values ? Number(latest.values[field.key]) : null;
      if (!Number.isFinite(value)) return;
      const band = bandForField(field.key, value);
      if (band.level !== "review" && band.level !== "alert") return;
      const rule = typeof ruleFor === "function" ? ruleFor(field.key, value) : null;
      out.push({
        level: band.level === "alert" ? "urgent" : "warn",
        title: `${SYSTEMS[part].title} · ${field.label}: ${value} ${field.unit}`,
        saw: rule && rule.saw ? rule.saw : band.text,
        todo: rule && rule.todo ? rule.todo : "Repeat the measurement after a few minutes of rest and compare it with your baseline."
      });
    });
  });
  return out;
}
