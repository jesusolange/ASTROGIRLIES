"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Topics = require("../src/data/topics.js");
const { CARD_BY_ID } = require("../src/data/emergencies.js");
const hrr = require("../src/data/hrr-risks.js");

const riskIds = new Set(hrr.default.risks.map((risk) => risk.id));

test("every emergency id in the topic table exists in the emergency data", () => {
  for (const topic of Topics.TOPICS) {
    if (topic.emergency == null) continue;
    assert.ok(CARD_BY_ID.has(topic.emergency), `${topic.id}: unknown emergency card ${topic.emergency}`);
  }
});

test("every risk id in the topic table exists in the NASA risk model", () => {
  for (const topic of Topics.TOPICS) {
    for (const id of topic.riskIds) assert.ok(riskIds.has(id), `${topic.id}: unknown risk ${id}`);
  }
});

test("a risk belongs to at most one topic", () => {
  const seen = new Map();
  for (const topic of Topics.TOPICS) {
    for (const id of topic.riskIds) {
      assert.equal(seen.has(id), false, `risk ${id} in ${seen.get(id)} and ${topic.id}`);
      seen.set(id, topic.id);
    }
  }
});

test("the environment topic keeps NASA risk 173 and opens the cabin conditions card", () => {
  const topic = Topics.topicFor(173);
  assert.equal(topic.id, "environment");
  assert.equal(topic.label, "Cabin conditions");
  assert.equal(topic.emergency, "cabin-air");
});

test("risk, topic and emergency lookups agree", () => {
  assert.equal(Topics.topicFor(105).id, "vision");
  assert.equal(Topics.emergencyFor("vision"), "vision-change");
  assert.equal(Topics.emergencyFor("bones"), null);
  assert.deepEqual(Topics.topicsFor("fever").map((topic) => topic.id), ["immune"]);
  assert.deepEqual(Topics.topicsFor("self-harm").map((topic) => topic.id), ["mental"]);
  assert.equal(Topics.topicFor(9999), null);
});
