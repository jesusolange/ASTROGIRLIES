import { openEmergency } from "../../lib/nav.js";
import Button from "../ui/Button.jsx";
import SourceLink from "../ui/SourceLink.jsx";
import Blocks from "./Blocks.jsx";
import CardIcon from "./CardIcon.jsx";
import CardLinks from "./CardLinks.jsx";
import RichText from "./RichText.jsx";

export default function EmergencyCard({ card }) {
  const danger = card.actWithin === "minutes";
  const designRest = card.designNote ? card.designNote.replace(/^Design choice\.\s*/, "") : null;
  const sourceId = card.sourceIds && card.sourceIds[0];
  return (
    <article class="emg-card" data-card={card.id}>
      <Button variant="soft" className="emg-back" onClick={() => openEmergency(null)}>
        {"\u2190"} All emergencies
      </Button>
      <header class={`emg-head${danger ? " is-danger" : ""}`}>
        <span class="emg-head-icon"><CardIcon name={card.icon} /></span>
        <div>
          <h2><RichText text={card.title} /></h2>
          <p><RichText text={card.sign} /></p>
        </div>
        {card.tag ? <span class="emg-head-tag">{card.tag}</span> : null}
      </header>
      <Blocks blocks={card.blocks} />
      <CardLinks card={card} />
      {designRest ? <p class="em-source em-design"><b>Design choice.</b> <RichText text={designRest} /></p> : null}
      {card.disclaimer ? <p class="am-small em-disclaimer"><RichText text={card.disclaimer} /></p> : null}
      {sourceId ? (
        <p class="emg-source-line">
          <SourceLink id={sourceId}>Sources</SourceLink>
        </p>
      ) : null}
    </article>
  );
}
