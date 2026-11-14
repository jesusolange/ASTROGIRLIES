import { COVERAGE_MIN } from "../../scripts/readiness.js";

export default function ScoreHero({ readiness }) {
  const scored = readiness.status === "scored";
  const band = readiness.band;
  const note = scored
    ? `Recent data covers ${readiness.coveragePct}% of the risk weight for this mission.${readiness.missing.length ? ` ${readiness.missing.length} check${readiness.missing.length === 1 ? "" : "s"} still missing.` : ""}`
    : "An area with no recent data counts as missing, not as healthy.";
  return (
    <section class="am-panel td-hero">
      <div class={`td-score ${scored ? `td-${band.key}` : "td-none"}`}>
        <b>{scored ? readiness.total : "?"}</b>
        <small>{scored ? "of 100" : ""}</small>
      </div>
      <div class="td-hero-main">
        <h3>{scored ? band.title : "Not enough data"}</h3>
        <p>{scored ? band.advice : `Recent data covers ${readiness.coveragePct}% of the risk-weighted checks. A score is shown only from ${Math.round(COVERAGE_MIN * 100)}% coverage; that share is our design choice.`}</p>
        <p class="td-note">{note}</p>
        <a class="td-link" href="#tdHow">How this score is made</a>
      </div>
      <div class="td-hero-mission">
        <small>Mission type</small>
        <b>{readiness.mission.label}</b>
      </div>
    </section>
  );
}
