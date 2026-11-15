import Button from "../ui/Button.jsx";
import { SYSTEMS, STEP_IDS, bandForField, latestFor } from "../../scripts/checkup-flow.js";

const LEVEL_LABEL = { review: "Review", alert: "Act now" };

function ruleFor(key, value) {
  try {
    return window.AstroMedData && window.AstroMedData.rule ? window.AstroMedData.rule(key, value) : null;
  } catch {
    return null;
  }
}

function navTarget() {
  const hasToday = window.AstroMedNav && window.AstroMedNav.has("today");
  return hasToday
    ? { id: "today", label: "Go to Today" }
    : { id: "protocols", label: "Go to Protocols" };
}

export default function CheckupActions({ records }) {
  const flags = [];
  let recorded = 0;

  STEP_IDS.forEach((part) => {
    const latest = latestFor(records, part);
    if (!latest) return;
    recorded += 1;
    SYSTEMS[part].fields.forEach((field) => {
      const value = Number(latest.values ? latest.values[field.key] : NaN);
      if (!Number.isFinite(value)) return;
      const band = bandForField(field.key, value);
      if (band.level !== "review" && band.level !== "alert") return;
      const rule = ruleFor(field.key, value);
      flags.push({
        id: `${part}-${field.key}`,
        title: `${SYSTEMS[part].title} · ${field.label}: ${value} ${field.unit}`,
        level: band.level,
        saw: rule && rule.saw ? rule.saw : band.text,
        todo: rule && rule.todo
          ? rule.todo
          : "Repeat the measurement after a few minutes of rest and compare it with your baseline."
      });
    });
  });

  const target = navTarget();

  const go = () => {
    if (window.AstroMedNav) window.AstroMedNav.show(target.id);
  };

  return (
    <div class="che-actions-panel">
      <h3>What to do</h3>
      {recorded === 0 ? (
        <p class="che-empty">Record a body system first. Actions appear here once a reading is saved.</p>
      ) : flags.length === 0 ? (
        <p class="che-ok">Nothing you recorded is outside its reference band. Keep your routine and repeat the checkup tomorrow.</p>
      ) : (
        <ul class="che-flags">
          {flags.map((flag) => (
            <li class={`che-flag is-${flag.level}`} key={flag.id}>
              <div class="che-flag-top">
                <b>{flag.title}</b>
                <span>{LEVEL_LABEL[flag.level]}</span>
              </div>
              <p class="che-flag-saw">{flag.saw}</p>
              <p class="che-flag-todo"><b>Do this:</b> {flag.todo}</p>
            </li>
          ))}
        </ul>
      )}

      <div class="che-next">
        <Button onClick={go}>{target.label}</Button>
      </div>
    </div>
  );
}
