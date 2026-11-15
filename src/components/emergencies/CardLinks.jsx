import { CHECK_IDS, openCard } from "../../lib/nav.js";
import { topicsFor } from "../../data/topics.js";
import { allCards, cardsForTopic, findCard } from "../check/deck.js";
import Button from "../ui/Button.jsx";

function humanize(id) {
  const text = String(id || "").replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function collectLinks(blocks, out = []) {
  for (const block of blocks || []) {
    if (block.link) out.push(block.link.check || block.link.card);
    if (block.blocks) collectLinks(block.blocks, out);
    if (block.diagram) collectLinks(block.diagram, out);
  }
  return out;
}

export default function CardLinks({ card }) {
  const deck = allCards();
  const blockLinks = new Set(collectLinks(card.blocks));
  const seen = new Set();
  const buttons = [];

  for (const topic of topicsFor(card.id)) {
    const checks = cardsForTopic(topic.id, deck);
    if (!checks.length && CHECK_IDS.includes(topic.id) && !seen.has(topic.id)) {
      seen.add(topic.id);
      buttons.push({ id: topic.id, label: `Open the ${topic.label} check` });
      continue;
    }
    for (const check of checks) {
      if (!check || !check.id || seen.has(check.id)) continue;
      seen.add(check.id);
      buttons.push({ id: check.id, label: check.title });
    }
  }

  const direct = card.link && (card.link.check || card.link.card);
  if (direct && !seen.has(direct) && !blockLinks.has(direct)) {
    const known = findCard(deck, direct);
    seen.add(direct);
    buttons.push({ id: direct, label: known ? known.title : `Open the ${humanize(direct)} check` });
  }

  if (!buttons.length) return null;
  return (
    <section class="emg-links">
      <h3>Check this now</h3>
      <div class="emg-links-row">
        {buttons.map((button) => (
          <Button key={button.id} variant="soft" onClick={() => openCard(button.id)}>{button.label}</Button>
        ))}
      </div>
    </section>
  );
}
