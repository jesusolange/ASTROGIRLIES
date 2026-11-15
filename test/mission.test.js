"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Mission = require("../src/scripts/mission.js");

test("a missing crew field means one astronaut", () => {
  assert.equal(Mission.crewSize(null), 1);
  assert.equal(Mission.crewSize({}), 1);
  assert.equal(Mission.crewSize({ crew: 0 }), 1);
  assert.equal(Mission.crewSize({ crew: "6" }), 6);
  assert.equal(Mission.hasCrew({}), false);
  assert.equal(Mission.hasCrew({ crew: 1 }), false);
  assert.equal(Mission.hasCrew({ crew: 6 }), true);
});

test("the link follows the environment place", () => {
  assert.deepEqual(Mission.link({ place: "iss" }, null), { kind: "live", oneWay: "< 1 s", roundTrip: "about 1 s" });
  assert.equal(Mission.link({ place: "moon" }, null).kind, "delayed");
  assert.equal(Mission.link({ place: "mars" }, null).kind, "delayed");
  assert.equal(Mission.link({ place: "transit" }, null).kind, "delayed");
  assert.equal(Mission.link({ place: "unknown" }, null).kind, "none");
});

test("the link falls back to the mission type in the profile", () => {
  assert.equal(Mission.link(null, { missionType: "leo-long" }).kind, "live");
  assert.equal(Mission.link(null, { missionType: "lunarSurface-short" }).kind, "delayed");
  assert.equal(Mission.link(null, { missionType: "mars-planetary" }).kind, "delayed");
  assert.equal(Mission.link(null, null).kind, "none");
});

test("alsoTell words the second step for the current link", () => {
  assert.equal(Mission.alsoTell("the flight surgeon", Mission.link({ place: "iss" }, null)), "Also tell the flight surgeon; the link is live.");
  assert.equal(
    Mission.alsoTell("the flight surgeon", Mission.link({ place: "mars" }, null)),
    "Also tell the flight surgeon; a reply takes about 6 to 44 minutes."
  );
  assert.equal(
    Mission.alsoTell("the flight surgeon", Mission.link({ place: "moon" }, null)),
    "Also tell the flight surgeon; a reply takes about 2.6 seconds."
  );
  assert.equal(Mission.alsoTell("the flight surgeon", { kind: "none" }), "");
  assert.equal(Mission.alsoTell("the flight surgeon", Mission.link(null, null)), "");
});

test("alsoTell uses the flight surgeon by default", () => {
  assert.match(Mission.alsoTell(undefined, Mission.link({ place: "mars" }, null)), /^Also tell the flight surgeon;/);
});

test("the message delay follows the destination in the profile", () => {
  assert.equal(Mission.comm({ missionType: "mars-planetary" }).place, "mars");
  assert.equal(Mission.comm({ missionType: "leo-long" }).place, "iss");
  assert.equal(Mission.comm({ missionType: "lunarSurface-short" }).place, "moon");
  assert.equal(Mission.comm({ missionType: "not-a-mission" }), null);
  assert.equal(Mission.comm(null), null);
  assert.equal(Mission.comm({}), null);
});

test("a delay is defined for every place and absent otherwise", () => {
  assert.equal(Mission.commFor(null), null);
  assert.equal(Mission.commFor("unknown"), null);
  assert.equal(Mission.commFor("other"), null);
  assert.equal(Mission.commFor("mars").one, "3 to 22 min");
  assert.equal(Mission.commFor("transit").bar, 100);
  assert.equal(Object.keys(Mission.COMM).length, 5);
});
