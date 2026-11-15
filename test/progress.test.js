"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Progress = require("../src/scripts/progress.js");

const DAY = 864e5;
const at = (offset) => new Date(Date.now() - offset * DAY).toISOString();

test("the change arrow compares this week with last week", () => {
  assert.deepEqual(Progress.arrow(null, 10), { txt: "—", cls: "flat" });
  assert.deepEqual(Progress.arrow(10, null), { txt: "—", cls: "flat" });
  assert.deepEqual(Progress.arrow(100, 100), { txt: "no change", cls: "flat" });
  assert.deepEqual(Progress.arrow(110, 100), { txt: "+10.0%", cls: "up" });
  assert.deepEqual(Progress.arrow(90, 100), { txt: "-10.0%", cls: "down" });
});

test("window statistics keep the last seven days apart from the week before", () => {
  const list = [
    { value: 60, time: at(1) },
    { value: 80, time: at(3) },
    { value: 40, time: at(8) },
    { value: 60, time: at(10) },
    { value: 999, time: at(20) },
  ];
  const stats = Progress.statsFor(list);
  assert.equal(stats.n, 2);
  assert.equal(stats.cur, 70);
  assert.equal(stats.prev, 50);
});

test("chart bounds always include the reference band and pad the range", () => {
  const { lo, hi } = Progress.chartBounds([76, 82], [60, 100]);
  assert.ok(lo < 60);
  assert.ok(hi > 100);
  const flat = Progress.chartBounds([70, 70], null);
  assert.ok(flat.lo < 70 && flat.hi > 70);
});

test("syncing daily records adds each reading once and marks demo separately", () => {
  const records = [
    { part: "heart", time: at(0), values: { hr: 76, sys: "118", hrv: "n/a" } },
  ];
  const first = Progress.syncHistory({ entries: [], seen: [] }, records, []);
  assert.equal(first.changed, true);
  assert.equal(first.history.entries.length, 2);
  assert.deepEqual(first.history.entries.map((entry) => entry.key).sort(), ["hr", "sys"]);

  const second = Progress.syncHistory(first.history, records, []);
  assert.equal(second.changed, false);
  assert.equal(second.history.entries.length, 2);
});

test("demo data covers 14 days for every readable indicator", () => {
  const meta = {
    heart: { title: "Heart", f: { hr: ["Heart rate", "bpm"], sys: ["Systolic", "mmHg"] } },
    brain: { title: "Sleep", f: { sleep: ["Sleep", "h"] } },
  };
  const entries = Progress.demoEntries(meta, Date.now(), 1);
  assert.equal(entries.length, 3 * 14);
  assert.ok(entries.every((entry) => entry.src === "demo" && Number.isFinite(entry.value)));
  assert.ok(entries.every((entry) => entry.part && entry.key && entry.time));
});
