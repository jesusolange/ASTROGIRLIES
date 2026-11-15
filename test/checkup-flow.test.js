"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const Flow = require("../src/scripts/checkup-flow.js");

function fakeStore() {
  const map = new Map();
  return {
    get(key, fallback) {
      return map.has(key) ? JSON.parse(map.get(key)) : fallback;
    },
    set(key, value) {
      map.set(key, JSON.stringify(value));
      return true;
    }
  };
}

const DAY = new Date(2026, 10, 15, 10, 0, 0);

test("the body systems keep the stored record part keys", () => {
  assert.deepEqual(Flow.STEP_IDS, ["brain", "lungs", "heart", "kidneys", "hand", "bones", "muscles"]);
  Flow.STEP_IDS.forEach((part) => {
    assert.ok(Flow.SYSTEMS[part], part);
    assert.ok(Flow.SYSTEMS[part].fields.length > 0, part);
  });
});

test("a heart rate of 500 is refused with the accepted range", () => {
  const outcome = Flow.saveCard("heart", { hr: "500" }, { store: fakeStore() });
  assert.ok(outcome.error);
  assert.equal(outcome.error.field, "hr");
  assert.match(outcome.error.message, /0 to 250 bpm/);
});

test("a blank field is skipped but one measurement is required", () => {
  const empty = Flow.validateValues(Flow.SYSTEMS.heart.fields, { hr: "", sys: "" });
  assert.equal(empty.error.field, "hr");
  assert.match(empty.error.message, /at least one measurement/i);
  const partial = Flow.validateValues(Flow.SYSTEMS.heart.fields, { hr: "76", sys: "" });
  assert.deepEqual(partial.values, { hr: 76 });
});

test("saving writes the stored record shape and undo removes it", () => {
  const store = fakeStore();
  const outcome = Flow.saveCard("heart", { hr: "76", sys: "118" }, { store, now: DAY });
  const saved = Flow.readRecords(store);
  assert.equal(saved.length, 1);
  assert.deepEqual(Object.keys(saved[0]).sort(), ["part", "source", "time", "values"]);
  assert.deepEqual(saved[0].values, { hr: 76, sys: 118 });
  assert.equal(saved[0].source, "manual");

  outcome.undo();
  assert.equal(Flow.readRecords(store).length, 0);
});

test("a second save for the same system in the same minute replaces the first", () => {
  const store = fakeStore();
  Flow.saveCard("heart", { hr: "76" }, { store, now: DAY });
  Flow.saveCard("heart", { hr: "88" }, { store, now: new Date(DAY.getTime() + 40000) });
  const saved = Flow.readRecords(store);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].values.hr, 88);
});

test("undo keeps a record it replaced in the same minute", () => {
  const store = fakeStore();
  Flow.saveCard("heart", { hr: "76" }, { store, now: DAY });
  const second = Flow.saveCard("heart", { hr: "88" }, { store, now: new Date(DAY.getTime() + 1000) });
  second.undo();
  const saved = Flow.readRecords(store);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].values.hr, 76);
});

test("done today and the summary follow the record's day", () => {
  const store = fakeStore();
  Flow.saveCard("heart", { hr: "76", sys: "118" }, { store, now: DAY });
  const records = Flow.readRecords(store);
  assert.equal(Flow.doneToday("heart", records, DAY), true);
  assert.equal(Flow.doneToday("heart", records, new Date(2026, 10, 16, 9, 0, 0)), false);
  assert.equal(Flow.summaryFor("heart", records, DAY), "Heart rate 76 bpm \u00b7 Systolic BP 118 mmHg");
  assert.equal(Flow.summaryFor("lungs", records, DAY), "");
});

test("the result level comes from the reference bands and never guesses a normal", () => {
  assert.equal(Flow.resultFor("heart", { hr: 76 }).level, "ok");
  assert.equal(Flow.resultFor("heart", { hr: 130 }).level, "warn");
  assert.equal(Flow.resultFor("lungs", { spo2: 90 }).level, "urgent");
  assert.equal(Flow.resultFor("heart", { hrv: 40 }).level, null);
});

test("the result prefers the flight-surgeon wording from the shared rules", () => {
  const ruleFor = (key) => (key === "hr" ? { level: "alert", saw: "Heart rate very high.", todo: "Sit down and rest." } : null);
  const result = Flow.resultFor("heart", { hr: 140 }, ruleFor);
  assert.equal(result.level, "urgent");
  assert.match(result.saw, /Heart rate very high/);
  assert.equal(result.todo, "Sit down and rest.");
});

test("findings list only values outside a reference band", () => {
  const findings = Flow.findingsFromRecords([
    { part: "heart", time: DAY.toISOString(), values: { hr: 130 } },
    { part: "lungs", time: DAY.toISOString(), values: { spo2: 98 } }
  ]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].level, "warn");
  assert.match(findings[0].title, /130 bpm/);
});

test("the record key is unchanged so Progress and the report keep reading it", () => {
  assert.equal(Flow.RECORDS_KEY, "astrotwin-gui-v2-records");
});
