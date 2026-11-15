import test from "node:test";
import assert from "node:assert/strict";
import {
  DEVICES, deviceOf, validateSession, buildSession, addSession, sessionsToday, doneToday,
  weeklyResistive, removeSession, RESISTIVE_WEEKLY_TARGET, parseVo2, todaySummary
} from "../src/scripts/exercise.js";
import { buildOverview, validSessions, weeklyNumbers } from "../src/scripts/exercise-overview.js";

const now = new Date(2026, 10, 14, 12, 0, 0);
const daysAgo = (n) => new Date(2026, 10, 14 - n, 12, 0, 0).toISOString();
const session = (type, values, days) => ({ type, title: type.toUpperCase(), values, date: daysAgo(days) });

test("the three machines keep their names, images and fields", () => {
  assert.deepEqual(DEVICES.map((d) => d.type), ["ared", "t2", "cevis"]);
  assert.equal(deviceOf("ared").title, "ARED");
  assert.ok(deviceOf("cevis").fields.some((f) => f.key === "power"));
  assert.equal(deviceOf("missing"), null);
  const movement = deviceOf("ared").fields.find((f) => f.key === "movement");
  assert.ok(movement.options.includes("Squat"));
});

test("session validation requires duration and a movement", () => {
  const ared = deviceOf("ared");
  const missing = validateSession(ared, { movement: "Squat" });
  assert.equal(missing.ok, false);
  assert.ok(missing.errors.some((e) => /Duration/.test(e)));
  const noMovement = validateSession(ared, { minutes: "30" });
  assert.equal(noMovement.ok, false);
  assert.ok(noMovement.errors.some((e) => /Movement/.test(e)));
});

test("valid sessions keep numbers and empty optional fields", () => {
  const result = validateSession(deviceOf("t2"), { minutes: "30", distance: "4.2", speed: "", effort: "0" });
  assert.equal(result.ok, true);
  assert.deepEqual(result.values, { minutes: 30, distance: 4.2, speed: null, heartRate: null, effort: 0, soreness: null });
});

test("session validation rejects out-of-range values", () => {
  assert.equal(validateSession(deviceOf("t2"), { minutes: "0" }).ok, false);
  assert.equal(validateSession(deviceOf("t2"), { minutes: "301" }).ok, false);
  assert.equal(validateSession(deviceOf("cevis"), { minutes: "30", effort: "11" }).ok, false);
  assert.equal(validateSession(deviceOf("cevis"), { minutes: "30", effort: "10" }).ok, true);
});

test("a built session keeps the stored record shape", () => {
  const built = buildSession(deviceOf("ared"), { movement: "Squat", minutes: 45 }, now);
  assert.deepEqual(built, { type: "ared", title: "ARED", values: { movement: "Squat", minutes: 45 }, date: now.toISOString() });
});

test("new sessions go first and the list is capped", () => {
  const base = [{ id: 1 }, { id: 2 }];
  assert.deepEqual(addSession(base, { id: 3 }).map((x) => x.id), [3, 1, 2]);
  assert.equal(addSession(Array.from({ length: 500 }, (_, i) => ({ id: i })), { id: "new" }).length, 500);
});

test("only well-formed sessions are used", () => {
  const data = [session("ared", { minutes: 10 }, 0), { type: "other", values: {} }, null, { type: "t2", values: {}, date: "nope" }];
  assert.equal(validSessions(data).length, 1);
  assert.equal(validSessions(null).length, 0);
});

test("the overview adds the current week and compares it with the previous one", () => {
  const data = [
    session("ared", { movement: "Squat", minutes: 45, load: 80, effort: 7 }, 0),
    session("t2", { minutes: 30, speed: 9, effort: 6 }, 2),
    session("cevis", { minutes: 40, power: 150, effort: 8 }, 4),
    session("t2", { minutes: 25, speed: 8.4, effort: 5 }, 9)
  ];
  const overview = buildOverview(data, now);
  assert.equal(overview.currentCount, 3);
  assert.equal(overview.totalMinutes, 115);
  assert.equal(overview.previousMinutes, 25);
  assert.equal(overview.effort, 7);
  assert.equal(overview.days.length, 7);
  assert.equal(overview.days[6].amount, 45);
  assert.equal(overview.days[4].amount, 30);
  assert.equal(overview.days[2].amount, 40);
  assert.equal(overview.comparison.difference, 90);
  assert.equal(overview.comparison.percentage, 360);
});

test("the overview breaks training down by machine", () => {
  const data = [
    session("ared", { minutes: 20, effort: 5 }, 0),
    session("ared", { minutes: 30, effort: 5 }, 1),
    session("cevis", { minutes: 10, effort: 5 }, 2)
  ];
  const machines = buildOverview(data, now).machines;
  assert.deepEqual(machines.map((m) => m.type), ["ared", "cevis", "t2"]);
  assert.equal(machines[0].count, 2);
  assert.equal(machines[0].mins, 50);
  assert.equal(machines[2].count, 0);
});

test("performance compares the latest two comparable sessions", () => {
  const data = [
    session("t2", { minutes: 30, speed: 9.5 }, 0),
    session("t2", { minutes: 30, speed: 8.5 }, 3),
    session("ared", { movement: "Squat", minutes: 30, load: 90 }, 1),
    session("ared", { movement: "Squat", minutes: 30, load: 80 }, 4)
  ];
  const performance = buildOverview(data, now).performance;
  const speed = performance.find((p) => p.label === "T2 average speed");
  assert.equal(speed.from, 8.5);
  assert.equal(speed.to, 9.5);
  assert.equal(speed.difference, 1);
  const load = performance.find((p) => /ARED Squat/.test(p.label));
  assert.equal(load.from, 80);
  assert.equal(load.to, 90);
});

test("one session today marks the day done and several records are kept", () => {
  const today = [session("ared", { minutes: 30 }, 0), session("t2", { minutes: 20 }, 0)];
  assert.equal(sessionsToday(today, now).length, 2);
  assert.equal(doneToday(today, now), true);
  assert.equal(doneToday([session("ared", { minutes: 30 }, 1)], now), false);
});

test("weekly resistive counts ARED sessions in the last seven days", () => {
  const data = [
    session("ared", { minutes: 20 }, 0),
    session("ared", { minutes: 20 }, 2),
    session("cevis", { minutes: 20 }, 1),
    session("ared", { minutes: 20 }, 6),
    session("ared", { minutes: 20 }, 7)
  ];
  assert.equal(RESISTIVE_WEEKLY_TARGET, 6);
  assert.equal(weeklyResistive(data, now), 3);
});

test("a session can be removed by its id", () => {
  const data = [{ ...session("ared", { minutes: 20 }, 0), id: "a" }, { ...session("t2", { minutes: 20 }, 0), id: "b" }];
  assert.deepEqual(removeSession(data, "a").map((item) => item.id), ["b"]);
});

test("the deck summary names today's sessions and minutes", () => {
  const data = [session("ared", { minutes: 45 }, 0), session("t2", { minutes: 20 }, 0)];
  assert.equal(todaySummary(data, now), "2 sessions, 65 min");
  assert.equal(todaySummary([session("ared", { minutes: 45 }, 1)], now), "");
});

test("a VO2max test is accepted only with a realistic value and a date", () => {
  assert.equal(parseVo2({ value: "42", date: "2026-11-14" }).ok, true);
  assert.equal(parseVo2({ value: "", date: "2026-11-14" }).ok, false);
  assert.equal(parseVo2({ value: "4", date: "2026-11-14" }).ok, false);
  assert.equal(parseVo2({ value: "91", date: "2026-11-14" }).ok, false);
  assert.equal(parseVo2({ value: "42", date: "" }).ok, false);
});

test("the weekly numbers carry the chart data for Progress", () => {
  const numbers = weeklyNumbers([session("ared", { minutes: 45, effort: 6 }, 0)], now);
  assert.equal(numbers.days.length, 7);
  assert.equal(numbers.currentCount, 1);
  assert.equal(numbers.totalMinutes, 45);
  assert.equal(numbers.days[6].amount, 45);
});

test("the overview reports an empty week and higher effort", () => {
  const empty = buildOverview([], now);
  assert.equal(empty.currentCount, 0);
  assert.equal(empty.insights[0].title, "No recent training logs");

  const hard = buildOverview([session("cevis", { minutes: 40, effort: 8, soreness: 8 }, 0)], now);
  assert.ok(hard.insights.some((i) => i.title === "Higher perceived effort" && i.review));
  assert.ok(hard.insights.some((i) => i.title === "Higher soreness reported" && i.review));
  assert.ok(hard.insights.some((i) => i.title === "More history is needed"));
});
