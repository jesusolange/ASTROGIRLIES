import CardIcon from "./CardIcon.jsx";
import { openCard } from "../../scripts/emergencies.js";

export default function Tile({ card }) {
  const open = () => {
    openCard.value = card.id;
    window.scrollTo({ top: 0 });
  };
  return (
    <button type="button" class={`emg-tile ${card.tone}`} data-emg-open={card.id} onClick={open}>
      <span class="emg-ic"><CardIcon name={card.icon} /></span>
      <b>{card.title}</b>
      <small>{card.sign}</small>
      {card.tag && <em>{card.tag}</em>}
    </button>
  );
}
