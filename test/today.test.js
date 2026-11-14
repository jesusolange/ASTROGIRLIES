"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Missions = require("../src/scripts/missions.js");
const Risks = require("../src/scripts/risks.js");

const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

test("the check interval follows the NASA rating", () => {
  assert.equal(Missions.intervalFor(25).days, 1);
  assert.equal(Missions.intervalFor(16).days, 1);
  assert.equal(Missions.intervalFor(15).days, 2);
  assert.equal(Missions.intervalFor(9).days, 2);
  assert.equal(Missions.intervalFor(8).days, 7);
  assert.equal(Missions.intervalFor(0).days, 7);
});

test("a check done today is not due, and a daily check is due again tomorrow", () => {
  assert.equal(Missions.isDue(null, 1), true);
  assert.equal(Missions.isDue(day(0), 1), false);
  assert.equal(Missions.isDue(day(0), 7), false);
  assert.equal(Missions.isDue(day(-1), 1), true);
  assert.equal(Missions.isDue(day(-1), 2), false);
  assert.equal(Missions.isDue(day(-2), 2), true);
  assert.equal(Missions.isDue(day(-6), 7), false);
  assert.equal(Missions.isDue(day(-7), 7), true);
});

test("higher-rated risks are scheduled more often", () => {
  const daily = Missions.intervalFor(16);
  const weekly = Missions.intervalFor(8);
  const weights = Risks.areaWeights("mars-planetary");
  const highest = weights[0];
  const lowest = weights[weights.length - 1];
  assert.ok(Missions.intervalFor(highest.score).days <= Missions.intervalFor(lowest.score).days);
  assert.ok(daily.days < weekly.days);
});

test("days since a completion is counted in whole local days", () => {
  assert.equal(Missions.daysSince(day(0)), 0);
  assert.equal(Missions.daysSince(day(-3)), 3);
  assert.equal(Missions.daysSince(null), Infinity);
});
