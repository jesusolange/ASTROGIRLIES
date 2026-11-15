import test from "node:test";
import assert from "node:assert/strict";
import { DAYS, DEMO_NAME, buildDemoData, loadDemo } from "../src/scripts/demo-data.js";
import { SYSTEMS } from "../src/scripts/checkup-flow.js";
import { FIELDS as CABIN_FIELDS } from "../src/scripts/environment.js";
import { FILTERS, measuresOf, readProgress } from "../src/scripts/progress.js";

const NOW = new Date(2026, 10, 15, 12, 0, 0);
const data = buildDemoData({ now: NOW });

test("the demo astronaut is Solange on one mission and marked as demo", () => {
  const profile = data["astromed-profile"];
  assert.equal(profile.name, DEMO_NAME);
  assert.equal(profile.demo, true);
  assert.equal(profile.sex, "f");
  assert.equal(profile.meno, "pre");
  assert.equal(profile.crew, 4);
  assert.equal(profile.missionType, "mars-planetary");
  assert.equal(profile.startDate, "2026-11-02");
});

test("the builder fills every record type and is deterministic for a seed", () => {
  const again = buildDemoData({ now: NOW });
  assert.deepEqual(again, data);

  Object.values(data).forEach((value) => {
    if (Array.isArray(value)) assert.ok(value.length > 0);
  });
  assert.ok(data["astrotwin-gui-v2-records"].length >= DAYS);
  assert.ok(Object.keys(data["astromed-immune"].log).length === DAYS);
  assert.ok(data["astromed-radiation"].entries.length === DAYS);
  assert.ok(data["astrotwin-exercise-sessions"].length === DAYS - 2);
  assert.ok(data["astromed-env-log"].length === DAYS);
  assert.ok(data["astromed-mental-history"].length > 0);
  assert.ok(data["astromed-vision"].results.length > 0);
  assert.ok(data["astromed-nutrition"].entries.length >= DAYS * 3);
});

test("body measurements cover fourteen days and stay in ordinary ranges", () => {
  const records = data["astrotwin-gui-v2-records"];
  const days = new Set(records.map((record) => record.time.slice(0, 10)));
  assert.equal(days.size, DAYS);
  assert.deepEqual(new Set(records.map((record) => record.part)), new Set(["brain", "lungs", "heart", "kidneys", "hand", "bones", "muscles"]));

  const byPart = (part) => records.find((record) => record.part === part).values;
  const heart = byPart("heart");
  assert.ok(heart.hr >= 60 && heart.hr <= 100);
  assert.ok(heart.sys >= 90 && heart.sys <= 120);
  const hand = byPart("hand");
  assert.ok(hand.bodyTemp >= 36 && hand.bodyTemp <= 37.8);
  assert.ok(hand.glucose >= 70 && hand.glucose <= 99);
  const kidneys = byPart("kidneys");
  assert.ok(kidneys.fluidIntake >= 1500);
});

test("meals, sessions and questionnaires carry the fields the sections read", () => {
  const meal = data["astromed-nutrition"].entries[0];
  ["id", "time", "meal", "name", "kcal", "carb", "prot", "fat", "fiber", "sodium", "veg", "fluid"].forEach((key) => {
    assert.ok(key in meal, `meal is missing ${key}`);
  });
  const session = data["astrotwin-exercise-sessions"][0];
  assert.ok(session.values.minutes > 0);
  assert.equal(typeof session.date, "string");
  const latest = data["astromed-mental"];
  assert.ok(latest.mood.value);
  assert.equal(latest.depression.level, "ok");
  assert.equal(latest.stress.level, "ok");
});

const READER_KEYS = [
  "astromed-profile", "astrotwin-gui-v2-records", "astromed-mental", "astromed-mental-history",
  "astromed-vision", "astromed-immune", "astromed-radiation", "astromed-nutrition",
  "astrotwin-exercise-sessions", "astromed-env", "astromed-env-log", "astromed-missions"
];

test("the builder fills every stored key the app reads", () => {
  READER_KEYS.forEach((key) => {
    const value = data[key];
    assert.ok(value != null, `missing ${key}`);
    if (Array.isArray(value)) assert.ok(value.length > 0, `${key} is empty`);
    else if (typeof value === "object") assert.ok(Object.keys(value).length > 0, `${key} is empty`);
  });
});

test("every body system carries every field it reads", () => {
  const records = data["astrotwin-gui-v2-records"];
  for (const [part, system] of Object.entries(SYSTEMS)) {
    const record = records.find((entry) => entry.part === part);
    assert.ok(record, `missing body record ${part}`);
    system.fields.forEach((field) => {
      assert.ok(Number.isFinite(record.values[field.key]), `${part}.${field.key} is missing`);
    });
  }
});

test("vision, mind, immune, nutrition and cabin records cover their cards", () => {
  const vision = data["astromed-vision"];
  assert.deepEqual(new Set(vision.results.map((result) => result.eye)), new Set(["left", "right"]));
  const latestDay = vision.results.map((result) => new Date(result.date).toDateString()).sort().pop();
  assert.equal(vision.results.filter((result) => new Date(result.date).toDateString() === latestDay).length, 2);

  const mental = data["astromed-mental"];
  assert.ok(mental.mood && mental.mood.value);
  assert.ok(mental.depression && mental.stress);
  const historyTypes = new Set(data["astromed-mental-history"].map((entry) => entry.type));
  assert.deepEqual(historyTypes, new Set(["depression", "stress"]));

  const immune = data["astromed-immune"];
  assert.ok(Array.isArray(immune.log[Object.keys(immune.log).sort().pop()]));
  assert.ok(immune.tests.length >= 2);

  assert.ok(data["astromed-nutrition"].entries.every((entry) => Number.isFinite(entry.fluid)));
  assert.ok(data["astromed-nutrition"].entries.some((entry) => entry.fluid > 0));

  const readings = data["astromed-env"].readings;
  CABIN_FIELDS.forEach((field) => assert.ok(Number.isFinite(readings[field.key]), `cabin ${field.key} is missing`));
});

test("the demo adds VO2max tests and a rewards history", () => {
  const missions = data["astromed-missions"];
  assert.equal(missions.vo2.length, 3);
  assert.equal(Object.keys(missions.auto).length, DAYS);
  const days = Object.keys(missions.auto).sort();
  const today = days.pop();
  days.forEach((day) => assert.deepEqual(missions.auto[day], ["env", "checkup", "exercise", "meals", "mental"]));
  assert.deepEqual(missions.auto[today], ["env", "mental"]);
});
test("every Progress filter has at least one chart with demo data", () => {
  const api = { get: (key, fallback) => (key in data ? data[key] : fallback) };
  const progress = readProgress(api, data["astromed-profile"]);
  const measures = measuresOf(progress.rows);
  FILTERS.filter((filter) => filter.id !== "all").forEach((filter) => {
    assert.ok(measures.some((measure) => measure.filter === filter.id), `${filter.label} has no chart`);
  });
  assert.ok(measures.some((measure) => measure.id === "exercise.vo2"), "the VO2max chart has no series");
  assert.ok(progress.projection != null, "the radiation projection is empty");
});

test("loading needs the browser store and returns false without it", () => {
  assert.equal(loadDemo(NOW), false);
});
