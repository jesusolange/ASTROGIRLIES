import Blocks from "./Blocks.jsx";

export default function SlowRiskCard({ card }) {
  return (
    <>
      <p class="ui-card-lead">{card.sign}</p>
      <Blocks blocks={card.blocks} />
    </>
  );
}
