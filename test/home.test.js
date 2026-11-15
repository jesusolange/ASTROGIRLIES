"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Store = require("../src/scripts/storage.js");
const Home = require("../src/scripts/home.js");

const store = (data = {}) => {
  const m = new Map(Object.entries(data));
  const backend = {
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k)
  };
  globalThis.AstroMedStore = { store: Store.create(backend) };
};

const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

test("the check interval follows the NASA rating", () => {
  assert.equal(Home.intervalFor(25).days, 1);
  assert.equal(Home.intervalFor(16).days, 1);
  assert.equal(Home.intervalFor(15).days, 2);
  assert.equal(Home.intervalFor(9).days, 2);
  assert.equal(Home.intervalFor(8).days, 7);
  assert.equal(Home.intervalFor(0).days, 7);
});

test("a check done today is not due, and a daily check is due again tomorrow", () => {
  assert.equal(Home.isDue(null, 1), true);
  assert.equal(Home.isDue(day(0), 1), false);
  assert.equal(Home.isDue(day(0), 7), false);
  assert.equal(Home.isDue(day(-1), 1), true);
  assert.equal(Home.isDue(day(-1), 2), false);
  assert.equal(Home.isDue(day(-2), 2), true);
  assert.equal(Home.isDue(day(-6), 7), false);
  assert.equal(Home.isDue(day(-7), 7), true);
});

test("days since a completion is counted in whole local days", () => {
  assert.equal(Home.daysSince(day(0)), 0);
  assert.equal(Home.daysSince(day(-3)), 3);
  assert.equal(Home.daysSince(null), Infinity);
});

test("a high body temperature finding opens the fever card from the immune topic", () => {
  const finding = { title: "Temperature & Glucose \u00b7 Oral body temperature: 39.2", saw: "High temperature." };
  assert.equal(Home.emergencyForFinding(finding), "fever");
});

test("vision, self-harm, cabin-air and breath findings open their topic's card", () => {
  assert.equal(Home.emergencyForFinding({ title: "Right eye: Urgent vision change", saw: "New blind spot." }), "vision-change");
  assert.equal(Home.emergencyForFinding({ title: "Thoughts of death or suicide", saw: "You wished you were dead." }), "self-harm");
  assert.equal(Home.emergencyForFinding({ title: "Environment \u00b7 CO\u2082: 6000 ppm", saw: "CO\u2082 is high." }), "cabin-air");
  assert.equal(Home.emergencyForFinding({ title: "Breathing \u00b7 short of breath", saw: "You are short of breath." }), "breath");
});

test("a finding with no topic has no emergency card", () => {
  assert.equal(Home.emergencyForFinding({ title: "Fitness \u00b7 VO\u2082max dropped", saw: "VO\u2082max went from 40 to 30." }), null);
  assert.equal(Home.emergencyForFinding(null), null);
});

test("the due list is ordered by risk rating and ends with the VO2max test", () => {
  store();
  const readiness = {
    areas: [
      { key: "immune", topicId: "immune", area: "Immune", risk: { ops: { l: 3, c: 3 } }, score: 9, weight: 0.6 },
      { key: "vision", topicId: "vision", area: "Vision", risk: { ops: { l: 2, c: 2 } }, score: 4, weight: 0.4 }
    ]
  };
  const queue = Home.buildQueue(readiness);
  assert.deepEqual(queue.map((item) => item.check.label), ["Immune watch check", "Vision self-check", "VO\u2082max test"]);
  assert.equal(queue[0].check.route, "immune");
  assert.equal(queue[2].vo2, true);
});

test("a recorded check leaves the due list until its interval has passed", () => {
  store({ "astromed-radiation": JSON.stringify({ entries: [{ day: day(0) }] }) });
  const readiness = {
    areas: [{ key: "radiation", topicId: "radiation", area: "Radiation", risk: { ops: { l: 3, c: 3 } }, score: 9, weight: 1, data: { score: 90 } }]
  };
  const queue = Home.buildQueue(readiness).filter((item) => !item.vo2);
  assert.equal(queue.length, 0);
});

test("the reason names the rating and labels the interval as our design choice", () => {
  const item = {
    area: { risk: { ops: { l: 3, c: 3 } } }, last: null,
    interval: { days: 2, label: "every 2 days" }
  };
  assert.match(Home.reasonFor(item), /3\u00d73/);
  assert.match(Home.reasonFor(item), /design choice/);
});
