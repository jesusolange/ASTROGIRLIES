"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Risks = require("../src/scripts/risks.js");
const Readiness = require("../src/scripts/readiness.js");

test("NASA area weights sum to 1 and follow the mission", () => {
  for (const mission of Risks.MISSION_TYPES) {
    const weights = Risks.areaWeights(mission.id);
    assert.ok(Math.abs(weights.reduce((sum, w) => sum + w.weight, 0) - 1) < 1e-9);
    assert.ok(weights.every((w) => w.weight >= 0));
  }
  const top = (id) => Risks.areaWeights(id).slice().sort((a, b) => b.weight - a.weight)[0].key;
  assert.notEqual(top("mars-planetary"), top("leo-short"));
});

test("a high score needs enough coverage", () => {
  const weights = [
    { key: "a", weight: 0.4 },
    { key: "b", weight: 0.6 }
  ];
  const oneArea = Readiness.evaluateReadiness(weights, { a: { score: 100 } });
  assert.equal(oneArea.status, "insufficient");
  assert.equal(oneArea.total, null);
  assert.equal(oneArea.coverage, 0.4);
  assert.deepEqual(oneArea.missing.map((w) => w.key), ["b"]);

  const both = Readiness.evaluateReadiness(weights, { a: { score: 100 }, b: { score: 100 } });
  assert.equal(both.status, "scored");
  assert.equal(both.total, 100);
});

test("missing weight pulls the score toward the middle, never to a high score", () => {
  const weights = [
    { key: "a", weight: 0.5 },
    { key: "b", weight: 0.25 },
    { key: "c", weight: 0.25 }
  ];
  const result = Readiness.evaluateReadiness(weights, { a: { score: 100 } });
  assert.equal(result.status, "scored");
  assert.equal(result.coverage, 0.5);
  assert.equal(result.total, 75);
  assert.ok(result.total < Readiness.BANDS[0].min);
});

test("the same data scores differently when the mission changes", () => {
  const scoresFor = (weights) => Object.fromEntries(weights.map((w, i) => [w.key, { score: 20 + (i % 5) * 15 }]));
  const marsWeights = Risks.areaWeights("mars-planetary");
  const leoWeights = Risks.areaWeights("leo-short");
  const mars = Readiness.evaluateReadiness(marsWeights, scoresFor(marsWeights));
  const leo = Readiness.evaluateReadiness(leoWeights, scoresFor(leoWeights));
  assert.equal(mars.status, "scored");
  assert.equal(leo.status, "scored");
  assert.notEqual(mars.total, leo.total);
});

test("three heart-rate readings alone are not enough data for any mission", () => {
  for (const mission of Risks.MISSION_TYPES) {
    const weights = Risks.areaWeights(mission.id);
    const result = Readiness.evaluateReadiness(weights, { "overview:heart": { score: 100 } });
    assert.equal(result.status, "insufficient", mission.id);
    assert.equal(result.total, null, mission.id);
    assert.ok(result.coverage < Readiness.COVERAGE_MIN, mission.id);
  }
});

test("bands run from rest to ready", () => {
  assert.equal(Readiness.bandFor(100).key, "ready");
  assert.equal(Readiness.bandFor(80).key, "ready");
  assert.equal(Readiness.bandFor(79).key, "almost");
  assert.equal(Readiness.bandFor(60).key, "almost");
  assert.equal(Readiness.bandFor(59).key, "easy");
  assert.equal(Readiness.bandFor(40).key, "easy");
  assert.equal(Readiness.bandFor(39).key, "rest");
});
