// The result of a set of cabin readings: each reading with its judgement and action.
// Props: results (rows from readingsResult), place.
import { PLACES } from "../../scripts/environment.js";
import LevelBadge from "../ui/LevelBadge.jsx";

export default function CabinResult({ results, place }) {
  return (
    <div class="env-result">
      <p class="env-result-place">{PLACES[place]?.name || "Your cabin"}</p>
      <ul class="env-result-list">
        {results.map((row) => (
          <li key={row.key} class={`env-reading env-${row.level}`}>
            <div class="env-reading-head">
              <b>{row.label}: {row.value} {row.unit}</b>
              <LevelBadge level={row.level} />
            </div>
            <span>{row.saw}</span>
            {row.todo ? <span class="env-reading-todo">{row.todo}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
