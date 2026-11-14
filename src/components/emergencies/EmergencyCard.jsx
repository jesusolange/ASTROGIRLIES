import Blocks from "./Blocks.jsx";
import CardIcon from "./CardIcon.jsx";
import { openCard } from "../../scripts/emergencies.js";

export default function EmergencyCard({ card, hidden }) {
  const designRest = card.designNote ? card.designNote.replace(/^Design choice\.\s*/, "") : null;
  const back = () => {
    openCard.value = null;
    window.scrollTo({ top: 0 });
  };
  return (
    <article class="emg-card" data-card={card.id} hidden={hidden}>
      <button type="button" class="am-btn am-btn-soft emg-back" onClick={back}>← All emergencies</button>
      <div class={`emg-head ${card.tone}`}>
        <span class="emg-head-icon"><CardIcon name={card.icon} /></span>
        <div><h3>{card.title}</h3><p>{card.sign}</p></div>
      </div>
      <Blocks blocks={card.blocks} />
      {card.source && (
        <p class="am-small">Source: {card.source}. This guide helps when the ground team is far away. It does not replace medical training.</p>
      )}
      {card.sourceLink && (
        <p class="em-source">Source: <a href={card.sourceLink.url} target="_blank" rel="noopener noreferrer">{card.sourceLink.name}</a></p>
      )}
      {designRest && <p class="em-source em-design"><b>Design choice.</b> {designRest}</p>}
      {card.disclaimer && <p class="am-small em-disclaimer">{card.disclaimer}</p>}
    </article>
  );
}
