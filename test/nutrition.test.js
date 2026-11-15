import test from "node:test";
import assert from "node:assert/strict";
import {
  targets, totalsOf, dayEntries, factor, unitLabel, buildEntry, status,
  weekRows, summaryFor, findingsFor, addToLibrary, parseFoodList, mergeFoodList,
  isoDay, blankNutrition, waterEntry, lookupFood, doneToday, plateShares, ironLimit,
  ironMinimum, ironOver, searchFoods, removeEntry, todaySummary
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
  close(T.iron, 8);
  assert.equal(T.ironMin, null);
});

test("iron is a limit of 8 mg for every crew member", () => {
  assert.equal(ironLimit(), 8);
  assert.equal(targets(profile, 0, 1.11).iron, 8);
});

test("women under 50 who are not postmenopausal get the 18 mg minimum", () => {
  assert.equal(ironMinimum({ sex: "f", meno: "pre", age: 30 }), 18);
  assert.equal(ironMinimum({ sex: "f", age: 30 }), 18);
  assert.equal(ironMinimum({ sex: "f", meno: "pre", age: 55 }), null);
  assert.equal(ironMinimum({ sex: "f", meno: "post", age: 45 }), null);
  assert.equal(ironMinimum({ sex: "m" }), null);
  assert.equal(ironMinimum(null), null);
  assert.equal(targets({ ...profile, sex: "f", meno: "pre", age: 30 }, 0, 1.11).ironMin, 18);
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
    { kcal: 100, carb: 10, prot: 5, fat: 2, fiber: 3, sodium: 50, veg: 20, fluid: 200, iron: 2 },
    { kcal: 250, carb: 30, prot: 12, fat: 8, fiber: 4, sodium: 100, veg: 0, fluid: 0, iron: 3 }
  ]);
  assert.deepEqual(totals, { kcal: 350, carb: 40, prot: 17, fat: 10, fiber: 7, sodium: 150, veg: 20, fluid: 200, iron: 5 });
});

test("a day is done when breakfast, lunch and dinner are recorded", () => {
  const state = { ...blankNutrition(), entries: [
    entry(at(2026, 11, 14), 100),
    entry(at(2026, 11, 14), 200, { meal: "Lunch" })
  ] };
  assert.equal(doneToday(state, "2026-11-14"), false);
  state.entries.push(entry(at(2026, 11, 14), 300, { meal: "Dinner" }));
  assert.equal(doneToday(state, "2026-11-14"), true);
  assert.equal(doneToday(state, "2026-11-13"), false);
});

test("the deck summary names the calories and main meals", () => {
  const state = { ...blankNutrition(), entries: [
    entry(at(2026, 11, 14), 400),
    entry(at(2026, 11, 14), 500, { meal: "Lunch" })
  ] };
  assert.equal(todaySummary(state, "2026-11-14"), "900 kcal, 2 of 3 main meals");
  assert.equal(todaySummary(state, "2026-11-13"), "");
});

test("plate shares follow the grams eaten and add up", () => {
  const shares = plateShares({ carb: 150, prot: 50, veg: 100 });
  close(shares[0].share, 0.5);
  close(shares[1].share, 1 / 6);
  close(shares[2].share, 1 / 3);
  close(shares.reduce((sum, row) => sum + row.share, 0), 1);
  assert.deepEqual(plateShares({ carb: 0, prot: 0, veg: 0 }).map((row) => row.share), [0, 0, 0]);
});

test("iron over the limit is marked and an entry can be removed", () => {
  const T = targets(profile, 0, 1.11);
  assert.equal(ironOver({ iron: 9 }, T), true);
  assert.equal(ironOver({ iron: 8 }, T), false);
  const state = { ...blankNutrition(), entries: [entry(at(2026, 11, 14), 100)] };
  assert.equal(removeEntry(state, state.entries[0].id).entries.length, 0);
});

test("iron above the flight limit is only an info finding", () => {
  const now = new Date(2026, 10, 14, 12);
  const high = summaryFor({ ...blankNutrition(), entries: [entry(at(2026, 11, 14), 200, { iron: 10 })] }, profile, now);
  close(high.iron, 10);
  assert.equal(high.ironLimit, 8);
  const iron = findingsFor(high).filter((finding) => /iron/i.test(finding.title));
  assert.equal(iron.length, 1);
  assert.equal(iron[0].level, "info");
  const low = summaryFor({ ...blankNutrition(), entries: [entry(at(2026, 11, 14), 200, { iron: 5 })] }, profile, now);
  assert.equal(findingsFor(low).filter((finding) => /iron/i.test(finding.title)).length, 0);
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
  assert.deepEqual(csv[0], { code: "123", name: "Oats", unit: "portion", kcal: 150, carb: 0, prot: 5, fat: 0, fiber: 0, sodium: 0, veg: 0, fluid: 0, iron: 0 });
  const json = parseFoodList(JSON.stringify([{ name: "Rice", kcal: 200, unit: "g" }]), "list.json");
  assert.equal(json[0].unit, "g");
  const merged = mergeFoodList(csv, [{ ...json[0], name: "Oats", kcal: 160 }]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].kcal, 160);
});

test("imported foods are searched first and search matches name or code", () => {
  const imported = { code: "9", name: "Iron bar", unit: "portion", kcal: 200, iron: 4 };
  const saved = { code: "1", name: "Milk", unit: "mL", kcal: 50, iron: 0 };
  const lib = mergeFoodList([saved], [imported]);
  assert.equal(lib[0].name, "Iron bar");
  assert.deepEqual(searchFoods(lib, "iron").map((food) => food.name), ["Iron bar"]);
  assert.deepEqual(searchFoods(lib, "1").map((food) => food.name), ["Milk"]);
  assert.equal(searchFoods(lib, "").length, 2);
});

test("without a network the barcode lookup names manual entry and CSV import", async () => {
  const result = await lookupFood("1234567890123", []);
  assert.match(result.note, /no internet/i);
  assert.match(result.note, /by hand/i);
  assert.match(result.note, /CSV/i);
});
