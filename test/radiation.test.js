import test from "node:test";
import assert from "node:assert/strict";
import {
  LIMIT, SPE_LIMIT, REF, PLACE_RATE, perDay, calc, careerShare, levelForPct, levelForProjection
} from "../src/scripts/radiation.js";

test("career limit and short-term storm limit keep their values", () => {
  assert.equal(LIMIT, 600);
  assert.equal(SPE_LIMIT, 250);
});

test("entries on the same day are summed", () => {
  const days = perDay({
    prior: 0,
    entries: [
      { day: "2026-11-01", dose: 1.2 },
      { day: "2026-11-01", dose: 0.3 },
      { day: "2026-11-02", dose: 2 }
    ]
  });
  assert.deepEqual(days, { "2026-11-01": 1.5, "2026-11-02": 2 });
});

test("calc adds prior dose, averages the last seven days and projects to the end", () => {
  const c = calc({
    prior: 40,
    entries: [
      { day: "2026-11-01", dose: 1.5 },
      { day: "2026-11-02", dose: 2 }
    ]
  }, { missionDay: 11, total: 20 });

  assert.deepEqual(c.keys, ["2026-11-01", "2026-11-02"]);
  assert.equal(c.mission, 3.5);
  assert.equal(c.career, 43.5);
  assert.equal(c.rate, 1.75);
  assert.equal(c.left, 9);
  assert.ok(Math.abs(c.projected - (43.5 + 1.75 * 9)) < 1e-9);
  assert.ok(Math.abs(c.pct - (43.5 / LIMIT) * 100) < 1e-9);
  assert.equal(c.level, "ok");
  assert.equal(c.projLevel, "ok");
});

test("calc averages only the last seven recorded days", () => {
  const entries = Array.from({ length: 9 }, (_, index) => ({ day: `2026-11-0${index + 1}`, dose: index + 1 }));
  const c = calc({ prior: 0, entries }, { missionDay: 20, total: 30 });
  assert.equal(c.rate, (3 + 4 + 5 + 6 + 7 + 8 + 9) / 7);
});

test("calc has no projection without a mission length", () => {
  const c = calc({ prior: 10, entries: [{ day: "2026-11-01", dose: 1 }] }, { missionDay: null, total: 365 });
  assert.equal(c.left, null);
  assert.equal(c.projected, null);
  assert.equal(c.projLevel, null);
});

test("career share bands are 50 and 80 percent of the limit", () => {
  assert.equal(careerShare(0), 0);
  assert.equal(careerShare(300), 50);
  assert.equal(careerShare(480), 80);
  assert.equal(levelForPct(49.9), "ok");
  assert.equal(levelForPct(50), "review");
  assert.equal(levelForPct(80), "alert");
  assert.equal(levelForProjection(479), "ok");
  assert.equal(levelForProjection(480), "review");
  assert.equal(levelForProjection(600), "alert");
});

test("reference table keeps the primary sources and measured rates", () => {
  assert.equal(REF.length, 4);
  assert.deepEqual(REF.map((row) => row.place), ["ISS (low Earth orbit)", "Moon surface", "Mars cruise", "Mars surface"]);
  assert.deepEqual(REF.map((row) => row.v), ["about 0.7", "about 1.37", "1.84", "0.64"]);
  assert.deepEqual(REF.map((row) => row.url), [
    "https://doi.org/10.1126/sciadv.aaz1334",
    "https://doi.org/10.1126/sciadv.aaz1334",
    "https://doi.org/10.1126/science.1235989",
    "https://doi.org/10.1126/science.1244797"
  ]);
  assert.equal(REF[0].src2, "NASA HRP");
  assert.deepEqual(PLACE_RATE, { iss: 0.73, moon: 1.37, mars: 0.64, rover: null, other: null });
});

test("a dose can be added, converted and removed", async () => {
  const { convertToMsv, addDose, removeDose, projection } = await import("../src/scripts/radiation.js");
  assert.equal(convertToMsv(500, "µSv"), 0.5);
  assert.equal(convertToMsv(0.5, "mSv"), 0.5);
  assert.equal(convertToMsv("x", "mSv"), null);

  const empty = { prior: 0, entries: [] };
  const added = addDose(empty, { day: "2026-11-15", dose: 0.5, src: "dosimeter" });
  assert.equal(added.state.entries.length, 1);
  assert.equal(added.entry.dose, 0.5);
  assert.equal(removeDose(added.state, added.entry.id).entries.length, 0);

  const numbers = projection({ prior: 10, entries: [{ day: "2026-11-01", dose: 1 }] }, { missionDay: 2, total: 10 });
  assert.equal(numbers.career, 11);
  assert.equal(numbers.left, 8);
  assert.equal(numbers.rate, 1);
});
