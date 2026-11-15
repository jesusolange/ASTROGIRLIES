"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Vision = require("../src/scripts/vision.js");
const Session = require("../src/components/vision/session.js");

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

test("the left eye comes first wherever both eyes are listed", () => {
  assert.deepEqual(Vision.EYES.map((eye) => eye.id), ["left", "right"]);
});

test("near-chart rows wider than the card are not offered", () => {
  const narrow = Vision.nearLinesFor(4.6, 314);
  assert.deepEqual(narrow.skipped.map((line) => line.snellen), ["20/200"]);
  assert.ok(narrow.offered.every((line) => line.needed <= 314));
  assert.equal(Vision.nearRowsLabel(narrow.offered), "20/100 to 20/15");

  const roomy = Vision.nearLinesFor(3.78, 314);
  assert.equal(roomy.skipped.length, 0);
  assert.equal(Vision.nearRowsLabel(roomy.offered), "20/200 to 20/15");

  const uncalibrated = Vision.nearLinesFor(null, 314);
  assert.equal(uncalibrated.calibrated, false);
  assert.equal(uncalibrated.offered.length, Vision.NEAR_LINES.length);
});

test("every grid cell keeps a 24 px tap target", () => {
  const phone = Vision.gridMetrics(3.78);
  assert.equal(phone.cell, 24);
  assert.equal(phone.enlarged, true);
  assert.equal(phone.size, 480);

  const roomy = Vision.gridMetrics(6);
  assert.equal(roomy.cell, 30);
  assert.equal(roomy.enlarged, false);
  assert.equal(roomy.size, 600);
});

test("assessmentToday reads one result per eye, left first, with the worse level", () => {
  const now = new Date(2026, 10, 15, 12);
  const earlier = { eye: "left", date: new Date(2026, 10, 1, 10).toISOString(), grid: { distortion: false, marks: [] }, near: { line: 4 }, symptoms: [] };
  const left = { eye: "left", date: new Date(2026, 10, 15, 10).toISOString(), grid: { distortion: false, marks: [] }, near: { line: 4 }, symptoms: [] };
  const right = { eye: "right", date: new Date(2026, 10, 15, 10).toISOString(), grid: { distortion: true, marks: [] }, near: { line: 2 }, symptoms: [] };
  const a = Session.assessmentToday({ results: [earlier, left, right] }, now);
  assert.deepEqual(a.eyes.map((entry) => entry.eye), ["left", "right"]);
  assert.equal(a.level, "warn");
  const text = Session.assessmentSummary(a);
  assert.ok(text.indexOf("Left eye") < text.indexOf("Right eye"));
  assert.match(text, /Left eye: No change against your baseline/);
});

test("an urgent symptom in either eye makes the day urgent", () => {
  const now = new Date(2026, 10, 15, 12);
  const left = { eye: "left", date: new Date(2026, 10, 15, 10).toISOString(), grid: { distortion: false, marks: [] }, near: { line: 4 }, symptoms: ["blind-spot"] };
  const right = { eye: "right", date: new Date(2026, 10, 15, 10).toISOString(), grid: { distortion: false, marks: [] }, near: { line: 4 }, symptoms: [] };
  const a = Session.assessmentToday({ results: [left, right] }, now);
  assert.equal(a.level, "urgent");
  assert.deepEqual(a.urgent, ["blind-spot"]);
});

test("symptoms save alone and the day combines once both eyes are ready", () => {
  const map = new Map();
  const previous = globalThis.window;
  globalThis.window = {
    AstroMedStore: {
      store: {
        get: (key, fallback) => (map.has(key) ? JSON.parse(map.get(key)) : fallback),
        set: (key, value) => { map.set(key, JSON.stringify(value)); return true; }
      }
    }
  };
  try {
    const now = new Date(2026, 10, 15, 12);
    Session.saveSymptoms(["near-blur"], now);
    assert.equal(Session.cardDone("vision-symptoms", now), true);
    assert.equal(Session.partsReady(Session.readProgress(now)), false);
    assert.equal(Session.finishIfComplete(now), null);

    Session.savePart("left", { grid: { distortion: false, marks: [] }, near: 4 }, now);
    Session.savePart("right", { grid: { distortion: false, marks: [] }, near: 4 }, now);
    assert.equal(Session.partsReady(Session.readProgress(now)), true);
    const entries = Session.finishIfComplete(now);
    assert.equal(entries.length, 2);
    assert.deepEqual(entries.map((entry) => entry.symptoms), [["near-blur"], ["near-blur"]]);
    assert.equal(Session.doneToday(now), true);
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
});
