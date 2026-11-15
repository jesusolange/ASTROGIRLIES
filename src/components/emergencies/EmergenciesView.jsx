import "./emergencies.css";
import { CARDS, indexCards } from "../../data/emergencies.js";
import { openCard } from "../../scripts/emergencies.js";
import Banner from "./Banner.jsx";
import EmergencyCard from "./EmergencyCard.jsx";
import Tile from "./Tile.jsx";

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
        <div class="emg-grid">
          {indexCards().map((card) => <Tile card={card} key={card.id} />)}
        </div>
      </div>
      {CARDS.map((card) => <EmergencyCard card={card} hidden={selected !== card.id} key={card.id} />)}
    </>
  );
}

export default function EmergenciesView() {
  return <Guide />;
}
