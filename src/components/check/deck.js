// The deck's logic: collect every section's cards, order them by the NASA risk rating of their topic,
// and split them into due, recorded and guide cards.
import { TOPIC_BY_ID, TOPICS } from "../../data/topics.js";
import { rankedRisks } from "../../scripts/risks.js";

function loadModules() {
  try {
    return import.meta.glob("../*/cards.js", { eager: true });
  } catch {
    return {};
  }
}

const modules = loadModules();

export function cardsFromModules(mods) {
  const seen = new Set();
  const cards = [];
  for (const mod of Object.values(mods || {})) {
    const list = mod && Array.isArray(mod.cards) ? mod.cards : [];
    for (const card of list) {
      if (!card || !card.id || seen.has(card.id)) continue;
      seen.add(card.id);
      cards.push(card);
    }
  }
  return cards;
}

export function allCards() {
  return cardsFromModules(modules);
}

export function isRecorded(card) {
  try {
    return Boolean(card && typeof card.isDone === "function" && card.isDone());
  } catch {
    return false;
  }
}

export function topicScore(card, ranked = []) {
  const topic = TOPIC_BY_ID.get(card && card.topic);
  if (!topic) return 0;
  let score = 0;
  for (const risk of ranked) {
    if (topic.riskIds.includes(risk.id)) score = Math.max(score, risk.score || 0);
  }
  return score;
}

export function orderCards(cards, ranked = rankedRisks()) {
  return [...cards].sort((a, b) =>
    topicScore(b, ranked) - topicScore(a, ranked)
    || String(a.title || a.id).localeCompare(String(b.title || b.id)));
}

export function dueCards(cards) {
  return cards.filter((card) => !card.reference && !isRecorded(card));
}

export function guideCards(cards) {
  return cards.filter((card) => Boolean(card.reference));
}

export function recordedCards(cards) {
  return cards.filter((card) => !card.reference && isRecorded(card));
}

export function deckProgress(cards) {
  const tracked = cards.filter((card) => !card.reference);
  const recorded = tracked.filter(isRecorded).length;
  return { recorded, total: tracked.length, remaining: tracked.length - recorded };
}

export function findCard(cards, id) {
  return cards.find((card) => card.id === id) || null;
}

export function cardsForTopic(topicId, cards = allCards()) {
  return cards.filter((card) => card.topic === topicId);
}

// Every card as search groups: the topic is the group, the cards are its items. Cards whose topic is
// not in the topic table go into a last group so nothing is hidden.
export function cardGroups(cards = allCards(), topics = TOPICS) {
  const byTopic = new Map();
  for (const card of cards) {
    const topicId = TOPIC_BY_ID.has(card.topic) ? card.topic : "other";
    if (!byTopic.has(topicId)) byTopic.set(topicId, []);
    byTopic.get(topicId).push({ id: card.id, label: card.title });
  }
  const groups = [];
  for (const topic of topics) {
    if (byTopic.has(topic.id)) {
      groups.push({ id: topic.id, label: topic.label, items: byTopic.get(topic.id) });
    }
  }
  if (byTopic.has("other")) {
    groups.push({ id: "other", label: "Other", items: byTopic.get("other") });
  }
  return groups;
}
