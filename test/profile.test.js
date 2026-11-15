import test from "node:test";
import assert from "node:assert/strict";
import {
  DAY, dayNum, isoDay, missionDayFor, dayOfFor, totalFor, dayLabelFor, formValues, applyForm
} from "../src/scripts/profile.js";

test("the local day number ignores daylight saving", () => {
  assert.equal(dayNum(new Date(2026, 10, 14)), Date.UTC(2026, 10, 14) / DAY);
  assert.equal(dayNum(new Date(2026, 2, 29)), Date.UTC(2026, 2, 29) / DAY);
});

test("mission day 1 is the start date and grows one per calendar day", () => {
  const profile = { startDate: "2026-11-01" };
  assert.equal(missionDayFor(profile, new Date(2026, 10, 1)), 1);
  assert.equal(missionDayFor(profile, new Date(2026, 10, 2)), 2);
  assert.equal(missionDayFor(profile, new Date(2026, 10, 14)), 14);
  assert.equal(missionDayFor(profile, new Date(2027, 10, 1)), 366);
  assert.equal(missionDayFor({}, new Date(2026, 10, 14)), null);
  assert.equal(missionDayFor(null), null);
});

test("a stored ISO date resolves to the same mission day", () => {
  const profile = { startDate: "2026-11-01" };
  assert.equal(dayOfFor(profile, "2026-11-10"), 10);
});

test("total length defaults to 365 and the label reads like the app", () => {
  assert.equal(totalFor(null), 365);
  assert.equal(totalFor({ totalDays: 700 }), 700);
  assert.equal(dayLabelFor(null), "Mission day not set");
  assert.match(dayLabelFor({ startDate: "2026-11-01", totalDays: 700 }), /^Mission Day \d+ \/ 700$/);
});

test("form values round-trip the stored record with safe defaults", () => {
  const values = formValues(null);
  assert.equal(values.day, 1);
  assert.equal(values.total, 365);
  assert.equal(values.sex, "x");
  assert.equal(values.missionType, "mars-planetary");

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
  const filled = formValues({
    name: "Solange", startDate: isoDay(start), totalDays: 700,
    missionType: "mars-preparatory", destination: "Mars", age: 41, sex: "f", meno: "pre", weightKg: 62, heightCm: 168
  });
  assert.equal(filled.day, 30);
  assert.equal(filled.sex, "f");
  assert.equal(filled.missionType, "mars-preparatory");
});

test("applyForm turns the typed day into a start date and keeps the old record", () => {
  const now = new Date(2026, 10, 14);
  const record = applyForm({
    name: "  Solange  ", day: "31", total: "700", missionType: "mars-planetary", destination: " Mars ",
    age: "41", sex: "f", meno: "pre", weight: "62.5", height: "168"
  }, { skipped: false }, now);

  assert.equal(record.startDate, "2026-10-15");
  assert.equal(record.name, "Solange");
  assert.equal(record.totalDays, 700);
  assert.equal(record.missionType, "mars-planetary");
  assert.equal(record.destination, "Mars");
  assert.equal(record.age, 41);
  assert.equal(record.sex, "f");
  assert.equal(record.meno, "pre");
  assert.equal(record.weightKg, 62.5);
  assert.equal(record.heightCm, 168);
  assert.equal(record.skipped, false);
});

test("applyForm clamps impossible day and length values", () => {
  const now = new Date(2026, 10, 14);
  const record = applyForm({ name: "A", day: "0", total: "0" }, {}, now);
  assert.equal(record.startDate, "2026-11-14");
  assert.equal(record.totalDays, 365);
  assert.equal(record.sex, null);
  assert.equal(record.age, null);
});
