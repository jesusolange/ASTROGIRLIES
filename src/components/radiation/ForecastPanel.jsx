import { LIMIT } from "../../scripts/radiation.js";
import Panel from "../ui/Panel.jsx";
import CumulativeChart from "./CumulativeChart.jsx";

export default function ForecastPanel({ state, totals, typicalRate }) {
  return (
    <Panel title="Where you are going">
      <p class="mi-note">
        Your profile supplies the mission start date and the total mission length. Add each dose in "Add a dose" below.
        This page averages your dose over the last seven recorded days and multiplies that daily rate by the remaining mission days.
      </p>
      {totals.projected != null ? (
        <p class={`rd-st ${totals.projLevel}`}>
          If you keep the same daily rate for the {totals.left} remaining mission days, your career total would be about{" "}
          <b>{totals.projected.toFixed(0)} mSv</b> ({((totals.projected / LIMIT) * 100).toFixed(0)}% of the limit).
          {totals.projLevel === "alert" ? " That exceeds the 600 mSv limit: this plan needs ground review." : ""}
        </p>
      ) : (
        <p class="mi-note">To see a forecast, enter your mission start date and total mission length in your profile, then add at least one dose below.</p>
      )}
      {typicalRate && totals.left != null ? (
        <p class="mi-note">
          For comparison, a typical rate at your location would add about {(typicalRate * totals.left).toFixed(0)} mSv over the
          remaining {totals.left} days ({typicalRate} mSv/day).
        </p>
      ) : null}
      <CumulativeChart state={state} totals={totals} />
    </Panel>
  );
}
