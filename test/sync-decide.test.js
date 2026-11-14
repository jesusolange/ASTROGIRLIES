"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { decide } = require("../astromed-sync.js");

// local: { dirty, modifiedAt }, remote: { updatedAt } | null, lastRemote: updatedAt seen at last sync (null = never)
test("nothing to do when neither side changed", () => {
  assert.equal(decide({ dirty: false, modifiedAt: 10 }, { updatedAt: 30 }, 30), "none");
});
test("no remote copy: push if there is local data, else nothing", () => {
  assert.equal(decide({ dirty: false, modifiedAt: 5 }, null, null), "push");
  assert.equal(decide({ dirty: false, modifiedAt: 0 }, null, null), "none");
});
test("push when only local changed", () => {
  assert.equal(decide({ dirty: true, modifiedAt: 20 }, { updatedAt: 30 }, 30), "push");
});
test("pull when only remote changed", () => {
  assert.equal(decide({ dirty: false, modifiedAt: 10 }, { updatedAt: 40 }, 30), "pull");
});
test("both changed: newest wins", () => {
  assert.equal(decide({ dirty: true, modifiedAt: 50 }, { updatedAt: 40 }, 30), "push");
  assert.equal(decide({ dirty: true, modifiedAt: 35 }, { updatedAt: 40 }, 30), "pull");
});
test("first sign-in with local data and an older remote: newest wins", () => {
  assert.equal(decide({ dirty: false, modifiedAt: 100 }, { updatedAt: 50 }, null), "push");
  assert.equal(decide({ dirty: false, modifiedAt: 0 }, { updatedAt: 50 }, null), "pull");
});
