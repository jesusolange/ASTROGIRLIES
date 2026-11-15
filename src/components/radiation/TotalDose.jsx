import { LIMIT } from "../../scripts/radiation.js";
import Panel from "../ui/Panel.jsx";

const LABEL = {
  ok: "Far from the limit",
  review: "Getting closer: check your plan",
  alert: "Close to the limit: wake the crew medical officer"
};

export default function TotalDose({ totals }) {
  return (
    <Panel title="Your total dose">
      <div class={`rd-gauge ${totals.level}`}>
        <div class="rd-fill" style={{ width: `${Math.min(100, totals.pct)}%` }} />
        <i style={{ left: "50%" }} />
        <i style={{ left: "80%" }} />
      </div>
      <div class="rd-scale"><span>0</span><span>300</span><span>480</span><span>{LIMIT} mSv</span></div>
      <div class="mi-kpis" style={{ marginTop: "14px" }}>
        <div><small>Total (all missions)</small><b>{totals.career.toFixed(1)} mSv</b></div>
        <div><small>Of NASA limit ({LIMIT})</small><b>{totals.pct.toFixed(1)}%</b></div>
        <div><small>This mission</small><b>{totals.mission.toFixed(1)} mSv</b></div>
        <div><small>Daily average (last 7 days)</small><b>{totals.rate != null ? `${totals.rate.toFixed(2)} mSv/day` : "–"}</b></div>
      </div>
      <p class={`rd-st ${totals.level}`}><b>{LABEL[totals.level]}.</b> Always keep your dose as low as you reasonably can (ALARA).</p>
    </Panel>
  );
}
