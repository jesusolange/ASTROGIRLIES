import { Info } from "lucide-preact";
import { COVERAGE_MIN } from "../../scripts/readiness.js";
import Button from "../ui/Button.jsx";

export default function ScoreHero({ readiness, onExplain }) {
  const scored = readiness.status === "scored";
  const band = readiness.band;
  const coverage = `${readiness.covered} of ${readiness.due} areas recorded`;
  return (
    <section class="ui-panel home-hero">
      <div class={`home-score ${scored ? `home-tone-${band.key}` : "home-tone-none"}`}>
        <b>{scored ? readiness.total : "\u2013"}</b>
        {scored ? <small>of 100</small> : null}
      </div>
      <div class="home-hero-main">
        <h2>{scored ? band.title : `Not enough data: ${coverage}`}</h2>
        {scored ? <p class="home-coverage">from {coverage}</p> : null}
        <p>{scored ? band.advice : `A score appears only when at least ${Math.round(COVERAGE_MIN * 100)}% of the due areas are recorded.`}</p>
        <Button variant="soft" className="home-explain" onClick={onExplain}>
          <Info size={16} aria-hidden="true" />
          How this score is made
        </Button>
      </div>
      <div class="home-hero-mission">
        <small>Mission type</small>
        <b>{readiness.mission.label}</b>
      </div>
    </section>
  );
}
