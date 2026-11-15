"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Risks = require("../src/scripts/risks.js");

test("all 22 NASA risks are ranked for every mission type", () => {
  for (const m of Risks.MISSION_TYPES) {
    const ranked = Risks.rankedRisks(m.id);
    assert.equal(ranked.length, 22);
    for (let i = 1; i < ranked.length; i++) assert.ok(ranked[i - 1].score >= ranked[i].score);
    for (const r of ranked) assert.match(r.url, /^https:\/\/humanresearchroadmap\.nasa\.gov\/risks\/\?i=\d+$/);
  }
});

test("ratings match the NASA pages for known cells", () => {
  const mars = Object.fromEntries(Risks.rankedRisks("mars-planetary").map((r) => [r.short, r]));
  assert.deepEqual([mars.SANS.ops.l, mars.SANS.ops.c], [4, 4]);
  assert.deepEqual([mars["Food and Nutrition"].ops.l, mars["Food and Nutrition"].ops.c], [5, 5]);
  const leo = Object.fromEntries(Risks.rankedRisks("leo-short").map((r) => [r.short, r]));
  assert.deepEqual([leo.SANS.ops.l, leo.SANS.ops.c], [4, 1]);
  assert.equal(leo.Dust.score, 0);
});

test("changing the mission changes the ranking", () => {
  const order = (id) => Risks.rankedRisks(id).map((r) => r.id).join(",");
  assert.notEqual(order("leo-short"), order("mars-planetary"));
});

test("uncovered risks are marked as not monitored", () => {
  const byShort = Object.fromEntries(Risks.rankedRisks("mars-planetary").map((r) => [r.short, r]));
  for (const s of ["Sensorimotor", "Pharm", "Dust"]) assert.equal(byShort[s].monitored, false);
  assert.equal(byShort.SANS.section, "vision");
});

test("area weights sum to 1 and follow the mission", () => {
  for (const m of Risks.MISSION_TYPES) {
    const w = Risks.areaWeights(m.id);
    assert.ok(Math.abs(w.reduce((s, a) => s + a.weight, 0) - 1) < 1e-9);
  }
  const weight = (id, key) => Risks.areaWeights(id).find((a) => a.key === key).weight;
  assert.ok(weight("mars-planetary", "vision") > weight("leo-short", "vision"));
});

test("an unknown mission falls back to the default", () => {
  assert.equal(Risks.missionType("nope").id, Risks.DEFAULT_MISSION);
  assert.equal(Risks.currentMission({ get: () => ({ missionType: "leo-long" }) }).id, "leo-long");
  assert.equal(Risks.currentMission({ get: () => null }).id, Risks.DEFAULT_MISSION);
});
