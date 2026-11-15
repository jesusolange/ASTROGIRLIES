import { RULES, sansRisk } from "../../scripts/vision.js";

export default function TodoPanel() {
  const risk = sansRisk();
  return (
    <div class="am-panel">
      <h3>What to do</h3>
      <p>Every result is compared with your own baseline, not with a population norm. These thresholds are our design choice.</p>
      <ul class="vs-rules">
        <li class="vs-urgent"><b>Urgent:</b> sudden loss of vision or a new blind spot. Open Emergencies now and follow the steps for a sudden change in vision.</li>
        <li class="vs-warn"><b>Change:</b> any new distortion on the grid, any new symptom, or {RULES.nearLineLossForChange} lines or more lost against your baseline. Repeat the check tomorrow and note what changed in which eye. Keep tasks that need sharp vision light until it settles.</li>
        <li class="vs-ok"><b>No change:</b> repeat the check in {RULES.recheckDays} days, or sooner if your vision changes.</li>
      </ul>
      <p class="vs-fine">Screening aid, not a diagnosis. A phone or laptop screen is not a calibrated instrument.</p>
      <p class="vs-fine">
        Why this check exists: <a href={risk ? risk.url : undefined} target="_blank" rel="noopener">NASA Human Research Roadmap · risk 105 (SANS)</a>.
      </p>
    </div>
  );
}
