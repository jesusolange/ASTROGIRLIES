import { COVERAGE_MIN } from "../../scripts/readiness.js";

export default function ScoreHero({ readiness }) {
  const scored = readiness.status === "scored";
  const band = readiness.band;
  const coverage = `${readiness.covered} of ${readiness.due} areas recorded`;
  return (
    <section class="am-panel td-hero">
      <div class={`td-score ${scored ? `td-${band.key}` : "td-none"}`}>
        <b>{scored ? readiness.total : "\u2013"}</b>
        {scored ? <small>of 100</small> : null}
      </div>
      <div class="td-hero-main">
        <h3>{scored ? band.title : `Not enough data: ${coverage}`}</h3>
        {scored ? <p class="td-coverage">from {coverage}</p> : null}
        <p>{scored ? band.advice : `A score appears only when at least ${Math.round(COVERAGE_MIN * 100)}% of the due areas are recorded.`}</p>
        <a class="td-link" href="#tdHow">How this score is made</a>
      </div>
      <div class="td-hero-mission">
        <small>Mission type</small>
        <b>{readiness.mission.label}</b>
      </div>
    </section>
  );
}
