// Points, levels, badges and the checks the app detects as done.
// Points come only from what the app records; there are no manual routine tasks.
const KEY = "astromed-missions";
const rd = (k, fb) => globalThis.AstroMedStore.store.get(k, fb);
const wr = (k, v) => globalThis.AstroMedStore.store.set(k, v);
const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const dayOfTime = (t) => (t ? isoDay(new Date(t)) : null);
const DAYMS = 864e5;
export const today = () => isoDay(new Date());
export const addDays = (iso, n) => { const d = parseIso(iso); d.setDate(d.getDate() + n); return isoDay(d); };

export const EMPTY_MISSIONS = { done: {}, auto: {}, vo2: [] };
export const load = () => {
  const s = rd(KEY, null) || {};
  return { done: s.done || {}, auto: s.auto || {}, vo2: s.vo2 || [] };
};
export const save = (s) => wr(KEY, s);

/* ---------- detected tasks ---------- */
// Every task is detected from the app's own data.
export const TASKS = [
  { id: "env", pts: 10, auto: true, t: "Check your environment", d: "Save your cabin readings." },
  { id: "checkup", pts: 15, auto: true, t: "Do your Daily Checkup", d: "Save at least one body measurement." },
  { id: "exercise", pts: 20, auto: true, t: "Scheduled exercise", d: "Log one exercise session. ISS crews train about 2.5 h a day." },
  { id: "meals", pts: 15, auto: true, t: "Log breakfast, lunch and dinner", d: "Add all three meals in Nutrition." },
  { id: "mental", pts: 10, auto: true, t: "Mental health check-in", d: "Pick how you feel today." }
];
export const MAXPTS = TASKS.reduce((a, t) => a + t.pts, 0);

export function detect(day) {
  const out = {};
  const env = rd("astromed-env", {});
  const elog = rd("astromed-env-log", []);
  out.env = dayOfTime(env.time) === day || (Array.isArray(elog) && elog.some((e) => dayOfTime(e.time) === day));
  const recs = rd("astrotwin-gui-v2-records", []);
  out.checkup = Array.isArray(recs) && recs.some((r) => r && r.part !== "env" && dayOfTime(r.time) === day);
  (Array.isArray(recs) ? recs : []).forEach((r) => { if (r && r.part) out[`checkup:${r.part}`] = out[`checkup:${r.part}`] || dayOfTime(r.time) === day; });
  const ex = rd("astrotwin-exercise-sessions", []);
  out.exercise = Array.isArray(ex) && ex.some((e) => dayOfTime(e.date) === day);
  const nu = rd("astromed-nutrition", { entries: [] }).entries || [];
  const meals = new Set(nu.filter((e) => dayOfTime(e.time) === day).map((e) => e.meal));
  out.meals = ["Breakfast", "Lunch", "Dinner"].every((m) => meals.has(m));
  const m = rd("astromed-mental", {});
  out.mental = [m.mood, m.depression, m.stress].some((x) => x && dayOfTime(x.date) === day);
  const immune = rd("astromed-immune", {});
  out.immune = Boolean(immune && immune.log && immune.log[day]);
  const rad = rd("astromed-radiation", { entries: [] }).entries || [];
  out.radiation = Array.isArray(rad) && rad.some((e) => e && e.day === day);
  return out;
}

function snapshot(s, day) {
  const d = detect(day);
  const prev = s.auto[day] || [];
  const set = new Set(prev);
  Object.entries(d).forEach(([k, v]) => { if (v) set.add(k); });
  s.auto[day] = [...set];
}
export function doneSet(s, day) {
  snapshot(s, day);
  return new Set([...(s.auto[day] || []), ...(s.done[day] || [])]);
}
export function dayPoints(s, day) {
  const ds = doneSet(s, day);
  return TASKS.reduce((a, t) => a + (ds.has(t.id) ? t.pts : 0), 0);
}

export function stats(s = load()) {
  const t = today();
  const first = Object.keys({ ...s.auto, ...s.done }).sort()[0] || t;
  let total = 0;
  for (let d = first; d <= t; d = addDays(d, 1)) total += dayPoints(s, d);
  total += s.vo2.length * 30;
  let streak = 0, d = t;
  if (dayPoints(s, d) < MAXPTS * 0.6) d = addDays(d, -1);
  while (dayPoints(s, d) >= MAXPTS * 0.6 && d >= addDays(t, -400)) { streak++; d = addDays(d, -1); }
  const avg = (from, n) => { let a = 0; for (let i = 0; i < n; i++) a += dayPoints(s, addDays(from, -i)); return (a / n / MAXPTS) * 100; };
  const thisWk = avg(t, 7), prevWk = avg(addDays(t, -7), 7);
  return { total, streak, thisWk, prevWk, level: Math.floor(total / 250) + 1 };
}

const TITLES = ["Cadet", "Crew Member", "Flight Specialist", "Mission Specialist", "Senior Astronaut", "Commander"];
export const titleOf = (lvl) => TITLES[Math.min(TITLES.length - 1, lvl - 1)];

export function badges(s = load(), st = stats(s)) {
  const ds = doneSet(s, today());
  const recs = rd("astrotwin-gui-v2-records", []);
  const parts = new Set((Array.isArray(recs) ? recs : []).filter((r) => dayOfTime(r.time) === today()).map((r) => r.part));
  return [
    { on: st.streak >= 3, n: "3-day streak" },
    { on: st.streak >= 7, n: "7-day streak" },
    { on: st.streak >= 14, n: "14-day streak" },
    { on: TASKS.every((t) => ds.has(t.id)), n: "Perfect day" },
    { on: parts.size >= 6, n: "Full-body checkup" },
    { on: s.vo2.length >= 1, n: "First VO\u2082max" },
    { on: s.vo2.length >= 3, n: "Fitness tracker" }
  ];
}

export { DAYMS };
