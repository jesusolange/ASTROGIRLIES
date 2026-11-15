import test from "node:test";
import assert from "node:assert/strict";
import { ACTIONS, LAB_UNITS, SYMPTOMS, assess, testRows, unitOptions } from "../src/scripts/immune.js";

test("symptoms follow the same bands whether saved or live", () => {
  assert.equal(assess([]).level, "ok");
  assert.equal(assess(["throat"]).level, "review");
  assert.equal(assess(["throat", "cough"]).level, "review");
  assert.equal(assess(["throat", "cough", "rash"]).level, "alert");
  assert.equal(assess(["fever"]).level, "alert");
  assert.equal(assess([], ["a", "b", "c"]).level, "review");
  assert.equal(assess(["fever"], ["a", "b", "c"]).level, "alert");
});

test("unknown symptom ids are dropped and the action follows the level", () => {
  const result = assess(["throat", "not-a-symptom"]);
  assert.deepEqual(result.sym, ["throat"]);
  for (const level of ["ok", "review", "alert"]) {
    assert.ok(ACTIONS[level].length > 10);
  }
});

test("every symptom keeps its short label", () => {
  assert.equal(SYMPTOMS.length, 7);
  assert.deepEqual(SYMPTOMS.map(([id]) => id), ["fever", "throat", "cough", "rash", "sores", "tired", "heal"]);
});

test("the test rows compare each result with the previous one of the same name and unit", () => {
  const rows = testRows([
    { id: "a", time: "2026-11-01T08:00:00.000Z", name: "Cortisol", unit: "µg/dL", value: 10 },
    { id: "b", time: "2026-11-03T08:00:00.000Z", name: "Cortisol", unit: "nmol/L", value: 300 },
    { id: "c", time: "2026-11-05T08:00:00.000Z", name: "Cortisol", unit: "µg/dL", value: 12 }
  ]);
  assert.equal(rows[0].id, "c");
  assert.equal(rows[0].before, 10);
  assert.equal(rows[1].id, "b");
  assert.equal(rows[1].before, null);
});

test("the unit combobox offers the usual units for the chosen test", () => {
  assert.deepEqual(unitOptions("Cortisol"), ["µg/dL", "nmol/L"]);
  assert.deepEqual(unitOptions("fasting glucose"), ["mg/dL", "mmol/L"]);
  assert.ok(unitOptions("CRP").includes("mg/L"));
  assert.ok(unitOptions("Epstein-Barr virus").includes("U/mL"));
  assert.ok(unitOptions("white cell count").includes("cells/µL"));
  assert.deepEqual(unitOptions("an unknown test"), LAB_UNITS);
  assert.deepEqual(unitOptions(""), LAB_UNITS);
  assert.equal(LAB_UNITS.length, 9);
});
