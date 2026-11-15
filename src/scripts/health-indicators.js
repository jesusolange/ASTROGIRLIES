/* Reference bands and gauge scales for the daily checkup.
   The bands are a screening aid and our design choice, not a diagnosis.
   Colours are supplied by the --am-* tokens through the returned CSS string. */

import { ntxRange as doctorNtxRange } from "./emergencies.js";

export const SCALES = {
  hr: {
    min: 30,
    max: 160,
    unit: "bpm",
    ticks: [30, 40, 60, 80, 100, 120, 160],
    zones: [
      { to: 60, level: "review" },
      { to: 101, level: "normal" },
      { to: Infinity, level: "review" }
    ]
  },
  sys: {
    min: 70,
    max: 200,
    unit: "mmHg",
    ticks: [70, 90, 120, 140, 180, 200],
    zones: [
      { to: 90, level: "review" },
      { to: 120, level: "normal" },
      { to: 181, level: "review" },
      { to: Infinity, level: "alert" }
    ]
  },
  dia: {
    min: 40,
    max: 140,
    unit: "mmHg",
    ticks: [40, 60, 80, 90, 120, 140],
    zones: [
      { to: 60, level: "review" },
      { to: 80, level: "normal" },
      { to: 121, level: "review" },
      { to: Infinity, level: "alert" }
    ]
  },
  hrv: {
    min: 0,
    max: 160,
    unit: "ms",
    ticks: [0, 40, 80, 120, 160],
    note: "Compare with your personal baseline."
  },
  resp: {
    min: 8,
    max: 32,
    unit: "/min",
    ticks: [8, 10, 12, 18, 24, 30, 32],
    zones: [
      { to: 12, level: "review" },
      { to: 19, level: "normal" },
      { to: Infinity, level: "review" }
    ]
  },
  spo2: {
    min: 85,
    max: 100,
    unit: "%",
    ticks: [85, 90, 92, 95, 98, 100],
    zones: [
      { to: 92, level: "alert" },
      { to: 95, level: "review" },
      { to: Infinity, level: "normal" }
    ]
  },
  bmd: {
    min: 0,
    max: 2,
    unit: "g/cm²",
    ticks: [0, 0.5, 1, 1.5, 2],
    note: "DXA result: compare by site and baseline."
  },
  exercise: {
    min: 0,
    max: 180,
    unit: "min",
    ticks: [0, 30, 60, 90, 120, 180],
    note: "Compare with your exercise plan."
  },
  ntx: {
    min: 0,
    max: 200,
    unit: "nmol/mmol creat.",
    ticks: [0, 50, 100, 150, 200],
    note: "Compare with your own baseline and reference range."
  },
  sleep: {
    min: 4,
    max: 12,
    unit: "h",
    ticks: [4, 5, 6, 7, 8, 9, 10, 12],
    note: "Compare with your sleep history."
  },
  deepSleep: {
    min: 1,
    max: 4,
    unit: "/4",
    ticks: [1, 2, 3, 4],
    note: "Self-reported depth: compare with your sleep history."
  },
  reaction: {
    min: 100,
    max: 700,
    unit: "ms",
    ticks: [100, 200, 300, 400, 500, 700],
    note: "Same test and personal baseline required."
  },
  mood: {
    min: 1,
    max: 10,
    unit: "/10",
    ticks: [1, 3, 5, 7, 10],
    note: "Self-report: follow the trend."
  },
  skin: {
    min: 25,
    max: 40,
    unit: "°C",
    ticks: [25, 28, 31, 34, 37, 40],
    note: "Skin temperature is not core temperature."
  },
  bodyTemp: {
    min: 34,
    max: 41,
    unit: "°C",
    ticks: [34, 36, 37, 38, 39, 41],
    zones: [
      { to: 36, level: "review" },
      { to: 37.9, level: "normal" },
      { to: 38.6, level: "review" },
      { to: Infinity, level: "alert" }
    ],
    note: "Oral temperature, demo reference."
  },
  glucose: {
    min: 40,
    max: 300,
    unit: "mg/dL",
    ticks: [40, 54, 70, 100, 126, 180, 300],
    zones: [
      { to: 54, level: "alert" },
      { to: 70, level: "review" },
      { to: 100, level: "normal" },
      { to: 126, level: "review" },
      { to: 250, level: "review" },
      { to: Infinity, level: "alert" }
    ],
    note: "Fasting reference (8 h). Demo values, not a diagnosis."
  },
  urineOutput: {
    min: 0,
    max: 3000,
    unit: "mL",
    ticks: [0, 500, 1000, 1500, 2000, 2500, 3000],
    note: "Compare with collection period and baseline."
  },
  collectionHours: {
    min: 0,
    max: 24,
    unit: "h",
    ticks: [0, 6, 12, 18, 24],
    note: "Collection duration."
  },
  weightKg: {
    min: 20,
    max: 200,
    unit: "kg",
    ticks: [20, 50, 80, 110, 140, 170, 200],
    note: "Recorded body weight."
  },
  fluidIntake: {
    min: 0,
    max: 4000,
    unit: "mL",
    ticks: [0, 1000, 2000, 3000, 4000],
    note: "Compare with your hydration plan and baseline."
  },
  activity: {
    min: 0,
    max: 180,
    unit: "min",
    ticks: [0, 30, 60, 90, 120, 180],
    note: "Compare with your activity plan."
  },
  strength: {
    min: 0,
    max: 150,
    unit: "kg",
    ticks: [0, 25, 50, 75, 100, 150],
    note: "Training load is not a strength diagnosis."
  }
};

const LEVEL_COLOUR = {
  normal: "var(--am-ok)",
  review: "var(--am-warn)",
  alert: "var(--am-danger)"
};

export const BAND_TEXT = {
  normal: "Within reference band",
  review: "Outside reference band - review",
  alert: "Outside reference band - act now"
};

// N-telopeptide ranges come from the team doctor's rules, shared with Emergencies.
// Without a sex the app shows the women-before-menopause range and says why on screen.
export function ntxRange(profile) {
  const range = doctorNtxRange(profile);
  const sex = profile && (profile.sex === "m" || profile.sex === "f") ? profile.sex : "x";
  const key = sex === "x" ? "unset" : sex === "m" ? "male" : profile.meno === "post" ? "post" : "pre";
  return {
    low: range.min,
    high: range.max,
    key,
    label: key === "unset" ? "sex not set, women before menopause" : range.label.toLowerCase()
  };
}

function currentProfile() {
  if (typeof window === "undefined" || !window.AstroMedProfile) return null;
  try {
    return window.AstroMedProfile.get();
  } catch (error) {
    console.error(error);
    return null;
  }
}

function ntxScale(profile) {
  const range = ntxRange(profile || currentProfile());
  return {
    ...SCALES.ntx,
    zones: [
      { to: range.low, level: "review" },
      { to: range.high + 1e-9, level: "normal" },
      { to: Infinity, level: "review" }
    ],
    range,
    rangeLabel: `${range.low} to ${range.high} nmol/mmol creatinine (${range.label})`
  };
}

export function scaleFor(key, profile = null) {
  const scale = SCALES[key] || null;
  if (!scale) return null;
  return key === "ntx" ? ntxScale(profile) : scale;
}

export function clampPercent(value) {
  return Math.max(0, Math.min(100, value));
}

export function position(value, scale) {
  if (!scale || scale.max === scale.min) return 0;
  return clampPercent((100 * (value - scale.min)) / (scale.max - scale.min));
}

export function bandFor(scale, value) {
  if (value == null || !Number.isFinite(Number(value))) {
    return { level: "neutral", text: "No value entered yet" };
  }
  if (!scale || !scale.zones) {
    return { level: "neutral", text: scale && scale.note ? scale.note : "No reference band; compare with your own baseline." };
  }
  const zone = scale.zones.find((item) => Number(value) < item.to) || scale.zones[scale.zones.length - 1];
  return { level: zone.level, text: BAND_TEXT[zone.level] };
}

export function gradientFor(scale) {
  if (!scale || !scale.zones) {
    return "linear-gradient(to right, var(--am-surface-2), var(--am-border-strong))";
  }
  const zones = scale.zones;
  const stops = [`${LEVEL_COLOUR[zones[0].level]} 0%`];
  for (let index = 0; index < zones.length - 1; index += 1) {
    const point = position(zones[index].to, scale);
    const left = Math.max(0, point - 1);
    const right = Math.min(100, point + 1);
    stops.push(`${LEVEL_COLOUR[zones[index].level]} ${left}%`);
    stops.push(`${LEVEL_COLOUR[zones[index + 1].level]} ${right}%`);
  }
  stops.push(`${LEVEL_COLOUR[zones[zones.length - 1].level]} 100%`);
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

export function isOutsideBand(scale, value) {
  const band = bandFor(scale, value);
  return band.level === "review" || band.level === "alert";
}
