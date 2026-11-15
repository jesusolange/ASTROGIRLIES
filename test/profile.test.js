import test from "node:test";
import assert from "node:assert/strict";
import {
  DAY, dayNum, isoDay, isIsoDay, missionDayFor, dayOfFor, totalFor, dayLabelFor, crewFor, formValues, applyForm, fieldErrors
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
  assert.equal(isIsoDay("2026-11-01"), true);
  assert.equal(isIsoDay("not a date"), false);
});

test("crew size is a whole number of 1 or more and a missing value reads as 1", () => {
  assert.equal(crewFor(null), 1);
  assert.equal(crewFor({}), 1);
  assert.equal(crewFor({ crew: 3 }), 3);
  assert.equal(crewFor({ crew: "4" }), 4);
  assert.equal(crewFor({ crew: 0 }), 1);
  assert.equal(crewFor({ crew: -2 }), 1);
  assert.equal(crewFor({ crew: 2.7 }), 2);
});

test("total length defaults to 365 and the label uses the chosen length", () => {
  assert.equal(totalFor(null), 365);
  assert.equal(totalFor({ totalDays: 700 }), 700);
  assert.equal(totalFor({ totalDays: "500" }), 500);
  assert.equal(totalFor({ totalDays: 0 }), 365);
  assert.equal(dayLabelFor(null), "Mission day not set");
  assert.match(dayLabelFor({ startDate: "2026-11-01", totalDays: 700 }), /^Mission Day \d+ \/ 700$/);
  assert.match(dayLabelFor({ startDate: "2026-11-01", totalDays: 500 }), /^Mission Day \d+ \/ 500$/);
});

test("form values round-trip the stored record with safe defaults", () => {
  const now = new Date(2026, 10, 14);
  const values = formValues(null, now);
  assert.equal(values.crew, 1);
  assert.equal(values.startDate, "2026-11-14");
  assert.equal(values.total, 365);
  assert.equal(values.sex, "");
  assert.equal(values.missionType, "mars-planetary");
  assert.equal(values.name, "");

  const filled = formValues({
    name: "Ada", startDate: "2026-10-16", totalDays: 700, crew: 3,
    missionType: "mars-preparatory", age: 41, sex: "f", meno: "pre", weightKg: 62, heightCm: 168
  }, now);
  assert.equal(filled.startDate, "2026-10-16");
  assert.equal(filled.crew, 3);
  assert.equal(filled.total, 700);
  assert.equal(filled.sex, "f");
  assert.equal(filled.meno, "pre");
  assert.equal(filled.missionType, "mars-preparatory");
});

test("menopause is only offered and kept for women", () => {
  const now = new Date(2026, 10, 14);
  assert.equal(formValues({ sex: "m", meno: "post" }, now).meno, "");
  assert.equal(formValues({ sex: "x", meno: "post" }, now).meno, "");
  assert.equal(formValues({ sex: "f", meno: "post" }, now).meno, "post");

  const woman = applyForm({ sex: "f", meno: "post" }, {}, now);
  assert.equal(woman.meno, "post");
  const man = applyForm({ sex: "m", meno: "post" }, {}, now);
  assert.equal(man.meno, null);
  const unsure = applyForm({ sex: "x", meno: "post" }, {}, now);
  assert.equal(unsure.meno, null);
});

test("applyForm stores the crew, the start date and the duration", () => {
  const now = new Date(2026, 10, 14);
  const record = applyForm({
    name: "  Ada  ", missionType: "mars-planetary", crew: "2", startDate: "2026-11-01", total: "500",
    age: "41", sex: "f", meno: "pre", weight: "62.5", height: "168"
  }, { skipped: false }, now);

  assert.equal(record.startDate, "2026-11-01");
  assert.equal(record.name, "Ada");
  assert.equal(record.crew, 2);
  assert.equal(record.totalDays, 500);
  assert.equal(record.missionType, "mars-planetary");
  assert.equal(record.age, 41);
  assert.equal(record.sex, "f");
  assert.equal(record.meno, "pre");
  assert.equal(record.weightKg, 62.5);
  assert.equal(record.heightCm, 168);
  assert.equal(record.skipped, false);
});

test("applyForm clamps impossible values and falls back to today", () => {
  const now = new Date(2026, 10, 14);
  const record = applyForm({ name: "A", crew: "0", startDate: "nonsense", total: "0" }, {}, now);
  assert.equal(record.startDate, "2026-11-14");
  assert.equal(record.crew, 1);
  assert.equal(record.totalDays, 365);
  assert.equal(record.sex, null);
  assert.equal(record.age, null);
  assert.equal(record.meno, null);
});

test("fieldErrors marks every required profile field", () => {
  const empty = fieldErrors({
    name: "  ", missionType: "", crew: "", startDate: "", total: "",
    age: "", sex: "", weight: "", height: "", meno: ""
  });
  ["name", "missionType", "crew", "startDate", "total", "age", "sex", "weight", "height"].forEach((key) => {
    assert.ok(empty[key], `${key} should have an error`);
  });

  const good = fieldErrors({
    name: "Ada", missionType: "mars-planetary", crew: 2, startDate: "2026-11-01", total: 365,
    age: 38, sex: "x", weight: 64, height: 168, meno: ""
  });
  assert.deepEqual(good, {});
  assert.equal(isoDay(new Date(2026, 10, 14)), "2026-11-14");
});

test("menopause is required only for a woman", () => {
  const base = {
    name: "Ada", missionType: "leo-long", crew: 1, startDate: "2026-11-01", total: 200,
    age: 41, weight: 62, height: 168
  };
  assert.ok(fieldErrors({ ...base, sex: "f", meno: "" }).meno);
  assert.equal(fieldErrors({ ...base, sex: "f", meno: "pre" }).meno, undefined);
  assert.equal(fieldErrors({ ...base, sex: "m", meno: "" }).meno, undefined);
  assert.equal(fieldErrors({ ...base, sex: "x" }).meno, undefined);
});

test("out-of-range measurements are refused", () => {
  const base = {
    name: "Ada", missionType: "leo-long", crew: 1, startDate: "2026-11-01", total: 200,
    age: 41, sex: "x", weight: 62, height: 168
  };
  assert.ok(fieldErrors({ ...base, age: 12 }).age);
  assert.ok(fieldErrors({ ...base, weight: 20 }).weight);
  assert.ok(fieldErrors({ ...base, height: 250 }).height);
  assert.ok(fieldErrors({ ...base, crew: 0 }).crew);
  assert.ok(fieldErrors({ ...base, total: 0 }).total);
});
