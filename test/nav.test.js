"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { CHECK_IDS, currentSection, go, has, openCard, openEmergency, parseRoute, route } = require("../src/lib/nav.js");

test("route paths parse to an area and an id", () => {
  assert.deepEqual(parseRoute("#/home"), { area: "home", id: null });
  assert.deepEqual(parseRoute("#/check"), { area: "check", id: null });
  assert.deepEqual(parseRoute("#/check/vision"), { area: "check", id: "vision" });
  assert.deepEqual(parseRoute("#/progress"), { area: "progress", id: null });
  assert.deepEqual(parseRoute("#/emergency"), { area: "emergency", id: null });
  assert.deepEqual(parseRoute("#/emergency/calf"), { area: "emergency", id: "calf" });
});

test("unknown paths fall back to home", () => {
  assert.deepEqual(parseRoute("#/bogus"), { area: "home", id: null });
  assert.deepEqual(parseRoute(""), { area: "home", id: null });
  assert.deepEqual(parseRoute(null), { area: "home", id: null });
});

test("the app starts on home and each navigation pushes its area", () => {
  assert.deepEqual(route.value, { area: "home", id: null });
  go("progress");
  assert.deepEqual(route.value, { area: "progress", id: null });
  go("#/check");
  assert.deepEqual(route.value, { area: "check", id: null });
});

test("opening a check or an emergency card sets one route", () => {
  openCard("vision");
  assert.deepEqual(route.value, { area: "check", id: "vision" });
  openCard();
  assert.deepEqual(route.value, { area: "check", id: null });
  openEmergency("calf");
  assert.deepEqual(route.value, { area: "emergency", id: "calf" });
  openEmergency();
  assert.deepEqual(route.value, { area: "emergency", id: null });
});

test("older sections follow the area, and check ids are known", () => {
  go("home");
  assert.equal(currentSection.value, "today");
  go("progress");
  assert.equal(currentSection.value, "progress");
  go("emergency");
  assert.equal(currentSection.value, "emergencies");
  go("check/mental");
  assert.equal(currentSection.value, "mental");
  assert.equal(has("vision"), true);
  assert.equal(has("emergencies"), true);
  assert.equal(has("riskmap"), false);
  assert.equal(has("settings"), false);
  assert.equal(CHECK_IDS.length, 7);
});
