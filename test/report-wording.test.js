import test from "node:test";
import assert from "node:assert/strict";
import { closingLine } from "../src/scripts/report.js";

test("a live link lets the record go to the flight surgeon now", () => {
  const line = closingLine({ kind: "live", oneWay: "< 1 s", roundTrip: "about 1 s" });
  assert.match(line, /sent to the flight surgeon/i);
  assert.match(line, /link is live/i);
});

test("a delayed link states the reply time", () => {
  const line = closingLine({ kind: "delayed", oneWay: "3 to 22 min", roundTrip: "6 to 44 min" });
  assert.match(line, /sent to the flight surgeon/i);
  assert.match(line, /reply takes about 6 to 44 minutes/i);
});

test("no link means the report says nothing about sending it", () => {
  assert.equal(closingLine({ kind: "none", oneWay: null, roundTrip: null }), "");
  assert.equal(closingLine(null), "");
});
