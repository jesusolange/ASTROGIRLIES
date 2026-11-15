"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Mental = require("../src/scripts/mental.js");

test("depression scores map to the screening bands", () => {
  assert.deepEqual(Mental.depLevel(0), ["Healthy", "ok"]);
  assert.deepEqual(Mental.depLevel(4), ["Healthy", "ok"]);
  assert.deepEqual(Mental.depLevel(5), ["No suspicion", "ok"]);
  assert.deepEqual(Mental.depLevel(9), ["No suspicion", "ok"]);
  assert.deepEqual(Mental.depLevel(10), ["Mild depression symptoms", "review"]);
  assert.deepEqual(Mental.depLevel(14), ["Mild depression symptoms", "review"]);
  assert.deepEqual(Mental.depLevel(15), ["Moderate depression symptoms", "review"]);
  assert.deepEqual(Mental.depLevel(19), ["Moderate depression symptoms", "review"]);
  assert.deepEqual(Mental.depLevel(20), ["Severe depression symptoms", "alert"]);
  assert.deepEqual(Mental.depLevel(27), ["Severe depression symptoms", "alert"]);
});

test("stress scores map to the screening bands", () => {
  assert.equal(Mental.stressBand(0).level, "ok");
  assert.equal(Mental.stressBand(10).level, "ok");
  assert.equal(Mental.stressBand(11).level, "review");
  assert.equal(Mental.stressBand(20).level, "review");
  assert.equal(Mental.stressBand(21).level, "alert");
  assert.equal(Mental.stressBand(Mental.stressMax()).level, "alert");
  assert.equal(Mental.stressMax(), 66);
});

test("the suicidal-thoughts flag ignores the total score", () => {
  const none = Array(9).fill(0);
  assert.equal(Mental.suicidalFlag(none), false);

  for (const answer of [1, 2, 3, "1", "3"]) {
    const answers = none.slice();
    answers[8] = answer;
    assert.equal(Mental.suicidalFlag(answers), true, `answer ${answer}`);
  }

  assert.equal(Mental.suicidalFlag([0, 0, 0, 0, 0, 0, 0, 0, 0, 1]), false);
  assert.equal(Mental.suicidalFlag(undefined), false);
  assert.equal(Mental.suicidalFlag([]), false);
});

test("a flagged answer with a low score is shown as needing attention, not healthy", () => {
  const answers = [1, 0, 0, 0, 0, 0, 0, 0, 1];
  const entry = {
    type: "depression", score: 2, max: 27, label: "Healthy", level: "ok",
    answers, date: "2026-11-14T10:00:00.000Z", flagged: Mental.suicidalFlag(answers)
  };
  assert.equal(entry.flagged, true);
  assert.equal(Mental.resultLabel(entry), "Needs attention");
  assert.equal(Mental.resultLevel(entry), "alert");

  const guide = Mental.guideFor(entry);
  assert.match(guide.meaning, /needs attention whatever the total score is/i);
  assert.equal(guide.todo[0], "Move away from airlock controls, tools, medicines and anything else you could use to hurt yourself.");
  assert.ok(guide.todo.every((line) => !/crewmate|flight surgeon/i.test(line)));
});

test("the urgent response adds a crewmate and Earth only when the mission has them", () => {
  const alone = Mental.suicidalResponse({ crew: false, link: { kind: "none" } });
  assert.equal(alone.actions[0], "Move away from airlock controls, tools, medicines and anything else you could use to hurt yourself.");
  assert.ok(alone.actions.every((line) => !/crewmate|flight surgeon/i.test(line)));

  const crewed = Mental.suicidalResponse({ crew: true, link: { kind: "delayed", oneWay: "3 to 22 min", roundTrip: "6 to 44 min" } });
  assert.ok(crewed.actions.some((line) => /stay with a crewmate/i.test(line)));
  assert.ok(crewed.actions.some((line) => /^Also tell the flight surgeon; a reply takes about 6 to 44 minutes\.$/.test(line)));
  assert.match(crewed.text, /^You answered .* Move away from airlock controls/);
});

test("depression actions keep the solo step first when Earth is reachable", () => {
  const todo = Mental.depActions("Severe depression symptoms", { crew: true, link: { kind: "live" } });
  assert.match(todo[0], /^Write down how you feel/);
  assert.ok(todo.some((line) => /stay with a crewmate/i.test(line)));
  assert.ok(todo.some((line) => /the link is live/i.test(line)));
});

test("an unflagged low score keeps its healthy band", () => {
  const entry = { type: "depression", score: 2, max: 27, label: "Healthy", level: "ok", answers: Array(9).fill(0), flagged: false };
  assert.equal(Mental.resultLabel(entry), "Healthy");
  assert.equal(Mental.resultLevel(entry), "ok");
});

test("history compares each result with the previous one of the same questionnaire", () => {
  const rows = [
    { type: "depression", score: 12, date: "2026-11-14T10:00:00.000Z" },
    { type: "stress", score: 20, date: "2026-11-13T10:00:00.000Z" },
    { type: "depression", score: 9, date: "2026-11-12T10:00:00.000Z" }
  ];
  const out = Mental.withChanges(rows);
  assert.equal(out[0].delta, 3);
  assert.equal(out[0].previous.score, 9);
  assert.equal(out[1].delta, null);
  assert.equal(out[1].previous, null);
  assert.equal(out[2].delta, null);
});
