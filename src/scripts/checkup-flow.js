/* The daily checkup: one ordered list of body systems, the current step and the done set.
   The form and the 3D guide both read the signals in this module, so selecting or saving in one
   place immediately moves the other. Record helpers keep the stored shape used by Protocols,
   Progress and the PDF report: { part, values, time, source }. */

import { computed, signal } from "@preact/signals";
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

export function stepNumber(part) {
  return STEP_IDS.indexOf(part) + 1;
}

export function nextUndone(done, after = null, ids = STEP_IDS) {
  const doneSet = done instanceof Set ? done : new Set(done || []);
  const start = after ? ids.indexOf(after) + 1 : 0;
  for (let index = start; index < ids.length; index += 1) {
    if (!doneSet.has(ids[index])) return ids[index];
  }
  for (let index = 0; index < start; index += 1) {
    if (!doneSet.has(ids[index])) return ids[index];
  }
  return null;
}

export const currentStep = signal(STEP_IDS[0]);
export const doneParts = signal([]);
export const flowComplete = computed(() => STEP_IDS.every((id) => doneParts.value.includes(id)));

export function select(part) {
  if (SYSTEMS[part]) currentStep.value = part;
}

export function complete(part) {
  if (!SYSTEMS[part]) return currentStep.value;
  const done = doneParts.value.includes(part) ? doneParts.value : [...doneParts.value, part];
  doneParts.value = done;
  currentStep.value = nextUndone(done, part);
  return currentStep.value;
}

export function next() {
  currentStep.value = nextUndone(doneParts.value, currentStep.value);
  return currentStep.value;
}

export function reset() {
  doneParts.value = [];
  currentStep.value = STEP_IDS[0];
}

export function isDone(part) {
  return doneParts.value.includes(part);
}

export function hydrate(records, now = new Date()) {
  const today = now.toDateString();
  const done = new Set();
  (Array.isArray(records) ? records : []).forEach((record) => {
    if (!record || !SYSTEMS[record.part]) return;
    const when = new Date(record.time);
    if (when.toDateString() === today) done.add(record.part);
  });
  doneParts.value = STEP_IDS.filter((id) => done.has(id));
  currentStep.value = nextUndone(doneParts.value);
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

export function draftFor(part, records) {
  const system = SYSTEMS[part];
  if (!system) return { values: {}, simulated: false };
  const latest = latestFor(records, part);
  const values = {};
  system.fields.forEach((field) => {
    const stored = latest && latest.values ? latest.values[field.key] : undefined;
    values[field.key] = stored != null && Number.isFinite(Number(stored)) ? Number(stored) : field.typical;
  });
  return { values, simulated: Boolean(latest && latest.simulated) };
}

export function readValues(fields, draft) {
  const values = {};
  for (const field of fields) {
    const raw = draft[field.key];
    const text = raw == null ? "" : String(raw).trim();
    const value = Number(text);
    if (text === "" || !Number.isFinite(value) || value < field.min || value > field.max) {
      return { error: `Enter a valid ${field.label.toLowerCase()} between ${field.min} and ${field.max} ${field.unit}.` };
    }
    values[field.key] = value;
  }
  return { values };
}

export function bandForField(key, value) {
  return bandFor(scaleFor(key), value);
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
