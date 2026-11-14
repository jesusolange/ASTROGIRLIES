// Every saved check-in, newest first, with the change against the previous result of the same test.
// Props: entries (rows from mental.js history()).
import { resultLabel, resultLevel } from "../../scripts/mental.js";

const fmt = (iso) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
const fmtDay = (iso) => new Date(iso).toLocaleDateString([], { dateStyle: "medium" });

function changeText(entry) {
  if (!entry.previous) return "First result";
  if (entry.delta === 0) return `No change vs ${fmtDay(entry.previous.date)}`;
  return `${entry.delta > 0 ? "+" : ""}${entry.delta} vs ${fmtDay(entry.previous.date)}`;
}

export default function History({ entries }) {
  if (!entries.length) {
    return <p class="mh-empty">No saved check-ins yet. Complete one of the questionnaires and it will appear here.</p>;
  }
  return (
    <ul class="mh-hist-list">
      {entries.map((entry) => (
        <li
          key={`${entry.type}-${entry.date}`}
          class={`mh-hist am-${resultLevel(entry)}${entry.flagged ? " mh-hist-flagged" : ""}`}
        >
          <span class="mh-hist-date">{fmt(entry.date)}</span>
          <span class="mh-hist-name">{entry.questionnaire}</span>
          <span class="mh-hist-score">{entry.score} / {entry.max} · {resultLabel(entry)}</span>
          <span class="mh-hist-change">{changeText(entry)}</span>
          {entry.flagged ? <span class="mh-hist-flag">Flagged: thoughts of self-harm</span> : null}
        </li>
      ))}
    </ul>
  );
}
