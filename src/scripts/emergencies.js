import { signal } from "@preact/signals";
import { resolveCardId, situations as listSituations } from "../data/emergencies.js";

const NORMAL = { pulse: [60, 100], resp: [12, 18], spo2: [95, 100] };
const NTX = [
  { min: 21, max: 83, label: "Men" },
  { min: 17, max: 94, label: "Women before menopause" },
  { min: 36, max: 124, label: "Women after menopause" },
];

export const openCard = signal(null);

export function gcsScore(picks) {
  const picked = picks.filter(Boolean).length;
  if (picked < 3) return { picked, total: null, level: null, message: `Picked ${picked} of 3 columns.` };
  const total = picks[0] + picks[1] + picks[2];
  if (total >= 13) return { picked, total, level: "ok", message: "Mild or normal. Keep watching." };
  if (total >= 9) return { picked, total, level: "mid", message: "Moderate drop in awareness. Call the flight surgeon now." };
  return { picked, total, level: "bad", message: "Severe drop in awareness (8 or less). Life-threatening. Call the flight surgeon now." };
}

export function shockIndex(pulse, systolic) {
  return pulse && systolic ? pulse / systolic : null;
}

export function vitalChips(values) {
  const chips = [];
  const range = (key, name, unit) => {
    if (values[key] == null) return;
    const [low, high] = NORMAL[key];
    const label = values[key] < low ? "low" : values[key] > high ? "high" : "normal";
    chips.push({ text: `${name}: ${values[key]} ${unit} · ${label}`, tone: label === "normal" ? "ok" : "bad" });
  };
  range("pulse", "Pulse", "/min");
  range("resp", "Breathing", "/min");
  range("spo2", "SpO₂", "%");
  if (values.temp != null) {
    const fever = values.temp >= 38.5;
    chips.push({ text: `Temperature: ${values.temp} °C · ${fever ? "fever" : "no fever"}`, tone: fever ? "bad" : "ok" });
  }
  const index = shockIndex(values.pulse, values.sys);
  if (index != null) chips.push({ text: `Shock index: ${index.toFixed(2)} (pulse ÷ top pressure)`, tone: "info" });
  return chips;
}

export function ntxRange(profile) {
  const p = profile || {};
  if (p.sex === "m") return NTX[0];
  if (p.sex === "f") return p.meno === "post" ? NTX[2] : NTX[1];
  return NTX[1];
}

export function ntxStatus(value, profile) {
  const range = ntxRange(profile);
  const tone = value > range.max ? "bad" : value < range.min ? "mid" : "ok";
  const state = tone === "bad" ? "high" : tone === "mid" ? "low" : "in range";
  return {
    tone,
    text: `${value}: ${state} for ${range.label.toLowerCase()} (${range.min}–${range.max})`,
    needSex: !(profile && profile.sex),
  };
}

export function situations() {
  return listSituations();
}

export function findings() {
  return [];
}

export function open(id) {
  const resolved = resolveCardId(id);
  if (!resolved) return false;
  openCard.value = resolved;
  if (window.AstroMedNav) window.AstroMedNav.show("emergencies");
  return true;
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    window.AstroMedEmergencies = { open, situations, findings };
  });
}
