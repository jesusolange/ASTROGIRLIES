import test from "node:test";
import assert from "node:assert/strict";
import {
  cardsFromModules, cardsForTopic, deckProgress, dueCards, findCard, guideCards,
  isRecorded, orderCards, recordedCards, topicScore
} from "../src/components/check/deck.js";

const ranked = [
  { id: 105, score: 16 },
  { id: 176, score: 9 },
  { id: 77, score: 4 }
];

const card = (id, topic, extra = {}) => ({ id, topic, title: id, ...extra });

const sample = [
  card("drinks", "nutrition"),
  card("eye", "vision"),
  card("bones", "bones", { reference: true }),
  card("eye", "vision", { title: "duplicate" })
];

test("cardsFromModules flattens modules and drops duplicate ids", () => {
  const modules = {
    a: { cards: [sample[0], sample[1]] },
    b: { cards: [sample[2], sample[3]] },
    c: {}
  };
  const cards = cardsFromModules(modules);
  assert.deepEqual(cards.map((entry) => entry.id).sort(), ["bones", "drinks", "eye"]);
  assert.equal(cards.find((entry) => entry.id === "eye").title, "eye");
});

test("orderCards sorts by the highest risk score of the card's topic", () => {
  const ordered = orderCards([sample[0], sample[1], card("bone-check", "bones")], ranked);
  assert.deepEqual(ordered.map((entry) => entry.id), ["eye", "drinks", "bone-check"]);
});

test("topicScore takes the highest rating among the topic's risks", () => {
  assert.equal(topicScore(card("x", "vision"), ranked), 16);
  assert.equal(topicScore(card("x", "unknown"), ranked), 0);
});

test("due, guide and recorded split ignores reference cards", () => {
  const done = card("drinks", "nutrition", { isDone: () => true });
  const pending = card("eye", "vision", { isDone: () => false });
  const guide = card("bones", "bones", { reference: true, isDone: () => false });
  assert.deepEqual(dueCards([done, pending, guide]).map((entry) => entry.id), ["eye"]);
  assert.deepEqual(guideCards([done, pending, guide]).map((entry) => entry.id), ["bones"]);
  assert.deepEqual(recordedCards([done, pending, guide]).map((entry) => entry.id), ["drinks"]);
});

test("isRecorded survives a card whose isDone throws", () => {
  assert.equal(isRecorded(card("x", "vision", { isDone: () => { throw new Error("no store"); } })), false);
  assert.equal(isRecorded(card("y", "vision")), false);
});

test("deckProgress counts recorded cards out of the tracked cards", () => {
  const done = card("drinks", "nutrition", { isDone: () => true });
  const pending = card("eye", "vision", { isDone: () => false });
  const guide = card("bones", "bones", { reference: true });
  assert.deepEqual(deckProgress([done, pending, guide]), { recorded: 1, total: 2, remaining: 1 });
});

test("cardsForTopic returns the cards of one topic", () => {
  assert.deepEqual(cardsForTopic("vision", [sample[0], sample[1]]).map((entry) => entry.id), ["eye"]);
  assert.deepEqual(cardsForTopic("sleep", [sample[0]]), []);
});

test("findCard matches by id", () => {
  assert.equal(findCard(sample, "drinks").id, "drinks");
  assert.equal(findCard(sample, "missing"), null);
});
