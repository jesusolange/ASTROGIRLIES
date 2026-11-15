"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { ntxRange, scaleFor, bandFor, position, valueFromPosition } = require("../src/scripts/health-indicators.js");

test("N-telopeptide ranges follow the profile's sex and menopause state", () => {
  assert.deepEqual(
    [ntxRange({ sex: "m" }).low, ntxRange({ sex: "m" }).high],
    [21, 83]
  );
  assert.deepEqual(
    [ntxRange({ sex: "f", meno: "pre" }).low, ntxRange({ sex: "f", meno: "pre" }).high],
    [17, 94]
  );
  assert.deepEqual(
    [ntxRange({ sex: "f", meno: "post" }).low, ntxRange({ sex: "f", meno: "post" }).high],
    [36, 124]
  );
});

test("a woman without a menopause state uses the premenopausal range", () => {
  const range = ntxRange({ sex: "f" });
  assert.equal(range.low, 17);
  assert.equal(range.high, 94);
  assert.equal(range.key, "pre");
});

test("a missing or unknown sex falls back to 17 to 94 and names the default", () => {
  [{}, null, { sex: "x" }].forEach((profile) => {
    const range = ntxRange(profile);
    assert.deepEqual([range.low, range.high], [17, 94]);
    assert.equal(range.key, "unset");
    assert.match(range.label, /sex not set/);
  });
});

test("the N-telopeptide gauge uses the profile range and marks values outside it", () => {
  const male = scaleFor("ntx", { sex: "m" });
  assert.deepEqual([male.range.low, male.range.high], [21, 83]);
  assert.match(male.rangeLabel, /21 to 83/);
  assert.match(male.rangeLabel, /men/);
  assert.equal(bandFor(male, 21).level, "normal");
  assert.equal(bandFor(male, 83).level, "normal");
  assert.equal(bandFor(male, 84).level, "review");
  assert.equal(bandFor(male, 20).level, "review");

  const post = scaleFor("ntx", { sex: "f", meno: "post" });
  assert.deepEqual([post.range.low, post.range.high], [36, 124]);
  assert.equal(bandFor(post, 100).level, "normal");
  assert.equal(bandFor(male, 100).level, "review");
  assert.match(post.rangeLabel, /women after menopause/);
});

test("the gauge keeps the 0 to 200 track so the band sits in context", () => {
  const scale = scaleFor("ntx", { sex: "f", meno: "post" });
  assert.equal(scale.min, 0);
  assert.equal(scale.max, 200);
  assert.equal(position(36, scale), 18);
  assert.equal(position(124, scale), 62);
});

test("other scales are returned unchanged", () => {
  const hr = scaleFor("hr");
  assert.equal(hr.unit, "bpm");
  assert.equal(hr.zones.length, 3);
  assert.equal(scaleFor("not-a-metric"), null);
});

test("a position on the track becomes a value at the gauge's ends", () => {
  const scale = scaleFor("hr");
  assert.equal(valueFromPosition(0, scale, 1), 30);
  assert.equal(valueFromPosition(100, scale, 1), 160);
  assert.equal(valueFromPosition(50, scale, 1), 95);
  assert.equal(valueFromPosition(-20, scale, 1), 30);
  assert.equal(valueFromPosition(180, scale, 1), 160);
});

test("the value snapped from a position follows the field's step", () => {
  assert.equal(valueFromPosition(22, { min: 0, max: 100 }, 5), 20);
  assert.equal(valueFromPosition(23, { min: 0, max: 100 }, 5), 25);
  assert.equal(valueFromPosition(50, scaleFor("bodyTemp"), 0.1), 37.5);
  assert.equal(valueFromPosition(33.3, scaleFor("weightKg"), 0.1), 79.9);
  assert.equal(valueFromPosition(50, null, 1), null);
});
