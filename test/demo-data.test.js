import test from "node:test";
import assert from "node:assert/strict";
import { DAYS, DEMO_NAME, buildDemoData, loadDemo } from "../src/scripts/demo-data.js";

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
  assert.ok(data["astrotwin-exercise-sessions"].length === DAYS);
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

test("loading needs the browser store and returns false without it", () => {
  assert.equal(loadDemo(NOW), false);
});
