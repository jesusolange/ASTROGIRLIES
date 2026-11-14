import { checkFor, exists, ratingOf } from "../../scripts/today.js";

export default function MissingChecks({ readiness, onOpen }) {
  if (readiness.status !== "insufficient" || !readiness.missing.length) return null;
  return (
    <section class="am-panel">
      <h3>What is missing</h3>
      <div class="td-missing">
        {readiness.missing.map((area) => {
          const check = checkFor(area);
          const canOpen = Boolean(check && exists(check.section));
          return (
            <div class="td-missing-row" key={area.key}>
              <div>
                <b>{area.area}</b>
                <small>NASA risk {ratingOf(area)} · weight {Math.round(area.weight * 100)}%</small>
              </div>
              {canOpen
                ? <button type="button" class="am-btn am-btn-soft" onClick={() => onOpen(area)}>{check.label}</button>
                : <span class="td-unavailable">Check not available yet</span>}
            </div>
          );
        })}
      </div>
      <p class="td-note">An area with no recent data counts as missing, not as healthy.</p>
    </section>
  );
}
