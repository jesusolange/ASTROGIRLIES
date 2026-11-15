/* Astronaut profile: stored locally under astromed-profile.
   Pure mission-day arithmetic plus the public object the rest of the app calls. */

import { signal } from "@preact/signals";
import { MISSION_TYPES, DEFAULT_MISSION } from "./risks.js";

export const KEY = "astromed-profile";
export const DAY = 86400000;
export const DEFAULT_TOTAL = 365;

export const dialog = signal({ open: false, first: false });

export const dayNum = (d) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);
export const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
export const isIsoDay = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(parseIso(s).getTime());

const positiveInt = (value, fallback) => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 1 ? n : fallback;
};

export function crewFor(profile) {
  return positiveInt(profile && profile.crew, 1);
}

export function missionDayFor(profile, date) {
  if (!profile || !profile.startDate) return null;
  return dayNum(date || new Date()) - dayNum(parseIso(profile.startDate)) + 1;
}

export function dayOfFor(profile, iso) {
  return missionDayFor(profile, new Date(iso));
}

export function totalFor(profile) {
  return positiveInt(profile && profile.totalDays, DEFAULT_TOTAL);
}

export function dayLabelFor(profile) {
  const day = missionDayFor(profile);
  return day == null ? "Mission day not set" : `Mission Day ${day} / ${totalFor(profile)}`;
}

export function formValues(profile, now = new Date()) {
  const p = profile || {};
  const mission = p.missionType || DEFAULT_MISSION;
  const sex = p.sex === "f" || p.sex === "m" ? p.sex : "x";
  return {
    name: p.name || "",
    missionType: MISSION_TYPES.some((m) => m.id === mission) ? mission : DEFAULT_MISSION,
    crew: crewFor(p),
    startDate: isIsoDay(p.startDate) ? p.startDate : isoDay(now),
    total: totalFor(p),
    age: p.age ?? "",
    sex,
    meno: sex === "f" ? (p.meno || "") : "",
    weight: p.weightKg ?? "",
    height: p.heightCm ?? ""
  };
}

export const REQUIRED_ORDER = ["name", "missionType", "crew", "startDate", "total"];

export function fieldErrors(values) {
  const errors = {};
  if (!String(values.name || "").trim()) errors.name = "Enter your name.";
  if (!MISSION_TYPES.some((m) => m.id === values.missionType)) errors.missionType = "Choose a destination.";
  if (!Number.isInteger(Number(values.crew)) || Number(values.crew) < 1) {
    errors.crew = "Enter a crew size of 1 or more.";
  }
  if (!isIsoDay(values.startDate)) errors.startDate = "Choose the mission start date.";
  if (!Number.isInteger(Number(values.total)) || Number(values.total) < 1) {
    errors.total = "Enter a mission length of 1 day or more.";
  }
  return errors;
}

export function applyForm(values, current, now = new Date()) {
  const num = (value) => (value === "" || value == null ? null : Number(value));
  const sex = values.sex || null;
  return {
    ...(current || {}),
    name: (values.name || "").trim(),
    startDate: isIsoDay(values.startDate) ? values.startDate : isoDay(now),
    totalDays: positiveInt(values.total, DEFAULT_TOTAL),
    missionType: values.missionType || DEFAULT_MISSION,
    crew: positiveInt(values.crew, 1),
    age: num(values.age),
    sex,
    meno: sex === "f" && values.meno ? values.meno : null,
    weightKg: num(values.weight),
    heightCm: num(values.height)
  };
}

const read = () => (typeof window !== "undefined" && window.AstroMedStore ? window.AstroMedStore.store.get(KEY, null) : null);
const write = (value) => { if (typeof window !== "undefined" && window.AstroMedStore) window.AstroMedStore.store.set(KEY, value); };

export function get() { return read() || null; }
export function missionDay(date) { return missionDayFor(get(), date); }
export function dayOf(iso) { return dayOfFor(get(), iso); }
export function total() { return totalFor(get()); }
export function crew() { return crewFor(get()); }
export function name() { const p = get(); return (p && p.name) || ""; }
export function dayLabel() { return dayLabelFor(get()); }

export function open(first) {
  dialog.value = { open: true, first: Boolean(first) };
}
export function closeDialog() {
  dialog.value = { open: false, first: false };
}
export function apply() {
  if (typeof document !== "undefined") document.dispatchEvent(new CustomEvent("astromed-profile-apply"));
}
export function saveProfile(record) {
  write(record);
  closeDialog();
  apply();
  if (typeof document !== "undefined") document.dispatchEvent(new CustomEvent("astromed-profile-changed"));
}

if (typeof window !== "undefined") {
  window.AstroMedProfile = { get, missionDay, dayOf, total, crew, name, dayLabel, open: () => open(false), apply };
}
