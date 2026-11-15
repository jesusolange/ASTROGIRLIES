/* ==============================================
   ASTROMED — PROGRESS DATA
   History for the charts, kept on its own so entries can be added or
   deleted without touching the Daily Checkup records. Pure helpers here;
   the interface lives under src/components/progress/.
============================================== */

export const KEY = "astromed-history";
export const DAY = 864e5;
export const CHART = { W: 720, H: 300, L: 46, R: 16, T: 16, B: 34 };

/* Normal (green) band drawn behind each chart. Illustrative reference ranges. */
export const BANDS = {
  "heart.hr": [60, 100], "heart.sys": [90, 120], "heart.dia": [60, 80],
  "lungs.resp": [12, 18], "lungs.spo2": [95, 100],
  "brain.sleep": [6, 9], "brain.mood": [5, 10],
  "hand.pulse": [60, 100], "hand.spo2": [95, 100], "hand.bodyTemp": [36, 37.8], "hand.glucose": [70, 99],
  "env.temp": [18, 27], "env.pressure": [95, 105], "env.humidity": [30, 60], "env.co2": [0, 3000], "env.noise": [30, 60],
  "muscles.activity": [30, 180], "bones.exercise": [30, 180], "kidneys.fluidIntake": [1500, 4000],
};

/* Typical value, daily noise, drift per day — only for the demo-data button. */
export const DEMO = {
  hr: [76, 4, 0.15], sys: [118, 5, 0.2], dia: [76, 3, 0.1], hrv: [42, 5, -0.2],
  resp: [16, 1, 0], spo2: [97.5, 0.8, -0.03],
  exercise: [45, 10, 0.4], bmd: [1.12, 0.004, -0.001],
  urineOutput: [1500, 180, 0], collectionHours: [24, 0, 0], weightKg: [65, 0.3, -0.02], fluidIntake: [2000, 250, -10],
  sleep: [7.2, 0.5, -0.04], reaction: [285, 18, 1.5], mood: [7, 0.8, -0.05],
  pulse: [72, 4, 0.1], skin: [33.1, 0.4, 0], bodyTemp: [36.8, 0.15, 0.01], glucose: [90, 7, 0.4],
  activity: [65, 12, 0.3], strength: [25, 2, 0.15],
  temp: [22, 0.6, 0], pressure: [101.3, 0.4, 0], humidity: [45, 4, 0], co2: [2400, 250, 40], noise: [55, 3, 0.2], radiation: [20, 2, 0.1],
};

export const EMPTY = () => ({ entries: [], seen: [] });
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const store = () => (typeof globalThis !== "undefined" && globalThis.AstroMedStore && globalThis.AstroMedStore.store) || null;

export function loadHistory() {
  const api = store();
  const value = api ? api.get(KEY, null) : null;
  return value && Array.isArray(value.entries) ? { entries: value.entries, seen: Array.isArray(value.seen) ? value.seen : [] } : EMPTY();
}

export function saveHistory(history) {
  const api = store();
  if (api) api.set(KEY, history);
}

export function allIds(meta) {
  return Object.entries(meta).flatMap(([part, system]) => Object.keys(system.f).map((key) => `${part}.${key}`));
}

export function labelFor(meta, id) {
  const [part, key] = id.split(".");
  return ((meta[part] && meta[part].f[key]) || [key, ""])[0];
}

export function unitFor(meta, id) {
  const [part, key] = id.split(".");
  return ((meta[part] && meta[part].f[key]) || [key, ""])[1];
}

export function levelOf(id, value) {
  const rule = globalThis.AstroMedData && globalThis.AstroMedData.rule;
  return (rule && rule(id.split(".")[1], value) || {}).level || "info";
}

export function fmtNum(value) {
  return Math.abs(value) >= 100 ? Math.round(value) : Math.round(value * 100) / 100;
}

export function entriesFor(history, id) {
  return history.entries
    .filter((entry) => `${entry.part}.${entry.key}` === id)
    .sort((a, b) => new Date(a.time) - new Date(b.time));
}

const avg = (list) => (list.length ? list.reduce((sum, entry) => sum + entry.value, 0) / list.length : null);

export function statsFor(list, now = Date.now()) {
  const current = list.filter((entry) => now - new Date(entry.time) < 7 * DAY);
  const previous = list.filter((entry) => now - new Date(entry.time) >= 7 * DAY && now - new Date(entry.time) < 14 * DAY);
  return { n: current.length, cur: avg(current), prev: avg(previous) };
}

export function arrow(cur, prev) {
  if (cur == null || prev == null || prev === 0) return { txt: "—", cls: "flat" };
  const delta = ((cur - prev) / Math.abs(prev)) * 100;
  if (Math.abs(delta) < 1) return { txt: "→ 0%", cls: "flat" };
  return { txt: `${delta > 0 ? "↑" : "↓"} ${Math.abs(delta).toFixed(1)}%`, cls: delta > 0 ? "up" : "down" };
}

export function chartBounds(values, band) {
  let lo = Math.min(...(values.length ? values : [0]), ...(band ? [band[0]] : []));
  let hi = Math.max(...(values.length ? values : [1]), ...(band ? [band[1]] : []));
  if (lo === hi) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.12;
  return { lo: lo - pad, hi: hi + pad };
}

/* Import new Daily Checkup records and Environment readings, never re-adding a deleted one. */
export function syncHistory(history, records, envLog) {
  const next = { entries: [...history.entries], seen: [...history.seen] };
  let changed = false;

  const add = (time, part, values) => {
    const signature = `${part}|${time}`;
    if (next.seen.includes(signature)) return;
    next.seen.push(signature);
    Object.entries(values || {}).forEach(([key, value]) => {
      if (Number.isFinite(Number(value))) next.entries.push({ id: uid(), part, key, value: Number(value), time, src: "checkup" });
    });
    changed = true;
  };

  (Array.isArray(records) ? records : []).forEach((record) => {
    if (!record || !record.part) return;
    add(record.time, record.part, record.values);
  });
  (Array.isArray(envLog) ? envLog : []).forEach((entry) => {
    if (!entry) return;
    const signature = `env|${entry.time}`;
    if (next.seen.includes(signature)) return;
    next.seen.push(signature);
    Object.entries(entry.readings || {}).forEach(([key, value]) => {
      if (Number.isFinite(Number(value))) next.entries.push({ id: uid(), part: "env", key, value: Number(value), time: entry.time, src: "checkup" });
    });
    changed = true;
  });

  if (next.seen.length > 4000) next.seen = next.seen.slice(-3000);
  return { history: next, changed };
}

/* Fold new checkup and environment readings into the history (the public hook older modules call). */
export function syncProgress() {
  const api = store();
  if (!api) return;
  const { history, changed } = syncHistory(loadHistory(), api.get("astrotwin-gui-v2-records", []), api.get("astromed-env-log", []));
  if (changed) saveHistory(history);
}

/* Simulated mission data: 14 days with gentle, realistic drift. Clearly tagged "demo". */
export function demoEntries(meta, now = Date.now(), seedStart = 7) {
  let seed = seedStart;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - 0.5; };
  const entries = [];
  Object.entries(meta).forEach(([part, system]) => {
    Object.keys(system.f).forEach((key) => {
      const demo = DEMO[key];
      if (!demo) return;
      for (let i = 13; i >= 0; i--) {
        const time = new Date(now - i * DAY);
        time.setHours(8, 15, 0, 0);
        if (time.getTime() > now) time.setTime(now);   // never place a demo reading in the future
        const value = demo[0] + demo[2] * (13 - i) + rnd() * 2 * demo[1];
        entries.push({ id: uid(), part, key, value: Math.round(value * 100) / 100, time: time.toISOString(), src: "demo" });
      }
    });
  });
  return entries;
}

if (typeof window !== "undefined") {
  window.AstroMedProgress = { sync: syncProgress };
}
