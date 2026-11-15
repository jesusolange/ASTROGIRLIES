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

test("coverage counts the share of due areas with a current record", () => {
  const areas = ["a", "b", "c", "d"].map((key) => ({ key, weight: 0.25 }));
  const none = Readiness.coverageOf(areas, {});
  assert.equal(none.done, 0);
  assert.equal(none.due, 4);
  assert.equal(none.share, 0);
  assert.deepEqual(none.missing.map((area) => area.key), ["a", "b", "c", "d"]);

  const half = Readiness.coverageOf(areas, { a: { score: 80 }, b: { score: 80 } });
  assert.equal(half.done, 2);
  assert.equal(half.share, 0.5);

  const reference = Readiness.coverageOf([...areas, { key: "emergencies", weight: 0.1 }], {});
  assert.equal(reference.due, 4);
});

test("a score appears only at 50% coverage of the due areas", () => {
  const seven = ["a", "b", "c", "d", "e", "f", "g"].map((key) => ({ key, weight: 1 / 7 }));
  const scoresFor = (count) => Object.fromEntries(seven.slice(0, count).map((area) => [area.key, { score: 100 }]));

  const zero = Readiness.evaluateReadiness(seven, scoresFor(0));
  assert.equal(zero.status, "insufficient");
  assert.equal(zero.total, null);
  assert.equal(zero.covered, 0);
  assert.equal(zero.due, 7);

  const below = Readiness.evaluateReadiness(seven, scoresFor(3));
  assert.equal(below.status, "insufficient");
  assert.equal(below.total, null);
  assert.ok(below.coverage < Readiness.COVERAGE_MIN);

  const fourOfSeven = Readiness.evaluateReadiness(seven, scoresFor(4));
  assert.equal(fourOfSeven.status, "scored");
  assert.equal(fourOfSeven.covered, 4);
  assert.equal(fourOfSeven.due, 7);
  assert.notEqual(fourOfSeven.total, null);

  const four = ["a", "b", "c", "d"].map((key) => ({ key, weight: 0.25 }));
  const atHalf = Readiness.evaluateReadiness(four, { a: { score: 90 }, b: { score: 90 } });
  assert.equal(atHalf.status, "scored");
  assert.equal(atHalf.coverage, 0.5);
  assert.equal(atHalf.covered, 2);
  assert.equal(atHalf.due, 4);
  assert.notEqual(atHalf.total, null);
});

test("missing areas pull the score toward the middle, never to a high score", () => {
  const weights = [
    { key: "a", weight: 0.3 },
    { key: "b", weight: 0.2 },
    { key: "c", weight: 0.25 },
    { key: "d", weight: 0.25 }
  ];
  const result = Readiness.evaluateReadiness(weights, { a: { score: 100 }, b: { score: 100 } });
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
