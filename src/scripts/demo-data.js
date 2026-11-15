/* One demo mission for the whole app: a pure builder and the loader that writes it.
   The builder never touches storage, so the shape is covered by node:test. */

import { isoDay } from "./profile.js";
import { PLACE_RATE } from "./radiation.js";
import { KEY as HISTORY_KEY, syncProgress } from "./progress.js";

export const DEMO_NAME = "Solange";
export const DAY = 86400000;
export const DAYS = 14;

const PROFILE_KEY = "astromed-profile";
const RECORDS_KEY = "astrotwin-gui-v2-records";
const MENTAL_KEY = "astromed-mental";
const MENTAL_HISTORY_KEY = "astromed-mental-history";
const VISION_KEY = "astromed-vision";
const IMMUNE_KEY = "astromed-immune";
const RADIATION_KEY = "astromed-radiation";
const NUTRITION_KEY = "astromed-nutrition";
const EXERCISE_KEY = "astrotwin-exercise-sessions";
const ENV_KEY = "astromed-env";
const ENV_LOG_KEY = "astromed-env-log";
const MISSIONS_KEY = "astromed-missions";

const PLACE_BY_DRM = { leo: "iss", lunarOrbit: "moon", lunarSurface: "moon", mars: "mars" };

// Mars planetary, with the demo astronaut already two weeks into the mission.
export const DEMO_MISSION = { id: "mars-planetary", drm: "mars", days: 730 };

function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n, step = 0.1) => Math.round(n / step) * step;
const round2 = (n) => Math.round(n * 100) / 100;

function at(now, daysAgo, hour, minute = 15) {
  const d = new Date(now.getTime() - daysAgo * DAY);
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() > now.getTime()) d.setTime(now.getTime());
  return d;
}

const CHECKUP_FIELDS = {
  brain: {
    sleep: () => [7.4, 0.5],
    deepSleep: () => [3, 0.7],
    reaction: () => [286, 18],
    mood: () => [7.4, 0.7]
  },
  lungs: { resp: () => [15.5, 0.9], spo2: () => [98, 0.6] },
  heart: { hr: () => [76, 5], sys: () => [114, 4], dia: () => [75, 3], hrv: () => [45, 5] },
  kidneys: {
    urineOutput: () => [1560, 90],
    collectionHours: () => [24, 0],
    weightKg: () => [64, 0.3],
    fluidIntake: () => [2100, 180]
  },
  hand: { skin: () => [33.1, 0.2], bodyTemp: () => [36.8, 0.15], glucose: () => [90, 5] },
  bones: { bmd: () => [1.12, 0.005], exercise: () => [52, 10], ntx: () => [51, 6] },
  muscles: { activity: () => [58, 9], strength: () => [25, 1.8] }
};

// Left open today so the demo can show these daily checks being done: heart, meals and training.
const SHOWCASE_TODAY = new Set(["heart", "meals", "exercise"]);

function checkupRecords(now, random) {
  const records = [];
  for (let index = 0; index < DAYS; index += 1) {
    const time = at(now, index, 8).toISOString();
    Object.entries(CHECKUP_FIELDS).forEach(([part, fields]) => {
      if (index === 0 && SHOWCASE_TODAY.has(part)) return;
      const values = {};
      Object.entries(fields).forEach(([key, pick]) => {
        const [centre, spread] = pick();
        values[key] = round(centre + (random() - 0.5) * 2 * spread, key === "bmd" ? 0.01 : 0.1);
      });
      records.push({ part, values, time, source: "demo" });
    });
  }
  return records;
}

function mentalData(now, random) {
  const dayIso = (daysAgo) => at(now, daysAgo, 9).toISOString();
  const depAnswers = [0, 1, 0, 1, 0, 0, 0, 0, 0];
  const stressAnswers = Array.from({ length: 33 }, () => (random() < 0.2 ? 1 : 0));
  const depScore = depAnswers.reduce((a, b) => a + b, 0);
  const stressScore = stressAnswers.reduce((a, b) => a + b, 0);
  const sub = {};
  ["body", "emotional", "cognitive", "behavioural"].forEach((cat) => { sub[cat] = { score: 0, max: 0 }; });
  stressAnswers.forEach((value, index) => {
    const cat = index < 12 ? "body" : index < 19 ? "emotional" : index < 24 ? "cognitive" : "behavioural";
    sub[cat].score += value;
    sub[cat].max += 2;
  });

  const depression = {
    score: depScore, label: "Healthy", level: "ok", answers: depAnswers,
    date: dayIso(0), flagged: false
  };
  const stress = {
    score: stressScore, label: "Stable", level: "ok", answers: stressAnswers,
    sub, date: dayIso(0), flagged: false
  };

  const history = [
    { type: "depression", questionnaire: "Isolation & depression", score: depression.score, max: 27, label: depression.label, level: depression.level, answers: depression.answers, date: depression.date, flagged: false },
    { type: "stress", questionnaire: "Stress & burn-out", score: stress.score, max: 66, label: stress.label, level: stress.level, answers: stress.answers, sub, date: stress.date, flagged: false },
    { type: "depression", questionnaire: "Isolation & depression", score: 4, max: 27, label: "Healthy", level: "ok", answers: depAnswers, date: dayIso(4), flagged: false },
    { type: "stress", questionnaire: "Stress & burn-out", score: 9, max: 66, label: "Stable", level: "ok", answers: stressAnswers, sub, date: dayIso(7), flagged: false },
    { type: "depression", questionnaire: "Isolation & depression", score: 5, max: 27, label: "Healthy", level: "ok", answers: depAnswers, date: dayIso(11), flagged: false },
    { type: "stress", questionnaire: "Stress & burn-out", score: 11, max: 66, label: "Stable", level: "ok", answers: stressAnswers, sub, date: dayIso(13), flagged: false }
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    latest: {
      mood: { value: "okay", date: dayIso(0) },
      depression, stress
    },
    history
  };
}

function visionData(now, random) {
  const results = [];
  for (let index = DAYS - 2; index >= 0; index -= 2) {
    const date = at(now, index, 10).toISOString();
    ["right", "left"].forEach((eye) => {
      const line = Math.min(7, Math.max(5, 6 + Math.round((random() - 0.5) * 1.4)));
      results.push({
        id: `demo-${eye}-${index}`,
        eye,
        date,
        missionDay: DAYS - index,
        grid: { distortion: false, marks: [] },
        near: { line },
        symptoms: []
      });
    });
  }
  return {
    ppmm: 5.5,
    calibratedAt: at(now, DAYS - 1, 9).toISOString(),
    results
  };
}

function immuneData(now) {
  const log = {};
  for (let index = DAYS - 1; index >= 0; index -= 1) {
    const day = isoDay(at(now, index, 8));
    log[day] = index === 6 ? ["tired"] : [];
  }
  return {
    log,
    tests: [
      { id: "demo-test-0", name: "Vitamin D (25-OH)", value: 33, unit: "ng/mL", kind: "blood", time: at(now, 0, 9).toISOString(), note: "" },
      { id: "demo-test-1", name: "Vitamin D (25-OH)", value: 32, unit: "ng/mL", kind: "blood", time: at(now, 3, 9).toISOString(), note: "" },
      { id: "demo-test-2", name: "Salivary cortisol", value: 4.2, unit: "nmol/L", kind: "saliva", time: at(now, 8, 8).toISOString(), note: "Morning sample" }
    ]
  };
}

function radiationData(now, place, random) {
  const rate = PLACE_RATE[place] || 0.64;
  const entries = [];
  for (let index = 0; index < DAYS; index += 1) {
    const dose = round2(rate + (random() - 0.5) * 0.04);
    entries.push({ id: `demo-dose-${index}`, day: isoDay(at(now, index, 8)), dose, src: "dosimeter" });
  }
  return { prior: 0, entries };
}

const MEALS = [
  {
    meal: "Breakfast", hour: 7, minute: 30, name: "Oats with dried fruit",
    kcal: 560, carb: 82, prot: 20, fat: 16, fiber: 10, sodium: 380, veg: 40, fluid: 300, iron: 2.0
  },
  {
    meal: "Lunch", hour: 12, minute: 30, name: "Rice, beans and vegetables",
    kcal: 760, carb: 96, prot: 32, fat: 24, fiber: 13, sodium: 720, veg: 210, fluid: 500, iron: 3.0
  },
  {
    meal: "Dinner", hour: 18, minute: 30, name: "Pasta with tomato and tuna",
    kcal: 790, carb: 92, prot: 38, fat: 26, fiber: 11, sodium: 780, veg: 200, fluid: 400, iron: 2.2
  },
  {
    meal: "Snack", hour: 15, minute: 30, name: "Yoghurt and nuts",
    kcal: 280, carb: 22, prot: 14, fat: 15, fiber: 4, sodium: 120, veg: 0, fluid: 150, iron: 0.6
  }
];

function nutritionData(now, random) {
  const entries = [];
  for (let index = SHOWCASE_TODAY.has("meals") ? 1 : 0; index < DAYS; index += 1) {
    MEALS.forEach((meal, mealIndex) => {
      const time = at(now, index, meal.hour, meal.minute).toISOString();
      const salt = (random() - 0.5) * 0.06;
      const entry = {
        id: `demo-meal-${index}-${mealIndex}`, time, meal: meal.meal, name: meal.name,
        portions: 1, amount: 1, unit: "portion"
      };
      ["kcal", "carb", "prot", "fat", "fiber", "sodium", "veg", "fluid", "iron"].forEach((key) => {
        entry[key] = round(meal[key] * (1 + salt), 1);
      });
      entries.push(entry);
    });
  }
  return { entries, eva: {}, af: 1.11, lib: [] };
}

function exerciseData(now, random) {
  const sessions = [];
  const kinds = [
    { type: "ared", title: "ARED", values: () => ({ movement: "Squat", minutes: 45, sets: 4, reps: 10, load: round(55 + random() * 15, 1), effort: 6 }) },
    { type: "t2", title: "T2", values: () => ({ minutes: 40, distance: round(4.8 + random() * 1.2, 0.1), speed: round(7.2 + random() * 1.2, 0.1), heartRate: Math.round(126 + random() * 12), effort: 5, soreness: 2 }) },
    { type: "cevis", title: "CEVIS", values: () => ({ minutes: 50, cadence: Math.round(80 + random() * 12), power: Math.round(110 + random() * 30), heartRate: Math.round(122 + random() * 14), effort: 5 }) }
  ];
  for (let index = SHOWCASE_TODAY.has("exercise") ? 1 : 0; index < DAYS; index += 1) {
    const kind = kinds[index % kinds.length];
    sessions.push({ type: kind.type, title: kind.title, values: kind.values(), date: at(now, index, 17).toISOString() });
  }
  return sessions;
}

const DEMO_READINGS = {
  iss: { temp: 22, pressure: 101.3, humidity: 45, co2: 2500, noise: 55, radiation: 20 },
  moon: { temp: 21, pressure: 70, humidity: 40, co2: 2800, noise: 52, radiation: 60 },
  mars: { temp: 21, pressure: 70, humidity: 40, co2: 2800, noise: 50, radiation: 27 },
  rover: { temp: 21, pressure: 101, humidity: 40, co2: 3200, noise: 62, radiation: 30 }
};

function environmentData(now, place, random) {
  const base = DEMO_READINGS[place] || DEMO_READINGS.mars;
  const readingsFor = (index) => {
    const readings = {};
    Object.entries(base).forEach(([key, value]) => {
      if (key === "radiation") readings[key] = round2(value + (random() - 0.5) * 2);
      else if (key === "co2") readings[key] = Math.round(value + (random() - 0.5) * 120);
      else if (key === "pressure") readings[key] = round(value + (random() - 0.5) * 0.4, 0.1);
      else readings[key] = round(value + (random() - 0.5) * 1.6, 0.1);
    });
    return readings;
  };
  const log = [];
  for (let index = 0; index < DAYS; index += 1) {
    log.push({ time: at(now, index, 8, 5).toISOString(), place, custom: "", readings: readingsFor(index) });
  }
  return {
    state: { place, custom: "", readings: log[0].readings, time: log[0].time },
    log
  };
}

const REWARD_TASKS = ["env", "checkup", "exercise", "meals", "mental"];

function missionsData(now) {
  const auto = {};
  for (let index = DAYS - 1; index >= 0; index -= 1) {
    auto[isoDay(at(now, index, 8))] = index === 0
      ? REWARD_TASKS.filter((task) => !["meals", "checkup", "exercise"].includes(task))
      : [...REWARD_TASKS];
  }
  const vo2 = [13, 7, 0].map((daysAgo, index) => ({
    value: [42, 41, 43][index],
    time: at(now, daysAgo, 9).toISOString()
  }));
  return { done: {}, auto, vo2 };
}

export function buildDemoData({ now = new Date(), seed = 7 } = {}) {
  const random = seeded(seed);
  const place = PLACE_BY_DRM[DEMO_MISSION.drm] || "mars";
  const startDate = isoDay(new Date(now.getTime() - (DAYS - 1) * DAY));

  const profile = {
    name: DEMO_NAME,
    missionType: DEMO_MISSION.id,
    crew: 4,
    startDate,
    totalDays: DEMO_MISSION.days,
    age: 38,
    sex: "f",
    meno: "pre",
    weightKg: 64,
    heightCm: 168,
    demo: true,
    demoLoadedAt: now.toISOString()
  };

  const mental = mentalData(now, random);
  const environment = environmentData(now, place, random);

  return {
    [PROFILE_KEY]: profile,
    [RECORDS_KEY]: checkupRecords(now, random),
    [MENTAL_KEY]: mental.latest,
    [MENTAL_HISTORY_KEY]: mental.history,
    [VISION_KEY]: visionData(now, random),
    [IMMUNE_KEY]: immuneData(now),
    [RADIATION_KEY]: radiationData(now, place, random),
    [NUTRITION_KEY]: nutritionData(now, random),
    [EXERCISE_KEY]: exerciseData(now, random),
    [ENV_KEY]: environment.state,
    [ENV_LOG_KEY]: environment.log,
    [MISSIONS_KEY]: missionsData(now)
  };
}

const store = () => (typeof window !== "undefined" && window.AstroMedStore && window.AstroMedStore.store) || null;

export function loadDemo(now = new Date()) {
  const api = store();
  if (!api) return false;
  const data = buildDemoData({ now });
  api.set(HISTORY_KEY, { entries: [], seen: [] });
  Object.entries(data).forEach(([key, value]) => api.set(key, value));
  syncProgress();
  if (typeof document !== "undefined") document.dispatchEvent(new CustomEvent("astromed-profile-changed"));
  return true;
}
