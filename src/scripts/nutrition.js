/* Nutrition logic. Energy and nutrient targets follow NASA JSC-67378
   (Nutritional Requirements for Exploration Missions up to 365 days) and
   NASA-STD-3001 Tech Brief OCHMO-TB-013. A self-monitoring aid, not medical advice. */

import { alsoTell } from "./mission.js";

export const KEY = "astromed-nutrition";
export const FIELDS = ["kcal", "carb", "prot", "fat", "fiber", "sodium", "veg", "fluid", "iron"];
export const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];
export const UNITS = ["g", "mL", "portion"];
export const AF_OPTIONS = [1.11, 1.25];

// Iron in flight: NASA spaceflight nutrition cites about 8 to 10 mg per day for every crew member, lower than
// the ground value for women because iron stores rise in weightlessness. This 10 mg goal is our design choice;
// the app records iron from the package label or the imported food list and never estimates it.
export const IRON_GOAL = 10;

export function ironTarget() {
  return IRON_GOAL;
}

const round1 = (n) => Math.round(n * 10) / 10;
const num = (x) => Math.max(0, Number(x) || 0);

export const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const parseIso = (s) => { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, m - 1, d); };

export const blankNutrition = () => ({ entries: [], eva: {}, af: 1.11, lib: [] });

export function readNutrition() {
  const store = typeof window !== "undefined" && window.AstroMedStore && window.AstroMedStore.store;
  if (!store) return blankNutrition();
  const v = store.get(KEY, null);
  return v ? { ...blankNutrition(), ...v, lib: v.lib || [] } : blankNutrition();
}

export function saveNutrition(value) {
  const store = typeof window !== "undefined" && window.AstroMedStore && window.AstroMedStore.store;
  return store ? store.set(KEY, value) : false;
}

export function missionDayFor(prof, date = new Date()) {
  if (!prof || !prof.startDate) return null;
  const dayNum = (d) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  return dayNum(date) - dayNum(parseIso(prof.startDate)) + 1;
}

export function bmiClass(b) {
  if (b < 18.5) return "Low";
  if (b < 25) return "Normal";
  if (b < 30) return "High";
  return "Very high";
}

export function targets(prof, evaHours, af = 1.11) {
  if (!prof || !prof.age || !prof.sex || !prof.weightKg || !prof.heightCm) return null;
  const kg = prof.weightKg, m = prof.heightCm / 100, age = prof.age;
  const male = 662 - 9.53 * age + af * (15.9 * kg + 539.6 * m);
  const female = 354 - 6.91 * age + af * (9.36 * kg + 726 * m);
  const pick = (forMale, forFemale) => (prof.sex === "m" ? forMale : prof.sex === "f" ? forFemale : (forMale + forFemale) / 2);
  const kcal = pick(male, female) + 200 * (evaHours || 0);
  return {
    bmi: kg / (m * m), kcal,
    protein: [1.2 * kg, 1.8 * kg],
    carbs: [kcal * 0.45 / 4, kcal * 0.65 / 4],
    fat: [kcal * 0.20 / 9, kcal * 0.35 / 9],
    fiber: pick(38, 25),
    sodiumMax: 2300,
    fluid: Math.max(32 * kg, pick(2500, 2100)),
    veg: 400,
    iron: ironTarget(prof),
    evaKcal: 200 * (evaHours || 0)
  };
}

export const dayEntries = (state, day) => (state.entries || []).filter((e) => isoDay(new Date(e.time)) === day);

const DAY_MEALS = ["Breakfast", "Lunch", "Dinner"];

// Home's rule: breakfast, lunch and dinner all recorded today. A meal may be logged more than once.
export function doneToday(state, day) {
  const meals = new Set(dayEntries(state, day).map((e) => e.meal));
  return DAY_MEALS.every((meal) => meals.has(meal));
}

export function removeEntry(state, id) {
  return { ...state, entries: (state.entries || []).filter((entry) => entry.id !== id) };
}

// One line for the deck's "Done for today" list.
export function todaySummary(state, day = isoDay(new Date())) {
  const list = dayEntries(state, day);
  if (!list.length) return "";
  const tot = totalsOf(list);
  const meals = DAY_MEALS.filter((meal) => list.some((entry) => entry.meal === meal)).length;
  return `${Math.round(tot.kcal)} kcal, ${meals} of 3 main meals`;
}

// The plate's three slices, sized by the grams actually eaten. Shares add up to 1 when anything is logged.
export function plateShares(tot) {
  const rows = [
    { key: "carb", label: "Carbohydrate" },
    { key: "prot", label: "Protein" },
    { key: "veg", label: "Vegetables" }
  ].map((row) => ({ ...row, grams: Math.max(0, Number(tot && tot[row.key]) || 0) }));
  const total = rows.reduce((sum, row) => sum + row.grams, 0);
  return rows.map((row) => ({ ...row, share: total > 0 ? row.grams / total : 0, total }));
}

export function ironUnder(tot, T) {
  return Boolean(T && tot && tot.iron < T.iron);
}

export function totalsOf(list) {
  const t = Object.fromEntries(FIELDS.map((k) => [k, 0]));
  list.forEach((e) => FIELDS.forEach((k) => { t[k] += Number(e[k]) || 0; }));
  return t;
}

export const factor = (d) => { const a = Math.max(0, Number(d.amount) || 0); return d.unit === "portion" ? a : a / 100; };
export const unitLabel = (u, a) => (u === "portion" ? (Number(a) === 1 ? "portion" : "portions") : u);
export const basisText = (u) => (u === "portion" ? "per portion" : `per 100 ${u}`);

export function status(ratio, any) {
  if (!any) return { level: "none", label: "Nothing logged yet" };
  if (ratio < 0.5) return { level: "low", label: "Eat more" };
  if (ratio < 0.95) return { level: "mid", label: "Getting there" };
  if (ratio <= 1.05) return { level: "ok", label: "On target" };
  if (ratio <= 1.2) return { level: "over", label: "A bit over" };
  return { level: "high", label: "Too much" };
}

export function needList(tot, T) {
  const need = [];
  const left = Math.max(0, T.kcal - tot.kcal);
  if (left > 100) need.push(`${Math.round(left)} kcal`);
  if (tot.prot < T.protein[0]) need.push(`${Math.round(T.protein[0] - tot.prot)} g protein`);
  if (tot.fluid < T.fluid) need.push(`${Math.round(T.fluid - tot.fluid)} mL water`);
  if (tot.veg < T.veg) need.push(`${Math.round(T.veg - tot.veg)} g vegetables`);
  return need;
}

export function stampForDay(day, now = new Date()) {
  const d = parseIso(day);
  d.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
  return d.toISOString();
}

export function entryId(now = new Date()) {
  return now.getTime().toString(36) + Math.random().toString(36).slice(2, 5);
}

export function buildEntry(draft, meal, day, now = new Date()) {
  const unit = UNITS.includes(draft.unit) ? draft.unit : "g";
  const amount = num(draft.amount);
  const fac = factor({ ...draft, unit, amount });
  const per = Object.fromEntries(FIELDS.map((k) => [k, num(draft[k])]));
  if (unit === "mL" && !per.fluid) per.fluid = 100;
  const entry = {
    id: entryId(now), time: stampForDay(day, now),
    meal, name: String(draft.name || "").trim() || meal,
    portions: unit === "portion" ? amount : 1, amount, unit
  };
  FIELDS.forEach((k) => { entry[k] = round1(per[k] * fac); });
  return entry;
}

export function libraryItem(draft) {
  const unit = UNITS.includes(draft.unit) ? draft.unit : "g";
  const item = { code: String(draft.code || "").trim(), name: String(draft.name || "").trim(), unit };
  FIELDS.forEach((k) => { item[k] = num(draft[k]); });
  return item;
}

export function addToLibrary(lib, item) {
  if (!item.name) return lib;
  const same = (x) => (item.code && x.code === item.code) || String(x.name).toLowerCase() === item.name.toLowerCase();
  if (lib.some(same)) return lib;
  return [...lib, item];
}

export function waterEntry(day, now = new Date(), amount = 250) {
  return {
    id: entryId(now), time: stampForDay(day, now), meal: "Drink", name: "Water",
    portions: 1, kcal: 0, carb: 0, prot: 0, fat: 0, fiber: 0, sodium: 0, veg: 0, fluid: amount, iron: 0
  };
}

export function weekRows(state, prof, now = new Date()) {
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() - (6 - i)); return d; });
  const eva = state.eva || {};
  return days.map((d) => {
    const key = isoDay(d), list = dayEntries(state, key), tot = totalsOf(list);
    const T = targets(prof, Number(eva[key]) || 0, state.af || 1.11);
    return {
      key, weekday: d.toLocaleDateString("en-GB", { weekday: "short" }),
      kcal: tot.kcal, ...tot, any: list.length > 0, targetKcal: T ? T.kcal : null,
      target: T ? { kcal: T.kcal, protein: T.protein[0], carbs: T.carbs[0], fat: T.fat[0], fluid: T.fluid, veg: T.veg, iron: T.iron, sodiumMax: T.sodiumMax } : null,
      meals: ["Breakfast", "Lunch", "Dinner"].filter((m) => list.some((e) => e.meal === m)).length
    };
  });
}

// The weekly numbers Progress draws (the chart itself left this section).
export const weeklyNutrition = weekRows;

// Average of the last 3 logged days vs goal (null if no data or no profile).
export function summaryFor(state, prof, now = new Date()) {
  const rows = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const key = isoDay(d), list = dayEntries(state, key);
    if (!list.length) continue;
    const T = targets(prof, Number((state.eva || {})[key]) || 0, state.af || 1.11);
    if (!T) continue;
    const t = totalsOf(list);
    rows.push({ ratio: t.kcal / T.kcal, fluid: T.fluid ? t.fluid / T.fluid : null });
  }
  if (!rows.length) return null;
  const avg = (f) => rows.reduce((a, r) => a + (r[f] || 0), 0) / rows.length;
  return { ratio: avg("ratio"), fluid: avg("fluid"), days: rows.length };
}

const appetiteTell = () => {
  const sentence = alsoTell();
  return sentence ? ` If you have no appetite, ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}` : "";
};

export function findingsFor(s) {
  if (!s) return [];
  const out = [];
  const pct = Math.round(s.ratio * 100);
  if (s.ratio < 0.6) out.push({ level: "alert", title: "Nutrition · very low calories", saw: `You ate about ${pct}% of your calorie goal (average of the last ${s.days} logged day${s.days > 1 ? "s" : ""}).`, todo: "Add an extra snack and a larger meal today. Low food intake in space leads to weight and muscle loss." + appetiteTell() });
  else if (s.ratio < 0.8) out.push({ level: "review", title: "Nutrition · low calories", saw: `You ate about ${pct}% of your calorie goal (average of the last ${s.days} logged day${s.days > 1 ? "s" : ""}).`, todo: "Add a snack or a bigger meal. Eating enough protects bones, muscles and the immune system." });
  else if (s.ratio > 1.2) out.push({ level: "review", title: "Nutrition · calories above goal", saw: `You ate about ${pct}% of your calorie goal.`, todo: "Look at portion sizes and snacks. Keep exercising every day." });
  else out.push({ level: "ok", title: "Nutrition · calories", saw: `You ate about ${pct}% of your calorie goal.`, todo: "Keep the balance." });
  if (s.fluid != null && s.fluid > 0 && s.fluid < 0.6) out.push({ level: "review", title: "Nutrition · low fluids", saw: `You drank about ${Math.round(s.fluid * 100)}% of your fluid goal.`, todo: "Drink water through the day. Fluids shift in space and thirst can be weak." });
  return out;
}

/* ---------- food data import ---------- */

export function parseFoodList(text, filename = "list.csv") {
  let rows;
  if (String(filename).toLowerCase().endsWith(".json")) rows = JSON.parse(text);
  else {
    const lines = String(text).split(/\r?\n/).filter((l) => l.trim());
    const head = lines.shift().split(",").map((h) => h.trim().toLowerCase());
    rows = lines.map((l) => { const c = l.split(","); return Object.fromEntries(head.map((h, i) => [h, (c[i] || "").trim()])); });
  }
  return (Array.isArray(rows) ? rows : [])
    .filter((r) => r && r.name)
    .map((r) => {
      const item = { code: String(r.code || ""), name: String(r.name), unit: UNITS.includes(r.unit) ? r.unit : "portion" };
      FIELDS.forEach((k) => { item[k] = Number(r[k]) || 0; });
      return item;
    });
}

// Imported foods go to the front so they are found first when the astronaut searches "My foods".
export function mergeFoodList(lib, rows) {
  const next = [...lib];
  rows.forEach((item) => {
    const i = next.findIndex((x) => (item.code && x.code === item.code) || String(x.name).toLowerCase() === item.name.toLowerCase());
    if (i >= 0) next[i] = item; else next.unshift(item);
  });
  return next;
}

export function searchFoods(lib, query) {
  const q = String(query || "").trim().toLowerCase();
  const list = Array.isArray(lib) ? lib : [];
  if (!q) return list;
  return list.filter((food) => `${food.name || ""} ${food.code || ""}`.toLowerCase().includes(q));
}

/* ---------- Open Food Facts lookup ---------- */

export async function offLookup(code) {
  if (typeof navigator !== "undefined" && !navigator.onLine) return null;
  if (typeof fetch !== "function") return null;
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
    const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,product_name_en,nutriments,quantity,serving_size`, { signal: ctl.signal });
    clearTimeout(t);
    const j = await r.json();
    if (!j || j.status !== 1 || !j.product) return null;
    const p = j.product, n = p.nutriments || {};
    const value = (k) => (n[k] != null && n[k] !== "" ? Number(n[k]) : null);
    let kcal = value("energy-kcal_100g");
    if (kcal == null) { const kj = value("energy_100g"); kcal = kj != null ? kj / 4.184 : null; }
    if (kcal == null) return { name: p.product_name || p.product_name_en || "", none: true };
    const g = (k) => value(`${k}_100g`) || 0;
    let sodium = value("sodium_100g");
    if (sodium == null) { const salt = value("salt_100g"); sodium = salt != null ? salt / 2.5 : 0; }
    const liquid = /\d\s*(ml|cl|dl|l)\b/i.test(`${p.quantity || ""} ${p.serving_size || ""}`);
    return { name: p.product_name || p.product_name_en || "", unit: liquid ? "mL" : "g", basis: "100", kcal: round1(kcal), carb: g("carbohydrates"), prot: g("proteins"), fat: g("fat"), fiber: g("fiber"), sodium: Math.round(sodium * 1000) };
  } catch { return null; }
}

export async function lookupFood(code, lib) {
  const trimmed = String(code || "").trim();
  if (!trimmed) return { note: "" };
  const hit = lib.find((f) => f.code === trimmed);
  if (hit) return { food: hit, note: "Found in saved foods. Check the amount." };
  const online = typeof navigator === "undefined" || navigator.onLine;
  if (!online) return { note: "No internet, so barcode lookup is unavailable. Enter the food by hand or import a CSV list." };
  const found = await offLookup(trimmed);
  if (found && !found.none) return { food: found, note: `Found online (${found.kcal} kcal per 100 ${found.unit}). Check the amount.` };
  if (found) return { name: found.name, note: "Name found, but no calories. Type them from the label." };
  return { note: "Not found. Enter the name and calories by hand, or import a CSV list." };
}

/* ---------- public object and navigation ---------- */

export function summary() {
  const read = (k, fb) => window.AstroMedStore.store.get(k, fb);
  const prof = window.AstroMedProfile ? window.AstroMedProfile.get() : read("astromed-profile", null);
  return summaryFor(readNutrition(), prof);
}

export function findings() {
  return findingsFor(summary());
}

if (typeof window !== "undefined") {
  window.AstroMedNutrition = { render: () => {}, targets, read: readNutrition, summary, findings };
}
