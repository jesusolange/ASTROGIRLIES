import { EYES, describeResult } from "../../scripts/vision.js";

const fmt = (iso) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

export default function LatestResults({ rows }) {
  const latest = {};
  rows.forEach((row) => { if (!latest[row.eye]) latest[row.eye] = row; });

  return (
    <div class="am-panel">
      <h3>Latest saved results</h3>
      <div class="vs-latest">
        {EYES.map((eye) => {
          const row = latest[eye.id];
          return (
            <div key={eye.id} class={`vs-latest-card${row ? ` vs-${row.assessment.level}` : ""}`}>
              <b>{eye.label}</b>
              {row ? (
                <>
                  <span>{fmt(row.date)}{row.missionDay != null ? ` · Mission day ${row.missionDay}` : ""}</span>
                  <span class="vs-latest-line">{row.assessment.title}</span>
                  <span>{describeResult(row)}</span>
                </>
              ) : (
                <span class="vs-muted">No result saved yet.</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
