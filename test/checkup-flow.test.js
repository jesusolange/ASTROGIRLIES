"use strict";
const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const Flow = require("../src/scripts/checkup-flow.js");

afterEach(() => Flow.reset());

test("the step order follows the 3D guide", () => {
  assert.deepEqual(Flow.STEP_IDS, ["brain", "lungs", "heart", "kidneys", "hand", "bones", "muscles"]);
  assert.equal(Flow.currentStep.value, "brain");
});

test("selecting a part moves the shared current step", () => {
  Flow.select("kidneys");
  assert.equal(Flow.currentStep.value, "kidneys");
  Flow.select("not-a-part");
  assert.equal(Flow.currentStep.value, "kidneys");
});

test("complete marks the part and advances to the next undone step in list order", () => {
  assert.equal(Flow.complete("brain"), "lungs");
  assert.equal(Flow.complete("lungs"), "heart");
  assert.deepEqual(Flow.doneParts.value, ["brain", "lungs"]);
  assert.equal(Flow.currentStep.value, "heart");
});

test("complete skips steps that are already done and wraps once", () => {
  assert.equal(Flow.complete("brain"), "lungs");
  assert.equal(Flow.complete("lungs"), "heart");
  assert.equal(Flow.complete("heart"), "kidneys");
  assert.equal(Flow.complete("brain"), "kidneys");
  Flow.complete("kidneys");
  Flow.complete("hand");
  Flow.complete("bones");
  assert.equal(Flow.complete("muscles"), null);
});

test("the flow is complete only when every listed step is done", () => {
  Flow.STEP_IDS.forEach((part) => Flow.complete(part));
  assert.equal(Flow.flowComplete.value, true);
  assert.equal(Flow.currentStep.value, null);
  assert.equal(Flow.next(), null);
});

test("hydrate marks today's saved systems done and ignores other days", () => {
  const now = new Date("2026-11-14T12:00:00.000Z");
  Flow.hydrate([
    { part: "brain", time: "2026-11-14T09:00:00.000Z", values: {} },
    { part: "heart", time: "2026-11-13T09:00:00.000Z", values: {} }
  ], now);
  assert.deepEqual(Flow.doneParts.value, ["brain"]);
  assert.equal(Flow.currentStep.value, "lungs");
});

const record = (part, time, value) => ({
  part,
  time,
  values: { hr: value },
  source: "manual"
});

test("a second save for the same system in the same minute replaces the first", () => {
  const first = record("heart", "2026-11-14T12:00:10.000Z", 76);
  const second = record("heart", "2026-11-14T12:00:50.000Z", 88);
  const list = Flow.upsertRecord(Flow.upsertRecord([], first), second);
  assert.equal(list.length, 1);
  assert.equal(list[0].values.hr, 88);
  assert.equal(list[0].time, "2026-11-14T12:00:50.000Z");
});

test("a save in the next minute adds a new reading", () => {
  const list = Flow.upsertRecord(
    Flow.upsertRecord([], record("heart", "2026-11-14T12:00:50.000Z", 76)),
    record("heart", "2026-11-14T12:01:05.000Z", 88)
  );
  assert.equal(list.length, 2);
  assert.equal(list[0].values.hr, 88);
});

test("two systems saved in the same minute are both kept", () => {
  const list = Flow.upsertRecord(
    Flow.upsertRecord([], record("heart", "2026-11-14T12:00:10.000Z", 76)),
    record("lungs", "2026-11-14T12:00:20.000Z", 16)
  );
  assert.equal(list.length, 2);
  assert.deepEqual(list.map((item) => item.part).sort(), ["heart", "lungs"]);
});

test("upsert keeps newest first and respects the stored record shape", () => {
  const list = Flow.upsertRecord([], record("brain", "2026-11-14T12:00:00.000Z", 7));
  assert.deepEqual(Object.keys(list[0]).sort(), ["part", "source", "time", "values"]);
  assert.equal(Flow.RECORDS_KEY, "astrotwin-gui-v2-records");
});

test("readValues accepts values inside the field range and names the first invalid field", () => {
  const fields = [
    { key: "hr", label: "Heart rate", min: 0, max: 250, unit: "bpm" },
    { key: "sys", label: "Systolic BP", min: 0, max: 300, unit: "mmHg" }
  ];
  assert.deepEqual(Flow.readValues(fields, { hr: "76", sys: "118" }).values, { hr: 76, sys: 118 });
  assert.match(Flow.readValues(fields, { hr: "76", sys: "400" }).error, /systolic bp/i);
  assert.match(Flow.readValues(fields, { hr: "", sys: "118" }).error, /heart rate/i);
});

test("draftFor uses the latest reading and marks a simulated fill", () => {
  const draft = Flow.draftFor("heart", [{
    part: "heart",
    time: "2026-11-14T12:00:00.000Z",
    simulated: true,
    values: { hr: 90, sys: 120, dia: 80, hrv: 40 }
  }]);
  assert.equal(draft.values.hr, 90);
  assert.equal(draft.simulated, true);
});
