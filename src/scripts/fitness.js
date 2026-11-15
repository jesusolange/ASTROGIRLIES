// VO2max testing: the stored test list, when the next test is due and the findings it produces.
// Tests stay in the same `astromed-missions` record the rewards module reads.
import { load, save, today, addDays, DAYMS } from "./rewards.js";

const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const dayOfTime = (t) => (t ? isoDay(new Date(t)) : null);

export const VO2_EVERY = 14;

export function vo2List(s = load()) {
  return Array.isArray(s.vo2) ? s.vo2 : [];
}

export function vo2Due(s = load()) {
  if (!s.vo2.length) return { days: 0, last: null };
  const last = s.vo2.slice().sort((a, b) => new Date(b.time) - new Date(a.time))[0];
  const next = addDays(dayOfTime(last.time), VO2_EVERY);
  return { days: Math.round((parseIso(next) - parseIso(today())) / DAYMS), last, next };
}

export function lastVo2() {
  const l = load().vo2.slice().sort((a, b) => new Date(a.time) - new Date(b.time));
  return l.length ? { value: l[l.length - 1].value, time: l[l.length - 1].time, prev: l.length > 1 ? l[l.length - 2].value : null } : null;
}

export function findings() {
  const s = load(), v = vo2Due(s), out = [];
  if (!s.vo2.length) return out;
  if (v.days <= -3) out.push({ level: "review", title: "Fitness \u00b7 VO\u2082max test overdue", saw: `Your last test was ${VO2_EVERY - v.days} days ago. The plan is one test every ${VO2_EVERY} days.`, todo: "Do a VO\u2082max test this week so we can see your fitness trend." });
  const l = s.vo2.slice().sort((a, b) => new Date(a.time) - new Date(b.time));
  if (l.length >= 2) {
    const a = l[l.length - 2].value, b = l[l.length - 1].value, drop = (a - b) / a;
    if (drop >= 0.15) out.push({ level: "alert", title: "Fitness \u00b7 VO\u2082max dropped", saw: `VO\u2082max went from ${a} to ${b} (${Math.round(drop * 100)}% lower).`, todo: "Rest, repeat the test after a rest day and check your sleep, food and how often you do aerobic training.", tell: "flight-surgeon" });
    else if (drop >= 0.08) out.push({ level: "review", title: "Fitness \u00b7 VO\u2082max is lower", saw: `VO\u2082max went from ${a} to ${b} (${Math.round(drop * 100)}% lower).`, todo: "Add more aerobic sessions (CEVIS or T2) this week and test again in 14 days." });
    else out.push({ level: "ok", title: "Fitness \u00b7 VO\u2082max", saw: `Latest ${b} (before: ${a}).`, todo: "Your aerobic fitness is stable. Keep training." });
  }
  return out;
}

export function recordVo2(value, time = new Date().toISOString()) {
  const s = load();
  s.vo2 = [...vo2List(s), { value: Number(value), time }];
  save(s);
  return s.vo2;
}

export { save };
