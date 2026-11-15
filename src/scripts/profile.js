/* Astronaut profile: stored locally under astromed-profile.
   Pure mission-day arithmetic plus the public object the rest of the app calls. */

import { signal } from "@preact/signals";
import { MISSION_TYPES, DEFAULT_MISSION } from "./risks.js";

export const KEY = "astromed-profile";
export const DAY = 86400000;

export const dialog = signal({ open: false, first: false });

export const dayNum = (d) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);
export const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

export function missionDayFor(profile, date) {
  if (!profile || !profile.startDate) return null;
  return dayNum(date || new Date()) - dayNum(parseIso(profile.startDate)) + 1;
}

export function dayOfFor(profile, iso) {
  return missionDayFor(profile, new Date(iso));
}

export function totalFor(profile) {
  return (profile && profile.totalDays) || 365;
}

export function dayLabelFor(profile) {
  const day = missionDayFor(profile);
  return day == null ? "Mission day not set" : `Mission Day ${day} / ${totalFor(profile)}`;
}

export function formValues(profile) {
  const p = profile || {};
  const mission = p.missionType || DEFAULT_MISSION;
  const sex = p.sex === "f" || p.sex === "m" ? p.sex : "x";
  return {
    name: p.name || "",
    day: missionDayFor(p) || 1,
    total: totalFor(p),
    missionType: MISSION_TYPES.some((m) => m.id === mission) ? mission : DEFAULT_MISSION,
    destination: p.destination || "",
    age: p.age ?? "",
    sex,
    meno: p.meno || "",
    weight: p.weightKg ?? "",
    height: p.heightCm ?? ""
  };
}

export function applyForm(values, current, now = new Date()) {
  const day = Math.max(1, parseInt(values.day, 10) || 1);
  const start = new Date(now);
  start.setDate(start.getDate() - (day - 1));
  const num = (value) => (value === "" || value == null ? null : Number(value));
  return {
    ...(current || {}),
    name: (values.name || "").trim(),
    startDate: isoDay(start),
    totalDays: Math.max(1, parseInt(values.total, 10) || 365),
    missionType: values.missionType || DEFAULT_MISSION,
    destination: (values.destination || "").trim() || null,
    age: num(values.age),
    sex: values.sex || null,
    meno: values.meno || null,
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
export function markSkipped() {
  write({ ...(get() || {}), skipped: true });
}

if (typeof window !== "undefined") {
  window.AstroMedProfile = { get, missionDay, dayOf, total, name, dayLabel, open: () => open(false), apply };
}
