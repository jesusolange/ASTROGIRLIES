// The result of a dose entry: the career total against its reference, with the mission share.
// Props: totals (from radiation.js calc()).
import { LIMIT } from "../../scripts/radiation.js";
import Term from "../ui/Term.jsx";

const LABEL = {
  ok: "Far from the limit",
  review: "Getting closer: check your plan",
  alert: "Close to the limit: reduce your dose now"
};

export default function DoseResult({ totals }) {
  return (
    <div class="rd-result">
      <div class={`rd-gauge ${totals.level}`}>
        <div class="rd-fill" style={{ width: `${Math.min(100, totals.pct)}%` }} />
        <i style={{ left: "50%" }} />
        <i style={{ left: "80%" }} />
      </div>
      <div class="rd-scale"><span>0</span><span>300</span><span>480</span><span>{LIMIT} mSv</span></div>
      <dl class="rd-kpis">
        <div><dt>Total (all missions)</dt><dd>{totals.career.toFixed(1)} mSv</dd></div>
        <div><dt>Of the NASA limit ({LIMIT} mSv)</dt><dd>{totals.pct.toFixed(1)}%</dd></div>
        <div><dt>This mission</dt><dd>{totals.mission.toFixed(1)} mSv</dd></div>
        <div><dt>Daily average (last 7 recorded days)</dt><dd>{totals.rate != null ? `${totals.rate.toFixed(2)} mSv/day` : "–"}</dd></div>
      </dl>
      <p class={`rd-level rd-${totals.level}`}>
        <b>{LABEL[totals.level]}.</b> Keep your dose as low as reasonably achievable (<Term term="ALARA" />).
      </p>
      <p class="rd-note">The 50% and 80% marks on the bar are our design choice.</p>
    </div>
  );
}
