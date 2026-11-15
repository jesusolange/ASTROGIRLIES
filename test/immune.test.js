import test from "node:test";
import assert from "node:assert/strict";
import {
  ACTIONS, LAB_UNITS, SAMPLE_TYPES, SYMPTOMS, URINE_UNITS, addTest, assess, immuneState, testOptions, testRows, unitOptions
} from "../src/scripts/immune.js";

const fakeStore = (init = {}) => {
  const map = new Map(Object.entries(init));
  return {
    get: (key, fallback) => (map.has(key) ? map.get(key) : fallback),
    set: (key, value) => { map.set(key, value); return value; }
  };
};

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

test("urine is a sample type with its own test and unit suggestions", () => {
  assert.deepEqual(SAMPLE_TYPES, ["saliva", "blood", "urine"]);
  for (const name of ["N-telopeptide", "Calcium", "Creatinine", "Specific gravity", "pH"]) {
    assert.ok(testOptions("urine").includes(name), name);
  }
  assert.deepEqual(unitOptions("", "urine"), URINE_UNITS);
  assert.deepEqual(unitOptions("an unknown test", "urine"), URINE_UNITS);
  assert.ok(unitOptions("N-telopeptide", "urine").includes("nmol/mmol creatinine"));
  assert.ok(unitOptions("urine calcium", "urine").includes("mg/24 h"));
  assert.deepEqual(unitOptions("pH", "urine"), []);
  assert.deepEqual(unitOptions("Cortisol", "urine"), URINE_UNITS);
  assert.deepEqual(unitOptions("Cortisol"), ["µg/dL", "nmol/L"]);
});

test("a urine result is stored with its sample and old results still read", () => {
  const previous = { id: "old-blood", time: "2026-11-01T09:00:00.000Z", kind: "blood", name: "CRP", value: 1.2, unit: "mg/L" };
  globalThis.AstroMedStore = { store: fakeStore({ "astromed-immune": { log: {}, tests: [previous] } }) };
  const { test } = addTest({ kind: "urine", name: "N-telopeptide", value: 42, unit: "nmol/mmol creatinine" });
  assert.equal(test.kind, "urine");
  const tests = immuneState().tests;
  assert.equal(tests.length, 2);
  assert.deepEqual(tests[0], previous);
  assert.equal(tests[1].kind, "urine");
});
