import { EYE_LABEL, changeSummary, describeResult } from "../../scripts/vision.js";

const fmt = (iso) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
const hasEmergencies = () => !!(window.AstroMedNav && window.AstroMedNav.has && window.AstroMedNav.has("emergencies"));

export default function ResultCard({ row }) {
  const assessment = row.assessment;
  return (
    <div class={`am-result vs-result vs-${assessment.level}`}>
      <h3>{EYE_LABEL[row.eye]} · {assessment.title}</h3>
      <p class="vs-meta">
        {fmt(row.date)}{row.missionDay != null ? ` · Mission day ${row.missionDay}` : ""}
      </p>
      <p class="vs-saw">{describeResult(row)}</p>
      <p class="vs-change">{changeSummary(row, row.baseline)}</p>
      <h4 class="vs-todo-title">What to do</h4>
      <p>{assessment.todo}</p>
      {assessment.level === "urgent" && hasEmergencies() && (
        <button
          type="button"
          class="am-btn vs-emergency"
          onClick={() => window.AstroMedNav.show("emergencies")}
        >Open Emergencies</button>
      )}
      <p class="vs-fine">Screening aid, not a diagnosis. The change thresholds are a design choice pending review by the team's medic.</p>
    </div>
  );
}
