"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Vision = require("../src/scripts/vision.js");

const result = (over = {}) => ({
  eye: "right",
  date: "2026-11-14T10:00:00.000Z",
  missionDay: 120,
  grid: { distortion: false, marks: [] },
  near: { line: 4 },
  symptoms: [],
  ...over
});

test("compare measures near-line loss, new distortion and new symptoms", () => {
  const baseline = result({ near: { line: 4 }, symptoms: ["near-blur"] });
  const worse = result({ near: { line: 2 }, grid: { distortion: true, marks: [] }, symptoms: ["near-blur", "headache"] });
  const c = Vision.compare(worse, baseline);
  assert.equal(c.nearLoss, 2);
  assert.equal(c.newDistortion, true);
  assert.deepEqual(c.newSymptoms, ["headache"]);
  assert.equal(c.changed, true);
});

test("compare treats a result against itself as no change", () => {
  const baseline = result();
  const c = Vision.compare(baseline, baseline);
  assert.equal(c.nearLoss, 0);
  assert.equal(c.newDistortion, false);
  assert.deepEqual(c.newSymptoms, []);
  assert.equal(c.changed, false);
});

test("a line that cannot be read counts as worse than the largest line", () => {
  const baseline = result({ near: { line: 0 } });
  const blind = result({ near: { line: -1 } });
  assert.equal(Vision.compare(blind, baseline).nearLoss, 1);
  assert.equal(Vision.lineIndex(blind), -1);
  assert.equal(Vision.compare(result({ near: { line: 4 } }), blind).nearLoss, -5);
});

test("new marked areas count as new distortion even when baseline had distortion", () => {
  const baseline = result({ grid: { distortion: true, marks: [{ row: 1, col: 1 }] } });
  const same = result({ grid: { distortion: true, marks: [{ row: 1, col: 1 }] } });
  const moved = result({ grid: { distortion: true, marks: [{ row: 1, col: 1 }, { row: 9, col: 9 }] } });
  assert.equal(Vision.compare(same, baseline).newDistortion, false);
  assert.equal(Vision.compare(moved, baseline).newDistortion, true);
});

test("urgent symptoms map to the urgent action whatever the baseline says", () => {
  const clean = result();
  for (const symptom of ["blind-spot", "sudden-loss"]) {
    const a = Vision.assess({ result: result({ symptoms: [symptom] }), baseline: clean });
    assert.equal(a.level, "urgent");
    assert.match(a.todo, /Open Emergencies/);
    assert.match(a.todo, /sudden change in vision/);
    assert.deepEqual(a.urgent, [symptom]);
  }
  const first = Vision.assess({ result: result({ symptoms: ["blind-spot"] }), baseline: null });
  assert.equal(first.level, "urgent");
});

test("two lost lines or more maps to repeat tomorrow and note what changed", () => {
  const baseline = result({ near: { line: 4 } });
  const two = Vision.assess({ result: result({ near: { line: 2 } }), baseline });
  assert.equal(two.level, "warn");
  assert.equal(two.reason, "change");
  assert.match(two.todo, /Repeat the check tomorrow/);
  assert.match(two.todo, /note what changed/);

  const three = Vision.assess({ result: result({ near: { line: 1 } }), baseline });
  assert.equal(three.level, "warn");
});

test("one lost line, no new distortion and no new symptom stays stable", () => {
  const baseline = result({ near: { line: 4 } });
  const one = Vision.assess({ result: result({ near: { line: 3 } }), baseline });
  assert.equal(one.level, "ok");
  assert.equal(one.reason, "stable");
  assert.match(one.todo, /Repeat the check in a week/);

  const better = Vision.assess({ result: result({ near: { line: 6 } }), baseline });
  assert.equal(better.level, "ok");
});

test("new distortion or a new symptom maps to the change action", () => {
  const baseline = result();
  const distorted = Vision.assess({ result: result({ grid: { distortion: true, marks: [{ row: 8, col: 8 }] } }), baseline });
  assert.equal(distorted.level, "warn");
  assert.equal(distorted.reason, "change");

  const symptom = Vision.assess({ result: result({ symptoms: ["headache"] }), baseline });
  assert.equal(symptom.level, "warn");
  assert.equal(symptom.reason, "change");
});

test("a first result is a baseline unless it already shows a finding", () => {
  const clean = Vision.assess({ result: result(), baseline: null });
  assert.equal(clean.level, "ok");
  assert.equal(clean.reason, "baseline");
  assert.match(clean.title, /Baseline saved/);

  const finding = Vision.assess({ result: result({ grid: { distortion: true, marks: [] } }), baseline: null });
  assert.equal(finding.level, "warn");
  assert.equal(finding.reason, "first-finding");
  assert.match(finding.todo, /Repeat the check tomorrow/);

  const unreadable = Vision.assess({ result: result({ near: { line: -1 } }), baseline: null });
  assert.equal(unreadable.level, "warn");
});

test("changeSummary describes the comparison with words, not numbers alone", () => {
  assert.equal(Vision.changeSummary(result(), null), "First result for this eye.");
  const baseline = result({ near: { line: 4 }, symptoms: ["near-blur"] });
  assert.match(Vision.changeSummary(result({ near: { line: 2 } }), baseline), /2 lines worse/);
  assert.match(Vision.changeSummary(result({ near: { line: 5 } }), baseline), /1 line better/);
  assert.match(Vision.changeSummary(result({ grid: { distortion: true, marks: [] } }), baseline), /new grid distortion/);
  assert.match(Vision.changeSummary(result({ symptoms: ["near-blur", "double"] }), baseline), /1 new symptom/);
});

test("describeResult states the grid, near line and symptoms", () => {
  const text = Vision.describeResult(result({ near: { line: 6 }, symptoms: ["near-blur"] }));
  assert.match(text, /Grid looked even/);
  assert.match(text, /20\/20/);
  assert.match(text, /New blur when reading at near/);

  const blind = Vision.describeResult(result({ near: { line: -1 } }));
  assert.match(blind, /could not read the largest line/);
});

test("isDueFrom uses the number of days since the last result", () => {
  const now = new Date("2026-11-14T12:00:00.000Z").getTime();
  assert.equal(Vision.isDueFrom(null, 7, now), true);
  assert.equal(Vision.isDueFrom("2026-11-13T12:00:00.000Z", 7, now), false);
  assert.equal(Vision.isDueFrom("2026-11-07T12:00:00.000Z", 7, now), true);
  assert.equal(Vision.isDueFrom("not a date", 7, now), true);
});

test("historyFrom keeps a separate baseline and previous result per eye", () => {
  const data = {
    results: [
      result({ id: "r2", eye: "right", date: "2026-11-14T10:00:00.000Z", near: { line: 2 } }),
      result({ id: "l1", eye: "left", date: "2026-11-13T10:00:00.000Z", near: { line: 4 } }),
      result({ id: "r1", eye: "right", date: "2026-11-12T10:00:00.000Z", near: { line: 4 } })
    ]
  };
  const rows = Vision.historyFrom(data);
  assert.deepEqual(rows.map((r) => r.id), ["r2", "l1", "r1"]);
  assert.equal(rows[0].baseline.id, "r1");
  assert.equal(rows[0].previous.id, "r1");
  assert.equal(rows[0].vsBaseline.nearLoss, 2);
  assert.equal(rows[1].baseline, null);
  assert.equal(rows[1].previous, null);
  assert.equal(rows[2].baseline, null);
});

test("findingsFrom reports one finding per eye from the newest result", () => {
  const data = {
    results: [
      result({ id: "r1", eye: "right", date: "2026-11-12T10:00:00.000Z", near: { line: 4 } }),
      result({ id: "r2", eye: "right", date: "2026-11-14T10:00:00.000Z", near: { line: 2 } }),
      result({ id: "l1", eye: "left", date: "2026-11-13T10:00:00.000Z", near: { line: 4 } })
    ]
  };
  const out = Vision.findingsFrom(data);
  assert.equal(out.length, 2);
  const right = out.find((f) => f.title.startsWith("Right eye"));
  const left = out.find((f) => f.title.startsWith("Left eye"));
  assert.equal(right.level, "warn");
  assert.match(right.saw, /2 lines worse/);
  assert.equal(left.level, "ok");
});
