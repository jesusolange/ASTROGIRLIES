// One risk in the ranked list: rank, NASA title and source, both ratings, and the link to
// the app section that watches it.
// Props: risk (an entry of rankedRisks()), rank (1-based position).
import Button from "../ui/Button.jsx";
import SourceLink from "../ui/SourceLink.jsx";
import RatingChip from "./RatingChip.jsx";

const PAGE_FOR_SECTION = { overview: "checkupPage", twin: "exercisePage" };

const sectionExists = (section) =>
  Boolean(section && document.getElementById(PAGE_FOR_SECTION[section] || `${section}Page`));

function Rating({ label, side, missing }) {
  return (
    <div class="rk-rate">
      <span>{label}</span>
      <RatingChip side={side} missing={missing} />
      {side && side.disposition ? <em>{side.disposition}</em> : null}
    </div>
  );
}

function Watch({ risk }) {
  if (!risk.monitored) return <span class="rk-unwatched">Not monitored yet</span>;
  const area = risk.area || risk.section;
  if (!sectionExists(risk.section)) return <span class="rk-area">{area}</span>;
  return (
    <Button variant="soft" className="rk-open" onClick={() => window.AstroMedNav.show(risk.section)}>
      {area}
    </Button>
  );
}

export default function RiskRow({ risk, rank }) {
  const tone = risk.ops ? risk.ops.colour || "none" : "none";
  return (
    <article class={`rk-row ${tone}`}>
      <div class="rk-rank" aria-hidden="true">{rank}</div>
      <div class="rk-main">
        <h3>{risk.short}</h3>
        <p class="rk-title">{risk.title}</p>
        <div class="rk-meta">
          <SourceLink href={risk.url}>NASA source</SourceLink>
          <span>last published {risk.published || "date not given"}</span>
        </div>
      </div>
      <div class="rk-ratings">
        <Rating label="In mission" side={risk.ops} missing="Not rated for this mission" />
        <Rating label="Long-term health" side={risk.lth} missing="Not rated" />
      </div>
      <div class="rk-watch">
        <Watch risk={risk} />
      </div>
    </article>
  );
}
