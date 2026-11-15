/* Exercise session model. Stored sessions keep the long-standing
   "astrotwin-exercise-sessions" key and record shape. */

export const KEY = "astrotwin-exercise-sessions";
export const TYPES = ["ared", "t2", "cevis"];

// The station programme performs aerobic and resistance exercise on six days per week (English et al.,
// npj Microgravity 2020;6:21).
export const RESISTIVE_WEEKLY_TARGET = 6;

const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dayOf = (value) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? isoDay(date) : null;
};

const MOVEMENTS = ["Squat", "Deadlift", "Heel Raise", "Bench Press", "Shoulder Press", "Bent-over Row"];

const number = (label, key, required, min, max) => ({ label, key, type: "number", required, min, max });

export const DEVICES = [
  {
    type: "ared",
    title: "ARED",
    subtitle: "Resistance Training",
    image: "/assets/ARED.png",
    alt: "Astronaut performing resistance training",
    ai: true,
    fields: [
      { label: "Movement", key: "movement", type: "select", required: true, options: MOVEMENTS },
      number("Duration (min)", "minutes", true, 1, 300),
      number("Sets", "sets", false, 1, 100),
      number("Repetitions", "reps", false, 1, 200),
      number("Resistance (kg)", "load", false, 0, 500),
      number("Effort (0–10)", "effort", false, 0, 10)
    ]
  },
  {
    type: "t2",
    title: "T2",
    subtitle: "Treadmill Running",
    image: "/assets/T2.png",
    alt: "Astronaut running on a treadmill",
    ai: true,
    fields: [
      number("Duration (min)", "minutes", true, 1, 300),
      number("Distance (km)", "distance", false, 0, 100),
      number("Speed (km/h)", "speed", false, 0, 40),
      number("Heart Rate (bpm)", "heartRate", false, 1, 250),
      number("Effort (0–10)", "effort", false, 0, 10),
      number("Soreness (0–10)", "soreness", false, 0, 10)
    ]
  },
  {
    type: "cevis",
    title: "CEVIS",
    subtitle: "Cycling Training",
    image: "/assets/CEVIS.png",
    alt: "Astronaut using the cycling system",
    ai: true,
    fields: [
      number("Duration (min)", "minutes", true, 1, 300),
      number("Cadence (RPM)", "cadence", false, 0, 250),
      number("Power (W)", "power", false, 0, 1500),
      number("Heart Rate (bpm)", "heartRate", false, 1, 250),
      number("Effort (0–10)", "effort", false, 0, 10)
    ]
  }
];

export const deviceOf = (type) => DEVICES.find((device) => device.type === type) || null;

export function validateSession(device, raw) {
  const errors = [];
  const values = {};
  device.fields.forEach((field) => {
    const input = raw ? raw[field.key] : undefined;
    const text = input == null ? "" : String(input).trim();
    if (text === "") {
      values[field.key] = null;
      if (field.required) errors.push(`${field.label} is required.`);
      return;
    }
    if (field.type === "number") {
      const value = Number(text);
      if (!Number.isFinite(value)) { errors.push(`${field.label} must be a number.`); return; }
      if (field.min != null && value < field.min) { errors.push(`${field.label} must be at least ${field.min}.`); return; }
      if (field.max != null && value > field.max) { errors.push(`${field.label} must be at most ${field.max}.`); return; }
      values[field.key] = value;
    } else {
      if (field.options && !field.options.includes(text)) { errors.push(`Choose a ${field.label.toLowerCase()}.`); return; }
      values[field.key] = text;
    }
  });
  return { ok: errors.length === 0, errors, values };
}

export function buildSession(device, values, now = new Date()) {
  return { type: device.type, title: device.title, values, date: now.toISOString() };
}

export function addSession(sessions, session, limit = 500) {
  return [session, ...(Array.isArray(sessions) ? sessions : [])].slice(0, limit);
}

export function sessionsToday(sessions, now = new Date()) {
  const day = isoDay(now);
  return (Array.isArray(sessions) ? sessions : []).filter((session) => session && dayOf(session.date) === day);
}

// Home's rule: one session recorded today. Several sessions a day are kept.
export function doneToday(sessions, now = new Date()) {
  return sessionsToday(sessions, now).length > 0;
}

// Resistive sessions in the last seven days, today included.
export function weeklyResistive(sessions, now = new Date()) {
  const end = new Date(now); end.setHours(0, 0, 0, 0);
  const start = new Date(end); start.setDate(start.getDate() - 6);
  return (Array.isArray(sessions) ? sessions : []).filter((session) => {
    if (!session || session.type !== "ared") return false;
    const date = new Date(session.date);
    return Number.isFinite(date.getTime()) && date >= start && date <= new Date(end.getTime() + 864e5 - 1);
  }).length;
}

export function removeSession(sessions, id) {
  return (Array.isArray(sessions) ? sessions : []).filter((session) => session && session.id !== id);
}

// One line for the deck's "Done for today" list.
export function todaySummary(sessions, now = new Date()) {
  const list = sessionsToday(sessions, now);
  if (!list.length) return "";
  const minutes = list.reduce((sum, session) => sum + (Number(session.values && session.values.minutes) || 0), 0);
  return `${list.length} session${list.length === 1 ? "" : "s"}, ${Math.round(minutes)} min`;
}

// A VO2max test needs a realistic value and a date. Pure so the card and the tests share it.
export function parseVo2(values) {
  const text = values && values.value != null ? String(values.value).trim() : "";
  const value = Number(text);
  if (text === "" || !Number.isFinite(value) || value < 5 || value > 90) {
    return { ok: false, field: "value", error: "Enter a value from 5 to 90 mL/kg/min." };
  }
  const [year, month, day] = String((values && values.date) || "").split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  if (!Number.isFinite(date.getTime())) return { ok: false, field: "date", error: "Choose the test date." };
  return { ok: true, value, date };
}

export function readSessions() {
  const store = typeof window !== "undefined" && window.AstroMedStore && window.AstroMedStore.store;
  if (!store) return [];
  const data = store.get(KEY, []);
  return Array.isArray(data) ? data : [];
}

export function saveSessions(sessions) {
  const store = typeof window !== "undefined" && window.AstroMedStore && window.AstroMedStore.store;
  return store ? store.set(KEY, sessions) : false;
}

