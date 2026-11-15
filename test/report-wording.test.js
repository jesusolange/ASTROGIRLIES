"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Wording = require("../src/components/protocols/report-wording.js");

test("near Earth says send now", () => {
  assert.equal(Wording.linkKind({ place: "iss" }), "now");
  assert.match(Wording.sendHint({ place: "iss" }), /send it now/i);
});

test("the Moon says replies come after a short pause", () => {
  assert.equal(Wording.linkKind({ place: "moon" }), "moon");
  assert.match(Wording.sendHint({ place: "moon" }), /short pause/i);
});

test("Mars and the cruise to Mars ask for one complete message and no waiting", () => {
  assert.equal(Wording.linkKind({ place: "mars" }), "mars");
  assert.equal(Wording.linkKind({ place: "transit" }), "mars");
  assert.match(Wording.sendHint({ place: "mars" }), /one complete message/i);
  assert.match(Wording.sendHint({ place: "mars" }), /6 to 44 minutes/i);
  assert.match(Wording.sendHint({ place: "mars" }), /do not wait/i);
});

test("no environment, or an unknown place, uses the neutral wording", () => {
  for (const comm of [null, undefined, {}, { place: "rover" }, { place: "other" }, { place: "unknown" }]) {
    assert.equal(Wording.linkKind(comm), "none");
    assert.match(Wording.sendHint(comm), /if you have contact with Earth, you can send it/i);
  }
});

test("the report is the astronaut's own record first, then the sending step", () => {
  const lead = Wording.reportLead({ place: "mars" });
  assert.ok(lead.startsWith("Your mission health report. Keep it as your record."));
  assert.match(lead, /send it as one complete message/i);
});
