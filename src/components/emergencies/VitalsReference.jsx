import { useState } from "preact/hooks";
import { openEmergency } from "../../lib/nav.js";
import { VITALS_REFERENCE } from "../../data/emergencies.js";
import Button from "../ui/Button.jsx";
import CardIcon from "./CardIcon.jsx";
import RangeBar from "./RangeBar.jsx";
import VitalsCheck from "./VitalsCheck.jsx";

const BAR_KEYS = ["pulse", "resp", "spo2"];

export default function VitalsReference() {
  const [values, setValues] = useState({});
  return (
    <article class="emg-card" data-card="vitals">
      <Button variant="soft" className="emg-back" onClick={() => openEmergency(null)}>
        {"\u2190"} All emergencies
      </Button>
      <header class="emg-head">
        <span class="emg-head-icon"><CardIcon name="vitals" /></span>
        <div>
          <h2>Vital signs</h2>
          <p>Pulse, breathing, oxygen and temperature, judged as you type.</p>
        </div>
      </header>
      <div class="am-panel emg-panel">
        <h4>Your values</h4>
        <VitalsCheck values={values} onValues={setValues} />
      </div>
      <div class="am-panel emg-panel">
        <h4>Reference values</h4>
        <div class="emg-ranges">
          {VITALS_REFERENCE.bars.map((bar, index) => (
            <RangeBar bar={bar} key={bar.label} value={values[BAR_KEYS[index]]} />
          ))}
        </div>
        <div class="emg-chips">
          {VITALS_REFERENCE.chips.map((chip) => (
            <span class={`emg-chip ${chip.tone}`} key={chip.text}>{chip.text}</span>
          ))}
        </div>
        <p class="emg-note">{VITALS_REFERENCE.note}</p>
      </div>
    </article>
  );
}
