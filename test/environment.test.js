import test from "node:test";
import assert from "node:assert/strict";
import {
  PLACES, FIELDS, COMM, evaluate, baselineFor, labelFrom, findingsFrom, commFor
} from "../src/scripts/environment.js";

test("temperature follows the stated bands", () => {
  assert.equal(evaluate("temp", 13.9, "iss", null).level, "alert");
  assert.equal(evaluate("temp", 14, "iss", null).level, "review");
  assert.equal(evaluate("temp", 18, "iss", null).level, "ok");
  assert.equal(evaluate("temp", 27, "iss", null).level, "ok");
  assert.equal(evaluate("temp", 27.1, "iss", null).level, "review");
  assert.equal(evaluate("temp", 32, "iss", null).level, "review");
  assert.equal(evaluate("temp", 32.1, "iss", null).level, "alert");
});

test("pressure uses a reduced range on the Moon, Mars and an unnamed place", () => {
  assert.equal(evaluate("pressure", 39, "moon", null).level, "alert");
  assert.equal(evaluate("pressure", 50, "mars", null).level, "review");
  assert.equal(evaluate("pressure", 100, "other", null).level, "ok");
  assert.equal(evaluate("pressure", 110, "moon", null).level, "review");
  assert.equal(evaluate("pressure", 111, "mars", null).level, "alert");

  assert.equal(evaluate("pressure", 79, "iss", null).level, "alert");
  assert.equal(evaluate("pressure", 94, "iss", null).level, "review");
  assert.equal(evaluate("pressure", 101, "iss", null).level, "ok");
  assert.equal(evaluate("pressure", 110, "iss", null).level, "review");
});

test("humidity, carbon dioxide and noise keep their thresholds", () => {
  assert.equal(evaluate("humidity", 19, "iss", null).level, "alert");
  assert.equal(evaluate("humidity", 29, "iss", null).level, "review");
  assert.equal(evaluate("humidity", 60, "iss", null).level, "ok");
  assert.equal(evaluate("humidity", 70, "iss", null).level, "review");
  assert.equal(evaluate("humidity", 71, "iss", null).level, "alert");

  assert.equal(evaluate("co2", 3000, "iss", null).level, "ok");
  assert.equal(evaluate("co2", 3001, "iss", null).level, "review");
  assert.equal(evaluate("co2", 5000, "iss", null).level, "review");
  assert.equal(evaluate("co2", 5001, "iss", null).level, "alert");

  assert.equal(evaluate("noise", 60, "iss", null).level, "ok");
  assert.equal(evaluate("noise", 70, "iss", null).level, "review");
  assert.equal(evaluate("noise", 71, "iss", null).level, "alert");
});

test("radiation compares with the place typical rate or the personal baseline", () => {
  assert.equal(evaluate("radiation", 20, "iss", null).level, "ok");
  assert.equal(evaluate("radiation", 30, "iss", null).level, "ok");
  assert.equal(evaluate("radiation", 31, "iss", null).level, "review");
  assert.equal(evaluate("radiation", 80, "iss", null).level, "review");
  assert.equal(evaluate("radiation", 81, "iss", null).level, "alert");

  assert.equal(evaluate("radiation", 10, "rover", null).level, "info");
  assert.equal(evaluate("radiation", 15, "rover", 10).level, "ok");
  assert.equal(evaluate("radiation", 20, "rover", 10).level, "review");
  assert.equal(evaluate("radiation", 50, "rover", 10).level, "alert");
});

test("baseline needs three earlier readings and averages at most seven", () => {
  const log = [
    { place: "rover", time: "d5", readings: { radiation: 12 } },
    { place: "rover", time: "d4", readings: { radiation: 10 } },
    { place: "moon", time: "d3", readings: { radiation: 100 } },
    { place: "rover", time: "d2", readings: { radiation: 8 } },
    { place: "rover", time: "d1", readings: { radiation: 6 } }
  ];
  assert.equal(baselineFor(log.slice(0, 2), "rover"), null);
  assert.equal(baselineFor(log, "rover"), 9);
  assert.equal(baselineFor(log, "rover", "d5"), 8);
});

test("place label falls back to the typed name", () => {
  assert.equal(labelFrom({ place: "" }), "");
  assert.equal(labelFrom({ place: "iss" }), "ISS");
  assert.equal(labelFrom({ place: "other", custom: "" }), "Other place");
  assert.equal(labelFrom({ place: "other", custom: "Lunar orbit" }), "Lunar orbit");
});

test("findings keep ok and warn rows but drop the first-baseline info row", () => {
  const state = { place: "iss", custom: "", readings: { temp: 35, co2: 2500, radiation: 20 }, time: "now" };
  const findings = findingsFrom(state, []);
  assert.equal(findings.length, 3);
  assert.equal(findings[0].level, "alert");
  assert.equal(findings[0].key, "temp");
  assert.equal(findings[0].title, "Environment · Cabin temperature: 35 °C");
  assert.equal(findingsFrom({ place: "rover", readings: { radiation: 10 }, time: "now" }, []).length, 0);
});

test("message delay is defined for every place and absent otherwise", () => {
  assert.equal(commFor(null), null);
  assert.equal(commFor("unknown"), null);
  assert.equal(commFor("other"), null);
  assert.equal(commFor("mars").one, "3 to 22 min");
  assert.equal(commFor("transit").bar, 100);
  assert.equal(Object.keys(COMM).length, 5);
  assert.equal(FIELDS.length, 6);
  assert.equal(PLACES.transit.rad, 76.7);
});
