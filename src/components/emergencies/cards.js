import { h } from "preact";
import { ANEMIA, BONE_LOSS } from "../../data/slow-risks.js";
import SlowRiskCard from "./SlowRiskCard.jsx";

function guide(card, topic) {
  return {
    id: card.id,
    topic,
    title: card.title,
    reference: true,
    Component: (props) => h(SlowRiskCard, { ...props, card }),
    isDone: () => false,
  };
}

export const cards = [
  guide(BONE_LOSS, "bones"),
  guide(ANEMIA, "nutrition"),
];
