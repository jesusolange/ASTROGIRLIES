"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Store = require("../src/scripts/storage.js");
const Rewards = require("../src/scripts/rewards.js");

const fake = (init = {}) => {
  const m = new Map(Object.entries(init));
  return {
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k)
  };
};
const store = (data) => {
  globalThis.AstroMedStore = { store: Store.create(fake(data ? { "astromed-missions": JSON.stringify(data) } : {})) };
  return globalThis.AstroMedStore.store;
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

test("the remaining tasks are all detected and the maximum drops to them", () => {
  assert.equal(Rewards.TASKS.length, 5);
  assert.ok(Rewards.TASKS.every((task) => task.auto));
  assert.equal(Rewards.MAXPTS, 70);
});

test("detection reads the app's own records for the day", () => {
  const day = daysAgo(0);
  store();
  const s = globalThis.AstroMedStore.store;
  s.set("astromed-env", { time: `${day}T09:00:00` });
  s.set("astrotwin-gui-v2-records", [{ part: "heart", time: `${day}T09:00:00` }]);
  s.set("astrotwin-exercise-sessions", [{ date: `${day}T10:00:00` }]);
  s.set("astromed-nutrition", { entries: ["Breakfast", "Lunch", "Dinner"].map((meal) => ({ meal, time: `${day}T12:00:00` })) });
  s.set("astromed-mental", { mood: { date: `${day}T12:00:00` } });
  s.set("astromed-immune", { log: { [day]: ["fever"] } });
  s.set("astromed-radiation", { entries: [{ day }] });
  const found = Rewards.detect(day);
  for (const key of ["env", "checkup", "exercise", "meals", "mental", "immune", "radiation"]) assert.equal(found[key], true, key);
});

test("points add up only the detected tasks", () => {
  const day = daysAgo(0);
  const s = store({ done: {}, auto: { [day]: ["env", "mental"] }, vo2: [] });
  assert.equal(Rewards.dayPoints(Rewards.load(), day), 20);
  assert.equal(Rewards.MAXPTS - Rewards.dayPoints(Rewards.load(), day), 50);
});

test("a full day earns the perfect-day badge", () => {
  const day = daysAgo(0);
  store({ done: {}, auto: { [day]: Rewards.TASKS.map((task) => task.id) }, vo2: [] });
  const s = Rewards.load();
  const st = Rewards.stats(s);
  const on = Rewards.badges(s, st).filter((badge) => badge.on).map((badge) => badge.n);
  assert.ok(on.includes("Perfect day"));
});

test("the streak counts days at the old 60% threshold and levels follow total points", () => {
  const today = daysAgo(0);
  const yesterday = daysAgo(1);
  store({ done: {}, auto: { [today]: Rewards.TASKS.map((t) => t.id), [yesterday]: Rewards.TASKS.map((t) => t.id) }, vo2: [] });
  const st = Rewards.stats(Rewards.load());
  assert.equal(st.streak, 2);
  assert.equal(st.level, Math.floor(st.total / 250) + 1);
});

test("level titles run from Cadet to Commander", () => {
  assert.equal(Rewards.titleOf(1), "Cadet");
  assert.equal(Rewards.titleOf(6), "Commander");
  assert.equal(Rewards.titleOf(99), "Commander");
});

test("badges report the streak, the checkup and VO2max counts", () => {
  const day = daysAgo(0);
  store({
    done: {},
    auto: { [day]: ["env", "checkup", "exercise", "meals", "mental"] },
    vo2: [{ value: 40, time: `${day}T09:00:00` }]
  });
  const s = Rewards.load();
  const on = Rewards.badges(s).filter((badge) => badge.on).map((badge) => badge.n);
  assert.ok(on.includes("Perfect day"));
  assert.ok(on.includes("First VO\u2082max"));
  assert.equal(on.includes("Fitness tracker"), false);
});
