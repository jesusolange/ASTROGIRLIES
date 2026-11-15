/* Radiation logic: cumulative dose, career limit, projection and reference rates.
   Sources: NASA-STD-3001 Vol. 1 Rev B via OCHMO-TB-020 (career limit 600 mSv, ALARA,
   250 mSv short-term SPE limit); Zeitlin et al. 2013 and Hassler et al. 2014 (Science,
   MSL/RAD cruise and surface); Zhang et al. 2020 (Science Advances, Chang'e-4 LND and
   DOSIS 3D on the ISS); NASA Human Research Program, Space Radiation.
   Status bands (50% / 80% of the limit) are illustrative design choices. */

import { alsoTell } from "./mission.js";
import { missionDayFor, totalFor } from "./profile.js";
import { KEYS as ENV_KEYS } from "./environment.js";

export const KEY = "astromed-radiation";
export const LIMIT = 600;
export const SPE_LIMIT = 250;

// Reference dose rates. The table is rendered in the Sources dialog from this export.
export const REF = [
  { place: "ISS (low Earth orbit)", v: "about 0.7", note: "731 µSv/day measured by DOSIS 3D on the ISS", src: "Zhang et al. 2020 (DOSIS 3D)", url: "https://doi.org/10.1126/sciadv.aaz1334", src2: "NASA HRP", url2: "https://www.nasa.gov/hrp/elements/radiation/" },
  { place: "Moon surface", v: "about 1.37", note: "1369 µSv/day (about 57 µSv/h) measured by Chang'e-4 LND; roughly twice the ISS", src: "Zhang et al. 2020, Science Advances", url: "https://doi.org/10.1126/sciadv.aaz1334" },
  { place: "Mars cruise", v: "1.84", note: "Average measured by RAD during the 253-day cruise to Mars", src: "Zeitlin et al. 2013, Science", url: "https://doi.org/10.1126/science.1235989" },
  { place: "Mars surface", v: "0.64", note: "Measured by RAD on the surface at Gale Crater; the cruise is nearly three times higher", src: "Hassler et al. 2014, Science", url: "https://doi.org/10.1126/science.1244797" }
];

export const PLACE_RATE = { iss: 0.73, moon: 1.37, mars: 0.64, rover: null, other: null };

export const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
export const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const addDays = (iso, n) => { const d = parseIso(iso); d.setDate(d.getDate() + n); return isoDay(d); };

export function perDay(state) {
  const days = {};
  (state.entries || []).forEach((entry) => { days[entry.day] = (days[entry.day] || 0) + entry.dose; });
  return days;
}

export function careerShare(career, limit = LIMIT) {
  return (career / limit) * 100;
}

export function levelForPct(pct) {
  return pct >= 80 ? "alert" : pct >= 50 ? "review" : "ok";
}

export function levelForProjection(projected, limit = LIMIT) {
  return projected >= limit ? "alert" : projected >= limit * 0.8 ? "review" : "ok";
}

// The card accepts mSv or µSv and always stores mSv.
export function convertToMsv(value, unit) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return unit === "µSv" || unit === "uSv" ? number / 1000 : number;
}

export function addDose(state, entry) {
  const record = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    day: entry.day,
    dose: entry.dose,
    src: entry.src
  };
  return { state: { ...state, entries: [...(state.entries || []), record] }, entry: record };
}

export function removeDose(state, id) {
  return { ...state, entries: (state.entries || []).filter((entry) => entry.id !== id) };
}

export function missionFor(profile) {
  return {
    missionDay: profile && profile.startDate ? missionDayFor(profile) : null,
    total: totalFor(profile)
  };
}

function profileMission() {
  const profileApi = typeof window !== "undefined" ? window.AstroMedProfile : null;
  const profile = profileApi && profileApi.get ? profileApi.get() : null;
  return {
    missionDay: profile && profile.startDate && profileApi.missionDay ? profileApi.missionDay() : null,
    total: profileApi && profileApi.total ? profileApi.total() : 365
  };
}

export function calc(state, mission) {
  const days = perDay(state);
  const keys = Object.keys(days).sort();
  const missionDose = keys.reduce((sum, key) => sum + days[key], 0);
  const career = (Number(state.prior) || 0) + missionDose;
  const last7 = keys.slice(-7).map((key) => days[key]);
  const rate = last7.length ? last7.reduce((a, b) => a + b, 0) / last7.length : null;
  const info = mission || profileMission();
  const missionDay = info.missionDay;
  const left = missionDay != null ? Math.max(0, info.total - missionDay) : null;
  const projected = rate != null && left != null ? career + rate * left : null;
  const pct = careerShare(career);
  return {
    days, keys, mission: missionDose, career, rate, left, projected, pct,
    level: levelForPct(pct),
    projLevel: projected == null ? null : levelForProjection(projected)
  };
}

// The numbers Progress draws for "Projected mission dose".
export function projection(state, mission) {
  const c = calc(state, mission);
  return { projected: c.projected, left: c.left, rate: c.rate, level: c.projLevel, career: c.career, pct: c.pct };
}

const read = (key, fallback) => (typeof window !== "undefined" && window.AstroMedStore ? window.AstroMedStore.store.get(key, fallback) : fallback);
const write = (key, value) => { if (typeof window !== "undefined" && window.AstroMedStore) window.AstroMedStore.store.set(key, value); };

export function load() {
  const stored = read(KEY, null) || {};
  return { prior: Number(stored.prior) || 0, entries: Array.isArray(stored.entries) ? stored.entries : [] };
}

export const save = (state) => write(KEY, state);

export function openStormSteps() {
  if (typeof window === "undefined") return;
  if (window.AstroMedEmergencies) window.AstroMedEmergencies.open("solar-storm");
  else window.AstroMedNav?.show("emergencies");
}

export function recordedToday(now = new Date()) {
  return load().entries.some((entry) => entry.day === isoDay(now));
}

// The cabin dose-rate reading from the Cabin conditions record, converted to a daily dose.
export function cabinRate() {
  const state = read(ENV_KEYS.state, null);
  const microSvPerHour = state && state.readings ? Number(state.readings.radiation) : NaN;
  if (!Number.isFinite(microSvPerHour)) return null;
  return { microSvPerHour, mSvPerDay: (microSvPerHour * 24) / 1000 };
}

export function status() {
  const state = load();
  const c = calc(state);
  return { career: c.career, pct: c.pct, level: c.level, rate: c.rate, projected: c.projected, projLevel: c.projLevel, hasData: state.entries.length > 0 || state.prior > 0 };
}

const tell = (who) => {
  const sentence = alsoTell(who);
  return sentence ? ` ${sentence}` : "";
};

export function findings() {
  const st = status();
  if (!st.hasData) return [];
  const out = [];
  const todo = {
    ok: "Keep logging your dose. Know where your storm shelter is.",
    review: "Spend more time in the best-shielded space and plan lower-dose activities yourself." + tell(),
    alert: "Stay in the best-shielded space and stop non-essential activity today." + tell("the flight surgeon and the radiation team")
  };
  out.push({ level: st.level, title: "Radiation · career dose", saw: `${st.career.toFixed(1)} mSv used of ${LIMIT} mSv (${st.pct.toFixed(1)}%).`, todo: todo[st.level] });
  if (st.projLevel && st.projLevel !== "ok") {
    out.push({
      level: st.projLevel,
      title: "Radiation · mission forecast",
      saw: `At your recent rate you would reach about ${Math.round(st.projected)} mSv by the end of the mission.`,
      todo: "Lower your daily dose now: more time in the best-shielded space and fewer non-essential activities." + tell()
    });
  }
  return out;
}

if (typeof window !== "undefined") {
  window.AstroMedRadiation = { status, findings, LIMIT };
}
