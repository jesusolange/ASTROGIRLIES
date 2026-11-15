import test from "node:test";
import assert from "node:assert/strict";
import {
  FILTERS, arrow, dateLabel, deleteRow, formatValue, fromDayFor,
  measuresOf, missionLabel, readProgress, seriesFor, statsFor, weekComparison
} from "../src/scripts/progress.js";
import { RECORDS_KEY } from "../src/scripts/checkup-flow.js";

const DAY = 864e5;
const ago = (days, hour = 9) => {
  const date = new Date(Date.now() - days * DAY);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};
const day = (days) => ago(days).slice(0, 10);

const PROFILE = {
  name: "Test Astronaut", startDate: day(13), totalDays: 730,
  age: 38, sex: "f", weightKg: 64, heightCm: 168
};

function fakeStore(values) {
  const map = new Map(Object.entries(values).map(([key, value]) => [key, JSON.parse(JSON.stringify(value))]));
  return {
    get(key, fallback) { return map.has(key) ? JSON.parse(JSON.stringify(map.get(key))) : fallback; },
    set(key, value) { map.set(key, JSON.parse(JSON.stringify(value))); },
    has: (key) => map.has(key)
  };
}

function fixture() {
  return fakeStore({
    "astromed-profile": PROFILE,
    [RECORDS_KEY]: [
      { part: "heart", time: ago(1), values: { hr: 78, sys: 118, dia: 76 } },
      { part: "heart", time: ago(8), values: { hr: 64, sys: 108, dia: 70 } },
      { part: "lungs", time: ago(1), values: { resp: 15, spo2: 98 } }
    ],
    "astromed-vision": {
      results: [
        { id: "r1", eye: "right", date: ago(2), near: { line: 6 }, grid: { distortion: false, marks: [] }, symptoms: [] },
        { id: "r2", eye: "left", date: ago(2), near: { line: 5 }, grid: { distortion: true, marks: [{ row: 1, col: 2 }] }, symptoms: [] }
      ]
    },
    "astromed-mental-history": [
      { type: "depression", score: 4, max: 27, label: "Healthy", level: "ok", date: ago(3) },
      { type: "stress", score: 12, max: 66, label: "Stress reactions have started", level: "review", date: ago(4) }
    ],
    "astromed-mental": { mood: { value: "okay", date: ago(0) }, depression: { score: 4, date: ago(3) } },
    "astromed-immune": {
      log: { [day(0)]: ["tired"], [day(2)]: [] },
      tests: [{ id: "t1", name: "Cortisol", value: 4.2, unit: "nmol/L", time: ago(3) }]
    },
    "astromed-radiation": { prior: 10, entries: [
      { id: "d1", day: day(2), dose: 0.6 },
      { id: "d2", day: day(1), dose: 0.7 }
    ] },
    "astromed-env-log": [
      { time: ago(1), place: "mars", readings: { temp: 21, pressure: 70, humidity: 40, co2: 2800, noise: 50, radiation: 27 } }
    ],
    "astromed-env": { place: "mars", readings: { temp: 21 }, time: ago(1) },
    "astromed-nutrition": {
      entries: [
        { id: "m1", time: ago(1), meal: "Lunch", name: "Rice", kcal: 700, prot: 30, fluid: 300, carb: 90, fat: 20, fiber: 10, sodium: 600, veg: 200 },
        { id: "m2", time: ago(2), meal: "Dinner", name: "Pasta", kcal: 800, prot: 35, fluid: 400, carb: 100, fat: 22, fiber: 12, sodium: 700, veg: 150 }
      ],
      eva: {}, af: 1.11, lib: []
    },
    "astrotwin-exercise-sessions": [
      { type: "ared", title: "ARED", values: { minutes: 45 }, date: ago(1) },
      { type: "t2", title: "T2", values: { minutes: 40 }, date: ago(3) }
    ],
    "astromed-missions": { done: {}, auto: {}, vo2: [{ value: 42, time: ago(6) }, { value: 44, time: ago(1) }] }
  });
}

test("every filter has records and every chart measure belongs to one filter", () => {
  const { rows } = readProgress(fixture(), PROFILE);
  const filters = new Set(rows.map((row) => row.filter));
  ["body", "vision", "mind", "immune", "radiation", "cabin", "nutrition", "exercise"].forEach((id) => {
    assert.ok(filters.has(id), `missing ${id}`);
  });
  const measures = measuresOf(rows);
  assert.ok(measures.length > 10);
  measures.forEach((measure) => assert.ok(FILTERS.some((filter) => filter.id === measure.filter)));
});

test("history is newest first with one date format and the mission day beside it", () => {
  const { rows } = readProgress(fixture(), PROFILE);
  const history = rows.filter((row) => row.history);
  for (let index = 1; index < history.length; index += 1) {
    assert.ok(new Date(history[index - 1].date) >= new Date(history[index].date));
  }
  const date = new Date(2026, 10, 14, 9).toISOString();
  assert.equal(dateLabel(date), "14 Nov 2026");
  assert.equal(missionLabel(date, { startDate: "2026-11-02" }), "Mission day 13");
  assert.equal(missionLabel(date, null), "");
});

test("chart series aggregate each day and the week range drops older points", () => {
  const { rows } = readProgress(fixture(), PROFILE);
  const measure = measuresOf(rows).find((item) => item.id === "body.heart.hr");
  const all = seriesFor(rows, measure);
  assert.equal(all.values.length, 2);
  assert.equal(all.values[0], 64);
  assert.equal(all.values[1], 78);
  const week = seriesFor(rows, measure, fromDayFor(7));
  assert.equal(week.values.length, 1);
  const narrow = seriesFor(rows, measure, fromDayFor(1));
  assert.equal(narrow.values.length, 0);
});

test("cumulative radiation adds the prior dose once and keeps the projection", () => {
  const { rows, projection } = readProgress(fixture(), PROFILE);
  const measure = measuresOf(rows).find((item) => item.id === "radiation.cumulative");
  const series = seriesFor(rows, measure);
  assert.ok(Math.abs(series.values[0] - 10.6) < 1e-9);
  assert.ok(Math.abs(series.values[1] - 11.3) < 1e-9);
  assert.ok(projection > 11.3);
});

test("vision lines and mood values keep their own labels", () => {
  const { rows } = readProgress(fixture(), PROFILE);
  const vision = measuresOf(rows).find((item) => item.id === "vision.right.line");
  assert.equal(formatValue(vision, 6), "20/20");
  const mood = measuresOf(rows).find((item) => item.id === "mind.mood");
  assert.equal(formatValue(mood, 4), "okay");
});

test("this week against last week compares the same measure", () => {
  const { rows } = readProgress(fixture(), PROFILE);
  const comparison = weekComparison(rows);
  const heart = comparison.find((entry) => entry.measure.id === "body.heart.hr");
  assert.equal(heart.cur, 78);
  assert.equal(heart.prev, 64);
  assert.equal(heart.change.txt, "+21.9%");
  assert.deepEqual(arrow(null, 10), { txt: "—", cls: "flat" });
  assert.deepEqual(arrow(100, 100), { txt: "no change", cls: "flat" });
});

test("statsFor keeps the last seven days apart from the week before", () => {
  const list = [{ value: 60, date: ago(1) }, { value: 80, date: ago(3) }, { value: 40, date: ago(8) }, { value: 60, date: ago(10) }];
  const stats = statsFor(list);
  assert.equal(stats.n, 2);
  assert.equal(stats.cur, 70);
  assert.equal(stats.prev, 50);
});

test("deleting a checkup reading removes only that value and Undo restores it", () => {
  const store = fixture();
  const { rows } = readProgress(store, PROFILE);
  const row = rows.find((item) => item.source === "checkup" && item.measureKey === "hr");
  const undo = deleteRow(store, row);
  const left = store.get(RECORDS_KEY, []);
  assert.equal(left.length, 3);
  assert.equal(left.find((record) => record.part === "heart" && record.time === row.time).values.hr, undefined);
  assert.equal(left.find((record) => record.part === "heart" && record.time === row.time).values.sys, 118);
  undo();
  const restored = store.get(RECORDS_KEY, []);
  assert.equal(restored.find((record) => record.part === "heart" && record.time === row.time).values.hr, 78);
});

test("deleting an exercise session removes it from the store and Undo puts it back", () => {
  const store = fixture();
  const { rows } = readProgress(store, PROFILE);
  const row = rows.find((item) => item.source === "exercise" && item.history);
  const undo = deleteRow(store, row);
  assert.equal(store.get("astrotwin-exercise-sessions", []).length, 1);
  undo();
  assert.equal(store.get("astrotwin-exercise-sessions", []).length, 2);
});

test("deleting a questionnaire clears the matching latest result and Undo restores both", () => {
  const store = fixture();
  const { rows } = readProgress(store, PROFILE);
  const row = rows.find((item) => item.source === "mental-history" && item.type === "depression");
  const undo = deleteRow(store, row);
  assert.equal(store.get("astromed-mental-history", []).length, 1);
  assert.equal(store.get("astromed-mental", {}).depression, undefined);
  undo();
  assert.equal(store.get("astromed-mental-history", []).length, 2);
  assert.ok(store.get("astromed-mental", {}).depression);
});
