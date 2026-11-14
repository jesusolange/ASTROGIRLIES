import "./emergencies.css";
import { CARDS, GROUPS, cardsInGroup } from "../../data/emergencies.js";
import { openCard } from "../../scripts/emergencies.js";
import Banner from "./Banner.jsx";
import EmergencyCard from "./EmergencyCard.jsx";
import TileGroup from "./TileGroup.jsx";

function Guide() {
  const selected = openCard.value;
  return (
    <>
      <div data-emg-list hidden={Boolean(selected)}>
        <div class="am-heading">
          <h2>Emergency</h2>
          <p>Start with what you see or feel. The steps lead you to what to do.</p>
        </div>
        <Banner />
        {GROUPS.map((group) => {
          const cards = cardsInGroup(group.id);
          return cards.length ? <TileGroup group={group} cards={cards} key={group.id} /> : null;
        })}
        <p class="am-small emg-closing">Written from the team doctor's notes. Items marked CHECK still need the doctor's confirmation.</p>
      </div>
      {CARDS.map((card) => <EmergencyCard card={card} hidden={selected !== card.id} key={card.id} />)}
    </>
  );
}

export default function EmergenciesView() {
  return <Guide />;
}
