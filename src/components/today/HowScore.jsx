import { BANDS, COVERAGE_MIN, MENTAL_DAYS, RECENT_DAYS, SOURCE } from "../../scripts/readiness.js";
import { checkFor, exists, ratingOf } from "../../scripts/today.js";

export default function HowScore({ readiness, onOpen }) {
  return (
    <div class="am-panel" id="tdHow">
      <h3>How this score is made</h3>
      <p>Each area's weight is its highest in-mission NASA risk rating for the mission you chose, scaled so the weights add to 100%. The app turns your recent data in an area into a 0–100 result with its own existing rules. The weighted average is then pulled toward the middle by the share of due areas you have not recorded, so a missing check can never look healthy. An area with no recent data counts as missing, not as healthy.</p>
      <p>A score appears only when you have recorded at least {Math.round(COVERAGE_MIN * 100)}% of the due areas. That threshold is our design choice. Recent means a reading from the last {RECENT_DAYS} days, or {MENTAL_DAYS} days for mental health; those windows are our design choice too. The <a class="td-link" href={SOURCE} target="_blank" rel="noopener noreferrer">ratings are NASA's</a>, from the Human Research Roadmap; the mapping of areas to checks, the formula and the bands are ours.</p>

      <div class="td-table-wrap">
        <table class="td-table">
          <thead><tr><th>Area</th><th>NASA risk</th><th>Weight</th><th>Your data</th><th>Check</th></tr></thead>
          <tbody>
            {readiness.areas.map((area) => {
              const check = checkFor(area);
              const canOpen = Boolean(!area.reference && check && exists(check.section));
              return (
                <tr key={area.key}>
                  <td><b>{area.area}</b></td>
                  <td>
                    {area.risk ? <a href={area.risk.url} target="_blank" rel="noopener noreferrer">{area.risk.short}</a> : null}
                    {area.risk ? <span> {ratingOf(area)}</span> : <span>–</span>}
                  </td>
                  <td>{Math.round(area.weight * 100)}%</td>
                  <td>{area.reference ? "reference only" : area.data ? Math.round(area.data.score) : "no recent data"}</td>
                  <td>{canOpen ? <button type="button" class="td-link" onClick={() => onOpen(area)}>Open</button> : area.reference ? "–" : "not available"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div class="td-bands">
        {BANDS.map((band, index) => (
          <span class={`td-band td-${band.key}`} key={band.key}>
            <b>{band.title}</b> {band.min}–{index === 0 ? 100 : BANDS[index - 1].min - 1}
          </span>
        ))}
      </div>
      <p class="td-note">This is a screening and self-monitoring aid, not a medical device and not a diagnosis.</p>
    </div>
  );
}
