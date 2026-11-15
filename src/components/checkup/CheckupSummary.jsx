import Button from "../ui/Button.jsx";
import CheckupActions from "./CheckupActions.jsx";
import { STEP_IDS, SYSTEMS, doneParts, latestFor, reset } from "../../scripts/checkup-flow.js";

const fmtTime = (iso) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

export default function CheckupSummary({ records }) {
  const done = doneParts.value;
  const rows = STEP_IDS.filter((part) => done.includes(part)).map((part) => ({
    part,
    system: SYSTEMS[part],
    latest: latestFor(records, part)
  }));

  return (
    <div class="che-summary">
      <h3>Checkup complete</h3>
      <p>
        You recorded {rows.length} of {STEP_IDS.length} body systems today. Each system keeps one reading
        per save, and the record below is what the app stored on this device.
      </p>

      <CheckupActions records={records} />

      <h4 class="che-list-title">What was recorded</h4>
      <ul class="che-summary-list">
        {rows.map(({ part, system, latest }) => (
          <li key={part}>
            <div class="che-summary-top">
              <b>{system.title}</b>
              <span>{latest ? fmtTime(latest.time) : "No reading"}</span>
            </div>
            {latest ? (
              <p>
                {system.fields.map((field) => (
                  <span class="che-summary-value" key={field.key}>
                    {field.label}: <b>{latest.values[field.key]} {field.unit}</b>
                  </span>
                ))}
              </p>
            ) : (
              <p class="che-empty">This system has no saved reading.</p>
            )}
            {latest && latest.simulated ? <em>Simulated typical values</em> : null}
          </li>
        ))}
      </ul>

      <div class="che-restart">
        <Button variant="soft" onClick={reset}>Start another checkup</Button>
      </div>
    </div>
  );
}
