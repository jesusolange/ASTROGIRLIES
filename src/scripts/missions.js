/* ==============================================
   ASTROMED — MISSION DAY (checks, points, streaks, training, reminders)
   The task list follows the structure of a standard ISS crew day
   (planning conference, work block, 2.5 h scheduled exercise, meals,
   evening conference, 8.5 h sleep window; ESA "The astronaut daily schedule").
   Educational prototype: not medical advice.
============================================== */

const KEY = "astromed-missions";
const rd = (k, fb) => globalThis.AstroMedStore.store.get(k, fb);
const wr = (k, v) => globalThis.AstroMedStore.store.set(k, v);
const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const dayOfTime = (t) => (t ? isoDay(new Date(t)) : null);
const DAYMS = 864e5;
export const today = () => isoDay(new Date());
const addDays = (iso, n) => { const d = parseIso(iso); d.setDate(d.getDate() + n); return isoDay(d); };

export const EMPTY_MISSIONS = { done: {}, auto: {}, vo2: [], reminders: null, fired: {}, tab: "today" };
const load = () => {
  const s = rd(KEY, null) || {};
  return { done: s.done || {}, auto: s.auto || {}, vo2: s.vo2 || [], reminders: s.reminders || null, fired: s.fired || {}, tab: s.tab || "today" };
};
const save = (s) => wr(KEY, s);

/* ---------- tasks ---------- */
// auto: detected from the app's own data. manual: the astronaut ticks it.
export const TASKS = [
  { id: "env", pts: 10, auto: true, t: "Check your environment", d: "Save your cabin readings." },
  { id: "checkup", pts: 15, auto: true, t: "Do your Daily Checkup", d: "Save at least one body measurement." },
  { id: "exercise", pts: 20, auto: true, t: "Scheduled exercise", d: "Log one exercise session. ISS crews train about 2.5 h a day." },
  { id: "meals", pts: 15, auto: true, t: "Log breakfast, lunch and dinner", d: "Add all three meals in Nutrition." },
  { id: "mental", pts: 10, auto: true, t: "Mental health check-in", d: "Pick how you feel today." },
  { id: "plan", pts: 5, auto: false, t: "Morning planning", d: "Review today's plan and note the tasks you will do and follow up on." },
  { id: "house", pts: 5, auto: false, t: "Housekeeping", d: "Clean your area. Check air vents." },
  { id: "equip", pts: 5, auto: false, t: "Equipment check", d: "Dosimeter on, devices charged." },
  { id: "sleep", pts: 10, auto: false, t: "Keep your sleep window", d: "Go to bed on time. ISS crews sleep 8.5 h." },
  { id: "eve", pts: 5, auto: false, t: "Evening wrap-up", d: "Review your day. Note anything to follow up tomorrow." }
];
export const MAXPTS = TASKS.reduce((a, t) => a + t.pts, 0);

/* ---------- automatic completion ---------- */
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
function doneSet(s, day) {
  snapshot(s, day);
  return new Set([...(s.auto[day] || []), ...(s.done[day] || [])]);
}
function dayPoints(s, day) {
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

/* ---------- when a check comes back ---------- */
// Design choice, not a NASA rule: a higher NASA rating brings the check back sooner.
export const CHECK_INTERVALS = [
  { min: 16, days: 1, label: "every day" },
  { min: 9, days: 2, label: "every 2 days" },
  { min: 0, days: 7, label: "every week" }
];
export function intervalFor(score) {
  return CHECK_INTERVALS.find((i) => score >= i.min) || CHECK_INTERVALS[CHECK_INTERVALS.length - 1];
}
export function daysSince(lastIso, now = new Date()) {
  if (!lastIso) return Infinity;
  const last = parseIso(lastIso);
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((current - last) / DAYMS);
}
export function isDue(lastIso, intervalDays, now = new Date()) {
  return daysSince(lastIso, now) >= intervalDays;
}

function latestDay(list, field) {
  const days = (Array.isArray(list) ? list : []).map((x) => (x ? dayOfTime(x[field]) : null)).filter(Boolean).sort();
  return days.pop() || null;
}
function lastMealsDay() {
  const entries = rd("astromed-nutrition", { entries: [] }).entries || [];
  const byDay = {};
  entries.forEach((e) => { const d = dayOfTime(e.time); if (d) (byDay[d] = byDay[d] || new Set()).add(e.meal); });
  return Object.keys(byDay).filter((d) => ["Breakfast", "Lunch", "Dinner"].every((m) => byDay[d].has(m))).sort().pop() || null;
}

// Last day a check was completed, as YYYY-MM-DD, or null.
export function lastDoneFor(key) {
  if (!key) return null;
  if (key.startsWith("overview:")) {
    const part = key.slice("overview:".length);
    const recs = rd("astrotwin-gui-v2-records", []);
    return latestDay((Array.isArray(recs) ? recs : []).filter((r) => r && r.part === part), "time");
  }
  switch (key) {
    case "nutrition": return lastMealsDay();
    case "twin": return latestDay(rd("astrotwin-exercise-sessions", []), "date");
    case "mental": {
      const m = rd("astromed-mental", {}) || {};
      return ["mood", "depression", "stress"].map((k) => (m[k] ? dayOfTime(m[k].date) : null)).filter(Boolean).sort().pop() || null;
    }
    case "environment": {
      const live = rd("astromed-env", null);
      return [latestDay(rd("astromed-env-log", []), "time"), live && live.time ? dayOfTime(live.time) : null].filter(Boolean).sort().pop() || null;
    }
    case "immune": {
      const immune = rd("astromed-immune", {});
      const logDay = Object.keys((immune && immune.log) || {}).sort().pop() || null;
      const testDay = latestDay((immune && immune.tests) || [], "time");
      return [logDay, testDay].filter(Boolean).sort().pop() || null;
    }
    case "radiation": {
      const entries = rd("astromed-radiation", { entries: [] }).entries || [];
      return (Array.isArray(entries) ? entries : []).map((e) => e && e.day).filter(Boolean).sort().pop() || null;
    }
    default: return null;
  }
}

/* ---------- VO2max ---------- */
export const VO2_EVERY = 14;
export function vo2Due(s = load()) {
  if (!s.vo2.length) return { days: 0, last: null };
  const last = s.vo2.slice().sort((a, b) => new Date(b.time) - new Date(a.time))[0];
  const next = addDays(dayOfTime(last.time), VO2_EVERY);
  return { days: Math.round((parseIso(next) - parseIso(today())) / DAYMS), last, next };
}
/* ---------- equipment guide ---------- */
export const EQUIP = {
  pulse: { name: "Pulse oximeter", use: "Pulse and SpO\u2082", steps: ["Sit and rest for 5 minutes. Warm your hand if it is cold.", "Remove nail polish and clip the sensor on your index finger, display facing up.", "Rest the hand at heart level and keep still. Do not talk.", "Wait 15\u201330 seconds until the number stops changing.", "Write down pulse and SpO\u2082 in the Daily Checkup."], note: "Cold fingers and movement give false low readings." },
  bp: { name: "Blood pressure cuff", use: "Systolic and diastolic pressure", steps: ["Sit with your back supported and feet flat if gravity allows. Rest 5 minutes.", "Place the cuff on the bare upper arm, bottom edge about 2 cm above the elbow.", "Support the arm at heart level. Do not talk or move.", "Press start. The cuff inflates, then slowly releases.", "Take a second reading after 1 minute. Record both."], note: "Avoid caffeine and exercise for 30 minutes before." },
  gluco: { name: "Glucometer", use: "Blood glucose (mg/dL)", steps: ["Wash and dry your hands.", "Insert a fresh test strip. The meter turns on.", "Use the lancing device on the side of a fingertip.", "Touch the drop of blood to the strip edge.", "Read the result after the countdown and record it. Dispose of the lancet safely."], note: "Note whether the reading is fasting or after a meal." },
  thermo: { name: "Thermometer", use: "Body temperature", steps: ["Wait 15 minutes after eating, drinking or exercise.", "Clean the tip and switch the thermometer on.", "Place the tip under the tongue, lips closed.", "Hold until it beeps.", "Record the value in the Daily Checkup."], note: "A high reading needs a repeat measurement after 15 minutes of rest; write it down and repeat it the next day." },
  dosi: { name: "Radiation dosimeter", use: "Personal radiation dose", steps: ["Wear it on the body, in the same place every day.", "Check the display or light shows it is running.", "Read the dose at the same time each day.", "Record it in the Radiation page.", "Write down any sudden jump and repeat the reading the next day."], note: "Your own baseline matters more than a single number." }
};

/* ---------- findings for the shared analysis ---------- */
export function findings() {
  const s = load(), v = vo2Due(s), out = [];
  if (!s.vo2.length) return out;
  if (v.days <= -3) out.push({ level: "review", title: "Fitness \u00b7 VO\u2082max test overdue", saw: `Your last test was ${VO2_EVERY - v.days} days ago. The plan is one test every ${VO2_EVERY} days.`, todo: "Do a VO\u2082max test this week so we can see your fitness trend." });
  const l = s.vo2.slice().sort((a, b) => new Date(a.time) - new Date(b.time));
  if (l.length >= 2) {
    const a = l[l.length - 2].value, b = l[l.length - 1].value, drop = (a - b) / a;
    if (drop >= 0.15) out.push({ level: "alert", title: "Fitness \u00b7 VO\u2082max dropped", saw: `VO\u2082max went from ${a} to ${b} (${Math.round(drop * 100)}% lower).`, todo: "Rest, repeat the test after a rest day and check your sleep, food and how often you do aerobic training. If Earth contact exists, also tell the flight surgeon." });
    else if (drop >= 0.08) out.push({ level: "review", title: "Fitness \u00b7 VO\u2082max is lower", saw: `VO\u2082max went from ${a} to ${b} (${Math.round(drop * 100)}% lower).`, todo: "Add more aerobic sessions (CEVIS or T2) this week and test again in 14 days." });
    else out.push({ level: "ok", title: "Fitness \u00b7 VO\u2082max", saw: `Latest ${b} (before: ${a}).`, todo: "Your aerobic fitness is stable. Keep training." });
  }
  return out;
}
export function lastVo2() {
  const l = load().vo2.slice().sort((a, b) => new Date(a.time) - new Date(b.time));
  return l.length ? { value: l[l.length - 1].value, time: l[l.length - 1].time, prev: l.length > 1 ? l[l.length - 2].value : null } : null;
}

export { load, save, doneSet, dayPoints };

if (typeof window !== "undefined") {
  window.AstroMedMissions = { stats: () => stats(load()), findings, lastVo2 };
}
