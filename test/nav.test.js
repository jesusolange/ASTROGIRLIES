"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { SECTIONS, has, pageFor } = require("../src/lib/nav.js");

test("every sidebar entry is unique and points at a page", () => {
  const ids = SECTIONS.map((section) => section.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes("today"));
  assert.ok(ids.includes("progress"));
  assert.ok(ids.includes("protocols"));
  assert.equal(pageFor("settings"), null);
});

test("known sections resolve and unknown ones do not", () => {
  assert.equal(has("vision"), true);
  assert.equal(has("today"), true);
  assert.equal(has("not-a-section"), false);
  assert.equal(pageFor("overview"), "checkupPage");
  assert.equal(pageFor("twin"), "exercisePage");
  assert.equal(pageFor("mental"), "mentalPage");
});
