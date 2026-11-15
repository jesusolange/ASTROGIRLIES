import { FIELDS, PLACES, baselineFor, evaluate, formatTime, labelFrom } from "../../scripts/environment.js";
import Panel from "../ui/Panel.jsx";

const ICON = { ok: "✓", review: "!", alert: "!" };

export default function EnvironmentStatus({ state, log }) {
  if (!state.place || !state.readings) return null;
  const baseline = PLACES[state.place].rad ? null : baselineFor(log, state.place, state.time);
  const rows = FIELDS.filter((field) => Number.isFinite(state.readings[field.key])).map((field) => {
    const result = evaluate(field.key, state.readings[field.key], state.place, baseline);
    return { field, result };
  });

  return (
    <Panel title={`Status in ${labelFrom(state)}`}>
      <p class="am-small">Saved {formatTime(state.time)}</p>
      {rows.map(({ field, result }) => (
        <div key={field.key} class={`env-row ${result.level}`}>
          <i>{ICON[result.level] || "•"}</i>
          <div>
            <b>{field.label}: {state.readings[field.key]} {field.unit}</b>
            <p>{result.saw}{result.todo ? ` ${result.todo}` : ""}</p>
            <small>{field.why}</small>
          </div>
        </div>
      ))}
    </Panel>
  );
}
