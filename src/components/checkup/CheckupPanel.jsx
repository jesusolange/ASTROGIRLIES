import { useEffect, useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import {
  RECORDS_KEY, SYSTEMS, STEP_IDS, currentStep, doneParts, flowComplete, select
} from "../../scripts/checkup-flow.js";
import "../ui/ui.css";
import "./checkup.css";
import MeasurementForm from "./MeasurementForm.jsx";
import CheckupHistory from "./CheckupHistory.jsx";
import CheckupSummary from "./CheckupSummary.jsx";
import CheckupActions from "./CheckupActions.jsx";

const TABS = [["record", "Record"], ["history", "History"], ["todo", "What to do"]];

export default function CheckupPanel() {
  const [records, saveRecords] = useStored(RECORDS_KEY, []);
  const [tab, setTab] = useState("record");
  const step = currentStep.value;
  const done = doneParts.value;
  const complete = flowComplete.value;
  const system = step ? SYSTEMS[step] : null;

  useEffect(() => {
    if (complete || step) setTab("record");
  }, [complete, step]);

  return (
    <div class="che-panel">
      <header class="che-head">
        <div>
          <h2>Daily checkup</h2>
          <p>
            {complete
              ? "All seven body systems are recorded for today."
              : system
                ? `Step ${STEP_IDS.indexOf(step) + 1} of ${STEP_IDS.length} · ${system.title}`
                : "Choose a body system to begin."}
          </p>
        </div>
        <span class="che-count">{done.length} / {STEP_IDS.length} done</span>
      </header>

      {!complete ? (
        <nav class="che-steps" aria-label="Checkup steps">
          {STEP_IDS.map((id) => (
            <button
              key={id}
              type="button"
              class={`che-step${id === step ? " is-current" : ""}${done.includes(id) ? " is-done" : ""}`}
              aria-pressed={id === step}
              onClick={() => select(id)}
            >
              <span class="che-step-dot" aria-hidden="true" />
              {SYSTEMS[id].label}
            </button>
          ))}
        </nav>
      ) : null}

      <div class="che-tabs" role="tablist" aria-label="Daily checkup views">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            class={`che-tab${tab === id ? " is-active" : ""}`}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div hidden={tab !== "record"}>
        {complete ? (
          <CheckupSummary records={records} />
        ) : system ? (
          <MeasurementForm
            key={step}
            part={step}
            records={records}
            saveRecords={saveRecords}
          />
        ) : null}
      </div>
      <div hidden={tab !== "history"}>
        <CheckupHistory records={records} />
      </div>
      <div hidden={tab !== "todo"}>
        <CheckupActions records={records} />
      </div>
    </div>
  );
}
