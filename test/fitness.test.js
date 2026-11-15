"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Store = require("../src/scripts/storage.js");
const Fitness = require("../src/scripts/fitness.js");

const fake = () => {
  const m = new Map();
  return {
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k)
  };
};
const store = (data) => {
  globalThis.AstroMedStore = { store: Store.create(fake()) };
  if (data) globalThis.AstroMedStore.store.set("astromed-missions", data);
  return globalThis.AstroMedStore.store;
};
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const at = (offset) => `${day(offset)}T12:00:00`;

test("the plan repeats the test every 14 days", () => {
  assert.equal(Fitness.VO2_EVERY, 14);
});

test("no test means the test is due now", () => {
  store({ done: {}, auto: {}, vo2: [] });
  assert.deepEqual(Fitness.vo2Due({ done: {}, auto: {}, vo2: [] }), { days: 0, last: null });
});

test("the next test is counted from the newest test", () => {
  store({ done: {}, auto: {}, vo2: [{ value: 40, time: at(-10) }] });
  assert.equal(Fitness.vo2Due({ done: {}, auto: {}, vo2: [{ value: 40, time: at(-10) }] }).days, 4);
  assert.equal(Fitness.vo2Due({ done: {}, auto: {}, vo2: [{ value: 40, time: at(-15) }] }).days, -1);
});

test("lastVo2 returns the newest value and the one before it", () => {
  store({ done: {}, auto: {}, vo2: [{ value: 38, time: at(-30) }, { value: 41, time: at(-2) }] });
  assert.deepEqual(Fitness.lastVo2(), { value: 41, time: at(-2), prev: 38 });
});

test("an overdue test is a finding", () => {
  store({ done: {}, auto: {}, vo2: [{ value: 40, time: at(-20) }] });
  const out = Fitness.findings();
  assert.equal(out.length, 1);
  assert.equal(out[0].level, "review");
  assert.match(out[0].title, /overdue/);
});

test("a large drop is urgent and names the flight surgeon as the second step", () => {
  store({ done: {}, auto: {}, vo2: [{ value: 40, time: at(-30) }, { value: 30, time: at(-1) }] });
  const drop = Fitness.findings().find((finding) => /dropped/.test(finding.title));
  assert.equal(drop.level, "alert");
  assert.equal(drop.tell, "flight-surgeon");
  assert.doesNotMatch(drop.todo, /flight surgeon/i);
});

test("a small drop is a review and a stable result is on track", () => {
  store({ done: {}, auto: {}, vo2: [{ value: 40, time: at(-30) }, { value: 36, time: at(-1) }] });
  assert.equal(Fitness.findings()[0].level, "review");
  store({ done: {}, auto: {}, vo2: [{ value: 40, time: at(-30) }, { value: 39, time: at(-1) }] });
  assert.equal(Fitness.findings()[0].level, "ok");
});

test("a recorded test is stored in the same vo2 list and moves the due date", () => {
  store({ done: {}, auto: {}, vo2: [] });
  Fitness.recordVo2(42, at(0));
  const stored = Fitness.vo2List();
  assert.equal(stored.length, 1);
  assert.equal(stored[0].value, 42);
  assert.equal(Fitness.vo2Due().days, 14);
});
