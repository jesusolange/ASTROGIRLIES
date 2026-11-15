import test from "node:test";
import assert from "node:assert/strict";
import {
  targets, totalsOf, dayEntries, factor, unitLabel, buildEntry, status,
  weekRows, summaryFor, findingsFor, addToLibrary, parseFoodList, mergeFoodList,
  isoDay, blankNutrition, waterEntry, lookupFood
} from "../src/scripts/nutrition.js";

const profile = { age: 40, sex: "m", weightKg: 80, heightCm: 180, startDate: "2026-11-01" };
const close = (a, b, tol = 0.001) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);
const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).toISOString();
const entry = (time, kcal, extra = {}) => ({ id: time, time, meal: "Breakfast", name: "Food", kcal, ...extra });

test("energy target follows the male equation at activity 1.11", () => {
  const T = targets(profile, 0, 1.11);
  close(T.kcal, 2770.8408);
  close(T.bmi, 24.691358, 0.0001);
  close(T.protein[0], 96);
  close(T.protein[1], 144);
  close(T.fiber, 38);
  close(T.fluid, 2560);
  close(T.sodiumMax, 2300);
  close(T.veg, 400);
});

test("prefer not to say averages the male and female formulas", () => {
  const m = targets(profile, 0, 1.11);
  const f = targets({ ...profile, sex: "f" }, 0, 1.11);
  const x = targets({ ...profile, sex: "x" }, 0, 1.11);
  close(x.kcal, (m.kcal + f.kcal) / 2);
  close(x.fiber, (38 + 25) / 2);
  close(x.fluid, Math.max(32 * 80, (2500 + 2100) / 2));
});

test("EVA hours add 200 kcal each and target needs a complete profile", () => {
  close(targets(profile, 2, 1.11).kcal - targets(profile, 0, 1.11).kcal, 400);
  assert.equal(targets(null, 0, 1.11), null);
  assert.equal(targets({ ...profile, weightKg: null }, 0, 1.11), null);
});

test("daily totals add every nutrient field", () => {
  const totals = totalsOf([
    { kcal: 100, carb: 10, prot: 5, fat: 2, fiber: 3, sodium: 50, veg: 20, fluid: 200 },
    { kcal: 250, carb: 30, prot: 12, fat: 8, fiber: 4, sodium: 100, veg: 0, fluid: 0 }
  ]);
  assert.deepEqual(totals, { kcal: 350, carb: 40, prot: 17, fat: 10, fiber: 7, sodium: 150, veg: 20, fluid: 200 });
});

test("entries are grouped by the local day", () => {
  const state = { ...blankNutrition(), entries: [entry(at(2026, 11, 14), 100), entry(at(2026, 11, 13), 50)] };
  assert.equal(dayEntries(state, "2026-11-14").length, 1);
  assert.equal(dayEntries(state, "2026-11-13")[0].kcal, 50);
});

test("amounts scale from a per-100 basis or portions", () => {
  close(factor({ amount: 250, unit: "g" }), 2.5);
  close(factor({ amount: 2, unit: "portion" }), 2);
  assert.equal(unitLabel("portion", 1), "portion");
  assert.equal(unitLabel("portion", 2), "portions");
  assert.equal(unitLabel("mL", 200), "mL");
});

test("a built entry keeps the stored record shape and scales values", () => {
  const now = new Date(2026, 10, 14, 15, 30, 0);
  const built = buildEntry({ amount: 200, unit: "g", name: "Oats", code: "123", kcal: 100, carb: 10, prot: 5 }, "Breakfast", "2026-11-14", now);
  assert.equal(built.meal, "Breakfast");
  assert.equal(built.name, "Oats");
  assert.equal(built.amount, 200);
  assert.equal(built.portions, 1);
  assert.equal(built.kcal, 200);
  assert.equal(built.carb, 20);
  assert.equal(built.prot, 10);
});

test("a drink in mL counts as fluid by default and portions set portions", () => {
  const now = new Date(2026, 10, 14, 15, 30, 0);
  const drink = buildEntry({ amount: 250, unit: "mL", name: "Juice", kcal: 40 }, "Snack", "2026-11-14", now);
  assert.equal(drink.fluid, 250);
  const portion = buildEntry({ amount: 2, unit: "portion", name: "Bread", kcal: 80 }, "Snack", "2026-11-14", now);
  assert.equal(portion.portions, 2);
  assert.equal(portion.kcal, 160);
});

test("water adds a fluid-only entry to the current day", () => {
  const water = waterEntry("2026-11-14", new Date(2026, 10, 14, 9), 250);
  assert.equal(water.fluid, 250);
  assert.equal(water.kcal, 0);
  assert.equal(water.meal, "Drink");
});

test("status bands match the plate colours", () => {
  assert.equal(status(0, false).level, "none");
  assert.equal(status(0.4, true).level, "low");
  assert.equal(status(0.7, true).level, "mid");
  assert.equal(status(1, true).level, "ok");
  assert.equal(status(1.1, true).level, "over");
  assert.equal(status(1.4, true).level, "high");
});

test("weekly rows cover seven days with targets and meal counts", () => {
  const now = new Date(2026, 10, 14, 12);
  const state = { ...blankNutrition(), entries: [entry(at(2026, 11, 14), 300), entry(at(2026, 11, 14), 200, { meal: "Lunch" })] };
  const rows = weekRows(state, profile, now);
  assert.equal(rows.length, 7);
  assert.equal(rows[6].key, isoDay(now));
  close(rows[6].kcal, 500);
  assert.equal(rows[6].meals, 2);
  close(rows[6].targetKcal, targets(profile, 0, 1.11).kcal);
  assert.equal(rows[0].any, false);
});

test("summary averages the last three logged days and findings follow the bands", () => {
  const now = new Date(2026, 10, 14, 12);
  const T = targets(profile, 0, 1.11);
  const state = { ...blankNutrition(), entries: [entry(at(2026, 11, 14), T.kcal * 0.5), entry(at(2026, 11, 13), T.kcal * 0.5)] };
  const summary = summaryFor(state, profile, now);
  assert.equal(summary.days, 2);
  close(summary.ratio, 0.5);
  const findings = findingsFor(summary);
  assert.equal(findings[0].level, "alert");
  assert.equal(findingsFor(null).length, 0);
});

test("library entries are de-duplicated by code or name", () => {
  const lib = addToLibrary([], { code: "1", name: "Milk", kcal: 50 });
  assert.equal(addToLibrary(lib, { code: "1", name: "Other" }).length, 1);
  assert.equal(addToLibrary(lib, { code: "", name: "milk" }).length, 1);
  assert.equal(addToLibrary(lib, { code: "2", name: "Bread" }).length, 2);
});

test("legacy records without lib or eva still load", () => {
  assert.equal(dayEntries({}, "2026-11-14").length, 0);
  assert.equal(summaryFor({ entries: [] }, profile, new Date(2026, 10, 14)), null);
  const rows = weekRows({ entries: [] }, profile, new Date(2026, 10, 14));
  assert.equal(rows.length, 7);
  assert.equal(rows[6].kcal, 0);
});

test("food lists load from CSV and JSON and merge by name", () => {
  const csv = parseFoodList("code,name,kcal,prot\n123,Oats,150,5\n", "list.csv");
  assert.deepEqual(csv[0], { code: "123", name: "Oats", unit: "portion", kcal: 150, carb: 0, prot: 5, fat: 0, fiber: 0, sodium: 0, veg: 0, fluid: 0 });
  const json = parseFoodList(JSON.stringify([{ name: "Rice", kcal: 200, unit: "g" }]), "list.json");
  assert.equal(json[0].unit, "g");
  const merged = mergeFoodList(csv, [{ ...json[0], name: "Oats", kcal: 160 }]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].kcal, 160);
});

test("without a network the barcode lookup names manual entry and CSV import", async () => {
  const result = await lookupFood("1234567890123", []);
  assert.match(result.note, /no internet/i);
  assert.match(result.note, /by hand/i);
  assert.match(result.note, /CSV/i);
});
