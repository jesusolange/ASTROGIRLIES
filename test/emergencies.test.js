"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { SITUATIONS, situationById } = require("../src/data/emergencies.js");

const REQUIRED_IDS = [
  "chest-pain",
  "trouble-breathing",
  "vision-change",
  "headache-confusion",
  "bleeding",
  "fracture",
  "flank-pain",
  "self-harm",
  "solar-storm",
  "cabin-air",
];

const text = (s) => [s.title, s.hint, ...s.steps, ...s.prepare, ...s.escalate].join(" ");

test("every required situation is present exactly once", () => {
  assert.deepEqual(SITUATIONS.map((s) => s.id), REQUIRED_IDS);
});

test("every situation has steps, preparation and an escalation trigger", () => {
  for (const s of SITUATIONS) {
    assert.ok(s.title.length > 0, `${s.id}: title`);
    assert.ok(s.hint.length > 0, `${s.id}: hint`);
    assert.ok(s.steps.length >= 4, `${s.id}: at least four steps`);
    assert.ok(s.prepare.length >= 2, `${s.id}: at least two preparation items`);
    assert.ok(s.escalate.length >= 2, `${s.id}: at least two escalation triggers`);
  }
});

test("every situation has a named source with an https URL, or is marked as a design choice", () => {
  for (const s of SITUATIONS) {
    if (s.designChoice) {
      assert.equal(s.source, undefined, `${s.id}: design choice must not claim a source`);
      continue;
    }
    assert.ok(s.source, `${s.id}: source is missing`);
    assert.ok(s.source.name.length > 0, `${s.id}: source name`);
    assert.match(s.source.url, /^https:\/\//, `${s.id}: source URL`);
  }
});

test("no situation tells the astronaut to call emergency services or see a doctor", () => {
  const banned = /call (911|999|emergency services)|see a doctor|call a doctor|your doctor|send .* to your doctor/i;
  for (const s of SITUATIONS) {
    assert.doesNotMatch(text(s), banned, `${s.id}: banned copy`);
  }
});

test("the solar storm situation contains the moved steps", () => {
  const storm = situationById("solar-storm");
  assert.ok(storm, "solar storm situation");
  const body = text(storm).toLowerCase();
  assert.match(body, /shelter/);
  assert.match(body, /ground team/);
  assert.match(body, /dosimeter/);
});

test("unknown situation ids return null", () => {
  assert.equal(situationById("not-a-situation"), null);
  assert.equal(situationById(""), null);
});

test("Radiation cites primary sources and links to the solar storm steps", () => {
  const file = fs.readFileSync(path.join(__dirname, "..", "src", "scripts", "radiation.js"), "utf8");
  assert.doesNotMatch(file, /phys\.org|space\.com/i);
  assert.match(file, /Zeitlin et al\. 2013/);
  assert.match(file, /Hassler et al\. 2014/);
  assert.match(file, /Zhang et al\. 2020/);
  assert.match(file, /Open solar storm steps/);
  assert.match(file, /AstroMedEmergencies\.open\("solar-storm"\)/);
});

test("Emergencies registers first in the sidebar and exposes the public API", () => {
  const file = fs.readFileSync(path.join(__dirname, "..", "src", "scripts", "emergencies.js"), "utf8");
  assert.match(file, /id: "emergencies"/);
  assert.match(file, /before: "environment"/);
  assert.match(file, /window\.AstroMedEmergencies = \{ open, situations/);
});
