import { signal } from "@preact/signals";
import { VITALS_REFERENCE, resolveCardId, situations as listSituations } from "../data/emergencies.js";
import { NTX_RANGES } from "../data/slow-risks.js";

const NORMAL = VITALS_REFERENCE.normal;

export const openCard = signal(null);

export function gcsScore(picks) {
  const picked = picks.filter(Boolean).length;
  if (picked < 3) return { picked, total: null, level: null, message: `Picked ${picked} of 3 columns.` };
  const total = picks[0] + picks[1] + picks[2];
  if (total >= 13) return { picked, total, level: "ok", message: "Mild or normal. Keep watching." };
  if (total >= 9) return { picked, total, level: "mid", tell: "flight-surgeon", message: "Moderate drop in awareness. Call the flight surgeon now." };
  return { picked, total, level: "bad", tell: "flight-surgeon", message: "Severe drop in awareness (8 or less). Life-threatening. Call the flight surgeon now." };
}

export function shockIndex(pulse, systolic) {
  return pulse && systolic ? pulse / systolic : null;
}

export function vitalChips(values) {
  const chips = [];
  const range = (key, name) => {
    if (values[key] == null) return;
    const band = NORMAL[key];
    const label = values[key] < band.low ? "low" : values[key] > band.high ? "high" : "normal";
    chips.push({ text: `${name}: ${values[key]} ${band.unit} · ${label}`, tone: label === "normal" ? "ok" : "bad" });
  };
  range("pulse", "Pulse");
  range("resp", "Breathing");
  range("spo2", "SpO₂");
  if (values.temp != null) {
    const fever = values.temp >= VITALS_REFERENCE.feverC;
    chips.push({ text: `Temperature: ${values.temp} °C · ${fever ? "fever" : "no fever"}`, tone: fever ? "bad" : "ok" });
  }
  const index = shockIndex(values.pulse, values.sys);
  if (index != null) chips.push({ text: `Shock index: ${index.toFixed(2)} (pulse ÷ top pressure)`, tone: "info" });
  return chips;
}

export function ntxRange(profile) {
  const p = profile || {};
  if (p.sex === "m") return NTX_RANGES[0];
  if (p.sex === "f") return p.meno === "post" ? NTX_RANGES[2] : NTX_RANGES[1];
  return NTX_RANGES[1];
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

export function situations(crew = 1) {
  return listSituations(crew);
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
