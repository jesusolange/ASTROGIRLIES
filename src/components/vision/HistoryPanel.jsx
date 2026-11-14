import { EYE_LABEL, changeSummary, describeResult, historyFrom } from "../../scripts/vision.js";

const fmt = (iso) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

export default function HistoryPanel({ data }) {
  const rows = historyFrom(data);
  return (
    <div class="am-panel">
      <h3>History</h3>
      <p>Every saved result per eye, newest first. Each result is compared with the first result for that eye (your baseline) and with the previous result.</p>
      {rows.length === 0 ? (
        <p class="vs-empty">No saved results yet. Complete a check for one eye and it will appear here.</p>
      ) : (
        <ul class="vs-hist-list">
          {rows.map((row) => (
            <li key={row.id} class={`vs-hist vs-${row.assessment.level}`}>
              <div class="vs-hist-top">
                <b>{EYE_LABEL[row.eye]}</b>
                <span>{fmt(row.date)}{row.missionDay != null ? ` · Mission day ${row.missionDay}` : ""}</span>
              </div>
              <p class="vs-hist-saw">{describeResult(row)}</p>
              <div class="vs-changes">
                <span><b>vs first:</b> {row.baseline ? changeSummary(row, row.baseline) : "This is the first result"}</span>
                <span><b>vs previous:</b> {row.previous ? changeSummary(row, row.previous) : "No earlier result"}</span>
              </div>
              <p class="vs-hist-todo"><b>{row.assessment.title}:</b> {row.assessment.todo}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
