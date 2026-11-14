import Tile from "./Tile.jsx";

export default function TileGroup({ group, cards }) {
  return (
    <>
      <h3 class="emg-h">{group.title}</h3>
      <div class="emg-grid">
        {cards.map((card) => <Tile card={card} key={card.id} />)}
      </div>
    </>
  );
}
